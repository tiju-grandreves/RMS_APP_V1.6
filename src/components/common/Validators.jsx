// ─── Common Validators ───────────────────────────────────────────────────────
// Single source of truth for all validation across the app.
// Every function returns an error string if invalid, or '' if valid.

// ─── Required ────────────────────────────────────────────────────────────────

export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || !String(value).trim()) {
    return `${fieldName} is required`;
  }
  return '';
};

// ─── Name ────────────────────────────────────────────────────────────────────

export const validateName = (name, fieldName = 'Name') => {
  if (!name || !name.trim()) return `${fieldName} is required`;
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
  if (name.trim().length > 100) return `${fieldName} must be under 100 characters`;
  return '';
};

// ─── Email ───────────────────────────────────────────────────────────────────

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (email.length < 5 || email.length > 254)
    return 'Email length must be between 5 and 254 characters';
  if (email.includes(' ')) return 'Email cannot contain spaces';

  const parts = email.split('@');
  if (parts.length !== 2) return 'Invalid email format';

  const [username, domainWithTld] = parts;
  if (username.length < 1 || username.length > 64)
    return 'Username part must be between 1 and 64 characters';
  if (username.startsWith('.') || username.endsWith('.'))
    return 'Username cannot start or end with a dot';
  if (username.includes('..')) return 'Username cannot contain consecutive dots';

  const lastDotIndex = domainWithTld.lastIndexOf('.');
  if (lastDotIndex === -1) return 'Invalid domain format';

  const domain = domainWithTld.substring(0, lastDotIndex);
  const tld = domainWithTld.substring(lastDotIndex + 1);

  if (domain.length < 3 || domain.length > 255)
    return 'Domain part must be between 3 and 255 characters';
  if (domain.startsWith('-') || domain.endsWith('-'))
    return 'Domain cannot start or end with a hyphen';
  if (tld.length < 2 || tld.length > 3)
    return 'Domain extension must be 2 to 3 characters';

  const emailRegex =
    /^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,3}$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';

  return '';
};

// Optional — only validates if a value is provided
export const validateEmailOptional = (email) => {
  if (!email || !email.trim()) return '';
  return validateEmail(email);
};

// ─── Password ─────────────────────────────────────────────────────────────────

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password must be under 128 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    return 'Password must contain at least one special character';
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

// ─── Phone ───────────────────────────────────────────────────────────────────

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return 'Phone number is required';
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return 'Phone number must be exactly 10 digits';
  return '';
};

export const validatePhoneOptional = (phone) => {
  if (!phone || !phone.trim()) return '';
  return validatePhone(phone);
};

// ─── Number ──────────────────────────────────────────────────────────────────

export const validateNumber = (value, fieldName = 'Value', { min, max } = {}) => {
  if (value === '' || value === null || value === undefined)
    return `${fieldName} is required`;
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a valid number`;
  if (min !== undefined && num < min) return `${fieldName} must be at least ${min}`;
  if (max !== undefined && num > max) return `${fieldName} must be at most ${max}`;
  return '';
};

export const validatePositiveNumber = (value, fieldName = 'Value') => {
  const err = validateNumber(value, fieldName);
  if (err) return err;
  if (Number(value) <= 0) return `${fieldName} must be greater than 0`;
  return '';
};

// ─── Date ────────────────────────────────────────────────────────────────────

export const validateDate = (date, fieldName = 'Date') => {
  if (!date) return `${fieldName} is required`;
  const d = new Date(date);
  if (isNaN(d.getTime())) return `${fieldName} is not a valid date`;
  return '';
};

export const validateDateRange = (startDate, endDate) => {
  const startErr = validateDate(startDate, 'Start date');
  if (startErr) return startErr;
  const endErr = validateDate(endDate, 'End date');
  if (endErr) return endErr;
  if (new Date(startDate) >= new Date(endDate))
    return 'End date must be after start date';
  return '';
};

export const validateFutureDate = (date, fieldName = 'Date') => {
  const err = validateDate(date, fieldName);
  if (err) return err;
  if (new Date(date) < new Date()) return `${fieldName} must be in the future`;
  return '';
};

// ─── Text Length ─────────────────────────────────────────────────────────────

export const validateMinLength = (value, min, fieldName = 'This field') => {
  if (!value || !value.trim()) return `${fieldName} is required`;
  if (value.trim().length < min) return `${fieldName} must be at least ${min} characters`;
  return '';
};

export const validateMaxLength = (value, max, fieldName = 'This field') => {
  if (!value) return '';
  if (value.length > max) return `${fieldName} must be under ${max} characters`;
  return '';
};

// ─── URL validators ──────────────────────────────────────────────────────────

export const validateUrl = (url, fieldName = 'URL') => {
  if (!url) return '';
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return '';
  } catch {
    return `Please enter a valid ${fieldName}`;
  }
};

export const validateFacebookUrl = (url) => {
  if (!url) return '';
  const facebookRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/[a-zA-Z0-9(.?)?]/;
  if (!facebookRegex.test(url))
    return 'Please enter a valid Facebook URL (e.g., https://facebook.com/username)';
  return '';
};

export const validateLinkedInUrl = (url) => {
  if (!url) return '';
  const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company|pub)\/[a-zA-Z0-9-]+/;
  if (!linkedinRegex.test(url))
    return 'Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)';
  return '';
};

export const validateTwitterUrl = (url) => {
  if (!url) return '';
  const twitterRegex = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+/;
  if (!twitterRegex.test(url))
    return 'Please enter a valid X/Twitter URL (e.g., https://twitter.com/username)';
  return '';
};

// ─── File ────────────────────────────────────────────────────────────────────

export const validateFile = (file, { maxSizeMB = 5, allowedTypes = [] } = {}) => {
  if (!file) return 'File is required';
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) return `File size must be under ${maxSizeMB}MB`;
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type))
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  return '';
};

export const validateFileOptional = (file, options = {}) => {
  if (!file) return '';
  return validateFile(file, options);
};

// ─── Form-level validator ────────────────────────────────────────────────────
// Pass a rules object: { fieldKey: validatorFn }
// Returns errors object: { fieldKey: errorString }
//
// Usage:
//   const errors = validateForm(form, {
//     customerName: (v) => validateName(v, 'Customer Name'),
//     customerEmail: validateEmailOptional,
//     customerPhone: validatePhone,
//   });
//   const isValid = Object.keys(errors).length === 0;

export const validateForm = (values, rules) => {
  const errors = {};
  for (const [field, validator] of Object.entries(rules)) {
    const error = validator(values[field]);
    if (error) errors[field] = error;
  }
  return errors;
};