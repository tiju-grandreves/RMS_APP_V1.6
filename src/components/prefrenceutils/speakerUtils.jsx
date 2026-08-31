export const getDefaultSpeaker = () => ({
  id: '',
  prefix: '',
  name: '',
  designation: '',
  organization: '',
  email: '',
  location: '',
  phone: '',
  facebook: '',
  linkedin: '',
  twitter: '',
  about: '',
  photo: '',
  documents: []
});

export const getComparableFileSignature = (value) => {
  if (!value) return '';
  if (value instanceof File) {
    return `file:${value.name}:${value.size}:${value.type}:${value.lastModified}`;
  }
  if (typeof value === 'string') {
    return `url:${value}`;
  }
  if (value?.url) {
    return `url:${value.url}:${value.name || ''}:${value.type || ''}`;
  }
  return String(value);
};

export const normalizeSpeakerForCompare = (speaker = {}) => ({
  id: speaker.id || '',
  prefix: speaker.prefix || '',
  name: speaker.name || '',
  designation: speaker.designation || '',
  organization: speaker.organization || '',
  email: speaker.email || '',
  location: speaker.location || '',
  phone: speaker.phone || '',
  facebook: speaker.facebook || '',
  linkedin: speaker.linkedin || '',
  twitter: speaker.twitter || '',
  about: speaker.about || '',
  photo: getComparableFileSignature(speaker.photo),
  documents: (speaker.documents || []).map(getComparableFileSignature)
});

export const prefixOptions = [
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Ms.', label: 'Ms.' },
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Prof.', label: 'Prof.' }
];

export const extractPrefix = (fullName = '') => {
  const prefixes = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];
  const trimmedName = fullName.trim();

  for (const prefix of prefixes) {
    const regex = new RegExp(`^${prefix.replace('.', '\\.')}\\s+`, 'i');
    if (regex.test(trimmedName)) {
      return {
        prefix,
        name: trimmedName.replace(regex, '').trim(),
      };
    }
  }

  return {
    prefix: '',
    name: trimmedName,
  };
};

export {
  validateEmail,
  validateFacebookUrl,
  validateLinkedInUrl,
  validateTwitterUrl,
} from '../common/Validators';