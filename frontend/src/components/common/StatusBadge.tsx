import { cn } from '@/lib/utils';
import type { ReservationStatut, PaiementStatut, AvisStatut, AppartementStatut } from '@/types/api.types';

type Status = ReservationStatut | PaiementStatut | AvisStatut | AppartementStatut;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  // Réservation
  en_attente:           { label: 'في الانتظار',    className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  confirmee:            { label: 'مؤكد',           className: 'bg-teal text-white' },
  annulee_client:       { label: 'ملغى (عميل)',    className: 'bg-red-100 text-red-700 border border-red-200' },
  annulee_proprietaire: { label: 'ملغى (مالك)',    className: 'bg-red-100 text-red-700 border border-red-200' },
  terminee:             { label: 'منتهي',          className: 'bg-gray-100 text-gray-700 border border-gray-200' },
  litige:               { label: 'نزاع',           className: 'bg-orange-100 text-orange-700 border border-orange-200' },
  // Paiement
  valide:               { label: 'مدفوع',          className: 'bg-teal text-white' },
  echoue:               { label: 'فشل',            className: 'bg-red-100 text-red-700 border border-red-200' },
  rembourse:            { label: 'مُسترد',         className: 'bg-blue-100 text-blue-700 border border-blue-200' },
  // Avis
  publie:               { label: 'منشور',          className: 'bg-teal text-white' },
  masque:               { label: 'مخفي',           className: 'bg-gray-100 text-gray-700' },
  // Appartement
  disponible:           { label: 'متاح',           className: 'bg-teal text-white' },
  en_attente_validation:{ label: 'قيد المراجعة',  className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  suspendu:             { label: 'موقوف',          className: 'bg-orange-100 text-orange-700 border border-orange-200' },
  archive:              { label: 'مؤرشف',          className: 'bg-gray-100 text-gray-500' },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' };
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  );
}
