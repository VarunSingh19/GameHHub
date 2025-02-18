import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { GameScore } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

const SYMBOLS = ["🎮", "🎲", "🎯", "🎪", "🎨", "🎭", "🎪", "🎯"];
const PAIRS = [...SYMBOLS, ...SYMBOLS];

export default function Memory() {
  const [cards, setCards] = useState<Array<{ symbol: string; isFlipped: boolean; isMatched: boolean }>>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const { data: userScores } = useQuery<GameScore[]>({
    queryKey: ["/api/user/scores"],
  });

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const shuffled = PAIRS
      .sort(() => Math.random() - 0.5)
      .map((symbol) => ({
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setSelectedCards([]);
    setScore(0);
    setMoves(0);
    setGameOver(false);
  };

  const handleCardClick = (index: number) => {
    if (
      selectedCards.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    )
      return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    setSelectedCards([...selectedCards, index]);

    if (selectedCards.length === 1) {
      setMoves((m) => m + 1);
      const [firstIndex] = selectedCards;

      if (cards[firstIndex].symbol === cards[index].symbol) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[index].isMatched = true;
          setCards(matchedCards);
          setSelectedCards([]);
          setScore((s) => s + 10);

          if (matchedCards.every((card) => card.isMatched)) {
            setGameOver(true);
            submitScore();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const flippedBack = [...cards];
          flippedBack[firstIndex].isFlipped = false;
          flippedBack[index].isFlipped = false;
          setCards(flippedBack);
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const submitScore = async () => {
    await apiRequest("POST", "/api/scores", {
      game: "memory",
      score,
    });
    queryClient.invalidateQueries({ queryKey: ["/api/user/scores"] });
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="space-x-4">
            <span className="font-mono">Score: {score}</span>
            <span className="font-mono">Moves: {moves}</span>
          </div>
          <Button size="icon" variant="outline" onClick={resetGame}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card, index) => (
            <motion.button
              key={index}
              className={`aspect-square text-2xl flex items-center justify-center rounded-lg ${card.isFlipped || card.isMatched
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
                }`}
              onClick={() => handleCardClick(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {(card.isFlipped || card.isMatched) && card.symbol}
            </motion.button>
          ))}
        </div>
        {gameOver && (
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-primary">
              Congratulations! You won!
            </h3>
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
