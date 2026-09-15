"use client";

import Guard from "@/components/Guard";
import Shell from "@/components/Shell";

export default function FinanceDashboard() {
  return (
    <Guard izinkan={["FINANCE"]}>
      <Shell judul="Dashboard Finance" keterangan="Bon karyawan dan payroll mingguan menyusul.">
        <div className="kartu">
          <p className="text-sm text-muted">
            Peran Anda sudah aktif. Menu bon karyawan dan payroll mingguan akan muncul di sini
            setelah tahap berikutnya selesai.
          </p>
        </div>
      </Shell>
    </Guard>
  );
}
