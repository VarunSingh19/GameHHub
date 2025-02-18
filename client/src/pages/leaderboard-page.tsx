import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award } from "lucide-react";
import type { GameScore } from "@shared/schema";

type ScoreWithUsername = GameScore & { username?: string };

export default function LeaderboardPage() {
  const games = ["snake", "memory", "tetris", "candycrush"];
  const [activeGame, setActiveGame] = useState(games[0]);

  const { data: scores } = useQuery<ScoreWithUsername[]>({
    queryKey: [`/api/scores/${activeGame}`],
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Global Leaderboards</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeGame} onValueChange={setActiveGame}>
          <TabsList className="grid w-full grid-cols-4 max-w-[600px]">
            <TabsTrigger value="snake">Snake</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="tetris">Tetris</TabsTrigger>
            <TabsTrigger value="candycrush">Candy Crush</TabsTrigger>
          </TabsList>

          {games.map((game) => (
            <TabsContent key={game} value={game} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Top Scores - {game.charAt(0).toUpperCase() + game.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scores?.slice(0, 10).map((score, index) => (
                      <div
                        key={score.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          {index === 0 ? (
                            <Award className="h-6 w-6 text-yellow-500" />
                          ) : index === 1 ? (
                            <Award className="h-6 w-6 text-gray-400" />
                          ) : index === 2 ? (
                            <Award className="h-6 w-6 text-orange-500" />
                          ) : (
                            <span className="text-2xl font-bold text-primary">
                              #{index + 1}
                            </span>
                          )}
                          <span>{score.username}</span>
                        </div>
                        <span className="font-mono text-lg">{score.score}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
