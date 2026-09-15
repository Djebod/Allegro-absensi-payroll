"use client";

import {
  INCOMPLETE_DAY_WORK_HOURS,
  STANDARD_WORK_HOURS,
} from "@/lib/constants";
import type { Attendance, JenisSesi } from "@/types";

export const URUTAN_SESI: JenisSesi[] = [
  "checkIn",
  "breakStart",
  "breakEnd",
  "checkOut",
  "overtimeStart",
  "overtimeEnd",
];

export const NAMA_SESI: Record<JenisSesi, string> = {
  checkIn: "Masuk",
  breakStart: "Mulai istirahat",
  breakEnd: "Selesai istirahat",
  checkOut: "Pulang",
  overtimeStart: "Mulai lembur",
  overtimeEnd: "Selesai lembur",
};

export function idAbsensi(employeeId: string, tanggal: string): string {
  return `${employeeId}_${tanggal}`;
}

export function tanggalHariIni(): string {
  const d = new Date();
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const hari = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${bulan}-${hari}`;
}

export function jamDari(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Pemeriksaan urutan. Sesi tidak boleh melompat, dan satu sesi hanya
 * boleh dicatat sekali. Ini yang mencegah "pulang" tercatat sebelum
 * "masuk", atau istirahat tercatat dua kali.
 */
export function periksaSesi(
  absen: Partial<Attendance> | null,
  jenis: JenisSesi
): { boleh: boolean; alasan?: string } {
  const ada = (k: JenisSesi) => Boolean(absen?.[k]);

  if (ada(jenis)) {
    return { boleh: false, alasan: `${NAMA_SESI[jenis]} sudah tercatat hari ini.` };
  }

  switch (jenis) {
    case "checkIn":
      return { boleh: true };
    case "breakStart":
      return ada("checkIn")
        ? ada("checkOut")
          ? { boleh: false, alasan: "Sudah pulang, istirahat tidak bisa dicatat lagi." }
          : { boleh: true }
        : { boleh: false, alasan: "Harus absen masuk lebih dulu." };
    case "breakEnd":
      return ada("breakStart")
        ? { boleh: true }
        : { boleh: false, alasan: "Belum ada catatan mulai istirahat." };
    case "checkOut":
      return ada("checkIn")
        ? { boleh: true }
        : { boleh: false, alasan: "Harus absen masuk lebih dulu." };
    case "overtimeStart":
      return ada("checkOut")
        ? { boleh: true }
        : { boleh: false, alasan: "Lembur dicatat setelah absen pulang." };
    case "overtimeEnd":
      return ada("overtimeStart")
        ? { boleh: true }
        : { boleh: false, alasan: "Belum ada catatan mulai lembur." };
  }
}

function selisihJam(a?: string | null, b?: string | null): number {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return ms > 0 ? ms / 3600000 : 0;
}

function bulatkan(jam: number): number {
  return Math.round(jam * 100) / 100;
}

/**
 * Mesin perhitungan jam kerja.
 *
 * Aturan biasa : (pulang - masuk) - lama istirahat
 * Aturan khusus: ada masuk + mulai istirahat + pulang, TETAPI selesai
 *                istirahat hilang  ->  jam kerja dipatok 4 jam.
 *                Ini permintaan blueprint, bukan tebakan.
 */
export function hitungJam(absen: Partial<Attendance>): {
  workHours: number;
  overtimeHours: number;
  status: Attendance["status"];
} {
  const masuk = absen.checkIn?.waktu;
  const mulaiIstirahat = absen.breakStart?.waktu;
  const selesaiIstirahat = absen.breakEnd?.waktu;
  const pulang = absen.checkOut?.waktu;

  let workHours = 0;
  let status: Attendance["status"] = "BELUM";

  if (masuk) status = "HADIR";

  if (masuk && pulang) {
    if (mulaiIstirahat && !selesaiIstirahat) {
      workHours = INCOMPLETE_DAY_WORK_HOURS;
      status = "TIDAK_LENGKAP";
    } else {
      const kotor = selisihJam(masuk, pulang);
      const istirahat = selisihJam(mulaiIstirahat, selesaiIstirahat);
      workHours = bulatkan(Math.max(0, kotor - istirahat));
      status = "SELESAI";
    }
  }

  const overtimeHours = bulatkan(
    selisihJam(absen.overtimeStart?.waktu, absen.overtimeEnd?.waktu)
  );

  return { workHours, overtimeHours, status };
}

/** Sekadar penanda di layar bila jamnya jauh dari kebiasaan. */
export function jamTidakWajar(workHours: number): boolean {
  return workHours > STANDARD_WORK_HOURS + 4;
}

/**
 * Selisih antara jam HP dan jam server, dalam menit.
 * Jam server yang dipercaya. Selisih besar berarti jam perangkatnya
 * meleset - entah tidak sengaja atau disengaja - dan itu perlu terlihat.
 */
export function selisihJamServerMenit(event?: {
  waktu?: string;
  recordedAt?: unknown;
} | null): number | null {
  if (!event?.waktu || !event.recordedAt) return null;
  const server = event.recordedAt as { toDate?: () => Date };
  if (typeof server.toDate !== "function") return null;
  const beda = Math.abs(server.toDate().getTime() - new Date(event.waktu).getTime());
  return Math.round(beda / 60000);
}

/** Di atas ini dianggap perlu diperiksa manusia. */
export const BATAS_SELISIH_JAM_MENIT = 10;
