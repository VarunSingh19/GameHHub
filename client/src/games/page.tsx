import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Trophy, Users, Gamepad2, Crown, Sparkles } from "lucide-react";

// Sample game data
const games = [
    {
        id: 'snake',
        name: 'Snake',
        description: 'Master the classic with new power-ups and competitive modes',
        difficulty: 'Medium',
        players: '10k+',
        image:
            'https://th.bing.com/th/id/R.59c160cabaadd516e8644a1f3e59d5cd?rik=lsawqZDnbqY%2fbA&riu=http%3a%2f%2fwww.rewritetherules.org%2fwp-content%2fuploads%2f2023%2f06%2fWhy-Do-I-Keep-Seeing-Snakes-3.jpg&ehk=h0CYMv%2bIfCbW4QzS54e1ZushN6%2b%2bGYt820HCJVG6TQg%3d&risl=&pid=ImgRaw&r=0',
        route: '/games/snake',
    },
    {
        id: 'memory',
        name: 'Memory Match',
        description: 'Challenge your memory with stunning visual effects and progressive difficulty',
        difficulty: 'Easy',
        players: '8k+',
        image:
            'https://th.bing.com/th/id/OIP.X58oEPTq1iGYJ1lkn1Qy7wHaHa?rs=1&pid=ImgDetMain',
        route: '/games/memory',
    },
    {
        id: 'tetris',
        name: 'Quantum Blocks',
        description: 'Experience Tetris with a mind-bending quantum mechanics twist',
        difficulty: 'Hard',
        players: '15k+',
        image:
            'https://th.bing.com/th/id/OIP.lwy6AMjdWQ1FHKlwyxLTPAHaHa?rs=1&pid=ImgDetMain',
        route: '/games/tetris',
    },
    {
        id: "candy-crush",
        name: "Candy Crush",
        description: "Engage in a delightful match-three puzzle adventure, swapping colorful candies to achieve challenging objectives.",
        difficulty: "Medium",
        players: "35k+",
        image: "https://th.bing.com/th/id/OIP.sRbJhi9MmTzHhv_lXwGr4QHaHa?rs=1&pid=ImgDetMain",
        route: "/games/candy-crush"
    }

];

export default function GamesPage() {
    return (
        <div className="min-h-screen bg-[#0a0a1f] text-white">
            {/* Hero Section */}
            <section className="hero bg-gradient-to-br from-blue-900 to-purple-900 py-20">
                <div className="container mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-bold mb-4"
                    >
                        Explore Our Games
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-xl md:text-2xl mb-8 text-blue-100/90"
                    >
                        Dive into a curated collection where classic fun meets modern innovation.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-transform duration-300 hover:scale-105 px-8 py-4"
                        >
                            Get Started
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Games Grid */}
            <section className="games container mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center gap-3 mb-4"
                    >
                        <Crown className="w-8 h-8 text-orange-400" />
                        <h2 className="text-4xl md:text-5xl font-bold">Featured Games</h2>
                    </motion.div>
                    <p className="text-blue-200/70 text-xl mt-4">
                        Choose your challenge and compete with players worldwide.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {games.map((game, index) => (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <Card className="relative h-[420px] bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500/20 overflow-hidden group backdrop-blur-sm">
                                {/* Background overlay for image effect */}
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
                                    <h3 className="text-3xl font-bold mb-3">{game.name}</h3>
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

            {/* Community Stats Section */}
            <section className="stats bg-gray-900 py-16">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <Sparkles className="w-10 h-10 inline-block text-yellow-400 mb-4" />
                        <h2 className="text-4xl font-bold mb-2">Gaming Excellence</h2>
                        <p className="text-lg mb-8">
                            Join our thriving community of players and embrace the challenge.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { value: '500K+', label: 'Active Players' },
                                { value: '1M+', label: 'Games Played' },
                                { value: '100+', label: 'Daily Challenges' },
                            ].map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.2, duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg"
                                >
                                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                                    <p className="mt-2">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
