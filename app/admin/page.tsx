"use client";

import Link from "next/link";
import Guard from "@/components/Guard";
import Shell from "@/components/Shell";

const menu = [
  { judul: "Pengguna & Peran", ket: "Beri peran Admin, Finance, atau Mandor.", href: "/admin/users", siap: true },
  { judul: "Proyek & Section", ket: "Daftar proyek Allegro dan pembagian seksinya.", href: "#", siap: false },
  { judul: "Data Karyawan", ket: "Mandor, tukang, dan kenek beserta tarifnya.", href: "#", siap: false },
  { judul: "Absensi", ket: "Rekap harian, koreksi, dan persetujuan lembur.", href: "#", siap: false },
  { judul: "Bon Karyawan", ket: "Pinjaman karyawan dan potongannya.", href: "#", siap: false },
  { judul: "Payroll Mingguan", ket: "Perhitungan gaji per proyek dan seksi.", href: "#", siap: false },
];

export default function AdminDashboard() {
  return (
    <Guard izinkan={["ADMIN"]}>
      <Shell judul="Dashboard Admin"
        keterangan="Tahap 1 aktif — login dan pengaturan peran sudah bisa dipakai.">
        <div className="grid gap-3 sm:grid-cols-2">
          {menu.map((m) =>
            m.siap ? (
              <Link key={m.judul} href={m.href} className="kartu hover:border-allegro-600">
                <h2 className="font-semibold text-ink">{m.judul}</h2>
                <p className="mt-1 text-sm text-muted">{m.ket}</p>
              </Link>
            ) : (
              <div key={m.judul} className="kartu opacity-60">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-ink">{m.judul}</h2>
                  <span className="label-status bg-surface text-muted">Belum aktif</span>
                </div>
                <p className="mt-1 text-sm text-muted">{m.ket}</p>
              </div>
            )
          )}
        </div>
      </Shell>
    </Guard>
  );
}
