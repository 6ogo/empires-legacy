
import Turnstile from 'react-turnstile';

interface TurnstileProps {
  onVerify: (token: string) => void;
}

export const TurnstileCaptcha: React.FC<TurnstileProps> = ({ onVerify }) => {
  return (
    <Turnstile
      sitekey="0x4AAAAAAA8rGkMocyc8drQ-"
      onVerify={onVerify}
      className="mx-auto"
    />
  );
};

export { TurnstileCaptcha as Turnstile };
