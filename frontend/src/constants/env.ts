const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw Error(`Missing String environment variable for ${key}`);
  }

  return value;
};

export const APP_NAME = getEnv("APP_NAME", "Invoice Hub");
export const APP_SLOGAN = getEnv("APP_SLOGAN", "Manage your invoices by touch");
export const NODE_ENV = getEnv("NODE_ENV", "development");
export const APP_ORIGIN = getEnv("APP_ORIGIN", "http://localhost:3000");
export const APP_PORT = getEnv("APP_PORT", "3000");
export const API_ORIGIN = getEnv("API_ORIGIN", "http://localhost:5000/api");
export const FILE_ORIGIN = getEnv("FILE_ORIGIN", "http://localhost:5000/uploads");
export const API_PORT = getEnv("API_PORT", "5000");
