import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale = 'ar-MA'): string {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ' درهم';
}

export function formatDate(date: string | Date | null | undefined, locale = 'ar-MA'): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateShort(date: string | Date | null | undefined, locale = 'ar-MA'): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function calculateNights(dateArrivee: string, dateDepart: string): number {
  const arrival = new Date(dateArrivee);
  const departure = new Date(dateDepart);
  const diffMs = departure.getTime() - arrival.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function getInitials(nom: string, prenom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export function parseEquipements(equipements: string): string[] {
  try {
    return JSON.parse(equipements) as string[];
  } catch {
    return equipements.split(',').map((e) => e.trim()).filter(Boolean);
  }
}
