
import Turnstile from 'react-turnstile';
import { useRef } from 'react';

interface TurnstileProps {
  onSuccess: (token: string) => void;
}

export const TurnstileCaptcha = ({ onSuccess }: TurnstileProps) => {
  const turnstileRef = useRef(null);

  return (
    <Turnstile
      ref={turnstileRef}
      siteKey="0x4AAAAAAA8rGkMocyc8drQ-"
      onVerify={onSuccess}
      className="mx-auto"
    />
  );
};
