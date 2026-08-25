<template>
  <div class="relative w-full max-w-[700px] mx-auto overflow-visible illustration-container group" :class="{ 'hover-active': isHovered }">
    <svg viewBox="0 0 1000 700" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto drop-shadow-soft-neo-lg dark:drop-shadow-soft-neo-dark-lg" role="img" aria-label="Soft Neo-Brutalism Personal Finance Illustration">
      
      <!-- ========================================== -->
      <!-- THE ENVIRONMENT & PLATFORM                   -->
      <!-- ========================================== -->
      
      <!-- Soft Ambient Backdrop Glow -->
      <circle cx="500" cy="350" r="300" fill="#FFD93D" opacity="0.1" class="anim-pulse-slow" />
      <circle cx="200" cy="200" r="150" fill="#4D96FF" opacity="0.1" class="anim-pulse-slow-reverse" />
      
      <!-- Base Floor (Isometric Grid feel, but softer) -->
      <path d="M100 550 Q500 650 900 550 Q500 450 100 550 Z" fill="#1E1E2A" opacity="0.05" class="dark:fill-[#FDFBF7]" />
      
      <!-- Elevated Platforms (Soft Neo-Brutalism: rounded, thin border, soft shadow) -->
      <g transform="translate(150, 420)">
        <rect x="0" y="20" width="300" height="100" rx="30" fill="#1E1E2A" class="dark:fill-[#232332]" />
        <rect x="0" y="0" width="300" height="100" rx="30" fill="#FFD93D" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
      </g>

      <g transform="translate(550, 460)">
        <rect x="0" y="20" width="250" height="80" rx="30" fill="#1E1E2A" class="dark:fill-[#232332]" />
        <rect x="0" y="0" width="250" height="80" rx="30" fill="#6BCB77" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
      </g>


      <!-- ========================================== -->
      <!-- CHARACTER 1: THE ANALYST (Left, sitting)   -->
      <!-- ========================================== -->
      <g transform="translate(200, 220)">
        
        <!-- Big Hovering Chart (Supporting Element) -->
        <g transform="translate(-80, -20)" class="anim-float-medium">
          <rect x="0" y="10" width="200" height="140" rx="20" fill="#1E1E2A" class="dark:fill-[#232332]" />
          <rect x="-5" y="0" width="200" height="140" rx="20" fill="#FDFBF7" stroke="#1E1E2A" stroke-width="3" class="dark:bg-[#1E1E2A] dark:stroke-[#E5E7EB]" />
          <!-- Chart Lines & Nodes -->
          <path d="M15 100 L60 60 L100 80 L160 40 L180 50" fill="none" stroke="#4D96FF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" class="anim-draw-chart" />
          <circle cx="60" cy="60" r="6" fill="#1E1E2A" class="dark:fill-[#FDFBF7]" />
          <circle cx="160" cy="40" r="6" fill="#1E1E2A" class="dark:fill-[#FDFBF7]" />
        </g>
        
        <!-- Human Character (Abstract proportions, soft edges) -->
        <!-- Desk/Table -->
        <rect x="120" y="160" width="120" height="80" rx="15" fill="#4D96FF" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
        <!-- Laptop -->
        <rect x="135" y="125" width="70" height="50" rx="8" fill="#FDFBF7" stroke="#1E1E2A" stroke-width="3" class="dark:bg-[#1E1E2A] dark:stroke-[#E5E7EB]" />
        
        <!-- Character sitting -->
        <g class="anim-breathe-slow">
          <!-- Legs -->
          <path d="M60 180 L60 250 M80 180 L80 260" stroke="#1E1E2A" stroke-width="16" stroke-linecap="round" class="dark:stroke-[#E5E7EB]" />
          <!-- Body (Hoodie) -->
          <rect x="20" y="60" width="80" height="120" rx="40" fill="#FF6B9D" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
          <!-- Head -->
          <g transform="translate(60, 20)" class="anim-head-bob">
            <!-- Neck -->
            <rect x="-10" y="30" width="20" height="20" fill="#FFD8B0" />
            <!-- Face -->
            <circle cx="0" cy="0" r="35" fill="#FFD8B0" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
            <!-- Hair -->
            <path d="M-35 0 C-40 -45 40 -45 35 0 C30 -20 -30 -20 -35 0" fill="#1E1E2A" class="dark:fill-[#232332]" />
            <!-- Glasses -->
            <rect x="-5" y="-5" width="40" height="16" rx="8" fill="none" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
            <!-- Smile -->
            <path d="M15 20 Q20 25 25 20" fill="none" stroke="#1E1E2A" stroke-width="3" stroke-linecap="round" class="dark:stroke-[#E5E7EB]" />
          </g>
          <!-- Arm typing -->
          <path d="M50 100 Q100 160 140 145" fill="none" stroke="#FF6B9D" stroke-width="18" stroke-linecap="round" class="anim-type-arm" />
        </g>
      </g>


      <!-- ========================================== -->
      <!-- CHARACTER 2: THE MOBILE TRACKER (Center Right) -->
      <!-- ========================================== -->
      <g transform="translate(630, 150)">
        
        <!-- Floating Elements around mobile user -->
        <g transform="translate(80, 20)" class="anim-float-fast">
          <circle cx="30" cy="30" r="25" fill="#FFD93D" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
          <path d="M30 15 v30 M20 25 h20" stroke="#1E1E2A" stroke-width="4" stroke-linecap="round" class="dark:stroke-[#E5E7EB]" />
        </g>
        
        <g class="anim-breathe-fast">
          <!-- Legs (Standing) -->
          <path d="M40 200 L40 320 M70 200 L70 320" stroke="#1E1E2A" stroke-width="18" stroke-linecap="round" class="dark:stroke-[#E5E7EB]" />
          <!-- Shoes -->
          <rect x="20" y="320" width="35" height="15" rx="7" fill="#4D96FF" />
          <rect x="50" y="320" width="35" height="15" rx="7" fill="#4D96FF" />
          
          <!-- Body (Jacket) -->
          <path d="M20 70 Q100 70 90 200 L20 200 Z" fill="#FF8C42" stroke="#1E1E2A" stroke-width="3" stroke-linejoin="round" class="dark:stroke-[#E5E7EB]" />
          
          <!-- Head looking at phone -->
          <g transform="translate(55, 30)" class="anim-head-bob">
            <!-- Hair back -->
            <circle cx="20" cy="-10" r="30" fill="#1E1E2A" class="dark:fill-[#FDFBF7]" />
            <!-- Face -->
            <circle cx="0" cy="0" r="32" fill="#FFB08A" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
            <!-- Eye looking down -->
            <path d="M-15 5 Q-10 10 -5 5" fill="none" stroke="#1E1E2A" stroke-width="3" stroke-linecap="round" class="dark:stroke-[#E5E7EB]" />
          </g>
          
          <!-- Arm holding phone -->
          <path d="M70 100 Q140 180 30 180" fill="none" stroke="#FF8C42" stroke-width="18" stroke-linecap="round" class="anim-phone-hold" />
          <!-- Phone -->
          <g transform="translate(10, 150) rotate(-20)" class="anim-phone-hold">
            <rect x="0" y="0" width="40" height="70" rx="8" fill="#1E1E2A" class="dark:fill-[#E5E7EB]" />
            <rect x="3" y="3" width="34" height="64" rx="5" fill="#4D96FF" />
            <!-- Mini Receipt flying out of phone -->
            <g class="anim-receipt-fly hover-jump">
              <path d="M-10 -30 h35 v40 L15 5 L5 10 L-5 5 L-10 10 Z" fill="#FDFBF7" stroke="#1E1E2A" stroke-width="2" stroke-linejoin="round" />
              <circle cx="7" cy="-10" r="6" fill="#FF6B9D" />
            </g>
          </g>
        </g>
      </g>


      <!-- ========================================== -->
      <!-- CHARACTER 3: THE SAVER (Foreground Bottom) -->
      <!-- ========================================== -->
      <g transform="translate(380, 480)">
        
        <!-- Giant Wallet & Savings Jar (Supporting Items) -->
        <g transform="translate(150, 20)">
          <!-- Jar Base -->
          <path d="M-40 0 L-30 80 H90 L100 0 Z" fill="#6BCB77" stroke="#1E1E2A" stroke-width="3" stroke-linejoin="round" class="dark:stroke-[#E5E7EB]" />
          <!-- Jar Lid -->
          <rect x="-50" y="-15" width="160" height="20" rx="10" fill="#FFD93D" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
          <!-- Plus Sign -->
          <path d="M30 30 v20 M20 40 h20" stroke="#FDFBF7" stroke-width="6" stroke-linecap="round" />
          <!-- Animated dropping coin -->
          <g class="anim-coin-drop">
            <circle cx="30" cy="-50" r="15" fill="#FFD93D" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
            <path d="M30 -58 v16" stroke="#1E1E2A" stroke-width="3" stroke-linecap="round" class="dark:stroke-[#E5E7EB]" />
          </g>
        </g>
        
        <!-- Human Reaching -->
        <g class="anim-breathe-slow">
          <!-- Torso leaning -->
          <path d="M20 20 Q80 10 90 80 L30 80 Q10 50 20 20 Z" fill="#4D96FF" stroke="#1E1E2A" stroke-width="3" stroke-linejoin="round" class="dark:stroke-[#E5E7EB]" transform="rotate(10 50 50)" />
          
          <!-- Head -->
          <g transform="translate(80, 0)" class="anim-head-bob">
            <circle cx="0" cy="0" r="30" fill="#FFD8B0" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
            <!-- Hat -->
            <path d="M-30 0 Q0 -30 30 0 Z" fill="#FF6B9D" stroke="#1E1E2A" stroke-width="3" stroke-linejoin="round" class="dark:stroke-[#E5E7EB]" />
            <path d="M10 -5 h30" stroke="#FF6B9D" stroke-width="5" stroke-linecap="round" />
            <!-- Eye -->
            <circle cx="15" cy="10" r="3" fill="#1E1E2A" class="dark:fill-[#E5E7EB]" />
          </g>
          
          <!-- Arm Reaching out -->
          <g class="anim-arm-reach hover-stretch">
            <path d="M50 40 Q120 40 150 -10" fill="none" stroke="#FFD8B0" stroke-width="16" stroke-linecap="round" />
            <circle cx="150" cy="-10" r="10" fill="#FFD8B0" />
            <circle cx="160" cy="-15" r="12" fill="#FFD93D" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
          </g>
        </g>
      </g>


      <!-- ========================================== -->
      <!-- FLOATING FINANCE ELEMENTS (Background)       -->
      <!-- ========================================== -->
      
      <!-- Big Floating Bank Card (Top Right) -->
      <g transform="translate(800, 80) rotate(15)" class="anim-float-slow hover-bounce">
        <rect x="0" y="10" width="160" height="100" rx="16" fill="#1E1E2A" opacity="0.1" />
        <rect x="-5" y="0" width="160" height="100" rx="16" fill="#B983FF" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
        <rect x="15" y="25" width="30" height="20" rx="4" fill="#FFD93D" stroke="#1E1E2A" stroke-width="2" class="dark:stroke-[#E5E7EB]" />
        <circle cx="130" cy="70" r="15" fill="#4D96FF" />
        <circle cx="110" cy="70" r="15" fill="#FFD93D" opacity="0.9" />
      </g>

      <!-- Floating Notification Bubbles -->
      <g transform="translate(80, 100)" class="anim-bounce-in-1">
        <rect x="0" y="5" width="120" height="40" rx="20" fill="#1E1E2A" opacity="0.1" />
        <rect x="-5" y="0" width="120" height="40" rx="20" fill="#6BCB77" stroke="#1E1E2A" stroke-width="3" class="dark:stroke-[#E5E7EB]" />
        <circle cx="15" cy="20" r="8" fill="#FDFBF7" />
        <path d="M12 20 h6 M15 17 v6" stroke="#1E1E2A" stroke-width="3" stroke-linecap="round" />
        <path d="M35 20 h50" stroke="#1E1E2A" stroke-width="4" stroke-linecap="round" />
      </g>
      
      <!-- Ambient Small Shapes -->
      <g stroke="#1E1E2A" stroke-width="4" stroke-linecap="round" class="dark:stroke-[#E5E7EB]">
        <path d="M500 150 v20 M490 160 h20" fill="none" class="anim-float-fast hover-spin" />
        <path d="M150 600 v15 M142 607 h15" fill="none" class="anim-float-medium" />
        <circle cx="850" cy="400" r="8" fill="#FF6B9D" stroke-width="3" class="anim-float-slow hover-jump" />
        <circle cx="350" cy="350" r="5" fill="#FFD93D" stroke-width="2" class="anim-float-fast" />
      </g>

    </svg>
  </div>
</template>

<script setup>
defineProps({
  isHovered: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
/* 
  SOFT NEO-BRUTALISM ANIMATION SYSTEM 
  Animations are more subtle, organic, and elegant.
*/

/* Floating */
.anim-float-slow { animation: float 6s ease-in-out infinite; }
.anim-float-medium { animation: float 4s ease-in-out infinite alternate-reverse; }
.anim-float-fast { animation: float 3s ease-in-out infinite alternate; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Ambient Pulse */
.anim-pulse-slow { animation: pulseAmbient 6s ease-in-out infinite alternate; }
.anim-pulse-slow-reverse { animation: pulseAmbient 6s ease-in-out infinite alternate-reverse; }
@keyframes pulseAmbient {
  from { transform: scale(0.95); opacity: 0.05; }
  to { transform: scale(1.05); opacity: 0.15; }
}

/* Character Breathing & Head Bobbing */
.anim-breathe-slow { animation: breathe 4s ease-in-out infinite; transform-origin: bottom; }
.anim-breathe-fast { animation: breathe 3s ease-in-out infinite reverse; transform-origin: bottom; }
@keyframes breathe {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.02); }
}

.anim-head-bob { animation: headBob 3s ease-in-out infinite; transform-origin: bottom; }
@keyframes headBob {
  0%, 100% { transform: rotate(0); }
  50% { transform: rotate(3deg) translateY(-2px); }
}

/* Micro Actions */
.anim-type-arm { animation: typing 0.4s ease-in-out infinite alternate; transform-origin: top; }
@keyframes typing {
  from { transform: rotate(0); }
  to { transform: rotate(4deg); }
}

.anim-phone-hold { animation: phoneBob 2s ease-in-out infinite alternate; }
@keyframes phoneBob {
  from { transform: translateY(0); }
  to { transform: translateY(4px); }
}

.anim-arm-reach { animation: armReach 2s ease-in-out infinite alternate; transform-origin: left; }
@keyframes armReach {
  from { transform: rotate(0); }
  to { transform: rotate(-3deg); }
}

.anim-coin-drop { animation: coinDrop 2.5s ease-in infinite; }
@keyframes coinDrop {
  0% { opacity: 0; transform: translateY(-40px); }
  20% { opacity: 1; transform: translateY(-20px); }
  70% { opacity: 1; transform: translateY(10px); }
  100% { opacity: 0; transform: translateY(20px); }
}

.anim-receipt-fly { animation: receiptFly 3s infinite; }
@keyframes receiptFly {
  0% { opacity: 0; transform: translateY(15px) rotate(-15deg) scale(0.8); }
  30% { opacity: 1; transform: translateY(-5px) rotate(-10deg) scale(1); }
  70% { opacity: 1; transform: translateY(-20px) rotate(-5deg) scale(1); }
  100% { opacity: 0; transform: translateY(-30px) rotate(0deg) scale(0.9); }
}

.anim-draw-chart {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: drawLine 2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s forwards;
}
@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}

.anim-bounce-in-1 {
  transform-origin: bottom left;
  animation: popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s backwards,
             float 5s ease-in-out 1.3s infinite;
}
@keyframes popIn {
  0% { opacity: 0; transform: scale(0) translateY(20px); }
  60% { transform: scale(1.05) translateY(-5px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

/* INTERACTIVE HOVER STATES */
.hover-active .hover-bounce {
  animation: bounceActive 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
}
.hover-active .hover-jump {
  animation: jump 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
}
.hover-active .hover-spin {
  animation: spinJump 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
}
.hover-active .hover-stretch {
  animation: stretchArm 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
}

@keyframes bounceActive {
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.05); }
  100% { transform: translateY(-5px) scale(1.02); }
}
@keyframes jump {
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
}
@keyframes spinJump {
  0% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-10px) rotate(45deg); }
  100% { transform: translateY(0) rotate(90deg); }
}
@keyframes stretchArm {
  0% { transform: rotate(0); }
  50% { transform: rotate(-5deg); }
  100% { transform: rotate(-2deg); }
}

/* ACCESSIBILITY: REDUCED MOTION */
@media (prefers-reduced-motion: reduce) {
  .anim-float-slow, .anim-float-medium, .anim-float-fast,
  .anim-pulse-slow, .anim-pulse-slow-reverse,
  .anim-breathe-slow, .anim-breathe-fast, .anim-head-bob,
  .anim-type-arm, .anim-phone-hold, .anim-arm-reach, .anim-coin-drop, .anim-receipt-fly,
  .hover-bounce, .hover-jump, .hover-spin, .hover-stretch {
    animation: none !important;
    transform: none !important;
  }
}
</style>
