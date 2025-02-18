import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Trophy, Users, Gamepad2, Crown, Sparkles } from "lucide-react";

export default function HomePage() {
  const games = [
    {
      id: 'snake',
      name: 'Snake ',
      description: 'Master the classic with new power-ups and competitive modes',
      difficulty: 'Medium',
      players: '10k+',
      image: 'https://th.bing.com/th/id/R.59c160cabaadd516e8644a1f3e59d5cd?rik=lsawqZDnbqY%2fbA&riu=http%3a%2f%2fwww.rewritetherules.org%2fwp-content%2fuploads%2f2023%2f06%2fWhy-Do-I-Keep-Seeing-Snakes-3.jpg&ehk=h0CYMv%2bIfCbW4QzS54e1ZushN6%2b%2bGYt820HCJVG6TQg%3d&risl=&pid=ImgRaw&r=0',
      route: '/games/snake',
    },
    {
      id: 'memory',
      name: 'Memory Match',
      description: 'Challenge your memory with stunning visual effects and progressive difficulty',
      difficulty: 'Easy',
      players: '8k+',
      image: 'https://th.bing.com/th/id/OIP.X58oEPTq1iGYJ1lkn1Qy7wHaHa?rs=1&pid=ImgDetMain',
      route: '/games/memory',
    },
    {
      id: 'tetris',
      name: 'Quantum Blocks',
      description: 'Experience Tetris with a mind-bending quantum mechanics twist',
      difficulty: 'Hard',
      players: '15k+',
      image: 'https://th.bing.com/th/id/OIP.lwy6AMjdWQ1FHKlwyxLTPAHaHa?rs=1&pid=ImgDetMain',
      route: '/games/tetris',
    },
    {
      "id": "candy-crush",
      "name": "Candy Crush",
      "description": "Engage in a delightful match-three puzzle adventure, swapping colorful candies to achieve challenging objectives.",
      "difficulty": "Medium",
      "players": "35k+",
      "image": "https://th.bing.com/th/id/OIP.sRbJhi9MmTzHhv_lXwGr4QHaHa?rs=1&pid=ImgDetMain",
      "route": "/games/candy-crush"
    }

  ];


  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a1f] text-foreground">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1f] via-[#1a1a3a] to-[#0a0a1f] opacity-80" />
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a1f]" />

          <div className="relative z-20 text-center space-y-8 px-4 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <Gamepad2 className="w-12 h-12 text-blue-400" />
              <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
                GameHub
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-3xl text-blue-100/90 max-w-3xl mx-auto font-light"
            >
              Where Classic Games Meet Modern Innovation
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col md:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                className="text-xl px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-none shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/games">Play Now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-xl px-8 py-6 border-blue-400/30 text-blue-400 hover:bg-blue-400/10 transition-all duration-300"
                asChild
              >
                <Link href="/leaderboard">Leaderboard</Link>
              </Button>
            </motion.div>
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 text-purple-400/20"
          >
            <Trophy size={80} />
          </motion.div>
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-1/4 right-1/4 text-blue-400/20"
          >
            <Crown size={80} />
          </motion.div>
        </section>

        {/* Games Grid */}
        <section id="games" className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <Crown className="w-8 h-8 text-orange-400" />
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Featured Games
              </h2>
            </motion.div>
            <p className="text-blue-200/70 text-xl mt-4">Choose your challenge and compete with players worldwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="relative h-[420px] bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500/20 overflow-hidden group backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
                  <img
                    src={game.image}
                    alt={game.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <CardContent className="relative z-20 h-full flex flex-col justify-end p-8">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400">{game.players} Active Players</span>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
                        {game.difficulty}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-3">{game.name}</h3>
                    <p className="text-blue-200/80 mb-6">{game.description}</p>
                    <Link to={game.route}>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 group-hover:scale-105 transition-all duration-300">
                        Play Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="container mx-auto px-6"
          >
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                <h2 className="text-4xl font-bold text-white">Gaming Excellence</h2>
              </div>
              <p className="text-blue-200/70 text-xl">Join our thriving gaming community</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { value: '500K+', label: 'Active Players', color: 'blue' },
                { value: '1M+', label: 'Games Played', color: 'purple' },
                { value: '100+', label: 'Daily Challenges', color: 'green' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-lg p-8 backdrop-blur-sm">
                    <div className={`text-5xl font-bold mb-2 text-${stat.color}-400`}>{stat.value}</div>
                    <div className="text-xl text-blue-200/90">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}