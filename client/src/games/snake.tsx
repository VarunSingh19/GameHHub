import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 100;

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "hsl(var(--card))";
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Draw snake
    ctx.fillStyle = "hsl(var(--primary))";
    snake.forEach(({ x, y }) => {
      ctx.fillRect(
        x * CELL_SIZE,
        y * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      );
    });

    // Draw food
    ctx.fillStyle = "hsl(var(--destructive))";
    ctx.fillRect(
      food.x * CELL_SIZE,
      food.y * CELL_SIZE,
      CELL_SIZE - 1,
      CELL_SIZE - 1
    );
  }, [snake, food]);

  useEffect(() => {
    if (!isRunning || gameOver) return;

    const interval = setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        // Check for collisions
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          currentSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameOver(true);
          setIsRunning(false);
          submitScore();
          return currentSnake;
        }

        const newSnake = [newHead, ...currentSnake];

        // Check if food is eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, GAME_SPEED);

    return () => clearInterval(interval);
  }, [isRunning, direction, gameOver, food]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isRunning) return;

      switch (e.key) {
        case "ArrowUp":
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning, direction]);

  const submitScore = async () => {
    await apiRequest("POST", "/api/scores", {
      game: "snake",
      score,
    });
    queryClient.invalidateQueries({ queryKey: ["/api/user/scores"] });
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
  };

  return (
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
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border border-border"
      />
      {gameOver && (
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-destructive">Game Over!</h3>
          <p className="text-sm text-muted-foreground">
            Press the reset button to play again
          </p>
        </div>
      )}
    </Card>
  );
}
