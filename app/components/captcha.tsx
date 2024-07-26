import { useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

interface ReCaptchaProps {
  sitekey: string;
  onVerify: (token: string | null) => void;
}

export const Captcha = ({ onVerify, sitekey }: ReCaptchaProps) => {
  const recaptchaRef = useRef<HCaptcha>(null);

  return <HCaptcha ref={recaptchaRef} sitekey={sitekey} onVerify={onVerify} />;
};
