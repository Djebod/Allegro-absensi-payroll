"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { authClient, dbClient, providerGoogle, SUPER_ADMIN_EMAIL } from "@/lib/firebase";
import type { AppUser, RoleOrPending } from "@/types";

interface AuthState {
  user: User | null;
  profile: AppUser | null;
  role: RoleOrPending | null;
  loading: boolean;
  error: string | null;
  masuk: () => Promise<void>;
  keluar: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Saat seseorang login Google untuk pertama kali, dokumen users/{uid}
 * dibuat dengan peran PENDING. Hanya email super admin yang langsung
 * mendapat peran ADMIN. Semua orang lain harus diberi peran oleh Admin.
 * Aturan yang sama ditegakkan ulang di Firestore Security Rules.
 */
async function ambilAtauBuatProfil(user: User): Promise<AppUser> {
  const ref = doc(dbClient(), "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return { uid: user.uid, ...(snap.data() as Omit<AppUser, "uid">) };
  }

  const superAdmin = (user.email || "").toLowerCase() === SUPER_ADMIN_EMAIL;
  const baru: Omit<AppUser, "uid"> = {
    name: user.displayName || "Tanpa nama",
    email: (user.email || "").toLowerCase(),
    photoURL: user.photoURL || "",
    role: superAdmin ? "ADMIN" : "PENDING",
    status: superAdmin ? "ACTIVE" : "PENDING",
    projectIds: [],
    sectionIds: [],
    employeeId: null,
  };

  await setDoc(ref, {
    ...baru,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  return { uid: user.uid, ...baru };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(authClient(), async (u) => {
      setError(null);
      if (!u) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const p = await ambilAtauBuatProfil(u);
        setUser(u);
        setProfile(p);
      } catch (e) {
        setUser(u);
        setProfile(null);
        setError("Data akun tidak bisa dibaca. Coba muat ulang halaman.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      error,
      masuk: async () => {
        setError(null);
        try {
          await signInWithPopup(authClient(), providerGoogle());
        } catch {
          setError("Login gagal. Pastikan koneksi aktif, lalu coba lagi.");
        }
      },
      keluar: async () => {
        await signOut(authClient());
      },
    }),
    [user, profile, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}

/** Halaman awal sesuai peran. */
export function berandaUntuk(role: RoleOrPending | null): string {
  if (role === "ADMIN") return "/admin";
  if (role === "FINANCE") return "/finance";
  if (role === "MANDOR") return "/mandor";
  return "/menunggu-akses";
}
