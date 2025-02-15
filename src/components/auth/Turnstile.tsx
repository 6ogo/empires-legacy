
import Turnstile from 'react-turnstile';
import { toast } from 'sonner';

interface TurnstileProps {
  onVerify: (token: string) => void;
}

export const TurnstileCaptcha: React.FC<TurnstileProps> = ({ onVerify }) => {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <Turnstile
        sitekey="0x4AAAAAAA8rGkMocyc8drQ-"
        onVerify={(token) => {
          console.log('Turnstile verification successful, token received');
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
    </div>
  );
};
