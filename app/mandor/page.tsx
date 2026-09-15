"use client";

import Guard from "@/components/Guard";
import Shell from "@/components/Shell";

export default function MandorDashboard() {
  return (
    <Guard izinkan={["MANDOR"]}>
      <Shell judul="Absensi Lapangan" keterangan="Absensi diri dan anggota tim di lokasi proyek.">
        <div className="kartu">
          <p className="text-sm text-muted">
            Peran Anda sudah aktif. Tombol absensi, GPS, dan kamera akan muncul di sini setelah
            proyek dan data karyawan dimasukkan Admin.
          </p>
          <button className="btn-lapangan mt-5" disabled>
            Mulai sesi absensi
          </button>
        </div>
      </Shell>
    </Guard>
  );
}
