"use client";

import { auth } from "@/lib/firebase/client";
import { onIdTokenChanged } from "firebase/auth";
import { useEffect, useState } from "react";

// undefined = loading, null = signed out, User = signed in
export function useFirebaseUser() {
  const [user, setUser] = useState<typeof auth.currentUser | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  return user;
}