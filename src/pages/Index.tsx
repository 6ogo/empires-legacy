// src/pages/Index.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Gamepad } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
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
    navigate('/game');
  };

  return (
    <div 
      className="min-h-screen bg-[#141B2C] text-white overflow-x-hidden w-full"
      onMouseMove={handleMouseMove}
    >
      <div 
        ref={backgroundRef}
        className="relative min-h-screen flex items-center justify-center w-full overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/bg.jpg')",
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            transition: 'transform 0.2s ease-out',
            willChange: 'transform'
          }}
        />
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full flex flex-col items-center justify-center min-h-screen -mt-32">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-[#ffd02f] animate-float">
            Empire's Legacy
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-gray-200">
            A Turn-Based Strategy Game of Conquest and Empire Building
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handlePlayNowClick}
              className="bg-[#ffd02f] text-black hover:bg-[#ffd02f]/90 text-lg px-6 md:px-8 py-4 md:py-6"
            >
              Play Now <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;