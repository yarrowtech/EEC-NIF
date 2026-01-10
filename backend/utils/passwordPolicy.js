const MIN_LENGTH = 8;

const isStrongPassword = (password = '') => {
  if (typeof password !== 'string') return false;
  if (password.length < MIN_LENGTH) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

const passwordPolicyMessage =
  'Password must be at least 8 characters and include uppercase, lowercase, and a number.';

module.exports = {
  isStrongPassword,
  passwordPolicyMessage,
};
