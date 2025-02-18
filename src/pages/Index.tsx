// src/pages/Index.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ChevronRight, Gamepad, LogIn } from "lucide-react";
import HeroSection from "@/components/landing/HeroSection";
import LoadingScreen from "@/components/game/LoadingScreen";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const backgroundRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (backgroundRef.current) {
      const rect = backgroundRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.02;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.02;
      setMousePosition({ x, y });
    }
  };

  const handlePlayNowClick = () => {
    if (user) {
      navigate('/game');
    } else {
      navigate('/auth');
    }
  };

  // Show loading screen only during initial auth check
  if (isLoading) {
    console.log('Index: Showing loading screen');
    return <LoadingScreen message="Loading game..." />;
  }

  console.log('Index: Rendering main content, user:', user?.email);

  return (
    <div 
      className="min-h-screen bg-[#141B2C] text-white overflow-x-hidden w-full"
      onMouseMove={handleMouseMove}
    >
      <nav className="fixed top-0 right-0 z-50 p-4 flex items-center gap-4">
        {user ? (
          <Button 
            onClick={() => navigate('/game')}
            className="bg-[#ffd02f] text-black hover:bg-[#ffd02f]/90"
          >
            <Gamepad className="h-4 w-4 mr-2" />
            Play Now
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate('/auth')}
            className="bg-white/10 text-white hover:bg-white/20"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        )}
      </nav>

      <HeroSection 
        handlePlayNowClick={handlePlayNowClick}
        mousePosition={mousePosition}
        backgroundRef={backgroundRef}
      />

      <section className="game-section bg-[#1a2237]">
        <div className="game-container">
          <h2 className="text-[#ffd02f] game-title">Strategic Gameplay Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Game feature cards */}
            <div className="game-card bg-gradient-to-br from-purple-900/50 to-transparent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-castle w-12 h-12 text-[#ffd02f] mb-4"
              >
                <path d="M22 20v-9H2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z" />
                <path d="M18 11V4H6v7" />
                <path d="M15 22v-4a3 3 0 0 0-3-3a3 3 0 0 0-3 3v4" />
                <path d="M22 11V9" />
                <path d="M2 11V9" />
                <path d="M6 4V2" />
                <path d="M18 4V2" />
                <path d="M10 4V2" />
                <path d="M14 4V2" />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">Empire Building</h3>
              <p className="text-gray-200">
                Construct cities, manage resources, and expand your territory strategically
              </p>
            </div>
            <div className="game-card bg-gradient-to-br from-red-900/50 to-transparent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-sword w-12 h-12 text-[#ffd02f] mb-4"
              >
                <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
                <line x1="13" x2="19" y1="19" y2="13" />
                <line x1="16" x2="20" y1="16" y2="20" />
                <line x1="19" x2="21" y1="21" y2="19" />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">Tactical Combat</h3>
              <p className="text-gray-200">
                Command armies in hex-based tactical warfare with unique unit abilities
              </p>
            </div>
            <div className="game-card bg-gradient-to-br from-blue-900/50 to-transparent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-crown w-12 h-12 text-[#ffd02f] mb-4"
              >
                <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                <path d="M5 21h14" />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">Dynamic Economy</h3>
              <p className="text-gray-200">Balance resources, trade, and development to grow your empire</p>
            </div>
          </div>
        </div>
      </section>

      <section className="game-section bg-[#141B2C]">
        <div className="game-container">
          <h2 className="game-title">Multiple Ways to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            <div className="game-card">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-users w-12 h-12 text-[#ffd02f] mb-4"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3 className="text-xl font-bold mb-4 text-[#ffd02f]">Local Multiplayer</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-right w-4 h-4 text-[#ffd02f]"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  2-6 players on the same device
                </li>
                <li className="flex items-center gap-2 text-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-right w-4 h-4 text-[#ffd02f]"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  Perfect for learning the game
                </li>
                <li className="flex items-center gap-2 text-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-right w-4 h-4 text-[#ffd02f]"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  Instant turn-taking
                </li>
                <li className="flex items-center gap-2 text-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-right w-4 h-4 text-[#ffd02f]"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  Host local tournaments
                </li>
              </ul>
            </div>
            <div className="game-card">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-globe w-12 h-12 text-[#ffd02f] mb-4"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <h3 className="text-xl font-bold mb-4 text-[#ffd02f]">Online Multiplayer</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-right w-4 h-4 text-[#ffd02f]"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  Create or join game rooms
                </li>
                <li className="flex items-center gap-2 text-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-right w-4 h-4 text-[#ffd02f]"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  Real-time synchronization
                </li>
                <li className="flex items-center gap-2 text-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-right w-4 h-4 text-[#ffd02f]"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  In-game chat system
                </li>
                <li className="flex items-center gap-2 text-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-right w-4 h-4 text-[#ffd02f]"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  Achievement tracking
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12">
            <div className="game-card bg-gradient-to-br from-[#1a2237] to-transparent border border-[#ffd02f]/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-crown w-16 h-16 text-[#ffd02f] mb-4"
              >
                <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                <path d="M5 21h14" />
              </svg>
              <h3 className="text-2xl font-bold mb-4 text-[#ffd02f]">World War Tournament</h3>
              <p className="text-gray-200 mb-6">
                Longer game-mode where 42 players compete in a structured elimination tournament
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[#ffd02f] font-semibold mb-3">Tournament Structure</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-chevron-right w-4 h-4 text-[#ffd02f] mt-1"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                      Start at national level battles
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-chevron-right w-4 h-4 text-[#ffd02f] mt-1"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                      Progress to regional conflicts
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-chevron-right w-4 h-4 text-[#ffd02f] mt-1"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                      Advance to continental warfare
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-chevron-right w-4 h-4 text-[#ffd02f] mt-1"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                      Compete in World War Finals
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[#ffd02f] font-semibold mb-3">Victory Rewards</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-crown w-4 h-4 text-[#ffd02f] mt-1"
                      >
                        <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                        <path d="M5 21h14" />
                      </svg>
                      Earn the prestigious World Emperor badge
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trophy w-4 h-4 text-[#ffd02f] mt-1"
                      >
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                        <path d="M4 22h16" />
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                      </svg>
                      Unlock World Emperor achievement
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-coins w-4 h-4 text-[#ffd02f] mt-1"
                      >
                        <circle cx="8" cy="8" r="6" />
                        <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
                        <path d="M7 6h1v4" />
                        <path d="m16.71 13.88.7.71-2.82 2.82" />
                      </svg>
                      Gain 10,000 XP
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-clock w-4 h-4 text-[#ffd02f] mt-1"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Turn-based battles played over hours
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="game-section bg-[#1a2237]">
        <div className="game-container">
          <h2 className="text-[#ffd02f] game-title">Paths to Victory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="game-card text-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-[#ffd02f]/10 rounded-full blur-xl transition-opacity group-hover:opacity-100 opacity-0"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-shield w-16 h-16 text-[#ffd02f] mx-auto mb-4 relative z-10"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">Domination</h3>
              <p className="text-gray-200">Control 75% of the map territories</p>
            </div>
            <div className="game-card text-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-[#ffd02f]/10 rounded-full blur-xl transition-opacity group-hover:opacity-100 opacity-0"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-coins w-16 h-16 text-[#ffd02f] mx-auto mb-4 relative z-10"
                >
                  <circle cx="8" cy="8" r="6" />
                  <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
                  <path d="M7 6h1v4" />
                  <path d="m16.71 13.88.7.71-2.82 2.82" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">Economic</h3>
              <p className="text-gray-200">Accumulate vast wealth and economic power</p>
            </div>
            <div className="game-card text-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-[#ffd02f]/10 rounded-full blur-xl transition-opacity group-hover:opacity-100 opacity-0"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-target w-16 h-16 text-[#ffd02f] mx-auto mb-4 relative z-10"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">Military</h3>
              <p className="text-gray-200">Eliminate all enemy forces and capitals</p>
            </div>
          </div>
        </div>
      </section>

      <section className="game-section bg-[#141B2C]">
        <div className="game-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#F5D547]">
            Ready to Begin Your Conquest?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Join players in epic battles for territory and resources. Your empire awaits!
          </p>
          <Button
            onClick={handlePlayNowClick}
            className="game-button-primary text-lg px-8 md:px-12 py-4 md:py-6 transform hover:scale-105 transition-transform"
          >
            Start Your Journey <ChevronRight className="h-6 w-6 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
