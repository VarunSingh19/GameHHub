import { Sparkles } from "lucide-react";
import { Link } from "wouter";
import {
    Trophy,
    User,
    Home,
    Gamepad2 as Snake,
    Brain,
    Square,
    Github,
    Linkedin,
    Twitter,
} from "lucide-react";
export function Footer() {

    const socialLinks = [
        {
            href: "https://twitter.com",
            icon: Twitter,
            label: "Twitter",
            color: "hover:text-blue-400",
        },
        {
            href: "https://github.com/VarunSingh19",
            icon: Github,
            label: "GitHub",
            color: "hover:text-purple-400",
        },
        {
            href: "https://linkedin.com",
            icon: Linkedin,
            label: "LinkedIn",
            color: "hover:text-blue-500",
        },
    ];

    const games = [
        { href: "/games/snake", icon: Snake, label: "Snake", players: "10k+" },
        { href: "/games/memory", icon: Brain, label: "Memory", players: "8k+" },
        { href: "/games/tetris", icon: Square, label: "Tetris", players: "15k+" },
    ];

    const navItems = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
        { href: "/profile", icon: User, label: "Profile" },
    ];
    return (
        <footer className="bg-[#000000] border-t border-blue-500/20">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="h-6 w-6 text-blue-400" />
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                GameHub
                            </h2>
                        </div>
                        <p className="text-blue-100/70 max-w-md">
                            Join our global gaming community and experience classic games reimagined
                            for the modern era. Challenge friends, climb leaderboards, and become
                            a gaming legend.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-blue-100">Quick Links</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[...navItems, ...games].map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="text-blue-100/70 hover:text-blue-100 transition-colors"
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Social & Newsletter */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-blue-100">Connect With Us</h3>
                        <div className="flex space-x-4">
                            {socialLinks.map(({ href, icon: Icon, label, color }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-blue-100/70 transition-all duration-200 hover:scale-110 ${color}`}
                                    aria-label={label}
                                >
                                    <Icon className="h-6 w-6" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-blue-500/20 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <div className="text-blue-100/70 text-sm">
                        © {new Date().getFullYear()} GameHub. All rights reserved.
                    </div>
                    <div className="text-blue-100/70 text-sm">
                        Made With 💖 by <a href="https://github.com/VarunSingh19" target="_blank">{"Varun Singh"}</a>
                    </div>
                    <div className="flex space-x-6 text-sm">
                        <a href="#" className="text-blue-100/70 hover:text-blue-100">Privacy Policy</a>
                        <a href="#" className="text-blue-100/70 hover:text-blue-100">Terms of Service</a>
                        <a href="#" className="text-blue-100/70 hover:text-blue-100">Contact Us</a>
                    </div>
                </div>
            </div>
        </footer >
    );
}