// Stub useAuth hook for Manus frontend compatibility
import { useState } from "react";

export function useAuth() {
  const [user] = useState({
    id: 1,
    username: "rylex",
    role: "driver" as const,
    email: "rylex@jidofreight.com",
  });
  return { user, isLoading: false, isAuthenticated: true };
}
