export const config = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:4000',
};
