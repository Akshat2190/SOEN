const defaultLocalOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
  "http://localhost:5176",
  "http://127.0.0.1:5176",
];

export const getAllowedOrigins = () => {
  const configuredOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
    : [];

  return [...new Set([...configuredOrigins, ...defaultLocalOrigins])]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ""));
};

export const isOriginAllowed = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, "");
  const allowedOrigins = getAllowedOrigins();

  return allowedOrigins.includes(normalizedOrigin);
};
