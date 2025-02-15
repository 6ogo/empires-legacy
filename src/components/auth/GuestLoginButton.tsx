
import { Button } from "@/components/ui/button";
import { TurnstileCaptcha } from "./Turnstile";
import { useGuestLogin } from "@/hooks/useGuestLogin";

export const GuestLoginButton = () => {
  const { isGuestLoading, handleGuestLogin, showTurnstile, setShowTurnstile } = useGuestLogin();

  const onTurnstileVerify = async (token: string) => {
    console.log('Turnstile verified for guest login');
    try {
      await handleGuestLogin(token);
    } catch (error) {
      console.error('Guest login failed:', error);
    }
  };

  return (
    <>
      {showTurnstile ? (
        <div className="w-full flex flex-col items-center gap-4">
          <TurnstileCaptcha onVerify={onTurnstileVerify} />
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
          onClick={() => setShowTurnstile(true)}
          disabled={isGuestLoading}
          className="w-full text-white bg-white/20 hover:bg-white/30"
        >
          {isGuestLoading ? "Joining as Guest..." : "Continue as Guest"}
        </Button>
      )}
    </>
  );
};
