
import { Turnstile } from '@cloudflare/turnstile-react';
import { useRef } from 'react';

interface TurnstileProps {
  onSuccess: (token: string) => void;
}

export const TurnstileCaptcha = ({ onSuccess }: TurnstileProps) => {
  const turnstileRef = useRef(null);

  return (
    <Turnstile
      ref={turnstileRef}
      sitekey="0x4AAAAAAA8rGkMocyc8drQ-"
      onSuccess={onSuccess}
      className="mx-auto"
    />
  );
};
