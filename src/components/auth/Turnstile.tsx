
import Turnstile from 'react-turnstile';
import { toast } from 'sonner';

interface TurnstileProps {
  onVerify: (token: string) => void;
}

export const TurnstileCaptcha: React.FC<TurnstileProps> = ({ onVerify }) => {
  return (
    <Turnstile
      sitekey="0x4AAAAAAA8rGkMocyc8drQ-"
      onVerify={onVerify}
      onError={() => {
        console.error('Turnstile failed to load');
        toast.error('Security verification failed. Please refresh the page.');
      }}
      className="mx-auto"
    />
  );
};
