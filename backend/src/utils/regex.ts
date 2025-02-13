export const regexString = /^[a-zA-Z0-9\s\-_'.,]*$/;
// Allows alphanumeric characters, spaces, dashes, underscores, apostrophes, periods, and commas.
export const regexNumber = /^[0-9]*$/;
// Allows empty string or numeric characters.
export const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Does not allow empty string; requires a valid email format.
export const regexImage = /^$|^.*\.(jpg|jpeg|png)$/i;
// Allows empty string or valid image file extensions.
export const regexFile = /^$|^.*\.(pdf)$/i;
// Allows empty string or valid PDF file extension.
export const regexPassword = /^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&#]*$/;
// Password must contain at least one letter and one number; special characters and uppercase are optional (does not allow empty string).
export const regexAddress = /^[a-zA-Z0-9\s,.'-]*$/;
// Allows empty string or letters, numbers, spaces, commas, periods, apostrophes, and hyphens.
export const regexCountry = /^[A-Z]*$/;
// Allows empty string or capital letters.
export const regexPhone = /^\+?[0-9]*$/;
// Allows empty string, numeric characters, and the special character '+', but '+' is allowed only at the first position.
export const regexBoolean = /^(true|false)$/i;
// Check Boolean regex
