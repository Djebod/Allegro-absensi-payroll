"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, berandaUntuk } from "@/lib/auth";

export default function Beranda() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const aktif = profile?.status === "ACTIVE";
    router.replace(berandaUntuk(aktif ? profile?.role ?? null : "PENDING"));
  }, [loading, user, profile, router]);

  return (
    <div className="grid min-h-screen place-items-center">
      <p className="text-muted">Memuat…</p>
    </div>
  );
}
