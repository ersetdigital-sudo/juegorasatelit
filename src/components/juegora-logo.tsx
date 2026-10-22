import Link from "next/link";

export function JuegoraLogo({
  href = "/",
  className = "",
  compact = false,
}: {
  href?: string | null;
  className?: string;
  compact?: boolean;
}) {
  const content = (
    <span className={`brand-logo ${className}`.trim()} aria-label="Juegora Satelit">
      <svg
        width={compact ? 34 : 38}
        height={compact ? 34 : 38}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="brand-logo__mark"
      >
        <defs>
          <linearGradient
            id="juegora-tile"
            x1="5"
            y1="3"
            x2="35"
            y2="37"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1AA894" />
            <stop offset="0.52" stopColor="#0E6E66" />
            <stop offset="1" stopColor="#08443F" />
          </linearGradient>
          <linearGradient
            id="juegora-glyph"
            x1="16"
            y1="8"
            x2="25"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#CFEFE9" />
          </linearGradient>
          <linearGradient
            id="juegora-orbit"
            x1="7"
            y1="27"
            x2="33"
            y2="13"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#CFEFE9" stopOpacity="0.3" />
            <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.7" />
            <stop offset="1" stopColor="#CFEFE9" stopOpacity="0.32" />
          </linearGradient>
          <filter id="juegora-mark-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        <rect x="1" y="1" width="38" height="38" rx="13" fill="url(#juegora-tile)" />
        <rect
          x="1.5"
          y="1.5"
          width="37"
          height="37"
          rx="12.5"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
        />

        <g transform="rotate(-22 20 20)">
          <ellipse
            cx="20"
            cy="20"
            rx="13.4"
            ry="6"
            stroke="url(#juegora-orbit)"
            strokeWidth="1.5"
          />
        </g>

        <path
          d="M24.8 9.2V23.4C24.8 27.5 22.2 30.2 18.1 30.2C15 30.2 12.9 28.6 11.9 26.2"
          stroke="url(#juegora-glyph)"
          strokeWidth="4.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="32.3" cy="15.3" r="2.9" fill="#FF9F1C" />
        <circle
          cx="32.3"
          cy="15.3"
          r="4.3"
          fill="#FF9F1C"
          opacity="0.42"
          filter="url(#juegora-mark-glow)"
        />
      </svg>

      <span className="brand-logo__type">
        <span className="brand-logo__name">juegora</span>
        <span className="brand-logo__store">satelit</span>
      </span>
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} className="brand-logo__link" aria-label="Juegora Satelit — kembali ke beranda">
      {content}
    </Link>
  );
}
