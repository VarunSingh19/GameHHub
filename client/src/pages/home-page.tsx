import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import type { GameScore } from "@shared/schema";
import Snake from "@/games/snake";
import Memory from "@/games/memory";
import { LogOut, Trophy } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { data: userScores } = useQuery<GameScore[]>({
    queryKey: ["/api/user/scores"],
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">GameHub</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="snake">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="snake">Snake</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
            <div>
              <TabsContent value="snake" className="m-0">
                <Snake />
              </TabsContent>
              <TabsContent value="memory" className="m-0">
                <Memory />
              </TabsContent>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Your Recent Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userScores?.slice(0, 5).map((score) => (
                    <div
                      key={score.id}
                      className="flex justify-between items-center py-2 border-b border-border last:border-0"
                    >
                      <span className="capitalize">{score.game}</span>
                      <span className="font-mono">{score.score}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
