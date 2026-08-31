import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import SideDrawer from "../components/common/SideDrawer";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import httpService from "../services/httpService";
import { showEventToast } from "../components/common/toastHelper";
 
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;
 
const AddUser = ({ isOpen, onClose, onSubmit, user = null }) => {
  const isEdit = !!user;
 
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", role: "", password: "" });
  const [errors, setErrors] = useState({});
  const [roleOptions, setRoleOptions] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 
  const getShopId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      return userData?.user?.shopId ?? userData?.shopId ?? null;
    } catch {
      return null;
    }
  };
 
  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true);
      try {
        const shopId = getShopId();
        const params = { page: 1, take: 200, ...(shopId && { shopId }) };
        const res = await httpService.get("/user-role", params);
        const rows = res?.data?.rows ?? [];
        const options = rows
          .filter((r) => r.isActive)
          .map((r) => ({ value: String(r.id), label: r.name }));
        setRoleOptions(options);
 
        if (!isEdit && options.length > 0) {
          setForm((prev) => ({ ...prev, role: options[0].value }));
        }
      } catch (err) {
        console.error("Failed to fetch roles:", err);
        showEventToast("error", "Failed to Load Roles", "We couldn't load the list of roles. Please close and try again.");
      } finally {
        setRolesLoading(false);
      }
    };
 
    fetchRoles();
  }, []);
 
  useEffect(() => {
    if (isEdit) {
      setForm({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber ?? "",
        role: String(user.roleId ?? ""),
        password: "",
      });
    } else {
      setForm((prev) => ({ name: "", email: "", phoneNumber: "", role: prev.role, password: "" }));
    }
    setErrors({});
  }, [user, isOpen, isEdit]);
 
  const validate = () => {
    const newErrors = {};
 
    if (!form.name.trim())
      newErrors.name = "Full name is required";
    else if (form.name.trim().length < 3)
      newErrors.name = "Name must be at least 3 characters";
 
    if (!form.email.trim())
      newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address";
    if (!form.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phoneNumber.trim()))
      newErrors.phoneNumber = "Enter a valid 10-digit phone number";
 
    if (!form.role)
      newErrors.role = "Please select a role";
 
    if (!isEdit) {
      if (!form.password.trim())
        newErrors.password = "Password is required";
      else if (form.password.trim().length < 8)
        newErrors.password = "Password must be at least 8 characters";
      else if (!PASSWORD_REGEX.test(form.password.trim()))
        newErrors.password = "Must include uppercase, lowercase, a number, and a special character";
    } else if (form.password.trim()) {
      if (form.password.trim().length < 8)
        newErrors.password = "Password must be at least 8 characters";
      else if (!PASSWORD_REGEX.test(form.password.trim()))
        newErrors.password = "Must include uppercase, lowercase, a number, and a special character";
    }
 
    setErrors(newErrors);
    return newErrors;
  };
 
  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      showEventToast("error", "Incomplete Form", Object.values(validationErrors)[0]);
      return;
    }
 
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber,
        roleId: Number(form.role),
        shopId: getShopId(),
        isActive: true,
        ...(isEdit && { id: user.id }),
        ...(form.password.trim() && { password: form.password.trim() }),
      };
      await httpService.post("/user", payload);
      showEventToast(
        "success",
        isEdit ? "User Updated" : "User Created",
        isEdit
          ? "The user's details have been updated successfully."
          : "The new user has been added successfully."
      );
      onSubmit();
      handleClose();
    } catch (err) {
      console.error("Failed to save user:", err);

      const statusCode = err?.statusCode;
      const backendMessage = err?.message;

      if (statusCode === 409) {
        const lowerMsg = (backendMessage || "").toLowerCase();
        const mentionsEmail = lowerMsg.includes("email");
        const mentionsPhone = lowerMsg.includes("phone");

        if (mentionsEmail && mentionsPhone) {
          setErrors((prev) => ({
            ...prev,
            email: "This email is already in use.",
            phoneNumber: "This phone number is already in use.",
          }));
        } else if (mentionsEmail) {
          setErrors((prev) => ({ ...prev, email: backendMessage }));
        } else if (mentionsPhone) {
          setErrors((prev) => ({ ...prev, phoneNumber: backendMessage }));
        }

        showEventToast(
          "error",
          "Duplicate Details",
          backendMessage || "This email or phone number is already in use by another user."
        );
        return;
      }

      showEventToast(
        "error",
        isEdit ? "Failed to Update User" : "Failed to Create User",
        backendMessage || "Something went wrong while saving this user. Please try again."
      );
    }
  };
 
  const handleClose = () => {
    setForm({ name: "", email: "", phoneNumber: "", role: roleOptions[0]?.value ?? "", password: "" });
    setErrors({});
    onClose();
  };
 
  return (
    <SideDrawer
      open={isOpen}
      onClose={handleClose}
      title={isEdit ? "Edit User" : "Add User"}
      subtitle={
        isEdit
          ? "Update system account access and role."
          : "Manage system account access and role."
      }
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium border transition-colors"
            style={{ borderColor: "rgba(57,80,98,0.2)", color: "#5a7585" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#02949D" }}
          >
            {isEdit ? "Save Changes" : "Add User"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <FormInput
          label="NAME"
          required
          placeholder="Enter full name"
          value={form.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: "" });
          }}
          icon={<User size={16} />}
          error={errors.name}
        />
        <FormInput
          label="EMAIL"
          required
          placeholder="name@example.com"
          value={form.email}
          type="email"
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          icon={<Mail size={16} />}
          error={errors.email}
        />
        <FormInput
          label="PHONE NUMBER"
          required
          placeholder="9946123456"
          value={form.phoneNumber}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            setForm({ ...form, phoneNumber: digits });
            if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: "" });
          }}
          icon={<Phone size={16} />}
          error={errors.phoneNumber}
        />
        <div>
          <div className="relative">
            <FormInput
              label="PASSWORD"
              required={!isEdit}
              placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
              value={form.password}
              type={showPassword ? "text" : "password"}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              icon={<Lock size={16} />}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {!errors.password && (
            <p className="text-xs mt-1.5" style={{ color: "#8896a7" }}>
              8+ characters, with uppercase, lowercase, a number, and a special character
            </p>
          )}
        </div>
        <FormSelect
          label="ROLE"
          required
          value={form.role}
          onChange={(e) => {
            setForm({ ...form, role: e.target.value });
            if (errors.role) setErrors({ ...errors, role: "" });
          }}
          options={rolesLoading ? [{ value: "", label: "Loading..." }] : roleOptions}
          error={errors.role}
        />
      </div>
    </SideDrawer>
  );
};
 
export default AddUser;