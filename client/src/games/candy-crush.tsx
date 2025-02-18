"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw, Trophy } from "lucide-react"
import { motion } from "framer-motion"
import { apiRequest, queryClient } from "@/lib/queryClient"
import type { GameScore } from "@shared/schema"
import { useQuery } from "@tanstack/react-query"

const CANDY_COLORS = ["🍬", "🍭", "🍫", "🍩", "🍪", "🍮"]
const GRID_SIZE = 8
const MATCH_MIN = 3

type Candy = {
    color: string
    isMatched: boolean
}

export default function CandyCrush() {
    const [board, setBoard] = useState<Candy[][]>([])
    const [selectedCandy, setSelectedCandy] = useState<{ row: number; col: number } | null>(null)
    const [score, setScore] = useState(0)
    const [moves, setMoves] = useState(0)
    const [gameOver, setGameOver] = useState(false)

    const { data: userScores } = useQuery<GameScore[]>({
        queryKey: ["/api/user/scores"],
    })

    useEffect(() => {
        resetGame()
    }, [])

    const resetGame = () => {
        const newBoard = Array(GRID_SIZE)
            .fill(null)
            .map(() =>
                Array(GRID_SIZE)
                    .fill(null)
                    .map(() => ({
                        color: CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)],
                        isMatched: false,
                    })),
            )
        setBoard(newBoard)
        setScore(0)
        setMoves(0)
        setGameOver(false)
    }

    const handleCandyClick = (row: number, col: number) => {
        if (gameOver) return

        if (!selectedCandy) {
            setSelectedCandy({ row, col })
        } else {
            const isAdjacent =
                (Math.abs(selectedCandy.row - row) === 1 && selectedCandy.col === col) ||
                (Math.abs(selectedCandy.col - col) === 1 && selectedCandy.row === row)

            if (isAdjacent) {
                swapCandies(selectedCandy.row, selectedCandy.col, row, col)
                setMoves(moves + 1)
            }

            setSelectedCandy(null)
        }
    }

    const swapCandies = (row1: number, col1: number, row2: number, col2: number) => {
        const newBoard = [...board]
        const temp = newBoard[row1][col1]
        newBoard[row1][col1] = newBoard[row2][col2]
        newBoard[row2][col2] = temp
        setBoard(newBoard)

        setTimeout(() => {
            const matchedBoard = findMatches(newBoard)
            if (JSON.stringify(matchedBoard) !== JSON.stringify(newBoard)) {
                removeMatches(matchedBoard)
            } else {
                // Swap back if no matches
                swapCandies(row2, col2, row1, col1)
            }
        }, 300)
    }

    const findMatches = (currentBoard: Candy[][]) => {
        const newBoard = JSON.parse(JSON.stringify(currentBoard))

        // Check horizontal matches
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE - 2; col++) {
                if (
                    newBoard[row][col].color === newBoard[row][col + 1].color &&
                    newBoard[row][col].color === newBoard[row][col + 2].color
                ) {
                    newBoard[row][col].isMatched = true
                    newBoard[row][col + 1].isMatched = true
                    newBoard[row][col + 2].isMatched = true
                }
            }
        }

        // Check vertical matches
        for (let row = 0; row < GRID_SIZE - 2; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (
                    newBoard[row][col].color === newBoard[row + 1][col].color &&
                    newBoard[row][col].color === newBoard[row + 2][col].color
                ) {
                    newBoard[row][col].isMatched = true
                    newBoard[row + 1][col].isMatched = true
                    newBoard[row + 2][col].isMatched = true
                }
            }
        }

        return newBoard
    }

    const removeMatches = (matchedBoard: Candy[][]) => {
        let points = 0
        const newBoard = matchedBoard.map((row) =>
            row.map((candy) => {
                if (candy.isMatched) {
                    points++
                    return {
                        color: CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)],
                        isMatched: false,
                    }
                }
                return candy
            }),
        )

        setScore(score + points)
        setBoard(newBoard)

        // Check for new matches after removing
        setTimeout(() => {
            const newMatchedBoard = findMatches(newBoard)
            if (JSON.stringify(newMatchedBoard) !== JSON.stringify(newBoard)) {
                removeMatches(newMatchedBoard)
            } else if (moves >= 20) {
                setGameOver(true)
                submitScore()
            }
        }, 300)
    }

    const submitScore = async () => {
        await apiRequest("POST", "/api/scores", {
            game: "candycrush",
            score,
        })
        queryClient.invalidateQueries({ queryKey: ["/api/user/scores"] })
    }

    return (
        <>
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="space-x-4">
                        <span className="font-mono">Score: {score}</span>
                        <span className="font-mono">Moves: {moves}/20</span>
                    </div>
                    <Button size="icon" variant="outline" onClick={resetGame}>
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-8 gap-1">
                    {board.map((row, rowIndex) =>
                        row.map((candy, colIndex) => (
                            <motion.button
                                key={`${rowIndex}-${colIndex}`}
                                className={`aspect-square text-2xl flex items-center justify-center rounded-lg ${selectedCandy?.row === rowIndex && selectedCandy?.col === colIndex
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                    }`}
                                onClick={() => handleCandyClick(rowIndex, colIndex)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {candy.color}
                            </motion.button>
                        )),
                    )}
                </div>
                {gameOver && (
                    <div className="mt-4 text-center">
                        <h3 className="text-lg font-semibold text-primary">Game Over!</h3>
                        <p className="text-sm text-muted-foreground">Final Score: {score}. Press the reset button to play again.</p>
                    </div>
                )}
            </Card>

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
                                <div
                                    key={score.id}
                                    className="flex justify-between items-center py-2 border-b border-border last:border-0"
                                >
                                    <span className="capitalize font-semibold">{score.game}</span>
                                    <span className="font-mono text-lg">{score.score}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground">No scores yet. Play a game to get started!</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

