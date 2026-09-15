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
  profilePhotoUrl?: string | null;
  profilePublicId?: string | null;
  /**
   * Cerminan penugasan yang sedang berjalan. Histori lengkapnya ada di
   * employeeAssignments; tiga kolom ini disimpan di sini supaya Security
   * Rules bisa membatasi mandor hanya melihat anggota timnya sendiri.
   */
  currentProjectId?: string | null;
  currentSectionId?: string | null;
  currentMandorId?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
}

/* ---------------- Tarif gaji ---------------- */

/**
 * Tarif tidak pernah ditimpa. Tarif lama ditutup masa berlakunya,
 * lalu tarif baru dibuat. Payroll lama harus tetap memakai angka
 * yang berlaku saat itu.
 */
export interface SalaryRate {
  id: string;
  employeeId: string;
  paymentMode: PaymentMode;
  dailyRate: number;
  hourlyRate: number;
  overtimeHourlyRate: number;
  /** Tanggal "YYYY-MM-DD". */
  effectiveFrom: string;
  /** Kosong berarti masih berlaku sampai sekarang. */
  effectiveUntil: string | null;
  createdBy: string;
  createdAt?: unknown;
}

/* ---------------- Penugasan ---------------- */

export type AssignmentStatus = "ACTIVE" | "ENDED";

export interface EmployeeAssignment {
  id: string;
  employeeId: string;
  projectId: string;
  sectionId: string;
  mandorId: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
  status: AssignmentStatus;
  reason?: string;
  createdBy: string;
  createdAt?: unknown;
}

/** Disimpan terpisah karena hanya Admin yang boleh membacanya. */
export interface EmployeePrivate {
  employeeId: string;
  ktpPhotoUrl: string | null;
  ktpPublicId: string | null;
  updatedAt?: unknown;
}
