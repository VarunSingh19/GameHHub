import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;
const TICK_SPEED = 1000;

type Point = { x: number; y: number };
type Tetromino = {
  shape: boolean[][];
  position: Point;
  color: string;
};

const TETROMINOES = [
  {
    shape: [[true, true, true, true]], // I
    color: "hsl(var(--primary))",
  },
  {
    shape: [ // L
      [true, false],
      [true, false],
      [true, true],
    ],
    color: "hsl(32, 100%, 50%)", // Orange
  },
  {
    shape: [ // J
      [false, true],
      [false, true],
      [true, true],
    ],
    color: "hsl(240, 100%, 50%)", // Blue
  },
  {
    shape: [ // O
      [true, true],
      [true, true],
    ],
    color: "hsl(60, 100%, 50%)", // Yellow
  },
  {
    shape: [ // S
      [false, true, true],
      [true, true, false],
    ],
    color: "hsl(120, 100%, 50%)", // Green
  },
  {
    shape: [ // Z
      [true, true, false],
      [false, true, true],
    ],
    color: "hsl(0, 100%, 50%)", // Red
  },
  {
    shape: [ // T
      [true, true, true],
      [false, true, false],
    ],
    color: "hsl(300, 100%, 50%)", // Purple
  },
];

export default function Tetris() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const spawnPiece = () => {
    const pieceTemplate = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
    const newPiece: Tetromino = {
      shape: pieceTemplate.shape,
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      color: pieceTemplate.color,
    };
    
    if (checkCollision(newPiece)) {
      setGameOver(true);
      setIsRunning(false);
      submitScore();
      return null;
    }
    
    return newPiece;
  };

  const checkCollision = (piece: Tetromino, offsetX = 0, offsetY = 0) => {
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
  };

  const rotatePiece = (piece: Tetromino) => {
    const rotated = {
      ...piece,
      shape: piece.shape[0].map((_, i) =>
        piece.shape.map(row => row[i]).reverse()
      ),
    };
    
    if (!checkCollision(rotated)) {
      setCurrentPiece(rotated);
    }
  };

  const movePiece = (offsetX: number) => {
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
  };

  const dropPiece = () => {
    if (!currentPiece || gameOver) return;
    
    if (!checkCollision(currentPiece, 0, 1)) {
      setCurrentPiece({
        ...currentPiece,
        position: {
          ...currentPiece.position,
          y: currentPiece.position.y + 1,
        },
      });
    } else {
      // Piece has landed
      const newBoard = [...board];
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
      
      // Check for completed lines
      let linesCleared = 0;
      for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (newBoard[y].every(cell => cell !== null)) {
          newBoard.splice(y, 1);
          newBoard.unshift(Array(BOARD_WIDTH).fill(null));
          linesCleared++;
          y++; // Check the same row again
        }
      }
      
      setBoard(newBoard);
      setScore(score => score + (linesCleared * 100));
      setCurrentPiece(spawnPiece());
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "hsl(var(--card))";
    ctx.fillRect(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);

    // Draw board
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

    // Draw current piece
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
  }, [board, currentPiece]);

  useEffect(() => {
    if (!isRunning || gameOver) return;

    const interval = setInterval(dropPiece, TICK_SPEED);
    return () => clearInterval(interval);
  }, [isRunning, currentPiece, board, gameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isRunning) return;

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
        case " ": // Space
          while (!checkCollision(currentPiece!, 0, 1)) {
            dropPiece();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning, currentPiece]);

  const submitScore = async () => {
    await apiRequest("POST", "/api/scores", {
      game: "tetris",
      score,
    });
    queryClient.invalidateQueries({ queryKey: ["/api/user/scores"] });
  };

  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setScore(0);
    setGameOver(false);
    setCurrentPiece(spawnPiece());
    setIsRunning(true);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="font-mono">Score: {score}</div>
        <div className="space-x-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsRunning(prev => !prev)}
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
      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH * CELL_SIZE}
        height={BOARD_HEIGHT * CELL_SIZE}
        className="border border-border"
      />
      {gameOver && (
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-destructive">Game Over!</h3>
          <p className="text-sm text-muted-foreground">
            Final Score: {score}
            <br />
            Press the reset button to play again
          </p>
        </div>
      )}
      <div className="mt-4 text-sm text-muted-foreground">
        <p>Controls:</p>
        <ul className="list-disc list-inside">
          <li>Arrow Left/Right: Move piece</li>
          <li>Arrow Up: Rotate piece</li>
          <li>Arrow Down: Soft drop</li>
          <li>Space: Hard drop</li>
        </ul>
      </div>
    </Card>
  );
}
