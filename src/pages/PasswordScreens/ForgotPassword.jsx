import React, { useState } from "react";

import httpService from "../../services/httpService";
import { colors } from "../../components/colors/colors";
import Input from "../../components/ui/Input";
import Button from "../../components/common/Button";
import { DmSansText, DMSansTextAsterisk, OpenSansText } from "../../components/common/customtTextFonts";
import { validateEmail } from '../../components/common/Validators';

const ForgetPassword = () => {

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState("");
const [touched, setTouched] = useState(false);

const handleChange = (e) => {
  const value = e.target.value;
  setEmail(value);

  if (touched) {
    setError(validateEmail(value));
  }
};
const handleBlur = () => {
  setTouched(true);
  setError(validateEmail(email));
};
  const handleSendLink = async () => {
    setLoading(true);
    setError("");
    setResetLink("");
const emailError = validateEmail(email);

if (emailError) {
  setTouched(true);
  setError(emailError);
  return;
}
    try {
      const payload = {
        email: email.trim().toLowerCase(),
      };

      const response = await httpService.post(
        "/event-password/forgot-password",
        payload
      );

      console.log("FULL RESPONSE:", response);

      /**
       * ✅ VERY IMPORTANT FIX
       * Handles ALL possible structures:
       * 1. response.data.data.resetLink
       * 2. response.data.resetLink
       * 3. response.resetLink (rare)
       */
      const resetLinkFromApi =
        response?.data?.data?.resetLink ??
        response?.data?.resetLink ??
        response?.resetLink ??
        "";

      if (resetLinkFromApi && typeof resetLinkFromApi === "string") {
        setResetLink(resetLinkFromApi);
      } else {
        setError("Check the email entered is correct");
      }

    } catch (err) {
      console.error("API ERROR:", err);
      setError("Check the email entered is correct");
    } finally {
      setLoading(false);
    }
  };

const isValid = email.trim() && !validateEmail(email);  return (
    <div className="h-screen flex overflow-hidden">

      {/* LEFT SIDE */}
      <div
        className="hidden md:flex w-[720px] h-screen relative justify-start pt-20 pl-20 pr-20 pb-0 text-white"
        style={{
          backgroundImage: "url('/icons/sidelogo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-teal-300/70 via-blue-400/5 to-blue-700/10"></div>

        <div className="relative z-10 flex flex-col justify-end h-full w-full max-w-[500px]">
          <OpenSansText
            text={`Welcome\nto RMS\nEvents!`}
            fontSize={90}
            fontWeight={800}
            color={colors.whiteColor}
            fontHeight={1}
            letterSpacing={0}
            textAlign="left"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="flex-1 h-full flex items-start justify-center px-8 pt-24"
        style={{
          backgroundImage: "url('/icons/loginbi.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full max-w-sm">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-4">
            <img
              src="/icons/rmslogoname.png"
              alt="RMS Logo"
              width={180}
              height={58}
              className="mb-2"
            />
          </div>

          {/* TITLE */}
          <div className="flex justify-center">
            <DmSansText
              text="Forget password"
              fontSize={32}
              fontWeight={600}
              color={colors.DarkColor}
              textAlign="center"
            />
          </div>

          {/* SUBTEXT */}
          <div className="mt-1 mb-5 flex justify-center">
            <OpenSansText
              text="To reset your password, please enter email address"
              fontSize={12}
              fontWeight={500}
              color={colors.colorview}
              textAlign="center"
            />
          </div>

          {/* ❌ ERROR */}
          {/* {error && (
            <p className="text-red-500 text-sm mb-2 text-center">
              {error}
            </p>
          )} */}

          {/* ✅ SUCCESS */}
          {resetLink && (
            <div className="bg-green-100 border border-green-400 p-3 rounded-md text-sm break-all">
              <p className="text-green-700 font-semibold mb-1">
                Reset link generated:
              </p>
              <a
                href={resetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {resetLink}
              </a>
            </div>
          )}

          {/* FORM */}
          <div className="space-y-4 mt-3">

            <div>
              <DmSansText
                text="Enter your email address"
                fontSize={16}
                fontWeight={500}
                color={colors.BlackColor}
                textAlign="left"

              />

              <Input
                type="text"
                placeholder="Enter your email address"
                value={email}
onChange={handleChange}
  onBlur={handleBlur}              />
  <div className="min-h-[18px] mt-1">
  {error && (
    <p className="text-red-500 text-xs">
      {error}
    </p>
  )}
</div>
            </div>

           <Button
  variant="primary"
  type="button"
  disabled={!isValid || loading}
  onClick={handleSendLink}
  className={`w-full justify-center ${
    isValid ? "" : "cursor-not-allowed"
  }`}
  style={{
    backgroundColor: isValid
      ? colors.viewcolor
      : colors.lightBlueColorShade,
  }}
>
  <DMSansTextAsterisk
    text={loading ? "Sending..." : "Send link"}
    fontSize={16}
    fontWeight={500}
    color={isValid ? colors.whiteColor : "#A0B0BA"}
    textAlign="center"
  />
</Button>
  </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;