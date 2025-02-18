
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, User, Clock, Crown } from "lucide-react";
import type { GameScore } from "@shared/schema";

// Replace these with your actual Cloudinary credentials.
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;


export default function ProfilePage() {
  const { user } = useAuth();
  const { data: userScores } = useQuery<GameScore[]>({
    queryKey: ["/api/user/scores"],
  });

  // Retrieve stored image from localStorage if available.
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const storedPic = localStorage.getItem("profilePic");
    if (storedPic) {
      setProfilePic(storedPic);
    }
  }, []);

  // Calculate statistics
  const totalGames = userScores?.length ?? 0;
  const highestScore =
    userScores?.reduce(
      (max, score) => (score.score > max ? score.score : max),
      0
    ) ?? 0;

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

  // Compute SHA-1 hash using the Web Crypto API
  async function computeSHA1(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Handle file input change
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    await uploadToCloudinary(file);
  };

  // Upload image to Cloudinary using a signed request
  const uploadToCloudinary = async (file: File) => {
    setUploading(true);
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      // For a minimal upload, we sign only the timestamp.
      const stringToSign = `timestamp=${timestamp}${API_SECRET}`;
      const signature = await computeSHA1(stringToSign);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("timestamp", timestamp.toString());
      if (API_KEY) {
        formData.append("api_key", API_KEY);
      } else {
        console.error("API_KEY is not defined");
      }
      formData.append("signature", signature);

      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        setProfilePic(data.secure_url);
        // Save the image URL to localStorage for persistence.
        localStorage.setItem("profilePic", data.secure_url);
      } else {
        console.error("Upload failed", data);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    setUploading(false);
  };

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
              <div className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4 shadow-inner">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  <div className="relative">
                    <input
                      id="profilePicInput"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profilePicInput"
                      className="cursor-pointer inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition duration-150 ease-in-out shadow-md"
                    >
                      {uploading ? "Uploading..." : "Change Profile Picture"}
                    </label>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Username</span>
                  <span className="font-semibold">{user?.username}</span>
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
                {gameStats &&
                  Object.entries(gameStats).map(([game, stats]) => (
                    <div key={game} className="space-y-2">
                      <h3 className="font-semibold capitalize">{game}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Games Played
                          </span>
                          <span className="font-mono">{stats.count}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            High Score
                          </span>
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
                      <span className="capitalize font-semibold">
                        {score.game}
                      </span>
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
