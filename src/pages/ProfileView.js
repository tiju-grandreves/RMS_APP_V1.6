import { useState, useEffect } from "react";
import { Mail, Phone, Pencil, Copy, Check } from "lucide-react";
import Layout from "../components/layout/Layout";
import ProfileImage from "../components/common/ProfileImage";
import httpService from "../services/httpService";
import { showEventToast } from "../components/common/toastHelper";
import ProfileEditDrawer from "./ProfileEditDrawer";

function DotPattern({ align }) {
  const dots = Array.from({ length: 12 });
  return (
    <div
      className="absolute top-5 grid grid-cols-4 gap-1.5"
      style={{ [align]: "20px" }}
    >
      {dots.map((_, i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.35)" }}
        />
      ))}
    </div>
  );
}

function InfoRow({ icon, label, value, action }) {
  const display = value !== undefined && value !== null && value !== "" ? String(value) : "—";
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
      style={{ background: "#f4f7f8" }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #02949D 0%, #0a6e75 100%)", color: "#fff" }}
      >
        {icon}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#8fa3af" }}>
          {label}
        </span>
        <span className="text-sm font-semibold truncate" style={{ color: "#1a2e38" }}>
          {display}
        </span>
      </div>
      {action}
    </div>
  );
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("userData") || "null");
  } catch {
    return null;
  }
}

const ProfileView = () => {
  const currentUser = getCurrentUser();
  const userId = currentUser?.employeeId || currentUser?.personId || currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await httpService.get(`/user/${userId}`);
      const data = res?.data?.data ?? res?.data ?? res;
      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        roleName: data.roleName || currentUser?.roleName || "",
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      showEventToast("error", "Failed to Load Profile", "Could not load your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdated = (updatedData) => {
    setProfile((prev) => ({ ...prev, ...updatedData }));
    const updatedUser = { ...currentUser, name: updatedData.name, email: updatedData.email };
    localStorage.setItem("userData", JSON.stringify(updatedUser));
    setShowEditDrawer(false);
    showEventToast("success", "Profile Updated", "Your profile has been updated successfully.");
  };

  const handleCopyEmail = () => {
    if (!profile?.email) return;
    navigator.clipboard.writeText(profile.email);
    setCopied(true);
    showEventToast("success", "Copied", "Email address copied to clipboard.");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Layout showSearch={false} breadcrumbs={[{ label: "Profile" }]}>
      <div className="-mt-2 px-3 sm:px-6 pt-4 sm:pt-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: "#02949D", borderTopColor: "transparent" }}
            />
            <span className="ml-3 text-sm" style={{ color: "#5a7585" }}>Loading profile...</span>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div
              className="rounded-[28px] overflow-hidden"
              style={{
                background: "#fff",
                boxShadow: "0 8px 32px rgba(2,80,98,0.12), 0 2px 8px rgba(2,80,98,0.06)",
              }}
            >
              {/* Wave banner */}
              <div className="relative" style={{ height: "110px" }}>
                <svg
                  viewBox="0 0 400 140"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full"
                >
                  <defs>
                    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1AB5AE" />
                      <stop offset="55%" stopColor="#02949D" />
                      <stop offset="100%" stopColor="#1a3a4a" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,0 L400,0 L400,90 C300,140 100,140 0,90 Z"
                    fill="url(#waveGradient)"
                  />
                </svg>
                <DotPattern align="left" />
                <DotPattern align="right" />
              </div>

              {/* Avatar overlapping the wave */}
              <div className="flex flex-col items-center -mt-16 px-6">
                <div className="relative">
                  <div
                    className="h-24 w-24 rounded-full overflow-hidden"
                    style={{
                      border: "4px solid #fff",
                      boxShadow: "0 2px 12px rgba(2,80,98,0.18)",
                      background: "#eef1f2",
                    }}
                  >
                    <ProfileImage
                      userId={userId}
                      name={profile?.name}
                      alt={profile?.name}
                      className="w-full h-full object-cover"
                      fallbackClassName="/icons/Speaker-image-placeholder.svg"
                    />
                  </div>
                  <span
                    className="absolute bottom-1 right-1 w-4 h-4 rounded-full"
                    style={{ background: "#22c55e", border: "3px solid #fff" }}
                    title="Online"
                  />
                </div>

                <h3 className="text-xl font-bold mt-3" style={{ color: "#1a2e38" }}>
                  {profile?.name || "—"}
                </h3>

                {profile?.roleName && (
                  <span
                    className="mt-2 px-4 py-1 rounded-full text-xs font-bold"
                    style={{ background: "#e8f5f7", color: "#02949D" }}
                  >
                    {profile.roleName}
                  </span>
                )}

                <div className="flex items-center gap-2 mt-3 mb-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: "rotate(180deg)" }}>
                    <path d="M7 7h10v10M17 7L7 17" stroke="#02949D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-xs text-center leading-snug" style={{ color: "#8fa3af", maxWidth: "220px" }}>
                    Welcome back! You have full access to manage the system.
                  </p>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M7 7h10v10M17 7L7 17" stroke="#02949D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Info section */}
              <div className="flex flex-col gap-2.5 px-6 pt-5 pb-6">
                <InfoRow
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={profile?.email}
                  action={
                    <button
                      onClick={handleCopyEmail}
                      className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors"
                      style={{ color: "#02949D" }}
                      title="Copy email"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  }
                />
                <InfoRow
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone"
                  value={profile?.phone}
                  action={
                    <button
                      onClick={() => setShowEditDrawer(true)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors"
                      style={{ color: "#b0c4ce" }}
                      title="Edit phone"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  }
                />

                <button
                  onClick={() => setShowEditDrawer(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 mt-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #02949D 0%, #0a6e75 100%)",
                    boxShadow: "0 4px 14px rgba(2,148,157,0.35)",
                  }}
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ProfileEditDrawer
        open={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        profile={profile}
        userId={userId}
        onSaved={handleProfileUpdated}
      />
    </Layout>
  );
};

export default ProfileView;