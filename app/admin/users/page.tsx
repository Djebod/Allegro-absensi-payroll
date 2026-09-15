"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import Guard from "@/components/Guard";
import Shell from "@/components/Shell";
import { dbClient, SUPER_ADMIN_EMAIL } from "@/lib/firebase";
import type { AppUser, RoleOrPending, UserStatus } from "@/types";

const PERAN: RoleOrPending[] = ["PENDING", "ADMIN", "FINANCE", "MANDOR"];

function warnaStatus(status: UserStatus) {
  if (status === "ACTIVE") return "bg-green-100 text-green-800";
  if (status === "INACTIVE") return "bg-red-100 text-bahaya";
  return "bg-kuning-400/40 text-allegro-700";
}

function DaftarPengguna() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [pesan, setPesan] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(
      collection(dbClient(), "users"),
      (snap) => {
        setUsers(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<AppUser, "uid">) })));
        setMemuat(false);
      },
      () => {
        setPesan("Data pengguna tidak bisa dibaca. Periksa Security Rules.");
        setMemuat(false);
      }
    );
  }, []);

  async function ubah(uid: string, data: Partial<AppUser>) {
    setPesan(null);
    try {
      await updateDoc(doc(dbClient(), "users", uid), { ...data, updatedAt: serverTimestamp() });
      setPesan("Perubahan tersimpan.");
    } catch {
      setPesan("Perubahan gagal disimpan. Periksa koneksi dan Security Rules.");
    }
  }

  if (memuat) return <p className="text-muted">Memuat daftar pengguna…</p>;

  if (users.length === 0)
    return (
      <div className="kartu text-center">
        <p className="text-sm text-muted">
          Belum ada pengguna lain. Minta mereka login dengan Google sekali, lalu peran bisa
          diberikan dari halaman ini.
        </p>
      </div>
    );

  return (
    <>
      {pesan && (
        <p className="mb-4 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink">
          {pesan}
        </p>
      )}

      <div className="space-y-3">
        {users.map((u) => {
          const superAdmin = u.email === SUPER_ADMIN_EMAIL;
          return (
            <div key={u.uid} className="kartu">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{u.name}</p>
                  <p className="truncate text-sm text-muted">{u.email}</p>
                </div>
                <span className={`label-status ${warnaStatus(u.status)}`}>{u.status}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="text-sm text-muted" htmlFor={`peran-${u.uid}`}>
                  Peran
                </label>
                <select
                  id={`peran-${u.uid}`}
                  className="input-dasar max-w-[10rem]"
                  value={u.role}
                  disabled={superAdmin}
                  onChange={(e) =>
                    ubah(u.uid, {
                      role: e.target.value as RoleOrPending,
                      status: e.target.value === "PENDING" ? "PENDING" : "ACTIVE",
                    })
                  }
                >
                  {PERAN.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                {!superAdmin && u.role !== "PENDING" && (
                  <button
                    className="btn-ringan"
                    onClick={() =>
                      ubah(u.uid, { status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" })
                    }
                  >
                    {u.status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                )}

                {superAdmin && <span className="text-xs text-muted">Super admin, tidak bisa diubah</span>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function HalamanPengguna() {
  return (
    <Guard izinkan={["ADMIN"]}>
      <Shell
        judul="Pengguna & Peran"
        keterangan="Setiap orang harus login Google sekali sebelum bisa diberi peran."
      >
        <DaftarPengguna />
      </Shell>
    </Guard>
  );
}
