export const passwordValidators = {
  minLength: (min: number) => (value: string) => value.length >= min,
  hasUppercase: (value: string) => /[A-Z]/.test(value),
  hasLowercase: (value: string) => /[a-z]/.test(value),
  hasNumber: (value: string) => /\d/.test(value),
  hasSymbol: (value: string) => /[^A-Za-z0-9]/.test(value),
  passwordsMatch: (a: string, b: string) => !!a && a === b,
};
