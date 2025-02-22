"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Trophy } from "lucide-react"
import { apiRequest, queryClient } from "@/lib/queryClient"
import type { GameScore } from "@shared/schema"
import { useQuery } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const GRID_SIZE = 20
const BASE_CELL_SIZE = 20 // Base size for desktop

type Difficulty = "low" | "medium" | "high"
const GAME_SPEEDS: Record<Difficulty, number> = {
  low: 150,
  medium: 100,
  high: 60,
}

export default function EnhancedSnake() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState(BASE_CELL_SIZE * GRID_SIZE)
  const [cellSize, setCellSize] = useState(BASE_CELL_SIZE)

  const [snake, setSnake] = useState([{ x: 10, y: 10 }])
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [food, setFood] = useState({ x: 15, y: 15 })
  const [isRunning, setIsRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")

  const directionRef = useRef(direction)
  const foodRef = useRef(food)

  const { data: userScores } = useQuery<GameScore[]>({
    queryKey: ["/api/user/scores"],
  })

  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  useEffect(() => {
    foodRef.current = food
  }, [food])

  useEffect(() => {
    const updateCanvasSize = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 400)
      const newCellSize = Math.floor(maxWidth / GRID_SIZE)
      setCellSize(newCellSize)
      setCanvasSize(newCellSize * GRID_SIZE)
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // Draw snake
    snake.forEach(({ x, y }, index) => {
      const gradient = ctx.createRadialGradient(
        x * cellSize + cellSize / 2,
        y * cellSize + cellSize / 2,
        cellSize / 10,
        x * cellSize + cellSize / 2,
        y * cellSize + cellSize / 2,
        cellSize / 2,
      )
      gradient.addColorStop(0, "#4ade80")
      gradient.addColorStop(1, "#22c55e")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, cellSize / 2 - 1, 0, 2 * Math.PI)
      ctx.fill()

      // Draw eyes for the head
      if (index === 0) {
        ctx.fillStyle = "#000000"
        ctx.beginPath()
        ctx.arc(x * cellSize + cellSize / 3, y * cellSize + cellSize / 3, cellSize / 10, 0, 2 * Math.PI)
        ctx.arc(x * cellSize + (2 * cellSize) / 3, y * cellSize + cellSize / 3, cellSize / 10, 0, 2 * Math.PI)
        ctx.fill()
      }
    })

    // Draw food
    const foodGradient = ctx.createRadialGradient(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 10,
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2,
    )
    foodGradient.addColorStop(0, "#f87171")
    foodGradient.addColorStop(1, "#ef4444")

    ctx.fillStyle = foodGradient
    ctx.beginPath()
    ctx.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, cellSize / 2 - 1, 0, 2 * Math.PI)
    ctx.fill()
  }, [snake, food, canvasSize, cellSize])

  useEffect(() => {
    if (!isRunning || gameOver) return

    const interval = setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0]
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        }

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          currentSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameOver(true)
          setIsRunning(false)
          return currentSnake
        }

        const newSnake = [newHead, ...currentSnake]

        if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
          setScore((s) => s + 10)
          let newFood: { x: number; y: number }
          do {
            newFood = {
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE),
            }
          } while (newSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y))
          setFood(newFood)
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, GAME_SPEEDS[difficulty])

    return () => clearInterval(interval)
  }, [isRunning, gameOver, difficulty])

  useEffect(() => {
    if (gameOver) {
      submitScore()
    }
  }, [gameOver])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isRunning) return

      switch (e.key) {
        case "ArrowUp":
          if (directionRef.current.y !== 1) setDirection({ x: 0, y: -1 })
          break
        case "ArrowDown":
          if (directionRef.current.y !== -1) setDirection({ x: 0, y: 1 })
          break
        case "ArrowLeft":
          if (directionRef.current.x !== 1) setDirection({ x: -1, y: 0 })
          break
        case "ArrowRight":
          if (directionRef.current.x !== -1) setDirection({ x: 1, y: 0 })
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isRunning])

  const submitScore = async () => {
    await apiRequest("POST", "/api/scores", {
      game: "snake",
      score,
    })
    queryClient.invalidateQueries({ queryKey: ["/api/user/scores"] })
  }

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }])
    setDirection({ x: 1, y: 0 })
    setScore(0)
    setGameOver(false)
    setIsRunning(false)
    setFood({
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    })
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
          <CardTitle className="text-2xl font-bold text-center">Snake Game</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="font-mono text-xl">🍎 {score}</div>
            <div className="space-x-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIsRunning((prev) => !prev)}
                disabled={gameOver}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={resetGame}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              className="border-4 border-primary rounded-lg shadow-lg"
            />
          </div>
          <div className="flex justify-between items-center">
            <Select value={difficulty} onValueChange={(value: Difficulty) => setDifficulty(value)} disabled={isRunning}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">Hard</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              {isRunning ? "Game in progress" : "Press play to start"}
            </div>
          </div>
        </CardContent>
      </Card>

      {gameOver && (
        <Card className="bg-destructive text-destructive-foreground animate-bounce">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
            <p className="text-lg">Your score: {score}</p>
            <Button onClick={resetGame} variant="secondary" className="mt-4">
              Play Again
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-primary" />
            Your Top Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userScores && userScores.length > 0 ? (
            userScores.slice(0, 5).map((score, index) => (
              <div
                key={score.id}
                className={cn(
                  "flex justify-between items-center py-2 border-b border-border last:border-0",
                  index === 0 && "text-primary font-bold",
                )}
              >
                <span className="capitalize font-semibold flex items-center gap-2">
                  {index === 0 && <Trophy className="h-4 w-4" />}
                  {score.game}
                </span>
                <span className="font-mono text-lg">{score.score}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">No scores yet. Play a game to get started!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

