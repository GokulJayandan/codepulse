import React from 'react';

export default function CodePulseLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="pulse" x1="6" y1="20" x2="34" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#E0E7FF" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#logoBg)" />
      {/* Pulse / heartbeat line */}
      <polyline
        points="6,22 12,22 15,14 18,28 21,10 24,26 27,18 30,22 34,22"
        fill="none"
        stroke="url(#pulse)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Code brackets */}
      <path d="M10,12 L6,20 L10,28" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30,12 L34,20 L30,28" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
