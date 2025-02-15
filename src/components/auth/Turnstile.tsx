
import Turnstile from 'react-turnstile';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
}

export const TurnstileCaptcha: React.FC<TurnstileProps> = ({ onVerify }) => {
  useEffect(() => {
    // Clear any previous Turnstile errors
    const existingScript = document.querySelector('script[src*="turnstile"]');
    if (existingScript) {
      existingScript.remove();
    }
  }, []);

  return (
    <Turnstile
      sitekey="0x4AAAAAAA8rGkMocyc8drQ-"
      onVerify={(token) => {
        console.log('Turnstile verification successful');
        onVerify(token);
      }}
      onError={(error) => {
        console.error('Turnstile error:', error);
        toast.error('Security verification failed. Please try again.');
      }}
      onTimeout={() => {
        console.error('Turnstile timeout');
        toast.error('Security verification timed out. Please refresh and try again.');
      }}
      refreshExpired="auto"
      className="mx-auto"
    />
  );
};
