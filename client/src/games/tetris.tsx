import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Trophy, ArrowLeft, ArrowRight, ChevronUp, ChevronDown } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { GameScore } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import dropSound from "./sounds/drop.mp3";
import rotateSound from "./sounds/rotate.mp3";
import GameOverSound from "./sounds/gameover.mp3";
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;
const TICK_SPEED = 1000; // in ms

type Point = { x: number; y: number };
type Tetromino = {
  shape: boolean[][];
  position: Point;
  color: string;
};

// Using explicit colors for clarity
const TETROMINOES: Omit<Tetromino, "position">[] = [
  { shape: [[true, true, true, true]], color: "hsl(200, 100%, 50%)" }, // I
  { shape: [[true, false], [true, false], [true, true]], color: "hsl(32, 100%, 50%)" }, // L
  { shape: [[false, true], [false, true], [true, true]], color: "hsl(240, 100%, 50%)" }, // J
  { shape: [[true, true], [true, true]], color: "hsl(60, 100%, 50%)" }, // O
  { shape: [[false, true, true], [true, true, false]], color: "hsl(120, 100%, 50%)" }, // S
  { shape: [[true, true, false], [false, true, true]], color: "hsl(0, 100%, 50%)" }, // Z
  { shape: [[true, true, true], [false, true, false]], color: "hsl(300, 100%, 50%)" }  // T
];

export default function Tetris() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<(string | null)[][]>(
    Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Sound effects using HTML Audio API
  const dropSoundRef = useRef(new Audio(dropSound));
  const rotateSoundRef = useRef(new Audio(rotateSound));
  const gameOverSoundRef = useRef(new Audio(GameOverSound));

  const { data: userScores } = useQuery<GameScore[]>({
    queryKey: ["/api/user/scores"],
  });

  // Responsive scaling of the canvas
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setScale(containerWidth / (BOARD_WIDTH * CELL_SIZE));
      }
      setIsMobile(window.innerWidth < 640);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Checks if a given piece (with an optional offset) collides with the board boundaries or existing pieces.
  const checkCollision = useCallback(
    (piece: Tetromino, offsetX = 0, offsetY = 0) => {
      return piece.shape.some((row, y) =>
        row.some((cell, x) => {
          if (!cell) return false;
          const newX = piece.position.x + x + offsetX;
          const newY = piece.position.y + y + offsetY;
          return (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX] !== null)
          );
        })
      );
    },
    [board]
  );

  // Spawns a new piece in the middle of the board.
  const spawnPiece = useCallback((): Tetromino | null => {
    const pieceTemplate = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
    const newPiece: Tetromino = {
      shape: pieceTemplate.shape,
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      color: pieceTemplate.color,
    };

    if (checkCollision(newPiece)) {
      setGameOver(true);
      setIsRunning(false);
      gameOverSoundRef.current.play().catch(() => { });
      submitScore();
      return null;
    }
    return newPiece;
  }, [checkCollision]);

  // Rotates the piece clockwise.
  const rotatePiece = useCallback(
    (piece: Tetromino) => {
      const rotated: Tetromino = {
        ...piece,
        shape: piece.shape[0].map((_, i) =>
          piece.shape.map((row) => row[i]).reverse()
        ),
      };
      if (!checkCollision(rotated)) {
        setCurrentPiece(rotated);
        rotateSoundRef.current.play().catch(() => { });
      }
    },
    [checkCollision]
  );

  // Moves the piece horizontally.
  const movePiece = useCallback(
    (offsetX: number) => {
      if (!currentPiece || gameOver) return;
      if (!checkCollision(currentPiece, offsetX, 0)) {
        setCurrentPiece({
          ...currentPiece,
          position: {
            ...currentPiece.position,
            x: currentPiece.position.x + offsetX,
          },
        });
      }
    },
    [currentPiece, gameOver, checkCollision]
  );

  // Drops the piece by one cell.
  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver) return;
    if (!checkCollision(currentPiece, 0, 1)) {
      setCurrentPiece({
        ...currentPiece,
        position: {
          ...currentPiece.position,
          y: currentPiece.position.y + 1,
        },
      });
      dropSoundRef.current.play().catch(() => { });
    } else {
      // Merge the landed piece into the board.
      setBoard((prevBoard) => {
        const newBoard = prevBoard.map((row) => [...row]);
        currentPiece.shape.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell) {
              const boardY = currentPiece.position.y + y;
              const boardX = currentPiece.position.x + x;
              if (boardY >= 0) {
                newBoard[boardY][boardX] = currentPiece.color;
              }
            }
          });
        });
        let linesCleared = 0;
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
          if (newBoard[y].every((cell) => cell !== null)) {
            newBoard.splice(y, 1);
            newBoard.unshift(Array(BOARD_WIDTH).fill(null));
            linesCleared++;
            y++; // Recheck same row after shifting.
          }
        }
        if (linesCleared > 0) {
          setScore((prev) => prev + linesCleared * 100);
        }
        return newBoard;
      });
      // Spawn a new piece.
      const newPiece = spawnPiece();
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, gameOver, checkCollision, spawnPiece]);

  // Draws the board and current piece onto the canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions based on scaling
    canvas.style.transform = `scale(${scale})`;
    canvas.style.transformOrigin = "top left";

    // Clear canvas with a white background.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);

    // Draw grid lines for better visibility.
    ctx.strokeStyle = "#ccc";
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }

    // Draw fixed pieces.
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = cell;
          ctx.fillRect(
            x * CELL_SIZE,
            y * CELL_SIZE,
            CELL_SIZE - 1,
            CELL_SIZE - 1
          );
        }
      });
    });

    // Draw the current falling piece.
    if (currentPiece) {
      ctx.fillStyle = currentPiece.color;
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            ctx.fillRect(
              (currentPiece.position.x + x) * CELL_SIZE,
              (currentPiece.position.y + y) * CELL_SIZE,
              CELL_SIZE - 1,
              CELL_SIZE - 1
            );
          }
        });
      });
    }
  }, [board, currentPiece, scale]);

  // Game loop: automatically drop the piece.
  useEffect(() => {
    if (!isRunning || gameOver) return;
    const interval = setInterval(dropPiece, TICK_SPEED);
    return () => clearInterval(interval);
  }, [isRunning, dropPiece, gameOver]);

  // Handle keyboard inputs.
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isRunning || gameOver) return;
      switch (e.key) {
        case "ArrowLeft":
          movePiece(-1);
          break;
        case "ArrowRight":
          movePiece(1);
          break;
        case "ArrowUp":
          if (currentPiece) rotatePiece(currentPiece);
          break;
        case "ArrowDown":
          dropPiece();
          break;
        case " ":
          while (currentPiece && !checkCollision(currentPiece, 0, 1)) {
            dropPiece();
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning, currentPiece, movePiece, rotatePiece, dropPiece, checkCollision, gameOver]);

  // Submit score when game ends.
  const submitScore = async () => {
    await apiRequest("POST", "/api/scores", {
      game: "tetris",
      score,
    });
    queryClient.invalidateQueries({ queryKey: ["/api/user/scores"] });
  };

  // Start (or reset) the game.
  const startGame = () => {
    setBoard(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null)));
    setScore(0);
    setGameOver(false);
    const piece = spawnPiece();
    setCurrentPiece(piece);
    setIsRunning(true);
  };

  // Handlers for mobile controls.
  const handleMobileMove = (offset: number) => movePiece(offset);
  const handleMobileRotate = () => currentPiece && rotatePiece(currentPiece);
  const handleMobileDrop = () => dropPiece();

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <div className="font-mono text-lg mb-2 sm:mb-0">Score: {score}</div>
          <div className="space-x-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsRunning((prev) => !prev)}
              disabled={gameOver}
            >
              {isRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button size="icon" variant="outline" onClick={startGame}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div ref={containerRef} className="mx-auto overflow-hidden" style={{ maxWidth: BOARD_WIDTH * CELL_SIZE }}>
          <canvas
            ref={canvasRef}
            width={BOARD_WIDTH * CELL_SIZE}
            height={BOARD_HEIGHT * CELL_SIZE}
            className="border border-gray-400"
          />
        </div>
        {gameOver && (
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-red-500">Game Over!</h3>
            <p className="text-sm text-gray-600">
              Final Score: {score}
              <br />
              Press the reset button to play again.
            </p>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-500">
          <p>Controls:</p>
          <ul className="list-disc list-inside">
            <li>Arrow Left/Right: Move piece</li>
            <li>Arrow Up: Rotate piece</li>
            <li>Arrow Down: Soft drop</li>
            <li>Space: Hard drop</li>
          </ul>
        </div>
      </Card>

      {/* Mobile Controls */}
      {isMobile && (
        <div className="mt-4 flex justify-center space-x-4">
          <Button onClick={() => handleMobileMove(-1)} variant="outline" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button onClick={handleMobileRotate} variant="outline" size="icon">
            <ChevronUp className="h-5 w-5" />
          </Button>
          <Button onClick={() => handleMobileMove(1)} variant="outline" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button onClick={handleMobileDrop} variant="outline" size="icon">
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Recent Scores */}
      <div className="mt-6">
        <Card className="bg-card p-6 rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Trophy className="h-6 w-6 text-primary" />
              Your Recent Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userScores && userScores.length > 0 ? (
              userScores.slice(0, 5).map((score) => (
                <div key={score.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="capitalize font-semibold">{score.game}</span>
                  <span className="font-mono text-lg">{score.score}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                No scores yet. Play a game to get started!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
