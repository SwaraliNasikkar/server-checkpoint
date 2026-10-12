// validators.js - all validation rules live on the server.
const NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,49}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/; // Indian mobile number

function validateRegistration(input) {
  const errors = {};
  const v = {
    name: String(input.name ?? '').trim(),
    email: String(input.email ?? '').trim().toLowerCase(),
    age: String(input.age ?? '').trim(),
    phone: String(input.phone ?? '').replace(/[\s-]/g, ''),
    password: String(input.password ?? ''),
    confirm: String(input.confirm ?? ''),
  };

  if (!v.name) errors.name = 'Enter your full name.';
  else if (!NAME_RE.test(v.name))
    errors.name = 'Name must be 2-50 characters: letters, spaces, . \' - only.';

  if (!v.email) errors.email = 'Enter your email address.';
  else if (!EMAIL_RE.test(v.email) || v.email.length > 100)
    errors.email = 'Enter a valid email, like name@example.com.';

  if (!v.age) errors.age = 'Enter your age.';
  else if (!/^\d+$/.test(v.age)) errors.age = 'Age must be a whole number.';
  else if (+v.age < 18 || +v.age > 120) errors.age = 'Age must be between 18 and 120.';

  if (!v.phone) errors.phone = 'Enter your mobile number.';
  else if (!PHONE_RE.test(v.phone))
    errors.phone = 'Mobile number must be 10 digits and start with 6, 7, 8 or 9.';

  if (!v.password) errors.password = 'Choose a password.';
  else if (v.password.length < 8) errors.password = 'Password must be at least 8 characters.';
  else if (!/[A-Z]/.test(v.password) || !/[a-z]/.test(v.password) || !/\d/.test(v.password))
    errors.password = 'Password needs an uppercase letter, a lowercase letter and a digit.';

  if (!v.confirm) errors.confirm = 'Re-enter your password.';
  else if (v.confirm !== v.password) errors.confirm = 'Passwords do not match.';

  return { valid: Object.keys(errors).length === 0, errors, values: v };
}

module.exports = { validateRegistration };