import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import httpService from "../../services/httpService";
import { colors } from "../../components/colors/colors";
import { DMSansTextAsterisk, InterText, OpenSansText } from "../../components/common/customtTextFonts";
import Input from "../../components/ui/Input";
import Button from "../../components/common/Button";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchError, setMatchError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [location]);

  // Validate passwords whenever either password changes
  useEffect(() => {
    // Only show validation if both fields have data and they are not equal
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        setMatchError("password entered wrong");
      } else {
        setMatchError("");
      }
    } else {
      // Clear error if either field is empty
      setMatchError("");
    }
  }, [password, confirmPassword]);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError("Please enter password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        token: token,
        password: password,
      };

      const response = await httpService.post(
        "/event-password/reset-password",
        payload
      );

      console.log("Reset success:", response);

      const confirmed = window.confirm("Password reset successful");

      if (confirmed) {
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = password && confirmPassword && password === confirmPassword;

  return (
    <div className="h-screen flex overflow-hidden">
      {/* LEFT SIDE - Same as before */}
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
            text={`Welcome\nto SEA\nEvents!`}
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
        className="flex-1 h-full flex items-center justify-center px-8"
        style={{
          backgroundImage: "url('/icons/loginbi.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <img
              src="/icons/rmslogoname.png"
              alt="RMS Logo"
              width={257}
              height={58}
              className="mb-2"
            />
          </div>

          <div className="flex justify-center text-center w-full">
            <DMSansTextAsterisk
              text="Enter your details"
              fontSize={32}
              fontWeight={600}
              color={colors.DarkColor}
              textAlign="center"
            />
          </div>

          <div className="space-y-5 mt-6">
            {/* NEW PASSWORD */}
            <div>
              <DMSansTextAsterisk
                text="New password"
                fontSize={16}
                fontWeight={500}
                color={colors.BlackColor}
                textAlign="left"
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!token}
                  style={{
                    fontFamily: "Open Sans",
                    fontSize: 16,
                    fontWeight: 600,
                    backgroundColor: colors.fillColor,
                    color: "#1B1D21",
                    border: "1px solid #CDD6DC",
                  }}
                />
                <img
                  src={
                    showPassword
                      ? "/icons/openeye.png"
                      : "/icons/eyeclose.png"
                  }
                  alt="toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-[15px] h-[15px] cursor-pointer ${password.length > 0 ? "block" : "hidden"
                    }`}
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <DMSansTextAsterisk
                text="Confirm password"
                fontSize={16}
                fontWeight={500}
                color={colors.BlackColor}
                textAlign="left"
              />
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!token}
                  style={{
                    backgroundColor: colors.fillColor,
                    color: "#1B1D21",
                    border: "1px solid #CDD6DC",
                    fontFamily: "Open Sans",
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                />
                <img
                  src={
                    showConfirmPassword
                      ? "/icons/openeye.png"
                      : "/icons/eyeclose.png"
                  }
                  alt="toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-[15px] h-[15px] cursor-pointer ${confirmPassword.length > 0 ? "block" : "hidden"
                    }`}
                />
              </div>
              {/* VALIDATION ERROR - Only shows when both fields have data and they don't match */}
              {matchError && (
                <p className="text-red-500 text-sm text-left mt-1">
                  {matchError}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              variant="primary"
              type="button"
              onClick={handleResetPassword}
              disabled={!token || loading || !isFormValid}
              className={`w-full justify-center mt-2`}
              style={{
                backgroundColor: isFormValid
                  ? colors.viewcolor
                  : colors.lightBlueColorShade,
              }}
            >
              <DMSansTextAsterisk
                text={loading ? "Submitting..." : "Submit"}
                fontSize={16}
                fontWeight={600}
                color={isFormValid ? colors.whiteColor : "#A0B0BA"}
                textAlign="center"
              />
            </Button>

            {error && (
              <p className="text-red-500 text-sm text-center mt-2">
                {error}
              </p>
            )}

            {/* TERMS */}
            <div className="text-center mt-2 whitespace-nowrap -ml-[12px]">
              <InterText
                text="By continuing, you agree to the "
                fontSize={14}
                fontWeight={700}
                color={colors.SecondaryDarkColor}
                textAlign="center"
              />
              <span className="underline cursor-pointer">
                <InterText
                  text="Terms of Service"
                  fontSize={14}
                  fontWeight={700}
                  color={colors.SecondaryDarkColor}
                  textAlign="center"
                />
              </span>
              <InterText
                text=" and "
                fontSize={14}
                fontWeight={700}
                color={colors.SecondaryDarkColor}
                textAlign="center"
              />
              <span className="underline cursor-pointer">
                <InterText
                  text="Privacy Policy"
                  fontSize={14}
                  fontWeight={700}
                  color={colors.SecondaryDarkColor}
                  textAlign="center"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;