import { useState, useEffect } from "react";
import { User, Phone, Mail, Lock } from "lucide-react";
import SideDrawer from "../components/common/SideDrawer";
import FormInput from "../components/common/FormInput";
import { validateForm, validateName, validatePhone, validateEmailOptional } from "../components/common/Validators";
import httpService from "../services/httpService";
import { showEventToast } from "../components/common/toastHelper";

const EMPTY_FORM = { name: "", email: "", phone: "" };
const EMPTY_PASSWORD = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function ProfileEditDrawer({ open, onClose, profile, userId, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
    });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    setPasswordForm(EMPTY_PASSWORD);
    setPasswordErrors({});
  }, [open, profile]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const setPassword = (key, val) => {
    setPasswordForm((f) => ({ ...f, [key]: val }));
    setPasswordErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = validateForm(form, {
      name: (v) => validateName(v, "Name"),
      phone: validatePhone,
      email: validateEmailOptional,
    });
    setErrors(e);
    return e;
  };

  const validatePasswordForm = () => {
    const e = {};
    if (!passwordForm.currentPassword) e.currentPassword = "Current password is required";
    if (!passwordForm.newPassword) {
      e.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      e.newPassword = "New password must be at least 6 characters";
    }
    if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      e.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(e);
    return e;
  };

  const handleClose = () => {
    setErrors({});
    setPasswordErrors({});
    onClose();
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      showEventToast("error", "Incomplete Form", Object.values(validationErrors)[0]);
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("phone", form.phone);
      if (imageFile) payload.append("profileImage", imageFile);

      await httpService.put(`/user/${userId}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSaved(form);
    } catch (err) {
      console.error("Profile update error:", err);
      showEventToast("error", "Save Failed", err.message || "We couldn't update your profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    // Only run if the user actually filled in any password field
    const hasAnyInput = passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword;
    if (!hasAnyInput) return;

    const validationErrors = validatePasswordForm();
    if (Object.keys(validationErrors).length > 0) {
      showEventToast("error", "Incomplete Form", Object.values(validationErrors)[0]);
      return;
    }

    setChangingPassword(true);
    try {
      await httpService.put(`/user/${userId}/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }); // TODO: confirm real change-password endpoint

      showEventToast("success", "Password Changed", "Your password has been updated successfully.");
      setPasswordForm(EMPTY_PASSWORD);
    } catch (err) {
      console.error("Password change error:", err);
      showEventToast("error", "Password Change Failed", err.message || "Could not change your password. Please check your current password and try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveAll = async () => {
    await handleSave();
    await handleChangePassword();
  };

  const footer = (
    <div className="flex gap-3">
      <button
        onClick={handleClose}
        disabled={submitting || changingPassword}
        className="flex-1 py-3 rounded-xl text-sm font-medium border transition-colors"
        style={{ borderColor: "rgba(57,80,98,0.2)", color: "#5a7585" }}
      >
        Cancel
      </button>
      <button
        onClick={handleSaveAll}
        disabled={submitting || changingPassword}
        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: "#02949D" }}
      >
        {submitting || changingPassword ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );

  return (
    <SideDrawer
      open={open}
      onClose={handleClose}
      title="Edit Profile"
      subtitle="Update your personal details below"
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-2xl flex flex-col items-center gap-3"
          style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}>
          <div className="relative h-20 w-20 rounded-full overflow-hidden border" style={{ borderColor: "#E5E7EB", background: "#f5f7f8" }}>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            )}
          </div>
          <label className="text-sm font-semibold cursor-pointer hover:underline" style={{ color: "#02949D" }}>
            Change Photo
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        <div className="p-4 rounded-2xl flex flex-col gap-3"
          style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#02949D" }}>
            Personal Information
          </p>
          <FormInput
            label="Full Name"
            required
            placeholder="Your name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            icon={<User className="w-4 h-4" />}
            error={errors.name}
            disabled={submitting}
          />
          <FormInput
            label="Phone Number"
            placeholder="9876543210"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            icon={<Phone className="w-4 h-4" />}
            error={errors.phone}
            disabled={submitting}
            maxLength={10}
          />
          <FormInput
            label="Email"
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            error={errors.email}
            disabled={submitting}
          />
        </div>

        <div className="p-4 rounded-2xl flex flex-col gap-3"
          style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#02949D" }}>
            Change Password
          </p>
          <p className="text-xs" style={{ color: "#8fa3af" }}>
            Leave blank if you don't want to change your password.
          </p>
          <FormInput
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPassword("currentPassword", e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            error={passwordErrors.currentPassword}
            disabled={changingPassword}
          />
          <FormInput
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={passwordForm.newPassword}
            onChange={(e) => setPassword("newPassword", e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            error={passwordErrors.newPassword}
            disabled={changingPassword}
          />
          <FormInput
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPassword("confirmPassword", e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            error={passwordErrors.confirmPassword}
            disabled={changingPassword}
          />
        </div>
      </div>
    </SideDrawer>
  );
}