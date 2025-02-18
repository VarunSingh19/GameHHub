import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Trophy } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { GameScore } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

const GRID_SIZE = 20;
const BASE_CELL_SIZE = 20; // Base size for desktop
const GAME_SPEED = 100;

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState(BASE_CELL_SIZE * GRID_SIZE);
  const [cellSize, setCellSize] = useState(BASE_CELL_SIZE);

  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Refs for latest values
  const directionRef = useRef(direction);
  const foodRef = useRef(food);


  const { data: userScores } = useQuery<GameScore[]>({
    queryKey: ["/api/user/scores"],
  });

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  // Handle responsive resizing
  useEffect(() => {
    const updateCanvasSize = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 400); // Keep a max width of 400px
      const newCellSize = Math.floor(maxWidth / GRID_SIZE);
      setCellSize(newCellSize);
      setCanvasSize(newCellSize * GRID_SIZE);
    };

    updateCanvasSize(); // Initial call
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw snake
    ctx.fillStyle = "#00aa00";
    snake.forEach(({ x, y }) => {
      ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
    });

    // Draw food
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(
      food.x * cellSize,
      food.y * cellSize,
      cellSize - 1,
      cellSize - 1,
    );
  }, [snake, food, canvasSize, cellSize]);

  // Game loop
  useEffect(() => {
    if (!isRunning || gameOver) return;

    const interval = setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        // Check for collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          currentSnake.some(
            (segment) => segment.x === newHead.x && segment.y === newHead.y,
          )
        ) {
          setGameOver(true);
          setIsRunning(false);
          return currentSnake;
        }

        const newSnake = [newHead, ...currentSnake];

        // Check if food is eaten
        if (
          newHead.x === foodRef.current.x &&
          newHead.y === foodRef.current.y
        ) {
          setScore((s) => s + 10);
          let newFood: { x: number; y: number };
          do {
            newFood = {
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE),
            };
          } while (
            newSnake.some(
              (segment) => segment.x === newFood.x && segment.y === newFood.y,
            )
          );
          setFood(newFood);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, GAME_SPEED);

    return () => clearInterval(interval);
  }, [isRunning, gameOver]);

  // Submit score when game over state changes to true
  useEffect(() => {
    if (gameOver) {
      submitScore();
    }
  }, [gameOver]);

  // Handle arrow key presses
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isRunning) return;

      switch (e.key) {
        case "ArrowUp":
          if (directionRef.current.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (directionRef.current.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (directionRef.current.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (directionRef.current.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning]);

  const submitScore = async () => {
    await apiRequest("POST", "/api/scores", {
      game: "snake",
      score, // now this score is up-to-date
    });
    queryClient.invalidateQueries({ queryKey: ["/api/user/scores"] });
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setIsRunning(false);
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="font-mono">Score: {score}</div>
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
            <Button size="icon" variant="outline" onClick={resetGame}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className="border border-border max-w-full"
          />
        </div>
        {gameOver && (
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-destructive">Game Over!</h3>
            <p className="text-sm text-muted-foreground">
              Press the reset button to play again
            </p>
          </div>
        )}
      </Card>

      {/* Recent Scores */}
      <div>
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
                <div
                  key={score.id}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0"
                >
                  <span className="capitalize font-semibold">
                    {score.game}
                  </span>
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
