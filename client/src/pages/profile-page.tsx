import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, User, Clock, Crown } from "lucide-react";
import type { GameScore } from "@shared/schema";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: userScores } = useQuery<GameScore[]>({
    queryKey: ["/api/user/scores"],
  });

  // Calculate statistics
  const totalGames = userScores?.length ?? 0;
  const highestScore = userScores?.reduce((max, score) => 
    score.score > max ? score.score : max, 0) ?? 0;

  const gameStats = userScores?.reduce((acc, score) => {
    if (!acc[score.game]) {
      acc[score.game] = { count: 0, highScore: 0 };
    }
    acc[score.game].count++;
    if (score.score > acc[score.game].highScore) {
      acc[score.game].highScore = score.score;
    }
    return acc;
  }, {} as Record<string, { count: number; highScore: number }>);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Player Profile</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Username</span>
                  <span className="font-semibold">{user?.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-semibold">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Games</span>
                  <span className="font-mono">{totalGames}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Highest Score</span>
                  <span className="font-mono">{highestScore}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Game Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(gameStats || {}).map(([game, stats]) => (
                  <div key={game} className="space-y-2">
                    <h3 className="font-semibold capitalize">{game}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Games Played</span>
                        <span className="font-mono">{stats.count}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">High Score</span>
                        <span className="font-mono">{stats.highScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Games */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userScores?.slice(0, 10).map((score) => (
                  <div
                    key={score.id}
                    className="flex justify-between items-center py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <span className="capitalize font-semibold">{score.game}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {new Date(score.playedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-mono">{score.score}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
