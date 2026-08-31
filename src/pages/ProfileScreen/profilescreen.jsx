import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layout";
import EditProfileScreen from "./editprofile";
import { showEventToast } from "../../components/common/toastHelper";
import { Toaster } from "react-hot-toast";
import SpeakerPhotoEditorModal from "../../components/ui/SpeakerPhotoEditorModal";

// caching helpers
const getCachedProfileImage = (userId) => {
  if (!userId) return null;
  const key = `profile_image_${userId}`;
  return localStorage.getItem(key);
};

const Profile = () => {
  const [showEdit, setShowEdit] = useState(false);
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: null,
    organization: "",
    designation: "",
  });

  const [imageData, setImageData] = useState(null);
  const isUploading = false;
  const [photoEditorOpen, setPhotoEditorOpen] = useState(false);
  const [photoEditorSourceFile, setPhotoEditorSourceFile] = useState(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const validateFileSize = (file) => {
    if (!file) return false;
    if (file.size > MAX_FILE_SIZE) {
      showEventToast(
        "error",
        "File size too large",
        "File size exceeds the 10MB limit. Please choose a smaller file."
      );
      return false;
    }
    return true;
  };

  const fetchUserImage = async (userId) => {
    if (!userId) return;
    const cached = getCachedProfileImage(userId);
    if (cached) {
      setImageData(cached);
      return;
    }
    // RMS backend has no images module yet — disabled until it exists.
    setImageData(null);
  };

  const handleUpload = async (file) => {
    if (!file || !user.id) {
      showEventToast("error", "Upload failed", "Please select a file first");
      return;
    }
    if (!validateFileSize(file)) return;

    // RMS backend has no images module yet — disabled until it exists.
    showEventToast("error", "Not available", "Uploading a profile picture is not available yet.");
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file && validateFileSize(file)) {
      setPhotoEditorSourceFile(file);
      setPhotoEditorOpen(true);
    }
    e.target.value = "";
  };

  const closePhotoEditor = () => {
    setPhotoEditorOpen(false);
    setPhotoEditorSourceFile(null);
  };

  const handlePhotoEditorApply = async (croppedFile) => {
    closePhotoEditor();
    await handleUpload(croppedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getRoleName = (role) => {
    if (role === 1) return "Facility manager";
    if (role === 2) return "Event manager";
    if (role === 3) return "Admin";
    if (role === 4) return "Super Admin";
    return "User";
  };

// helper
const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  let digits = String(phone).replace(/\D/g, ""); // keep only numbers
  if (digits.startsWith("971")) {
    digits = digits.slice(3); // remove 971 prefix
  }
  if (digits.startsWith("0")) {
    digits = digits.slice(1); // remove leading 0
  }
  return digits;
};

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("userData"));
    if (stored) {
      const updatedUser = {
        id: stored.id || "",
        name: stored.fullName || stored.name || "",
        email: stored.email || "",
        phone: stored.phone || "",
        role: stored.role ?? null,
        organization: stored.organization || "",
        designation: stored.designation || "",
      };
      setUser(updatedUser);
      fetchUserImage(updatedUser.id);
    }
  }, []);

  return (
    <Layout pageTitle="Profile">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="p-6">
        <div className="border-2 border-[#80cad6] rounded-lg p-6 bg-white relative">
          <button
            onClick={() => setShowEdit(true)}
            className="absolute top-4 right-4 flex h-[36px] w-[148px] items-center justify-center rounded-[4px] border border-[#395062] bg-white font-inter text-[14px] font-normal text-[#395062] hover:bg-gray-100"
          >
            Edit profile
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex items-center gap-6">
            <div className="relative w-[170px] h-[170px]">
              <div
                className="w-[170px] h-[170px] rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(145.27deg, #C5F4FF 16.63%, #0AC1CC 57.11%)" }}
              >
                <div className="w-[135px] h-[135px] rounded-full bg-white flex items-center justify-center overflow-hidden p-[4px]">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                    {imageData ? (
                      <img
                        src={imageData}
                        alt="profile"
                        className="w-full h-full object-cover rounded-full"
                        title={user.name}
                      />
                    ) : (
                      <img
                        src="/icons/userimage-placeholder.svg"
                        alt={user.name || "User"}
                        className="w-full h-full object-cover rounded-full"
                        title={user.name}
                      />
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={triggerFileSelect}
                disabled={isUploading}
                className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="h-6 w-6 border-2 border-gray-300 border-t-[#0AC1CC] rounded-full animate-spin" />
                ) : (
                  <img src="/icons/profile-edit.svg" alt="edit-avatar" className="h-12 w-12" />
                )}
              </button>
            </div>

            <h2 className="text-xl font-semibold text-black">{user.name}</h2>
          </div>
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-[#008c9e] mb-2">{user.email}</p>

<p className="text-sm text-[#008c9e]">
  {formatPhoneNumber(user.phone)}
</p>

          <div className="mt-6 flex gap-24 border-t pt-6 text-sm text-gray-700">
            <div>
              <p className="mb-3 font-dm-sans text-[14px] font-semibold text-[#000000]">Role type</p>
              <p>{user.roleName || getRoleName(user.role)}</p>
            </div>
            <div>
              <p className="mb-3 font-dm-sans text-[14px] font-semibold text-[#000000]">Organization</p>
              <p>{user.organization}</p>
            </div>
            <div>
              <p className="mb-3 font-dm-sans text-[14px] font-semibold text-[#000000]">Designation</p>
              <p>{user.designation}</p>
            </div>
          </div>
        </div>

        {showEdit && (
          <EditProfileScreen
            onClose={() => setShowEdit(false)}
            onSave={(updatedUser) => {
              const updated = { ...updatedUser, role: updatedUser.role ?? user.role };
              setUser(updated);
              localStorage.setItem("userData", JSON.stringify(updated));
              setShowEdit(false);
            }}
          />
        )}
        <SpeakerPhotoEditorModal
          isOpen={photoEditorOpen}
          sourceFile={photoEditorSourceFile}
          title="Adjust profile image"
          description="Crop, rotate, or flip the image before uploading."
          previewAlt="Profile image crop preview"
          applyLabel="Use Image"
          onCancel={closePhotoEditor}
          onApply={handlePhotoEditorApply}
          onError={(error) => {
            console.error("Error processing profile image:", error);
            showEventToast("error", "Image processing failed", "Unable to crop image. Please try again.");
          }}
        />
      </div>
    </Layout>
  );
};

export default Profile;