// Dev-server proxy used by vite.config.js.
// Calls to /api/... from the browser go to the Django server (VITE_BACKEND_URL in .env).
export function makeProxy(target) {
  return {
    "/api": { target, changeOrigin: true, secure: false },
    "/media": { target, changeOrigin: true, secure: false },
  };
}
