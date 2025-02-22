"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, Trophy, ArrowLeft, ArrowRight, ChevronUp, ChevronDown } from "lucide-react"
import { apiRequest, queryClient } from "@/lib/queryClient"
import type { GameScore } from "@shared/schema"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 30

type Point = { x: number; y: number }
type Tetromino = {
  shape: boolean[][]
  position: Point
  color: string
}

const TETROMINOES: Omit<Tetromino, "position">[] = [
  { shape: [[true, true, true, true]], color: "hsl(200, 100%, 50%)" }, // I
  {
    shape: [
      [true, false],
      [true, false],
      [true, true],
    ],
    color: "hsl(32, 100%, 50%)",
  }, // L
  {
    shape: [
      [false, true],
      [false, true],
      [true, true],
    ],
    color: "hsl(240, 100%, 50%)",
  }, // J
  {
    shape: [
      [true, true],
      [true, true],
    ],
    color: "hsl(60, 100%, 50%)",
  }, // O
  {
    shape: [
      [false, true, true],
      [true, true, false],
    ],
    color: "hsl(120, 100%, 50%)",
  }, // S
  {
    shape: [
      [true, true, false],
      [false, true, true],
    ],
    color: "hsl(0, 100%, 50%)",
  }, // Z
  {
    shape: [
      [true, true, true],
      [false, true, false],
    ],
    color: "hsl(300, 100%, 50%)",
  }, // T
]

type Difficulty = "easy" | "medium" | "hard"

const DIFFICULTY_SPEEDS: Record<Difficulty, number> = {
  easy: 800,
  medium: 500,
  hard: 200,
}

export default function EnhancedTetris() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [board, setBoard] = useState<(string | null)[][]>(
    Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null)),
  )
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null)
  const [nextPiece, setNextPiece] = useState<Omit<Tetromino, "position"> | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [linesCleared, setLinesCleared] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [scale, setScale] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")

  const dropSoundRef = useRef(new Audio("/sounds/drop.mp3"))
  const rotateSoundRef = useRef(new Audio("/sounds/rotate.mp3"))
  const gameOverSoundRef = useRef(new Audio("/sounds/gameover.mp3"))
  const lineClearSoundRef = useRef(new Audio("/sounds/line-clear.mp3"))

  const { data: userScores } = useQuery<GameScore[]>({
    queryKey: ["/api/user/scores"],
  })

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        setScale(containerWidth / (BOARD_WIDTH * CELL_SIZE))
      }
      setIsMobile(window.innerWidth < 640)
    }
    updateScale()
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [])

  const checkCollision = useCallback(
    (piece: Tetromino, offsetX = 0, offsetY = 0) => {
      return piece.shape.some((row, y) =>
        row.some((cell, x) => {
          if (!cell) return false
          const newX = piece.position.x + x + offsetX
          const newY = piece.position.y + y + offsetY
          return newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || (newY >= 0 && board[newY][newX] !== null)
        }),
      )
    },
    [board],
  )

  const spawnPiece = useCallback((): Tetromino | null => {
    const newPiece = nextPiece || TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)]
    const spawnedPiece: Tetromino = {
      ...newPiece,
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
    }

    if (checkCollision(spawnedPiece)) {
      setGameOver(true)
      setIsRunning(false)
      gameOverSoundRef.current.play().catch(() => { })
      submitScore()
      return null
    }

    setNextPiece(TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)])
    return spawnedPiece
  }, [checkCollision, nextPiece])

  const rotatePiece = useCallback(
    (piece: Tetromino) => {
      const rotated: Tetromino = {
        ...piece,
        shape: piece.shape[0].map((_, i) => piece.shape.map((row) => row[i]).reverse()),
      }
      if (!checkCollision(rotated)) {
        setCurrentPiece(rotated)
        rotateSoundRef.current.play().catch(() => { })
      }
    },
    [checkCollision],
  )

  const movePiece = useCallback(
    (offsetX: number) => {
      if (!currentPiece || gameOver) return
      if (!checkCollision(currentPiece, offsetX, 0)) {
        setCurrentPiece({
          ...currentPiece,
          position: {
            ...currentPiece.position,
            x: currentPiece.position.x + offsetX,
          },
        })
      }
    },
    [currentPiece, gameOver, checkCollision],
  )

  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver) return
    if (!checkCollision(currentPiece, 0, 1)) {
      setCurrentPiece({
        ...currentPiece,
        position: {
          ...currentPiece.position,
          y: currentPiece.position.y + 1,
        },
      })
      dropSoundRef.current.play().catch(() => { })
    } else {
      setBoard((prevBoard) => {
        const newBoard = prevBoard.map((row) => [...row])
        currentPiece.shape.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell) {
              const boardY = currentPiece.position.y + y
              const boardX = currentPiece.position.x + x
              if (boardY >= 0) {
                newBoard[boardY][boardX] = currentPiece.color
              }
            }
          })
        })
        let linesCleared = 0
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
          if (newBoard[y].every((cell) => cell !== null)) {
            newBoard.splice(y, 1)
            newBoard.unshift(Array(BOARD_WIDTH).fill(null))
            linesCleared++
            y++
          }
        }
        if (linesCleared > 0) {
          setScore((prev) => prev + linesCleared * 100 * level)
          setLinesCleared((prev) => {
            const newLinesCleared = prev + linesCleared
            setLevel(Math.floor(newLinesCleared / 10) + 1)
            return newLinesCleared
          })
          lineClearSoundRef.current.play().catch(() => { })
        }
        return newBoard
      })
      const newPiece = spawnPiece()
      setCurrentPiece(newPiece)
    }
  }, [currentPiece, gameOver, checkCollision, spawnPiece, level])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.style.transform = `scale(${scale})`
    canvas.style.transformOrigin = "top left"

    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE)

    const drawCell = (x: number, y: number, color: string) => {
      ctx.fillStyle = color
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1)
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    }

    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          drawCell(x, y, cell)
        }
      })
    })

    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            drawCell(currentPiece.position.x + x, currentPiece.position.y + y, currentPiece.color)
          }
        })
      })
    }

    // Draw ghost piece
    if (currentPiece) {
      let ghostY = currentPiece.position.y
      while (!checkCollision(currentPiece, 0, ghostY - currentPiece.position.y + 1)) {
        ghostY++
      }
      ctx.globalAlpha = 0.2
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            drawCell(currentPiece.position.x + x, ghostY + y, currentPiece.color)
          }
        })
      })
      ctx.globalAlpha = 1
    }
  }, [board, currentPiece, scale, checkCollision])

  useEffect(() => {
    if (!isRunning || gameOver) return
    const interval = setInterval(dropPiece, DIFFICULTY_SPEEDS[difficulty] / level)
    return () => clearInterval(interval)
  }, [isRunning, dropPiece, gameOver, difficulty, level])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isRunning || gameOver) return
      switch (e.key) {
        case "ArrowLeft":
          movePiece(-1)
          break
        case "ArrowRight":
          movePiece(1)
          break
        case "ArrowUp":
          if (currentPiece) rotatePiece(currentPiece)
          break
        case "ArrowDown":
          dropPiece()
          break
        case " ":
          while (currentPiece && !checkCollision(currentPiece, 0, 1)) {
            dropPiece()
          }
          break
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isRunning, currentPiece, movePiece, rotatePiece, dropPiece, checkCollision, gameOver])

  const submitScore = async () => {
    await apiRequest("POST", "/api/scores", {
      game: "tetris",
      score,
    })
    queryClient.invalidateQueries({ queryKey: ["/api/user/scores"] })
  }

  const startGame = () => {
    setBoard(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null)))
    setScore(0)
    setLevel(1)
    setLinesCleared(0)
    setGameOver(false)
    setNextPiece(TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)])
    const piece = spawnPiece()
    setCurrentPiece(piece)
    setIsRunning(true)
  }

  const handleMobileMove = (offset: number) => movePiece(offset)
  const handleMobileRotate = () => currentPiece && rotatePiece(currentPiece)
  const handleMobileDrop = () => {
    while (currentPiece && !checkCollision(currentPiece, 0, 1)) {
      dropPiece()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center mb-4">Tetris</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <div className="font-mono text-lg mb-2 sm:mb-0">
              Score: {score} | Level: {level} | Lines: {linesCleared}
            </div>
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
                onClick={startGame}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <Select value={difficulty} onValueChange={(value: Difficulty) => setDifficulty(value)} disabled={isRunning}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-center space-x-4">
            <div
              ref={containerRef}
              className="overflow-hidden"
              style={{ width: BOARD_WIDTH * CELL_SIZE, height: BOARD_HEIGHT * CELL_SIZE }}
            >
              <canvas
                ref={canvasRef}
                width={BOARD_WIDTH * CELL_SIZE}
                height={BOARD_HEIGHT * CELL_SIZE}
                className="border-4 border-primary rounded-lg shadow-lg"
              />
            </div>
            <div className="w-32">
              <h3 className="text-lg font-semibold mb-2">Next Piece</h3>
              <div className="bg-white p-2 rounded-lg shadow-md">
                {nextPiece && (
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    {nextPiece.shape.map((row, y) =>
                      row.map((cell, x) =>
                        cell ? (
                          <rect
                            key={`${x}-${y}`}
                            x={x * 25}
                            y={y * 25}
                            width="24"
                            height="24"
                            fill={nextPiece.color}
                            stroke="rgba(0,0,0,0.1)"
                          />
                        ) : null,
                      ),
                    )}
                  </svg>
                )}
              </div>
            </div>
          </div>
          {gameOver && (
            <div className="mt-4 text-center animate-bounce">
              <h3 className="text-2xl font-bold text-destructive mb-2">Game Over!</h3>
              <p className="text-lg">
                Final Score: {score}
                <br />
                Press the reset button to play again.
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
        </CardContent>
      </Card>

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

      <Card className="mt-6 bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-lg shadow-lg">
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

