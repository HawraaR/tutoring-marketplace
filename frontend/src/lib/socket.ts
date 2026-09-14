import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getToken(): string | null {
  // Adjust this to match wherever you actually store the JWT after login
  // (e.g. localStorage, a cookie, or your auth context).
  return localStorage.getItem("token");
}

// A single shared instance, created once and imported everywhere — same
// principle as the shared Prisma client on the backend. Never call io()
// again elsewhere in the app.
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => cb({ token: getToken() }),
});

// Call this once after a successful login (and once on app load if a token
// already exists), so the socket connects with a fresh, valid token.
export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }
}

// Call this on logout so the socket doesn't stay connected as a stale user.
export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}