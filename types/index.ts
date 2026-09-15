/**
 * MODEL DATA (typed domain models)
 * Dibuat lebih dulu sesuai disiplin implementasi di blueprint.
 */

export type Role = "ADMIN" | "FINANCE" | "MANDOR";

/** PENDING = sudah login Google tetapi belum diberi peran oleh Admin. */
export type RoleOrPending = Role | "PENDING";

export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: RoleOrPending;
  employeeId?: string | null;
  projectIds: string[];
  sectionIds: string[];
  status: UserStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
}

export type ProjectStatus = "ACTIVE" | "COMPLETED" | "SUSPENDED" | "ARCHIVED";

/**
 * ID dokumen = kode proyek (mis. "AGC-01").
 * Dipakai sebagai ID supaya kodenya dijamin unik oleh Firestore sendiri,
 * tanpa perlu server. Konsekuensinya kode tidak bisa diubah setelah disimpan.
 */
export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  attendanceRadiusMeter: number;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type SectionStatus = "ACTIVE" | "INACTIVE";

/** ID dokumen = "<kodeProyek>__<kodeSection>". */
export interface Section {
  id: string;
  projectId: string;
  code: string;
  name: string;
  description?: string;
  status: SectionStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type Position = "MANDOR" | "TUKANG" | "KENEK";
export type EmployeeStatus = "ACTIVE" | "INACTIVE";
export type PaymentMode = "DAILY" | "HOURLY";

/** ID dokumen = kode karyawan (mis. "TKG-001"). */
export interface Employee {
  id: string;
  employeeCode: string;
  nik: string;
  name: string;
  nickname?: string;
  position: Position;
  phone?: string;
  address?: string;
  joinDate?: string;
  status: EmployeeStatus;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  /** Diisi pada tahap upload foto (menunggu Cloudinary). */
  profilePhotoUrl?: string | null;
  ktpPhotoUrl?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
}
