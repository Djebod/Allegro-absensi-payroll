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

export type Position = "MANDOR" | "TUKANG" | "KENEK";
export type PaymentMode = "DAILY" | "HOURLY";
export type ProjectStatus = "ACTIVE" | "COMPLETED" | "SUSPENDED" | "ARCHIVED";

export interface Project {
  code: string;
  name: string;
  description?: string;
  location: { address: string; latitude: number; longitude: number };
  attendanceRadiusMeter: number;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string | null;
}

export interface Section {
  projectId: string;
  code: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
}
