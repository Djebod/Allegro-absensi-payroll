"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Guard from "@/components/Guard";
import Shell from "@/components/Shell";
import Modal from "@/components/Modal";
import BadgeLokasi from "@/components/BadgeLokasi";
import { Pesan } from "@/components/Field";
import { pantauAbsensiTanggal, semuaProyek, semuaSection } from "@/lib/data";
import { fotoKecil } from "@/lib/cloudinary";
import {
  BATAS_SELISIH_JAM_MENIT,
  NAMA_SESI,
  URUTAN_SESI,
  jamDari,
  selisihJamServerMenit,
  tanggalHariIni,
} from "@/lib/absensi";
import type { Attendance, Project, Section, StatusAbsen } from "@/types";

const STATUS: (StatusAbsen | "SEMUA")[] = ["SEMUA", "HADIR", "TIDAK_LENGKAP", "SELESAI"];

function warnaStatus(s: StatusAbsen) {
  if (s === "SELESAI") return "bg-green-100 text-green-800";
  if (s === "TIDAK_LENGKAP") return "bg-kuning-400/40 text-allegro-700";
  if (s === "HADIR") return "bg-allegro-100 text-allegro-700";
  return "bg-surface text-muted";
}

function Isi() {
  const [tanggal, setTanggal] = useState(tanggalHariIni());
  const [filterProyek, setFilterProyek] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusAbsen | "SEMUA">("SEMUA");

  const [data, setData] = useState<Attendance[]>([]);
  const [proyek, setProyek] = useState<Project[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [salah, setSalah] = useState<string | null>(null);
  const [rincian, setRincian] = useState<Attendance | null>(null);

  useEffect(() => {
    semuaProyek().then(setProyek).catch(() => {});
    semuaSection().then(setSections).catch(() => {});
  }, []);

  useEffect(() => {
    setMemuat(true);
    setSalah(null);
    return pantauAbsensiTanggal(
      tanggal,
      filterProyek || null,
      (d) => {
        setData(d);
        setMemuat(false);
      },
      () => {
        setSalah("Data absensi tidak bisa dibaca. Pastikan Security Rules terbaru sudah di-publish.");
        setMemuat(false);
      }
    );
  }, [tanggal, filterProyek]);

  const terlihat = useMemo(
    () => (filterStatus === "SEMUA" ? data : data.filter((a) => a.status === filterStatus)),
    [data, filterStatus]
  );

  const radiusDari = (projectId: string) =>
    proyek.find((p) => p.id === projectId)?.attendanceRadiusMeter ?? 1000;

  const namaSection = (id: string) => sections.find((s) => s.id === id)?.name || "—";

  const ringkasan = useMemo(() => {
    const jamKerja = data.reduce((t, a) => t + (a.workHours || 0), 0);
    const jamLembur = data.reduce((t, a) => t + (a.overtimeHours || 0), 0);
    const luarLokasi = data.filter(
      (a) => (a.terakhir?.jarakMeter ?? 0) > radiusDari(a.projectId)
    ).length;
    const jamMeleset = data.filter((a) =>
      URUTAN_SESI.some((j) => {
        const beda = selisihJamServerMenit(a[j]);
        return beda !== null && beda > BATAS_SELISIH_JAM_MENIT;
      })
    ).length;
    return {
      jamKerja: Math.round(jamKerja * 100) / 100,
      jamLembur: Math.round(jamLembur * 100) / 100,
      luarLokasi,
      jamMeleset,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, proyek]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Tanggal</span>
          <input
            type="date"
            className="input-dasar"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Proyek</span>
          <select
            className="input-dasar"
            value={filterProyek}
            onChange={(e) => setFilterProyek(e.target.value)}
          >
            <option value="">Semua proyek</option>
            {proyek.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} · {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Status</span>
          <select
            className="input-dasar"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StatusAbsen | "SEMUA")}
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s === "SEMUA" ? "Semua status" : s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {salah && (
        <div className="mb-4">
          <Pesan jenis="gagal" isi={salah} />
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <div className="kartu">
          <p className="text-xs text-muted">Tercatat</p>
          <p className="text-xl font-bold text-ink">{data.length} orang</p>
        </div>
        <div className="kartu">
          <p className="text-xs text-muted">Total jam kerja</p>
          <p className="text-xl font-bold text-ink">{ringkasan.jamKerja}</p>
        </div>
        <div className="kartu">
          <p className="text-xs text-muted">Total jam lembur</p>
          <p className="text-xl font-bold text-ink">{ringkasan.jamLembur}</p>
        </div>
        <div className="kartu">
          <p className="text-xs text-muted">Perlu diperiksa</p>
          <p className="text-xl font-bold text-ink">
            {ringkasan.luarLokasi + ringkasan.jamMeleset}
          </p>
          <p className="mt-1 text-xs text-muted">
            {ringkasan.luarLokasi} di luar lokasi · {ringkasan.jamMeleset} jam HP meleset
          </p>
        </div>
      </div>

      {memuat ? (
        <p className="text-muted">Memuat…</p>
      ) : terlihat.length === 0 ? (
        <div className="kartu text-center">
          <p className="text-sm text-muted">
            Tidak ada absensi pada tanggal dan saringan ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {terlihat.map((a) => (
            <div key={a.id} className="kartu">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{a.employeeName}</p>
                  <p className="text-xs text-muted">
                    {a.employeeId} · {a.projectId} · {namaSection(a.sectionId)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <BadgeLokasi
                    jarakMeter={a.terakhir?.jarakMeter}
                    radiusMeter={radiusDari(a.projectId)}
                  />
                  <span className={`label-status ${warnaStatus(a.status)}`}>{a.status}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                <span>Masuk {jamDari(a.checkIn?.waktu)}</span>
                <span>
                  Istirahat {jamDari(a.breakStart?.waktu)}–{jamDari(a.breakEnd?.waktu)}
                </span>
                <span>Pulang {jamDari(a.checkOut?.waktu)}</span>
                <span className="font-semibold text-ink">{a.workHours} jam kerja</span>
                {a.overtimeHours > 0 && (
                  <span className="font-semibold text-ink">{a.overtimeHours} jam lembur</span>
                )}
              </div>

              <button className="btn-ringan mt-3" onClick={() => setRincian(a)}>
                Rincian & foto
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        judul={rincian ? `${rincian.employeeName} · ${rincian.date}` : ""}
        terbuka={Boolean(rincian)}
        onTutup={() => setRincian(null)}
      >
        {rincian && (
          <div className="space-y-4">
            {URUTAN_SESI.map((jenis) => {
              const ev = rincian[jenis];
              if (!ev) return null;
              const beda = selisihJamServerMenit(ev);
              const radius = radiusDari(rincian.projectId);

              return (
                <div key={jenis} className="rounded-lg border border-line p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{NAMA_SESI[jenis]}</p>
                      <p className="text-sm text-muted">Pukul {jamDari(ev.waktu)}</p>
                    </div>
                    <BadgeLokasi
                      jarakMeter={ev.location?.distanceFromProjectMeter}
                      radiusMeter={radius}
                    />
                  </div>

                  <div className="mt-3 flex gap-3">
                    {ev.photoUrl && (
                      <a href={ev.photoUrl} target="_blank" rel="noopener noreferrer">
                        <Image
                          src={fotoKecil(ev.photoUrl, 160)}
                          alt={NAMA_SESI[jenis]}
                          width={80}
                          height={80}
                          className="h-20 w-20 rounded-lg border border-line object-cover"
                          unoptimized
                        />
                      </a>
                    )}
                    <div className="text-xs text-muted">
                      <p>Dicatat oleh {ev.recordedBy}</p>
                      <p className="mt-1">
                        Ketelitian GPS ±{ev.location?.accuracy ?? "?"} m ·{" "}
                        {ev.location?.distanceFromProjectMeter ?? "?"} m dari titik proyek
                      </p>
                      {beda !== null && (
                        <p
                          className={`mt-1 ${
                            beda > BATAS_SELISIH_JAM_MENIT ? "font-semibold text-bahaya" : ""
                          }`}
                        >
                          Selisih jam HP dengan jam server {beda} menit
                          {beda > BATAS_SELISIH_JAM_MENIT ? " — perlu diperiksa" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <p className="text-xs text-muted">
              Jam yang dipercaya adalah jam server. Jam HP hanya ditampilkan supaya mudah dibaca.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}

export default function HalamanAbsensiAdmin() {
  return (
    <Guard izinkan={["ADMIN"]}>
      <Shell judul="Rekap Absensi" keterangan="Catatan absensi harian beserta bukti lokasi dan fotonya.">
        <Isi />
      </Shell>
    </Guard>
  );
}
