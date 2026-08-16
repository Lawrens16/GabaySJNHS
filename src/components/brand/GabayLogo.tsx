import React from 'react';
import { HeartHandshake } from 'lucide-react';

interface GabayLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export default function GabayLogo({
  size = 'md',
  showSubtitle = true,
  className = '',
}: GabayLogoProps) {
  const iconSizeClass = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }[size];

  const iconGraphicSize = {
    sm: 18,
    md: 22,
    lg: 32,
  }[size];

  const titleSizeClass = {
    sm: 'text-sm font-bold',
    md: 'text-base font-extrabold',
    lg: 'text-2xl font-black',
  }[size];

  const badgeSizeClass = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Graphic Container */}
      <div
        className={`${iconSizeClass} rounded-2xl bg-gradient-to-br from-emerald-500/15 via-gabay-green/20 to-gabay-navy/15 dark:from-gabay-green/25 dark:to-gabay-navy/30 border border-gabay-green/30 dark:border-gabay-green/40 flex items-center justify-center shrink-0 shadow-sm relative group`}
      >
        <HeartHandshake
          size={iconGraphicSize}
          className="text-gabay-green dark:text-emerald-400 drop-shadow-sm transition-transform group-hover:scale-110 duration-200"
        />
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`${titleSizeClass} tracking-tight text-gabay-green dark:text-emerald-400`}>
            Gabay
          </span>
          <span
            className={`${badgeSizeClass} rounded-md bg-gabay-navy text-white font-black tracking-wider uppercase shadow-sm`}
          >
            SJNHS
          </span>
        </div>

        {showSubtitle && (
          <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5 tracking-tight">
            Guidance Counseling & Student Records
          </span>
        )}
      </div>
    </div>
  );
}
