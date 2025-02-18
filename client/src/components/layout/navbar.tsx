// import { useState } from "react";
// import { useAuth } from "@/hooks/use-auth";
// import { Button } from "@/components/ui/button";
// import { Link, useLocation } from "wouter";
// import { LogOut, Trophy, User, Gamepad, Home, Menu, X } from "lucide-react";

// export function Navbar() {
//   const { user, logoutMutation } = useAuth();
//   const [location] = useLocation();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const navItems = [
//     { href: "/", icon: Home, label: "Home" },
//     { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
//     { href: "/profile", icon: User, label: "Profile" },
//   ];

//   return (
//     <header className="sticky top-0 z-50 bg-white/90 backdrop-blur shadow-sm">
//       <div className="container mx-auto px-6 py-4 flex items-center justify-between">
//         {/* Logo */}
//         <Link href="/" className="flex items-center space-x-2">
//           <Gamepad className="h-6 w-6 text-primary" />
//           <span className="text-2xl font-bold text-primary">GameHub</span>
//         </Link>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex items-center gap-4">
//           {navItems.map(({ href, icon: Icon, label }) => (
//             <Link
//               key={href}
//               href={href}
//               className={`flex items-center space-x-1 transition-colors hover:text-gray-900 ${location === href ? "text-gray-900" : "text-gray-600"
//                 }`}
//             >
//               <Icon className="h-5 w-5" />
//               <span className="text-sm font-medium">{label}</span>
//             </Link>
//           ))}
//           {user && (
//             <Button
//               variant="link"
//               size="sm"
//               onClick={() => logoutMutation.mutate()}
//             >
//               <LogOut className="h-5 w-5 mr-1" />
//               <span className="text-sm font-medium" >Logout</span>
//             </Button>
//           )}
//         </nav>

//         {/* Mobile Menu Toggle */}
//         <div className="md:hidden">
//           <button
//             onClick={() => setMobileMenuOpen((prev) => !prev)}
//             className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
//             aria-label="Toggle mobile menu"
//           >
//             {mobileMenuOpen ? (
//               <X className="h-6 w-6 text-gray-900" />
//             ) : (
//               <Menu className="h-6 w-6 text-gray-900" />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Navigation Menu */}
//       {mobileMenuOpen && (
//         <div className="md:hidden bg-white/90 backdrop-blur shadow-sm">
//           <nav className="px-6 py-4 space-y-3">
//             {navItems.map(({ href, icon: Icon, label }) => (
//               <Link
//                 key={href}
//                 href={href}
//                 onClick={() => setMobileMenuOpen(false)}
//                 className={`flex items-center space-x-2 transition-colors hover:text-gray-900 ${location === href ? "text-gray-900" : "text-gray-600"
//                   }`}
//               >
//                 <Icon className="h-5 w-5" />
//                 <span className="text-base font-medium">{label}</span>
//               </Link>
//             ))}
//             {user && (
//               <Button
//                 variant="link"
//                 size="sm"
//                 onClick={() => {
//                   logoutMutation.mutate();
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full justify-start"
//               >
//                 <LogOut className="h-5 w-5 mr-1" />
//                 <span className="text-base font-medium">Logout</span>
//               </Button>
//             )}
//           </nav>
//         </div>
//       )}
//     </header>
//   );
// // }
// import { useState } from "react";
// import { useAuth } from "@/hooks/use-auth";
// import { Button } from "@/components/ui/button";
// import { Link, useLocation } from "wouter";
// import {
//   LogOut,
//   Trophy,
//   User,
//   Gamepad,
//   Home,
//   Menu,
//   X,
//   ChevronDown,
//   Gamepad2 as Snake,
//   Brain,
//   Square
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// const games = [
//   { href: "/games/snake", icon: Snake, label: "Snake" },
//   { href: "/games/memory", icon: Brain, label: "Memory" },
//   { href: "/games/tetris", icon: Square, label: "Tetris" },
// ];

// export function Navbar() {
//   const { user, logoutMutation } = useAuth();
//   const [location] = useLocation();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const navItems = [
//     { href: "/", icon: Home, label: "Home" },
//     { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
//     { href: "/profile", icon: User, label: "Profile" },
//   ];

//   const GamesDropdown = () => (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <button className="flex items-center space-x-1 transition-colors hover:text-gray-900 text-gray-600">
//           <Gamepad className="h-5 w-5" />
//           <span className="text-sm font-medium">Games</span>
//           <ChevronDown className="h-4 w-4" />
//         </button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end" className="w-48">
//         {games.map(({ href, icon: Icon, label }) => (
//           <DropdownMenuItem key={href} asChild>
//             <Link
//               href={href}
//               className="flex items-center space-x-2 w-full cursor-pointer"
//             >
//               <Icon className="h-4 w-4" />
//               <span>{label}</span>
//             </Link>
//           </DropdownMenuItem>
//         ))}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );

//   return (
//     <header className="sticky top-0 z-50 bg-white/90 backdrop-blur shadow-sm">
//       <div className="container mx-auto px-6 py-4 flex items-center justify-between">
//         {/* Logo */}
//         <Link href="/" className="flex items-center space-x-2">
//           <Gamepad className="h-6 w-6 text-primary" />
//           <span className="text-2xl font-bold text-primary">GameHub</span>
//         </Link>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex items-center gap-4">
//           {navItems.map(({ href, icon: Icon, label }) => (
//             <Link
//               key={href}
//               href={href}
//               className={`flex items-center space-x-1 transition-colors hover:text-gray-900 ${location === href ? "text-gray-900" : "text-gray-600"
//                 }`}
//             >
//               <Icon className="h-5 w-5" />
//               <span className="text-sm font-medium">{label}</span>
//             </Link>
//           ))}
//           <GamesDropdown />
//           {user && (
//             <Button
//               variant="link"
//               size="sm"
//               onClick={() => logoutMutation.mutate()}
//             >
//               <LogOut className="h-5 w-5 mr-1" />
//               <span className="text-sm font-medium">Logout</span>
//             </Button>
//           )}
//         </nav>

//         {/* Mobile Menu Toggle */}
//         <div className="md:hidden">
//           <button
//             onClick={() => setMobileMenuOpen((prev) => !prev)}
//             className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
//             aria-label="Toggle mobile menu"
//           >
//             {mobileMenuOpen ? (
//               <X className="h-6 w-6 text-gray-900" />
//             ) : (
//               <Menu className="h-6 w-6 text-gray-900" />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Navigation Menu */}
//       {mobileMenuOpen && (
//         <div className="md:hidden bg-white/90 backdrop-blur shadow-sm">
//           <nav className="px-6 py-4 space-y-3">
//             {navItems.map(({ href, icon: Icon, label }) => (
//               <Link
//                 key={href}
//                 href={href}
//                 onClick={() => setMobileMenuOpen(false)}
//                 className={`flex items-center space-x-2 transition-colors hover:text-gray-900 ${location === href ? "text-gray-900" : "text-gray-600"
//                   }`}
//               >
//                 <Icon className="h-5 w-5" />
//                 <span className="text-base font-medium">{label}</span>
//               </Link>
//             ))}
//             {/* Games Section in Mobile Menu */}
//             <div className="space-y-2">
//               <div className="flex items-center space-x-2 text-gray-900">
//                 <Gamepad className="h-5 w-5" />
//                 <span className="text-base font-medium">Games</span>
//               </div>
//               <div className="pl-7 space-y-2">
//                 {games.map(({ href, icon: Icon, label }) => (
//                   <Link
//                     key={href}
//                     href={href}
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
//                   >
//                     <Icon className="h-4 w-4" />
//                     <span className="text-base">{label}</span>
//                   </Link>
//                 ))}
//               </div>
//             </div>
//             {user && (
//               <Button
//                 variant="link"
//                 size="sm"
//                 onClick={() => {
//                   logoutMutation.mutate();
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full justify-start"
//               >
//                 <LogOut className="h-5 w-5 mr-1" />
//                 <span className="text-base font-medium">Logout</span>
//               </Button>
//             )}
//           </nav>
//         </div>
//       )}
//     </header>
//   );
// }

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  LogOut,
  Trophy,
  User,
  Gamepad,
  Home,
  Menu,
  X,
  ChevronDown,
  Gamepad2 as Snake,
  Brain,
  Square,
  Sparkles,
  Candy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

const games = [
  { href: "/games/snake", icon: Snake, label: "Snake", players: "10k+" },
  { href: "/games/memory", icon: Brain, label: "Memory", players: "8k+" },
  { href: "/games/tetris", icon: Square, label: "Tetris", players: "15k+" },
  { href: "/games/candy-crush", icon: Candy, label: "Candy", players: "35k+" },
];

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/profile", icon: User, label: "Profile" },
];



export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const GamesDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-1 transition-all duration-200 text-blue-100/70 hover:text-blue-100 hover:scale-105">
          <Gamepad className="h-5 w-5" />
          <span className="text-sm font-medium">Games</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-[#0f0f2d]/95 backdrop-blur-lg border-blue-500/20">
        {games.map(({ href, icon: Icon, label, players }) => (
          <DropdownMenuItem key={href} asChild className="focus:bg-blue-500/10">
            <Link
              href={href}
              className="flex items-center justify-between w-full cursor-pointer p-3 text-blue-100/70 hover:text-blue-100"
            >
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
              <span className="text-xs text-blue-400">{players}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a1f]/80 backdrop-blur-lg border-b border-blue-500/20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-4 flex items-center justify-between"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <Sparkles className="h-6 w-6 text-blue-400 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            GameHub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center space-x-1 transition-all duration-200 hover:scale-105 ${location === href
                ? "text-blue-100 font-medium"
                : "text-blue-100/70 hover:text-blue-100"
                }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm">{label}</span>
            </Link>
          ))}
          <GamesDropdown />
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="text-blue-100/70 hover:text-blue-100 hover:bg-blue-500/10"
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span className="text-sm">Logout</span>
            </Button>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 text-blue-100/70 hover:text-blue-100 transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </motion.div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a1f]/95 backdrop-blur-lg border-t border-blue-500/20"
          >
            <nav className="container mx-auto px-6 py-4 space-y-4">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 transition-colors ${location === href
                    ? "text-blue-100"
                    : "text-blue-100/70 hover:text-blue-100"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-base">{label}</span>
                </Link>
              ))}

              <div className="space-y-3 pt-2 border-t border-blue-500/20">
                <div className="flex items-center space-x-2 text-blue-100">
                  <Gamepad className="h-5 w-5" />
                  <span className="text-base">Games</span>
                </div>
                <div className="pl-7 space-y-3">
                  {games.map(({ href, icon: Icon, label, players }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between text-blue-100/70 hover:text-blue-100"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-base">{label}</span>
                      </div>
                      <span className="text-xs text-blue-400">{players}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logoutMutation.mutate();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-blue-100/70 hover:text-blue-100 hover:bg-blue-500/10"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  <span className="text-base">Logout</span>
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}