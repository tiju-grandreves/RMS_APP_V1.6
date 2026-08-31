import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import httpService from "../../services/httpService";
import { getShopLoginPath } from "../../services/authRedirect";
import { colors } from "../../components/colors/colors";
import Input from "../../components/ui/Input";
import Button from "../../components/common/Button";
import {
  DmSansText,
  DMSansTextAsterisk,
  OpenSansText,
} from "../../components/common/customtTextFonts";

const UpdatePassword = () => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // MATCH ERROR STATE
  const [matchError, setMatchError] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("userData"));
  const email = storedUser?.emailaddressuser;

  // VALIDATE PASSWORDS
  useEffect(() => {
    // Only show validation if both fields have data and they are not equal
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        setMatchError("Password mismatch");
      } else {
        setMatchError("");
      }
    } else {
      // Clear error if either field is empty
      setMatchError("");
    }
  }, [newPassword, confirmPassword]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    console.log("EMAIL CHECK:", email);

    if (!email) {
      setError("Session expired. Please login again.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: email,
        newPassword,
      };

      console.log("PAYLOAD:", payload);

      const response = await httpService.post(
        "/change-password",
        payload
      );

      console.log("API RESPONSE:", response);

      setSuccess(
        response?.data?.message || "Password changed successfully"
      );

      navigate(getShopLoginPath());

      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("API ERROR:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword;

  return (
    <div className="h-screen flex overflow-hidden">

      {/* LEFT SIDE */}
      <div
        className="hidden md:flex w-1/2 h-screen relative items-end p-16 text-white"
        style={{
          backgroundImage: "url('/icons/sidelogo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-300/80 via-blue-400/30 to-blue-700/40"></div>

        <div className="relative z-10 max-w-md">
          <OpenSansText
            text={`Welcome\nto RMS\nEvents!`}
            fontSize={72}
            fontWeight={800}
            color={colors.whiteColor}
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="flex-1 flex items-center justify-center px-6"
        style={{
          backgroundImage: "url('/icons/loginbi.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full max-w-md bg-white/70 backdrop-blur-md p-8 rounded-xl shadow-md">

          <div className="flex justify-center mb-6">
            <img src="/icons/sealogoname.png" alt="logo" className="h-12" />
          </div>

          <div className="flex justify-center text-center">
            <DmSansText
              text="Enter your details"
              fontSize={32}
              fontWeight={600}
              color={colors.DarkColor}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-green-600 text-sm text-center mt-2">
              {success}
            </p>
          )}

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
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    fontFamily: "Open Sans",
                    fontSize: 16,
                    fontWeight: 600,
                    backgroundColor: colors.fillColor,
                    color: "#1B1D21",
                    border: "1px solid #CDD6DC"
                  }}
                />

                <img
                  src={
                    showNewPassword
                      ? "/icons/openeye.png"
                      : "/icons/eyeclose.png"
                  }
                  alt="toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-[15px] h-[15px] cursor-pointer ${
                    newPassword.length > 0 ? "block" : "hidden"
                  }`}
                  style={{
                    width: "22.07px",
                    height: "11.08px",
                    cursor: "pointer",
                  }}
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
                  style={{
                    backgroundColor: colors.fillColor,
                    color: "#1B1D21",
                    border: "1px solid #CDD6DC",
                    fontFamily: "Open Sans",
                    fontSize: 16,
                    fontWeight: 600
                  }}
                />

                <img
                  src={
                    showConfirmPassword
                      ? "/icons/openeye.png"
                      : "/icons/eyeclose.png"
                  }
                  alt="toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-[15px] h-[15px] cursor-pointer ${
                    confirmPassword.length > 0 ? "block" : "hidden"
                  }`}
                  style={{
                    width: "22.07px",
                    height: "11.08px",
                    cursor: "pointer",
                  }}
                />
              </div>

              {/* VALIDATION ERROR */}
              {matchError && (
                <p className="text-red-500 text-sm text-left mt-1">
                  {matchError}
                </p>
              )}
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className={`w-full justify-center ${
                isValid ? "" : "opacity-60 cursor-not-allowed"
              }`}
            >
              {loading ? "Processing..." : "Submit"}
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;