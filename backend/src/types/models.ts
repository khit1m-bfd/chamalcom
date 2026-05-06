// ─── Role types ──────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'proprietaire' | 'client';

// ─── JWT Payload ─────────────────────────────────────────────────────────────
export interface JwtPayload {
  id: number;
  role: UserRole;
  email: string;
  iat?: number;
  exp?: number;
}

// ─── API standard responses ───────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface PaginatedResult<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Helper — success response builder ───────────────────────────────────────
export function success<T>(data: T, message?: string): ApiSuccess<T> {
  return { success: true, data, ...(message ? { message } : {}) };
}

export function paginated<T>(data: T[], meta: PaginationMeta): PaginatedResult<T> {
  return { success: true, data, meta };
}
