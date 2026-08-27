<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// ── Confetti ──────────────────────────────────────────────────────────────────
const canvas = ref(null);
let animId   = null;
let pieces   = [];

// Raksha Bandhan colors: Red, orange, gold, pink
const COLORS = ['#DC2626', '#F97316', '#FCD34D', '#EC4899', '#FB923C', '#FDE047'];

function initPieces(count = 80) {
  const w = canvas.value.width;
  const h = canvas.value.height;
  pieces = Array.from({ length: count }, () => ({
    x:    Math.random() * w,
    y:    Math.random() * h,
    vx:   (Math.random() - 0.5) * 1.2,
    vy:   0.8 + Math.random() * 1.8,
    rot:  Math.random() * 360,
    rotV: (Math.random() - 0.5) * 3.5,
    w:    8 + Math.random() * 16,
    h:    4 + Math.random() * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
}

function resizeCanvas() {
  if (!canvas.value) return;
  const parent = canvas.value.parentElement;
  canvas.value.width  = parent.offsetWidth;
  canvas.value.height = parent.offsetHeight;
}

function loop() {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  const W   = canvas.value.width;
  const H   = canvas.value.height;
  ctx.clearRect(0, 0, W, H);

  for (const p of pieces) {
    p.x   += p.vx;
    p.y   += p.vy;
    p.rot += p.rotV;

    // wrap horizontally
    if (p.x > W + 20)  p.x = -20;
    if (p.x < -20)     p.x = W + 20;

    // recycle from top when falls off bottom
    if (p.y > H + 20) {
      p.x   = Math.random() * W;
      p.y   = -20;
      p.vx  = (Math.random() - 0.5) * 1.2;
      p.vy  = 0.8 + Math.random() * 1.8;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot * Math.PI / 180);
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }
  animId = requestAnimationFrame(loop);
}

onMounted(() => {
  resizeCanvas();
  initPieces(80);
  loop();
  window.addEventListener('resize', () => { resizeCanvas(); });
});

onUnmounted(() => {
  cancelAnimationFrame(animId);
  window.removeEventListener('resize', resizeCanvas);
});

// ── Marquee ────────────────────────────────────────────────────────────────────
const marqueeInner = ref(null);
const marqueeOffset = ref(0);
let   marqueeId     = null;
const SPEED = 0.6;

function tickMarquee() {
  if (!marqueeInner.value) { marqueeId = requestAnimationFrame(tickMarquee); return; }
  const half = marqueeInner.value.scrollWidth / 2;
  marqueeOffset.value -= SPEED;
  if (marqueeOffset.value <= -half) marqueeOffset.value = 0;
  marqueeInner.value.style.transform = `translateX(${marqueeOffset.value}px)`;
  marqueeId = requestAnimationFrame(tickMarquee);
}

onMounted(() => { tickMarquee(); });
onUnmounted(() => { cancelAnimationFrame(marqueeId); });
</script>

<template>
  <!-- Banner wrapper -->
  <div class="relative w-full rounded-2xl overflow-hidden select-none"
       style="background:linear-gradient(160deg,#DC2626 0%,#F97316 20%,#FEF3C7 40%,#FFFBEB 50%,#FEE2E2 60%,#FB923C 80%,#DC2626 100%);min-height:260px;">

    <!-- Confetti canvas -->
    <canvas ref="canvas"
      class="absolute inset-0 w-full h-full pointer-events-none"
      style="z-index:1;">
    </canvas>

    <!-- Content layer -->
    <div class="relative flex flex-col items-center justify-between py-5 px-4" style="z-index:2;min-height:260px;">

      <!-- Decorative Rakhi SVGs in foreground -->
      <img src="/rakhi.svg" 
           alt="Rakhi"
           class="absolute pointer-events-none"
           style="width:180px;height:180px;top:10px;left:30px;transform:rotate(-15deg);filter:drop-shadow(0 4px 12px rgba(0,0,0,0.25));opacity:0.6;z-index:10;" />
      
      <img src="/rakhi.svg" 
           alt="Rakhi"
           class="absolute pointer-events-none"
           style="width:200px;height:200px;top:20px;right:20px;transform:rotate(25deg);filter:drop-shadow(0 4px 12px rgba(0,0,0,0.25));opacity:0.6;z-index:10;" />
      
      <img src="/rakhi.svg" 
           alt="Rakhi"
           class="absolute pointer-events-none"
           style="width:150px;height:150px;bottom:60px;left:50px;transform:rotate(45deg);filter:drop-shadow(0 4px 12px rgba(0,0,0,0.25));opacity:0.5;z-index:10;" />
      
      <img src="/rakhi.svg" 
           alt="Rakhi"
           class="absolute pointer-events-none"
           style="width:160px;height:160px;bottom:70px;right:60px;transform:rotate(-35deg);filter:drop-shadow(0 4px 12px rgba(0,0,0,0.25));opacity:0.5;z-index:10;" />

      <!-- Center Rakhi SVG -->
      <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center">
        <img src="/rakhi2.svg" 
             alt="Happy Raksha Bandhan" 
             class="w-auto h-48 md:h-56 lg:h-64 drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
             style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)) drop-shadow(0 2px 6px rgba(220,38,38,0.4));" />
        
        <!-- Date -->
        <div class="text-white text-2xl font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] mt-2">
          <span class="opacity-95" style="text-shadow: 0 2px 6px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4);">August 28, 2026</span>
        </div>
      </div>

      <!-- Marquee strip -->
      <div class="w-full overflow-hidden mt-3"
           style="background:linear-gradient(90deg,rgba(220,38,38,0.90),rgba(249,115,22,0.90),rgba(220,38,38,0.90));
                  border-radius:999px;padding:5px 0;">
        <div ref="marqueeInner"
             class="flex items-center whitespace-nowrap will-change-transform"
             style="display:inline-flex;gap:0;">
          <!-- copy 1 -->
          <span class="flex items-center gap-4 px-6 text-white font-bold text-sm tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
            <span>Happy Raksha Bandhan 2026!</span>
            <span class="opacity-60">•</span>
            <span>शुभ रक्षा बंधन</span>
            <span class="opacity-60">•</span>
            <span>The Bond of Love & Protection</span>
            <span class="opacity-60">•</span>
            <span>भाई-बहन का प्यार</span>
            <span class="opacity-60">•</span>
            <span>August 28, 2026</span>
            <span class="opacity-60">•</span>
            <span>Celebrating Sibling Love</span>
          </span>
          <!-- copy 2 -->
          <span class="flex items-center gap-4 px-6 text-white font-bold text-sm tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
            <span>Happy Raksha Bandhan 2026!</span>
            <span class="opacity-60">•</span>
            <span>शुभ रक्षा बंधन</span>
            <span class="opacity-60">•</span>
            <span>The Bond of Love & Protection</span>
            <span class="opacity-60">•</span>
            <span>भाई-बहन का प्यार</span>
            <span class="opacity-60">•</span>
            <span>August 28, 2026</span>
            <span class="opacity-60">•</span>
            <span>Celebrating Sibling Love</span>
          </span>
        </div>
      </div>

    </div>
  </div>
</template>
