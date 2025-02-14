
import { Button } from "@/components/ui/button";
import { TurnstileCaptcha } from "./Turnstile";
import { useGuestLogin } from "@/hooks/useGuestLogin";

export const GuestLoginButton = () => {
  const { isGuestLoading, showTurnstile, setShowTurnstile, handleGuestLogin } = useGuestLogin();

  return (
    <>
      {showTurnstile ? (
        <div className="w-full flex flex-col items-center gap-4">
          <TurnstileCaptcha onSuccess={(token) => {
            console.log('Turnstile verification successful, token:', token); // Enhanced debug log
            handleGuestLogin(token);
          }} />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowTurnstile(false)}
            className="w-full text-white bg-white/20 hover:bg-white/30"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleGuestLogin()} // This will trigger showing Turnstile
          disabled={isGuestLoading}
          className="w-full text-white bg-white/20 hover:bg-white/30"
        >
          {isGuestLoading ? "Joining as Guest..." : "Continue as Guest"}
        </Button>
      )}
    </>
  );
};
