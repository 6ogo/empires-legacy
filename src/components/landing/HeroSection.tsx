
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Gamepad, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeroSectionProps {
  handlePlayNowClick: () => void;
  mousePosition: { x: number; y: number };
  backgroundRef: React.RefObject<HTMLDivElement>;
}

const HeroSection = ({ handlePlayNowClick, mousePosition, backgroundRef }: HeroSectionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
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
          <>
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          </>
        )}
      </nav>

      <div 
        ref={backgroundRef}
        className="relative min-h-screen flex items-center justify-center w-full overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: `calc(50% + ${mousePosition.x}px) calc(50% + ${mousePosition.y}px)`,
          backgroundAttachment: "fixed",
          transition: "background-position 0.3s ease-out"
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full flex flex-col items-center justify-center min-h-screen -mt-32">
          <img 
            src="/testLogo.png" 
            alt="Empire's Legacy Logo" 
            className="w-1/4 mb-8 opacity-80"
          />
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
    </>
  );
};

export default HeroSection;
