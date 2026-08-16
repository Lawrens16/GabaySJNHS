'use client';

import React, { useEffect, useState } from 'react';
import { Lightbulb, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`h-9 px-3 rounded-xl bg-card border border-border flex items-center gap-1.5 opacity-50 ${className}`}
      >
        <Lightbulb className="w-4 h-4 text-gabay-green" />
        {showLabel && <span className="text-xs font-semibold">Theme</span>}
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Switch to Warm Light Mode (Default)' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`h-9 px-3 rounded-xl bg-card hover:bg-muted border border-border text-foreground transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 group ${className}`}
    >
      {/* Lightbulb / Sun-Moon Icon */}
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-gabay-navy-300 group-hover:rotate-12 transition-transform" />
        ) : (
          <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform" />
        )}
      </div>

      {showLabel ? (
        <span className="text-xs font-semibold text-foreground">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      ) : (
        <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
