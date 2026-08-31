import React, { useState, useEffect } from "react";

const EditProfileScreen = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
    organization: "",
    designation: "",
  });
  const [initialFormData, setInitialFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
    organization: "",
    designation: "",
  });

  const loading = false;
  const [userId, setUserId] = useState(null);

  // ✅ Role mapping
  const getRoleName = (role) => {
    if (role === 1) return "Facility manager";
    if (role === 2) return "Event manager";
     if (role === 4) return "Super admin";
      if (role === 3) return "admin";
    return "";
  };

  // ✅ Load user data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));

    if (!user) return;

    setUserId(user?.id);

    const nextFormData = {
      name: user?.fullName || "",
      phone: user?.phone?.replace("+971 - ", "") || "",
      email: user?.email || "",
      role: user?.roleName || getRoleName(user?.role),
      organization: user?.organization || "",
      designation: user?.designation || "",
    };

    setFormData(nextFormData);
    setInitialFormData(nextFormData);
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    let { name, value } = e.target;

    // Allow only numbers + spaces in phone
    if (name === "phone") {
      value = value.replace(/[^\d\s]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Form validation
  const isFormValid =
    formData.name?.trim() &&
    formData.phone?.trim() &&
    formData.email?.trim() &&
    formData.organization?.trim() &&
    formData.designation?.trim();

  const isFormDirty = Object.keys(initialFormData).some(
    (key) => formData[key]?.trim?.() !== initialFormData[key]?.trim?.()
  );

  // ✅ Save profile
  const handleSave = async () => {
    if (!isFormValid || !isFormDirty || !userId) return;

    // RMS backend has no rms_users module yet — disabled until it exists.
    alert("Updating profile details is not available yet.");
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-50">
      <div className="bg-white w-[900px] rounded-xl shadow-xl p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[18px] font-semibold text-[#008c9e]">
            Edit profile
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 text-xl hover:text-black"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-gray-200 mb-6"></div>

        {/* Form */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* User */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              User <span className="text-red-500">*</span>
            </label>

            <input
              name="name"
              value={formData.name}
              readOnly
              className="w-full px-3 py-2 rounded-md bg-gray-100 text-sm text-black outline-none"
            />
          </div>

      {/* Phone */}
<div>
  <label className="text-xs text-gray-500 mb-1 block">
    Phone number
  </label>

  <div className="flex items-center px-3 py-2 rounded-md bg-gray-100 text-sm">
    <span className="text-black">+971 -</span>

    <input
      name="phone"
      value={
        formData.phone
          ?.replace(/^971/, '')   
          ?.replace(/^0/, '')     
      }
      readOnly
      className="ml-2 bg-transparent outline-none flex-1 min-w-0 text-black"
    />
  </div>
</div>

          {/* Email */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Email
            </label>

            <input
              name="email"
              value={formData.email}
              readOnly
              className="w-full px-3 py-2 rounded-md bg-gray-100 text-sm text-black outline-none"
            />
          </div>

          {/* Role + Designation */}
          <div className="flex flex-col gap-6">
            
            {/* Role */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Role type <span className="text-red-500">*</span>
              </label>

              <input
                value={formData.role}
                disabled
                className="w-full px-3 py-2 rounded-md bg-gray-100 text-sm text-black cursor-not-allowed"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Designation <span className="text-red-500">*</span>
              </label>

              <input
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-gray-100 text-sm text-black outline-none"
              />
            </div>
          </div>

          {/* Organization */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Organization <span className="text-red-500">*</span>
            </label>

            <input
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-gray-100 text-sm text-black outline-none"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-12">
          
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={!isFormValid || !isFormDirty || loading}
            className={`px-6 py-2 rounded-md text-sm transition ${
              isFormValid && isFormDirty
                ? "bg-[#008c9e] text-white hover:bg-[#007785]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;
