<template>
  <Teleport to="body">
    <Transition name="backdrop-fade">
      <div v-if="open" class="fb-backdrop" @click.self="$emit('close')">

        <!-- Scene -->
        <div class="fb-scene">

          <!-- Label top -->
          <div class="fb-label">
            <span v-if="displayedSpread === 0">Cover</span>
            <span v-else>Page {{ (displayedSpread - 1) * 2 + 1 }}–{{ (displayedSpread - 1) * 2 + 2 }} of {{ spreads.length * 2 }}</span>
          </div>

          <!-- Close -->
          <button class="fb-close" @click="$emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <div class="fb-row">
            <!-- Prev -->
            <button class="fb-nav" @click="go(-1)" :disabled="flipping || displayedSpread === 0" :class="{ invisible: displayedSpread === 0 }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>

            <!-- ═══ BOOK ══════════════════════════════════════════════════ -->
            <div class="fb-book" :class="{ 'is-spread': displayedSpread > 0 || flipping }">

              <!-- ── COVER ─────────────────────────────────────────────── -->
              <div class="fb-cover" :class="{ 'cover-flipping-out': flipping && targetSpread > 0 && displayedSpread === 0, 'cover-hidden': displayedSpread > 0 && !flipping }">
                <img src="/images/cover-cityscape.jpg" class="cv-bg" alt="" />
                <div class="cv-overlay"/>
                <div class="cv-body">
                  <div class="cv-logo-box"><img src="/images/xonobics_logo.png" class="cv-logo" alt="Xonobics"/></div>
                  <div class="cv-badge">CORPORATE DIRECTORY 2025</div>
                  <h1 class="cv-title">EMPLOYEE<br/>DIRECTORY</h1>
                  <div class="cv-line"/>
                  <p class="cv-sub">Core Team · Leadership · Excellence</p>
                </div>
                <div class="cv-footer"><span>Xonobics</span><span>Call Center &amp; Consulting</span></div>
                <div class="cv-curl"/>
              </div>

              <!-- ── SPREAD CONTAINER ──────────────────────────────────── -->
              <div class="fb-spread-container" v-show="displayedSpread > 0 || flipping">

                <!-- Static left page (current or incoming) -->
                <div class="fb-page fb-page-left">
                  <div class="page-inner" v-html="leftContent"/>
                  <div class="pg-num pg-num-l">{{ leftNum }}</div>
                  <div class="pg-shadow-l"/>
                </div>

                <!-- Spine -->
                <div class="fb-spine"/>

                <!-- Static right page -->
                <div class="fb-page fb-page-right">
                  <div class="page-inner" v-html="rightContent"/>
                  <div class="pg-num pg-num-r">{{ rightNum }}</div>
                  <div class="pg-shadow-r"/>
                </div>

                <!-- ── FLIP LEAF (the page that animates) ────────────── -->
                <div
                  v-if="flipping"
                  class="fb-leaf"
                  :class="[flipDir === 'forward' ? 'leaf-forward' : 'leaf-backward']"
                >
                  <!-- Front of leaf = old page side -->
                  <div class="leaf-face leaf-front">
                    <div class="page-inner" v-html="leafFrontContent"/>
                  </div>
                  <!-- Back of leaf = new page side -->
                  <div class="leaf-face leaf-back">
                    <div class="page-inner" v-html="leafBackContent"/>
                  </div>
                </div>

              </div>
            </div>

            <!-- Next -->
            <button class="fb-nav" @click="go(1)" :disabled="flipping || displayedSpread >= totalSpreads" :class="{ invisible: displayedSpread >= totalSpreads }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Dots -->
          <div class="fb-dots">
            <button v-for="i in totalSpreads + 1" :key="i" class="fb-dot"
              :class="{ active: displayedSpread === i - 1 }"
              @click="goTo(i - 1)"/>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({ open: Boolean })
const emit  = defineEmits(['close'])

// ── State ─────────────────────────────────────────────────────────────────────
const displayedSpread = ref(0)   // what the reader sees (committed)
const targetSpread    = ref(0)   // where we're going
const flipping        = ref(false)
const flipDir         = ref('forward')  // 'forward' | 'backward'
const FLIP_MS = 600

// ── Employee data ─────────────────────────────────────────────────────────────
const employees = [
  { name: 'Mohd Naseer Uddin',       title: 'Manager',             dept: 'Operations',                    joined: '2015',             img: '/images/management/naseer.jpg'  },
  { name: 'Abdul Ateeq',             title: 'Billing Head',        dept: 'Finance',                       joined: '2016',             img: '/images/management/ateeq.jpg'   },
  { name: 'Mohd Kashif',             title: 'Business Manager',    dept: 'Sales & Business Development',  joined: '2017',             img: '/images/management/kashif.jpg'  },
  { name: 'Mohammed Ghouse',         title: 'Compliance Manager',  dept: 'Operations',                    joined: 'Oct 2020',         img: '/images/management/ghouse.jpg'  },
  { name: 'Jitendra Kamal Chowdary', title: 'Query Head',          dept: 'Operations',                    joined: 'February 7, 2022', img: '/images/management/jitendra.jpg'},
  { name: 'Mike Gill Christ',        title: 'Trainer',             dept: 'Human Resources',               joined: 'December 4, 2022', img: '/images/management/mike.jpg'    },
]

const deptColor = (d) => ({ 'Operations':'#1a73e8','Finance':'#0f9d58','Sales & Business Development':'#e37400','Human Resources':'#a142f4' })[d] || '#1a73e8'
const initials  = (n) => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

const empCard = (e) => `
<div class="emp-card">
  <div class="emp-photo-wrap" style="border-color:${deptColor(e.dept)}">
    <img src="${e.img}" class="emp-photo" alt="${e.name}"
         onerror="this.style.display='none';this.nextSibling.style.display='flex'"/>
    <div class="emp-initials" style="display:none;background:${deptColor(e.dept)}">${initials(e.name)}</div>
  </div>
  <div class="emp-info">
    <h3 class="emp-name">${e.name}</h3>
    <div class="emp-title" style="color:${deptColor(e.dept)}">${e.title}</div>
    <div class="emp-dept">${e.dept}</div>
    <div class="emp-joined"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Joined: ${e.joined}</div>
  </div>
</div>`

// ── All pages as flat array (index 0 = spread 0 left/right, etc.) ─────────────
const pages = computed(() => [
  // Spread 1 — Company Journey
  {
    left: `<div class="page-content company-page">
      <div class="section-badge" style="background:#1a73e8">THE JOURNEY OF XONOBICS</div>
      <div class="section-sub">The Beginning • 2012</div>
      <div class="section-icon">📅</div>
      <h2 class="section-title">The Genesis of a Relentless Journey</h2>
      <div class="story-block">
        <p>The company's journey began with its first official conversation with a Chartered Accountant on January 12, 2012. Formally registered with the Indian Government on February 21, 2012. Two employees were hired in the first week of March 2012, and operations officially commenced on <strong>March 11, 2012</strong>, under the name <strong>ETP</strong>.</p>
        <p style="margin-top:10px">Three members — two employees and one director — operated from a small shutter shop with minimal facilities but immense determination.</p>
      </div>
      <div class="stat-row">
        <div class="stat-item"><div class="stat-icon">👥</div><div class="stat-val">3 Members</div><div class="stat-lbl">Founding Team</div></div>
        <div class="stat-item"><div class="stat-icon">🏢</div><div class="stat-val">ETP Origins</div><div class="stat-lbl">Company Name</div></div>
        <div class="stat-item"><div class="stat-icon">📅</div><div class="stat-val">Mar 11, 2012</div><div class="stat-lbl">Operations Start</div></div>
      </div>
      <div class="page-footer-text">Determination • Vision • Growth</div>
    </div>`,
    right: `<div class="page-content company-page">
      <div class="section-badge" style="background:#1a73e8">OUR FOUNDATION</div>
      <div class="section-sub">From Vision to Reality • 2012–2025</div>
      <div class="section-icon">🏛️</div>
      <div class="story-block">
        <p>Founded over 13 years ago, XONOBICS began with a simple vision — to redefine excellence through innovation, integrity, and unwavering commitment to quality. What started with one passionate professional has evolved into a thriving organization of over <strong>125 talented individuals</strong>, united by one purpose: delivering excellence through technology and teamwork.</p>
      </div>
      <div class="milestone-list">
        <h4 class="milestone-title">Key Milestones</h4>
        <div class="milestone-item"><span class="m-icon">👥</span><div><strong>From 1 to 125+</strong><br/><span class="m-sub">Growing team of professionals</span></div></div>
        <div class="milestone-item"><span class="m-icon">🏆</span><div><strong>13+ Years of Excellence</strong><br/><span class="m-sub">Consistent quality and innovation</span></div></div>
        <div class="milestone-item"><span class="m-icon">🌐</span><div><strong>Global Impact</strong><br/><span class="m-sub">Expanding reach and influence</span></div></div>
      </div>
      <div class="values-row"><span>Innovation</span><span>Integrity</span><span>Excellence</span></div>
    </div>`,
  },
  // Spread 2 — Employees 1-4
  {
    left: `<div class="page-content emp-page">
      <div class="emp-page-hdr"><div class="emp-page-badge" style="background:#1a73e8">CORE TEAM</div><div class="emp-page-sub">Page 1 of 3</div></div>
      ${empCard(employees[0])}${empCard(employees[1])}
    </div>`,
    right: `<div class="page-content emp-page">
      <div class="emp-page-hdr"><div class="emp-page-badge" style="background:#1a73e8">CORE TEAM</div><div class="emp-page-sub">Page 2 of 3</div></div>
      ${empCard(employees[2])}${empCard(employees[3])}
    </div>`,
  },
  // Spread 3 — Employees 5-6 + Back
  {
    left: `<div class="page-content emp-page">
      <div class="emp-page-hdr"><div class="emp-page-badge" style="background:#1a73e8">CORE TEAM</div><div class="emp-page-sub">Page 3 of 3</div></div>
      ${empCard(employees[4])}${empCard(employees[5])}
    </div>`,
    right: `<div class="page-content back-page">
      <div class="back-logo-wrap"><img src="/images/xonobics_logo.png" class="back-logo" alt="Xonobics"/></div>
      <div class="back-title">XONOBICS</div>
      <div class="back-tagline">Call Center &amp; Consulting</div>
      <div class="back-line"/>
      <div class="back-quote">"Excellence is not a destination;<br/>it is a continuous journey."</div>
      <div class="back-foot"><div class="back-year">Est. 2012 · Hyderabad, India</div><div class="back-copy">© 2025 Xonobics. All rights reserved.</div></div>
    </div>`,
  },
])

const totalSpreads = computed(() => pages.value.length)

// ── What's shown statically while NOT flipping ────────────────────────────────
const leftContent  = computed(() => {
  const sp = displayedSpread.value
  return sp > 0 ? pages.value[sp - 1].left : ''
})
const rightContent = computed(() => {
  const sp = displayedSpread.value
  return sp > 0 ? pages.value[sp - 1].right : ''
})
const leftNum  = computed(() => displayedSpread.value > 0 ? (displayedSpread.value - 1) * 2 + 1 : '')
const rightNum = computed(() => displayedSpread.value > 0 ? (displayedSpread.value - 1) * 2 + 2 : '')

// ── What the leaf shows during flip ─────────────────────────────────────────
// Forward flip: leaf starts on right, reveals left of next spread
// - front  = right page of OLD spread (what was showing)
// - back   = left page of NEW spread  (what's coming in)
// Backward flip: leaf starts on left, reveals right of prev spread
// - front  = left page of OLD spread
// - back   = right page of NEW spread
const leafFrontContent = computed(() => {
  if (!flipping.value) return ''
  const from = displayedSpread.value
  const to   = targetSpread.value
  if (flipDir.value === 'forward') {
    // front = right of old spread (or empty if from cover)
    return from > 0 ? pages.value[from - 1].right : ''
  } else {
    // front = left of old spread
    return from > 0 ? pages.value[from - 1].left : ''
  }
})
const leafBackContent = computed(() => {
  if (!flipping.value) return ''
  const to = targetSpread.value
  if (flipDir.value === 'forward') {
    // back = left of new spread
    return to > 0 ? pages.value[to - 1].left : ''
  } else {
    // back = right of new spread (or empty if going to cover)
    return to > 0 ? pages.value[to - 1].right : ''
  }
})

// ── Navigate ──────────────────────────────────────────────────────────────────
const go = (delta) => {
  const next = displayedSpread.value + delta
  if (flipping.value || next < 0 || next > totalSpreads.value) return
  goTo(next)
}

const goTo = (target) => {
  if (flipping.value || target === displayedSpread.value) return
  flipDir.value = target > displayedSpread.value ? 'forward' : 'backward'

  // For forward: show the new spread's left/right immediately (behind the leaf)
  // For backward: keep old spread showing until leaf lands
  targetSpread.value = target
  flipping.value = true

  // Half-way through the flip, switch the static pages
  setTimeout(() => {
    displayedSpread.value = target
  }, FLIP_MS / 2)

  setTimeout(() => {
    flipping.value = false
  }, FLIP_MS)
}

// Keyboard
const onKey = (e) => {
  if (!props.open) return
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1)
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   go(-1)
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
watch(() => props.open, (v) => { if (v) { displayedSpread.value = 0; targetSpread.value = 0; flipping.value = false } })
</script>

<style scoped>
/* ── Backdrop ─────────────────────────────────────────────────────────────── */
.fb-backdrop {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,0.90);
  backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.backdrop-fade-enter-active { transition: opacity .3s ease; }
.backdrop-fade-leave-active { transition: opacity .25s ease; }
.backdrop-fade-enter-from, .backdrop-fade-leave-to { opacity: 0; }

/* ── Scene ────────────────────────────────────────────────────────────────── */
.fb-scene {
  position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 20px;
  width: 100%; max-width: 1100px;
}
.fb-label {
  font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 1.2px;
}
.fb-row {
  display: flex; align-items: center; gap: 20px;
}

/* ── Close ────────────────────────────────────────────────────────────────── */
.fb-close {
  position: absolute; top: 0; right: 0;
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .2s;
}
.fb-close:hover { background: rgba(220,50,50,.5); }
.fb-close svg   { width: 15px; height: 15px; }

/* ── Nav buttons ──────────────────────────────────────────────────────────── */
.fb-nav {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .2s;
}
.fb-nav:hover:not(:disabled) { background: rgba(255,255,255,0.2); transform: scale(1.08); }
.fb-nav:disabled              { opacity: .35; cursor: default; }
.fb-nav.invisible             { visibility: hidden; }
.fb-nav svg { width: 20px; height: 20px; }

/* ── Dots ─────────────────────────────────────────────────────────────────── */
.fb-dots { display: flex; gap: 8px; }
.fb-dot  {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255,255,255,0.22); border: none; cursor: pointer;
  transition: all .2s; padding: 0;
}
.fb-dot.active { background: #64b5f6; transform: scale(1.35); }

/* ── Book wrapper ─────────────────────────────────────────────────────────── */
.fb-book {
  position: relative;
  width: 420px; height: 580px;
  filter: drop-shadow(0 30px 60px rgba(0,0,0,.7));
  transition: width .4s ease;
}
.fb-book.is-spread {
  width: 852px; /* 420 + 12 spine + 420 */
}

/* ── Cover ────────────────────────────────────────────────────────────────── */
.fb-cover {
  position: absolute; inset: 0;
  border-radius: 4px 14px 14px 4px;
  overflow: hidden;
  transform-origin: left center;
  transition: none;
  z-index: 3;
  box-shadow: -4px 0 14px rgba(0,0,0,.4), 6px 6px 24px rgba(0,0,0,.5);
}
/* Cover flipping out to the left */
.fb-cover.cover-flipping-out {
  animation: coverFlipOut .6s cubic-bezier(.4,0,.2,1) forwards;
}
.fb-cover.cover-hidden {
  display: none;
}
@keyframes coverFlipOut {
  0%   { transform: perspective(1200px) rotateY(0deg); }
  100% { transform: perspective(1200px) rotateY(-180deg); }
}

.cv-bg      { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.cv-overlay { position: absolute; inset: 0; background: linear-gradient(160deg, rgba(15,35,60,.52) 0%, rgba(10,25,55,.84) 100%); }
.cv-body    { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 28px; gap: 14px; }
.cv-logo-box{ background: rgba(255,255,255,.95); border-radius: 14px; padding: 14px 24px; box-shadow: 0 4px 24px rgba(0,0,0,.3); }
.cv-logo    { height: 42px; object-fit: contain; }
.cv-badge   { background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.35); border-radius: 20px; padding: 5px 16px; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #fff; text-transform: uppercase; }
.cv-title   { font-size: 40px; font-weight: 900; letter-spacing: 3px; color: #fff; text-align: center; line-height: 1.1; text-shadow: 0 2px 20px rgba(0,0,0,.5); }
.cv-line    { width: 60px; height: 2px; background: linear-gradient(90deg, transparent, #64b5f6, transparent); }
.cv-sub     { font-size: 11px; color: rgba(255,255,255,.65); letter-spacing: 1.5px; text-align: center; }
.cv-footer  { position: absolute; bottom: 18px; left: 22px; right: 22px; display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,.45); }
.cv-curl    { position: absolute; bottom: 0; right: 0; width: 38px; height: 38px; background: linear-gradient(225deg,rgba(255,255,255,.1) 0%,transparent 60%); border-top-left-radius: 100%; }

/* ── Spread container ─────────────────────────────────────────────────────── */
.fb-spread-container {
  position: absolute; inset: 0;
  display: flex;
  perspective: 2000px;
}

/* ── Static pages ─────────────────────────────────────────────────────────── */
.fb-page {
  width: 420px; height: 580px;
  background: #fff; overflow: hidden; position: relative; flex-shrink: 0;
}
.fb-page-left  { border-radius: 4px 0 0 4px; }
.fb-page-right { border-radius: 0 4px 4px 0; }
.fb-spine {
  width: 12px; flex-shrink: 0;
  background: linear-gradient(to right, #bcc3ce, #e4e8ed, #bcc3ce);
  box-shadow: inset 0 0 6px rgba(0,0,0,.12);
}
.pg-num { position: absolute; bottom: 13px; font-size: 11px; color: #bbb; font-style: italic; }
.pg-num-l { left: 26px; }
.pg-num-r { right: 26px; }
.pg-shadow-l {
  position: absolute; inset: 0; right: auto; width: 28px;
  background: linear-gradient(to right, rgba(0,0,0,.07), transparent); pointer-events: none;
}
.pg-shadow-r {
  position: absolute; inset: 0; left: auto; width: 28px;
  background: linear-gradient(to left, rgba(0,0,0,.07), transparent); pointer-events: none;
}

/* ── Flip Leaf ────────────────────────────────────────────────────────────── */
.fb-leaf {
  position: absolute;
  width: 420px; height: 580px;
  top: 0;
  transform-style: preserve-3d;
  will-change: transform;
  z-index: 10;
  border-radius: 0;
}

/* Forward flip: leaf is the RIGHT page flipping to become the new left */
.fb-leaf.leaf-forward {
  left: 432px; /* 420 + 12 spine */
  transform-origin: left center;
  animation: leafFlipForward 600ms cubic-bezier(.4,0,.2,1) forwards;
}

/* Backward flip: leaf is the LEFT page flipping back to become the new right */
.fb-leaf.leaf-backward {
  left: 0;
  transform-origin: right center;
  animation: leafFlipBackward 600ms cubic-bezier(.4,0,.2,1) forwards;
}

@keyframes leafFlipForward {
  0%   { transform: rotateY(0deg);    box-shadow:  4px 0 18px rgba(0,0,0,.25); }
  50%  { transform: rotateY(-90deg);  box-shadow: 10px 0 28px rgba(0,0,0,.35); }
  100% { transform: rotateY(-180deg); box-shadow:  0   0 0   rgba(0,0,0,0); }
}
@keyframes leafFlipBackward {
  0%   { transform: rotateY(0deg);    box-shadow: -4px 0 18px rgba(0,0,0,.25); }
  50%  { transform: rotateY(90deg);   box-shadow:-10px 0 28px rgba(0,0,0,.35); }
  100% { transform: rotateY(180deg);  box-shadow:  0   0 0   rgba(0,0,0,0); }
}

/* Faces of the leaf */
.leaf-face {
  position: absolute; inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden; background: #fff;
}
.leaf-front { transform: rotateY(0deg);    border-radius: 0; }
.leaf-back  { transform: rotateY(180deg);  border-radius: 0; }

/* Page inner padding */
.page-inner { padding: 26px 26px 34px; height: 100%; box-sizing: border-box; overflow: hidden; }
</style>

<!-- ── Global page content styles (v-html bypasses scoped) ───────────────── -->
<style>
/* ── Company pages ──────────────────────────────────────────────────────────── */
.page-content { height: 100%; display: flex; flex-direction: column; gap: 11px; font-family: inherit; }

.section-badge { display: inline-block; color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 1.8px; padding: 5px 14px; border-radius: 4px; text-transform: uppercase; width: fit-content; }
.section-sub   { font-size: 11px; color: #888; }
.section-icon  { font-size: 20px; }
.section-title { font-size: 16px; font-weight: 700; color: #1a2742; line-height: 1.3; margin: 0; }

.story-block   { background: #f0f4f8; border-left: 3px solid #1a73e8; border-radius: 6px; padding: 13px 15px; font-size: 11.5px; color: #444; line-height: 1.65; text-align: left; flex: 1; }
.story-block p { margin: 0; }

.stat-row  { display: flex; gap: 6px; }
.stat-item { flex: 1; text-align: center; background: #f7fafc; border-radius: 8px; padding: 9px 4px; }
.stat-icon { font-size: 15px; }
.stat-val  { font-size: 10.5px; font-weight: 700; color: #1a2742; margin-top: 3px; }
.stat-lbl  { font-size: 9px; color: #888; margin-top: 1px; }

.milestone-list  { display: flex; flex-direction: column; gap: 7px; flex: 1; }
.milestone-title { font-size: 12.5px; font-weight: 700; color: #1a2742; margin: 0 0 3px; }
.milestone-item  { display: flex; gap: 9px; align-items: flex-start; background: #f7fafc; border-radius: 8px; padding: 9px 11px; font-size: 11.5px; color: #444; }
.m-icon { font-size: 17px; flex-shrink: 0; }
.m-sub  { color: #888; font-size: 10.5px; }

.values-row      { display: flex; justify-content: space-between; font-size: 10.5px; color: #1a73e8; font-weight: 600; letter-spacing: .5px; padding-top: 3px; }
.page-footer-text{ font-size: 9.5px; color: #c0c0c0; text-align: center; letter-spacing: 1.5px; }

/* ── Employee pages ─────────────────────────────────────────────────────────── */
.emp-page-hdr   { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.emp-page-badge { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #fff; padding: 4px 11px; border-radius: 4px; text-transform: uppercase; }
.emp-page-sub   { font-size: 10px; color: #aaa; }

.emp-card { display: flex; align-items: center; gap: 13px; background: #f0f5ff; border: 1px solid #dde6f5; border-radius: 12px; padding: 13px; margin-bottom: 10px; }
.emp-photo-wrap { flex-shrink: 0; width: 70px; height: 70px; border-radius: 50%; border: 3px solid; overflow: hidden; box-shadow: 0 3px 12px rgba(26,115,232,.2); }
.emp-photo   { width: 100%; height: 100%; object-fit: cover; display: block; }
.emp-initials{ width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #fff; }
.emp-info    { flex: 1; min-width: 0; }
.emp-name    { font-size: 13.5px; font-weight: 700; color: #1a2742; margin: 0 0 2px; }
.emp-title   { font-size: 11.5px; font-weight: 600; margin-bottom: 2px; }
.emp-dept    { font-size: 11px; color: #666; margin-bottom: 3px; }
.emp-joined  { font-size: 10px; color: #888; display: flex; align-items: center; gap: 4px; }

/* ── Back page ──────────────────────────────────────────────────────────────── */
.back-page { background: linear-gradient(155deg,#0d1f3c 0%,#1a3a6c 50%,#0d1f3c 100%) !important; align-items: center; justify-content: center; text-align: center; }
.back-logo-wrap { background: rgba(255,255,255,.95); border-radius: 14px; padding: 13px 22px; box-shadow: 0 4px 18px rgba(0,0,0,.3); margin-bottom: 14px; }
.back-logo   { height: 38px; object-fit: contain; }
.back-title  { font-size: 26px; font-weight: 900; color: #fff; letter-spacing: 4px; }
.back-tagline{ font-size: 11px; color: rgba(255,255,255,.5); letter-spacing: 2px; margin-top: 4px; text-transform: uppercase; }
.back-line   { width: 48px; height: 2px; background: linear-gradient(90deg,transparent,#64b5f6,transparent); margin: 14px auto; }
.back-quote  { font-size: 12.5px; color: rgba(255,255,255,.68); font-style: italic; line-height: 1.7; padding: 0 18px; }
.back-foot   { margin-top: 22px; }
.back-year   { font-size: 11px; color: rgba(255,255,255,.4); margin-bottom: 3px; }
.back-copy   { font-size: 9.5px; color: rgba(255,255,255,.28); }
</style>
