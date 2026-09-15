"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { dbClient } from "@/lib/firebase";
import type { Employee, Project, Section } from "@/types";

/**
 * Kode dipakai sebagai ID dokumen, jadi harus dirapikan lebih dulu:
 * huruf besar, spasi jadi strip, karakter aneh dibuang.
 */
export function rapikanKode(teks: string): string {
  return teks
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function idSection(kodeProyek: string, kodeSection: string): string {
  return `${rapikanKode(kodeProyek)}__${rapikanKode(kodeSection)}`;
}

/* ---------------- Proyek ---------------- */

export function pantauProyek(
  onData: (data: Project[]) => void,
  onGagal: () => void
) {
  return onSnapshot(
    query(collection(dbClient(), "projects"), orderBy("name")),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Project, "id">) }))),
    onGagal
  );
}

export async function ambilProyek(id: string): Promise<Project | null> {
  const snap = await getDoc(doc(dbClient(), "projects", id));
  return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Project, "id">) } : null;
}

/** Membuat proyek baru. Ditolak Firestore bila kodenya sudah dipakai. */
export async function buatProyek(data: Omit<Project, "id" | "createdAt" | "updatedAt">) {
  const id = rapikanKode(data.code);
  const ref = doc(dbClient(), "projects", id);
  const ada = await getDoc(ref);
  if (ada.exists()) throw new Error(`Kode proyek "${id}" sudah dipakai.`);
  await setDoc(ref, { ...data, code: id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return id;
}

export async function ubahProyek(id: string, data: Partial<Project>) {
  const { id: _buang, code: _kode, createdAt: _dibuat, ...bersih } = data as Project;
  await updateDoc(doc(dbClient(), "projects", id), { ...bersih, updatedAt: serverTimestamp() });
}

/* ---------------- Section ---------------- */

export function pantauSection(
  projectId: string,
  onData: (data: Section[]) => void,
  onGagal: () => void
) {
  return onSnapshot(
    query(collection(dbClient(), "sections"), where("projectId", "==", projectId)),
    (snap) => {
      const isi = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Section, "id">) }));
      isi.sort((a, b) => a.name.localeCompare(b.name));
      onData(isi);
    },
    onGagal
  );
}

export async function buatSection(data: Omit<Section, "id" | "createdAt" | "updatedAt">) {
  const id = idSection(data.projectId, data.code);
  const ref = doc(dbClient(), "sections", id);
  const ada = await getDoc(ref);
  if (ada.exists()) throw new Error(`Kode section "${rapikanKode(data.code)}" sudah ada di proyek ini.`);
  await setDoc(ref, {
    ...data,
    code: rapikanKode(data.code),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function ubahSection(id: string, data: Partial<Section>) {
  const { id: _b, code: _k, projectId: _p, createdAt: _c, ...bersih } = data as Section;
  await updateDoc(doc(dbClient(), "sections", id), { ...bersih, updatedAt: serverTimestamp() });
}

/* ---------------- Karyawan ---------------- */

export function pantauKaryawan(
  onData: (data: Employee[]) => void,
  onGagal: () => void
) {
  return onSnapshot(
    query(collection(dbClient(), "employees"), orderBy("name")),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Employee, "id">) }))),
    onGagal
  );
}

/** NIK juga diperiksa supaya satu orang tidak terdaftar dua kali. */
export async function buatKaryawan(data: Omit<Employee, "id" | "createdAt" | "updatedAt">) {
  const id = rapikanKode(data.employeeCode);
  const ref = doc(dbClient(), "employees", id);
  const ada = await getDoc(ref);
  if (ada.exists()) throw new Error(`Kode karyawan "${id}" sudah dipakai.`);

  const nikSama = await getDocs(
    query(collection(dbClient(), "employees"), where("nik", "==", data.nik))
  );
  if (!nikSama.empty) {
    throw new Error(`NIK ini sudah terdaftar atas nama ${nikSama.docs[0].data().name}.`);
  }

  await setDoc(ref, {
    ...data,
    employeeCode: id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function ubahKaryawan(id: string, data: Partial<Employee>) {
  const { id: _b, employeeCode: _k, createdAt: _c, ...bersih } = data as Employee;
  await updateDoc(doc(dbClient(), "employees", id), { ...bersih, updatedAt: serverTimestamp() });
}

/** Dipakai hanya untuk membatalkan salah input di hari yang sama. */
export async function hapusKaryawan(id: string) {
  await deleteDoc(doc(dbClient(), "employees", id));
}
