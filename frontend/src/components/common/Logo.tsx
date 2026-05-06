interface LogoProps {
  className?: string;
}

export function ChamalLogo({ className = 'h-10 w-auto' }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 180 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="شمال كوم"
    >
      {/* Vague mer */}
      <path
        d="M4 30 Q10 22 16 30 Q22 38 28 30 Q34 22 40 30"
        stroke="#E8B84B"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Soleil */}
      <circle cx="20" cy="14" r="6" fill="#E8B84B" />
      <line x1="20" y1="4" x2="20" y2="7" stroke="#E8B84B" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="21" x2="20" y2="24" stroke="#E8B84B" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="14" x2="13" y2="14" stroke="#E8B84B" strokeWidth="2" strokeLinecap="round" />
      <line x1="27" y1="14" x2="30" y2="14" stroke="#E8B84B" strokeWidth="2" strokeLinecap="round" />
      {/* Texte arabe */}
      <text
        x="48"
        y="22"
        fontFamily="'Noto Kufi Arabic', 'Cairo', sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="white"
      >
        شمال
      </text>
      <text
        x="48"
        y="40"
        fontFamily="'Noto Kufi Arabic', 'Cairo', sans-serif"
        fontSize="14"
        fontWeight="500"
        fill="#E8B84B"
      >
        كوم
      </text>
    </svg>
  );
}

export function ChamalLogoFull({ className = 'h-12 w-auto' }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="25" cy="18" r="8" fill="#E8B84B" />
      <path
        d="M6 36 Q13 26 20 36 Q27 46 34 36 Q41 26 48 36"
        stroke="#E8B84B"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <text
        x="58"
        y="24"
        fontFamily="'Noto Kufi Arabic', 'Cairo', sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="#0A3D6B"
      >
        شمال كوم
      </text>
      <text
        x="58"
        y="40"
        fontFamily="'Cairo', sans-serif"
        fontSize="11"
        fill="#6B7280"
      >
        ChamalCom
      </text>
    </svg>
  );
}
