
import Turnstile from 'react-turnstile';

interface TurnstileProps {
  onSuccess: (token: string) => void;
}

export const TurnstileCaptcha = ({ onSuccess }: TurnstileProps) => {
  return (
    <Turnstile
      siteKey="0x4AAAAAAA8rGkMocyc8drQ-"
      onVerify={onSuccess}
      className="mx-auto"
    />
  );
};
