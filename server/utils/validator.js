import validator from "validator";

export const isValidEmail = (email) => validator.isEmail(email);

export const isValidPhone = (phone) => validator.isMobilePhone(phone, "en-IN");

export const isStrongPassword = (password) =>
  validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

export const isValidMongoId = (id) => validator.isMongoId(id);

export const validateRequiredFields = (data, fields = []) => {
  const missing = fields.filter((f) => !data[f]);
  return missing.length ? missing : null;
};
