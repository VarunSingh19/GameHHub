import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import ProfilePage from "@/pages/profile-page";
import { ProtectedRoute } from "./lib/protected-route";
import Memory from "./games/memory";
import Snake from "./games/snake";
import Tetris from "./games/tetris";
import { Footer } from "./components/layout/footer";
import GamesPage from "./games/page";
import CandyCrush from "./games/candy-crush";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {children}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route>
        <Layout>
          <Switch>
            <ProtectedRoute path="/" component={HomePage} />
            <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
            <ProtectedRoute path="/profile" component={ProfilePage} />
            <ProtectedRoute path="/games" component={GamesPage} />
            <ProtectedRoute path="/games/memory" component={Memory} />
            <ProtectedRoute path="/games/snake" component={Snake} />
            <ProtectedRoute path="/games/tetris" component={Tetris} />
            <ProtectedRoute path="/games/candy-crush" component={CandyCrush} />
            <Route component={NotFound} />
          </Switch>
          <Footer />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;