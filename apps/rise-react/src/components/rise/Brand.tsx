import { useId } from "react";

export function BrandMark({ size = 40 }: { size?: number }) {
  const gid = `rh-gold-${useId().replace(/:/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.88 0.06 82)" />
          <stop offset="0.5" stopColor="oklch(0.73 0.08 75)" />
          <stop offset="1" stopColor="oklch(0.5 0.08 50)" />
        </linearGradient>
      </defs>
      <path d="M24 3 L45 24 L24 45 L3 24 Z" fill="none" stroke={`url(#${gid})`} strokeWidth="1" opacity="0.55" />
      <path d="M12 27 L24 15 L36 27" fill="none" stroke={`url(#${gid})`} strokeWidth="3.2" strokeLinecap="square" />
      <path d="M15 35 L24 26 L33 35" fill="none" stroke={`url(#${gid})`} strokeWidth="2.2" strokeLinecap="square" opacity="0.8" />
      <circle cx="24" cy="9" r="1.3" fill="oklch(0.88 0.06 82)" />
    </svg>
  );
}

const WORDMARK_SIZE = { sm: "text-[1.7rem]", md: "text-[2.6rem]", lg: "text-[4.4rem] sm:text-[5.2rem]" } as const;

/** Logotipo de texto "Rise": Bodoni Moda itálica con oro Nocturne y brillo al cargar. */
export function Wordmark({ size = "md", className = "" }: { size?: keyof typeof WORDMARK_SIZE; className?: string }) {
  return <span className={`rise-wordmark ${WORDMARK_SIZE[size]} ${className}`}>Rise</span>;
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <BrandMark size={compact ? 32 : 42} />
      <div className="leading-none" aria-label="Rise">
        <Wordmark size={compact ? "sm" : "md"} />
        {!compact && (
          <div className="mt-1 whitespace-nowrap text-[0.56rem] font-semibold tracking-[0.2em] text-muted-foreground">
            DISCIPLINA CREA LIBERTAD
          </div>
        )}
      </div>
    </div>
  );
}