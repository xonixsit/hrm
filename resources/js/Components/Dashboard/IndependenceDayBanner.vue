<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// ── Confetti ──────────────────────────────────────────────────────────────────
const canvas = ref(null);
let animId   = null;
let pieces   = [];

const COLORS = ['#FF9933', '#FF9933', '#138808', '#138808', '#ffffff', '#000080'];

function initPieces(count = 80) {
  const w = canvas.value.width;
  const h = canvas.value.height;
  pieces = Array.from({ length: count }, () => ({
    x:    Math.random() * w,
    y:    Math.random() * h,          // scatter across full height initially
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

// ── Marquee: measure the single copy width then animate exactly that ──────────
const marqueeInner = ref(null);
const marqueeOffset = ref(0);
let   marqueeId     = null;
const SPEED = 0.6; // px per frame — smooth and steady

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
       style="background:linear-gradient(160deg,#FF9933 0%,#FF9933 28%,#fff8f0 40%,#ffffff 50%,#f0fff4 60%,#138808 72%,#138808 100%);min-height:260px;">

    <!-- Confetti canvas -->
    <canvas ref="canvas"
      class="absolute inset-0 w-full h-full pointer-events-none"
      style="z-index:1;">
    </canvas>

    <!-- Content layer -->
    <div class="relative flex flex-col items-center justify-between py-5 px-4" style="z-index:2;min-height:260px;">

      <!-- SVG — large, centred, takes most of the banner height -->
      <img src="/images/hid.svg"
           alt="Happy Independence Day"
           style="width:100%;max-height:210px;object-fit:contain;flex:1;
                  filter:drop-shadow(0 4px 18px rgba(0,0,0,0.20));" />

      <!-- Marquee strip — pinned to the bottom edge -->
      <div class="w-full overflow-hidden mt-3"
           style="background:linear-gradient(90deg,rgba(255,153,51,0.85),rgba(19,136,8,0.85));
                  border-radius:999px;padding:5px 0;">
        <!-- inner holds TWO identical copies side-by-side for seamless loop -->
        <div ref="marqueeInner"
             class="flex items-center whitespace-nowrap will-change-transform"
             style="display:inline-flex;gap:0;">
          <!-- copy 1 -->
          <span class="flex items-center gap-4 px-6 text-white font-bold text-sm tracking-wide">
            <span>🇮🇳</span>
            <span>Happy 80th Independence Day!</span>
            <span class="opacity-60">•</span>
            <span>जय हिन्द!</span>
            <span class="opacity-60">•</span>
            <span>Jai Hind!</span>
            <span class="opacity-60">•</span>
            <span>वन्दे मातरम्</span>
            <span class="opacity-60">•</span>
            <span>Vande Mataram</span>
            <span class="opacity-60">•</span>
            <span>15 August 2026</span>
            <span class="opacity-60">•</span>
            <span>Proud to be Indian</span>
            <span>🇮🇳</span>
          </span>
          <!-- copy 2 — identical, creates the seamless loop -->
          <span class="flex items-center gap-4 px-6 text-white font-bold text-sm tracking-wide">
            <span>🇮🇳</span>
            <span>Happy 80th Independence Day!</span>
            <span class="opacity-60">•</span>
            <span>जय हिन्द!</span>
            <span class="opacity-60">•</span>
            <span>Jai Hind!</span>
            <span class="opacity-60">•</span>
            <span>वन्दे मातरम्</span>
            <span class="opacity-60">•</span>
            <span>Vande Mataram</span>
            <span class="opacity-60">•</span>
            <span>15 August 2024</span>
            <span class="opacity-60">•</span>
            <span>Proud to be Indian</span>
            <span>🇮🇳</span>
          </span>
        </div>
      </div>

    </div>
  </div>
</template>