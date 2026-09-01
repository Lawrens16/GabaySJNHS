'use client';

/**
 * StationWatermark — full-screen CSS overlay watermark for Enrollment Officer clearance screens.
 *
 * Designed to deter unauthorized photography/screenshotting of sensitive student data.
 * Per RA 10173 and DepEd data privacy best practices:
 * - User-specific watermark (officer username + timestamp) helps trace data leaks.
 * - CSS-only approach: works immediately, no external library needed, cannot be dismissed
 *   without opening browser DevTools.
 * - Opacity is intentionally low (0.042) — visible in photos but non-intrusive during work.
 */

interface StationWatermarkProps {
  officerUsername: string;
}

export default function StationWatermark({ officerUsername }: StationWatermarkProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
  const timeStr = now.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const watermarkText = `${officerUsername} • ${dateStr} ${timeStr} • CONFIDENTIAL • FOR OFFICIAL USE ONLY`;

  // Build a repeated diagonal grid using CSS SVG background trick
  // Each "cell" is 340×140px rotated -35deg with the text repeated.
  const svgContent = `
    <svg xmlns='http://www.w3.org/2000/svg' width='380' height='160'>
      <text
        x='50%'
        y='50%'
        dominant-baseline='middle'
        text-anchor='middle'
        font-family='monospace, sans-serif'
        font-size='11'
        font-weight='600'
        fill='%23334155'
        transform='rotate(-30, 190, 80)'
        letter-spacing='1'
      >${watermarkText}</text>
    </svg>
  `.trim();

  const svgDataUrl = `url("data:image/svg+xml,${encodeURIComponent(svgContent)}")`;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[60] pointer-events-none select-none overflow-hidden"
      style={{
        backgroundImage: svgDataUrl,
        backgroundRepeat: 'repeat',
        backgroundSize: '380px 160px',
        opacity: 0.042,
      }}
    />
  );
}
