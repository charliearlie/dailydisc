import { useRef, useEffect } from "react";
import { ReCAPTCHA } from "react-google-recaptcha";

interface ReCaptchaProps {
  sitekey: string;
  onVerify: (token: string | null) => void;
}

export const Captcha = ({ onVerify, sitekey }: ReCaptchaProps) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, []);

  return <ReCAPTCHA ref={recaptchaRef} sitekey={sitekey} onChange={onVerify} />;
};
