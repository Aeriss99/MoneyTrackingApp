<template>
  <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" class="filter drop-shadow-[4px_4px_0px_#1a1a2e]">
    <!-- 3D Wallet Base -->
    <g transform="translate(10, 10)">
      <!-- Back flap of wallet (darker) -->
      <rect x="30" y="40" width="110" height="80" rx="14" fill="#E67E22" stroke="#1a1a2e" stroke-width="3"/>
      
      <!-- Inside money sheets (isometric stack) -->
      <rect x="40" y="25" width="80" height="40" rx="6" fill="#2ECC71" stroke="#1a1a2e" stroke-width="2.5" transform="rotate(-5)" />
      <rect x="50" y="20" width="70" height="40" rx="6" fill="#27AE60" stroke="#1a1a2e" stroke-width="2.5" transform="rotate(5)" />

      <!-- Front flap of wallet (lighter, main body) -->
      <rect x="25" y="48" width="115" height="82" rx="14" fill="#F39C12" stroke="#1a1a2e" stroke-width="3"/>
      <!-- Stitches -->
      <path d="M 35 58 L 130 58" stroke="#FFFDF7" stroke-width="2" stroke-dasharray="4 4" />
      
      <!-- Wallet cute face details -->
      <circle cx="55" cy="85" r="5" fill="#1a1a2e"/>
      <circle cx="105" cy="85" r="5" fill="#1a1a2e"/>
      <circle cx="56.5" cy="83.5" r="1.5" fill="white"/>
      <circle cx="106.5" cy="83.5" r="1.5" fill="white"/>
      <path d="M 72 102 Q 80 110 88 102" stroke="#1a1a2e" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Clasp button -->
      <path d="M 125 75 L 145 75 L 140 95 L 125 90 Z" fill="#D35400" stroke="#1a1a2e" stroke-width="3" />
      <circle cx="136" cy="84" r="5" fill="#FFD93D" stroke="#1a1a2e" stroke-width="2" />
    </g>

    <!-- Hands & Legs -->
    <path d="M 45 138 L 52 160 L 65 160" stroke="#1a1a2e" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M 45 138 L 52 160 L 65 160" stroke="#FFD93D" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />

    <path d="M 105 138 L 112 160 L 125 160" stroke="#1a1a2e" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M 105 138 L 112 160 L 125 160" stroke="#FFD93D" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />

    <!-- Sparkle floating -->
    <g class="animate-float" style="animation-delay: 0.5s">
      <polygon points="160,30 162,34 167,34 163,37 164,42 160,39 156,42 157,37 153,34 158,34" fill="#FFD93D" stroke="#1a1a2e" stroke-width="1.5"/>
    </g>
  </svg>
</template>
