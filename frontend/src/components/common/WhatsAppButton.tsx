'use client';

const WHATSAPP_NUMBER = '212600000000'; // ← remplace par le vrai numéro
const WHATSAPP_MESSAGE = 'مرحباً، أريد الاستفسار عن شقة في شمال كوم';

interface WhatsAppButtonProps {
  /** Si fourni, affiche un bouton inline (pour la fiche appartement) */
  inline?: boolean;
  /** Message personnalisé pour une fiche spécifique */
  message?: string;
  label?: string;
}

export function WhatsAppButton({ inline = false, message, label }: WhatsAppButtonProps) {
  const text = encodeURIComponent(message ?? WHATSAPP_MESSAGE);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

  if (inline) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-xl font-medium text-sm hover:bg-[#20b458] transition-colors"
      >
        <WhatsAppIcon />
        {label ?? 'تواصل عبر واتساب'}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed bottom-6 start-6 z-50 bg-[#25D366] text-white w-14 h-14 rounded-full shadow-lg hover:bg-[#20b458] hover:scale-110 transition-all flex items-center justify-center"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}

function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.121 1.523 5.855L.057 23.17a.75.75 0 00.916.977l5.456-1.47A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.595-.506-5.088-1.387l-.361-.215-3.741 1.009.983-3.668-.234-.376A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}
