<template>
  <!-- No AuthenticatedLayout — this IS the full page, styled to fill 100vh -->
  <div class="dir-root" ref="rootEl">

    <div class="dir-bg">
      <div class="orb orb-a"/><div class="orb orb-b"/>
    </div>

    <!-- Header strip -->
    <header class="dir-header" ref="headerEl">
      <Link :href="route('employee-handbook')" class="dir-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m7-7-7 7 7 7"/></svg>
        Back
      </Link>
      <span class="dir-chip">📖 Employee Directory 2025</span>
      <div class="dir-hdr-r">
        <span class="dir-pg-lbl">{{ pageLabel }}</span>
        <button class="dir-fsbtn" @click="toggleFs" :title="isFs?'Exit fullscreen':'Fullscreen'">
          <svg v-if="!isFs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/></svg>
          <svg v-else       viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"/></svg>
        </button>
      </div>
    </header>

    <!-- Book row -->
    <div class="dir-book-row" ref="bookRowEl">
      <button class="dir-nav" :class="{invisible:atStart}" @click="prevPage">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
      </button>

      <!--
        StPageFlip OWNS everything inside this div.
        Vue sets innerHTML once in onMounted and never touches it again.
        No overflow, no filter, no transform on this element or any parent.
      -->
      <div class="dir-book-host" ref="bookHostEl"></div>

      <button class="dir-nav" :class="{invisible:atEnd}" @click="nextPage">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>

    <!-- Dots & hint -->
    <div class="dir-bottom" ref="bottomEl">
      <div class="dir-dots">
        <button v-for="i in 4" :key="i" class="dot" :class="{'dot--on': dotActive===i-1}" @click="goToDot(i-1)"/>
      </div>
      <div class="dir-hint">Drag corners to flip · ← → keys · Swipe</div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Link, router } from '@inertiajs/vue3'
import { PageFlip } from 'page-flip/dist/js/page-flip.module.js'

const rootEl    = ref(null)
const headerEl  = ref(null)
const bookRowEl = ref(null)
const bookHostEl= ref(null)
const bottomEl  = ref(null)

const currentPage = ref(0)
const totalPages  = ref(8)
const isFs        = ref(false)
let   pf          = null

// ── Data ───────────────────────────────────────────────────────────────────
const emps = [
  { name:'Mohd Naseer Uddin',       title:'Manager',            dept:'Operations',                   joined:'2015',             img:'/images/management/naseer.jpg'   },
  { name:'Abdul Ateeq',             title:'Billing Head',       dept:'Finance',                      joined:'2016',             img:'/images/management/ateeq.jpg'    },
  { name:'Mohd Kashif',             title:'Business Manager',   dept:'Sales & Business Development', joined:'2017',             img:'/images/management/kashif.jpg'   },
  { name:'Mohammed Ghouse',         title:'Compliance Manager', dept:'Operations',                   joined:'Oct 2020',         img:'/images/management/ghouse.jpg'   },
  { name:'Jitendra Kamal Chowdary', title:'Query Head',         dept:'Operations',                   joined:'February 7, 2022', img:'/images/management/jitendra.jpg' },
  { name:'Mike Gill Christ',        title:'Trainer',            dept:'Human Resources',              joined:'December 4, 2022', img:'/images/management/mike.jpg'     },
  { name:'Gogunta Mani',            title:'Sr. Tax Analyst',    dept:'Finance',                      joined:'Feb 2023',         img:'/images/mani.jpg'                },
  { name:'Vishal Manohar',          title:'Billing Team Leader',dept:'Operations',                   joined:'2023',             img:'/images/vishal.jpg'              },
]

const dc  = d => ({'Operations':'#1a73e8','Finance':'#0f9d58','Sales & Business Development':'#e37400','Human Resources':'#a142f4'})[d]||'#1a73e8'
const ini = n => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
const card= e => `<div class="emp-card"><div class="emp-ring" style="border-color:${dc(e.dept)}"><img src="${e.img}" class="emp-photo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><div class="emp-ini" style="display:none;background:${dc(e.dept)}">${ini(e.name)}</div></div><div class="emp-info"><div class="emp-name">${e.name}</div><div class="emp-role" style="color:${dc(e.dept)}">${e.title}</div><div class="emp-dept">${e.dept}</div><div class="emp-joined">📅 Joined: ${e.joined}</div></div></div>`

const bookHTML = () => `<div id="pf-book">
<div class="my-page" data-density="hard"><div class="page-content cover-page"><img src="/images/cover-cityscape.jpg" class="cover-bg-img" alt=""/><div class="cover-overlay"></div><div class="cover-body"><div class="cover-logo-card"><img src="/images/xonobics_logo.png" class="cover-logo" alt="Xonobics"/></div><div class="cover-eyebrow">CORPORATE DIRECTORY 2025</div><h1 class="cover-heading">EMPLOYEE<br/>DIRECTORY</h1><div class="cover-rule"></div><p class="cover-sub">Core Team · Leadership · Excellence</p><div class="cover-hint">▶ Drag corner or use arrows</div></div><div class="cover-footer"><span>Xonobics</span><span>Call Center &amp; Consulting</span></div></div></div>
<div class="my-page"><div class="page-content inner-page"><div class="section-badge" style="background:#1a73e8">THE JOURNEY OF XONOBICS</div><div class="section-sub">The Beginning • 2012</div><div class="section-icon">📅</div><h2 class="section-title">The Genesis of a Relentless Journey</h2><div class="story-block"><p>The company's journey began with its first official conversation with a Chartered Accountant on <strong>January 12, 2012</strong>. Formally registered with the Indian Government on February 21, 2012. Operations officially commenced on <strong>March 11, 2012</strong>, under the name <strong>ETP</strong> — three members, two employees and one director, operating from a small shutter shop with immense determination.</p></div><div class="stat-row"><div class="stat-item"><div class="stat-ico">👥</div><div class="stat-val">3 Members</div><div class="stat-lbl">Founding Team</div></div><div class="stat-item"><div class="stat-ico">🏢</div><div class="stat-val">ETP Origins</div><div class="stat-lbl">Company Name</div></div><div class="stat-item"><div class="stat-ico">📅</div><div class="stat-val">Mar 11, 2012</div><div class="stat-lbl">Start Date</div></div></div><div class="page-footer-text">Determination • Vision • Growth</div><span class="page-num">1</span></div></div>
<div class="my-page"><div class="page-content inner-page"><div class="section-badge" style="background:#1a73e8">OUR FOUNDATION</div><div class="section-sub">From Vision to Reality • 2012–2025</div><div class="section-icon">🏛️</div><div class="story-block" style="flex:1"><p>Founded over 13 years ago, XONOBICS began with a simple vision — to redefine excellence through innovation, integrity, and unwavering commitment to quality. What started with one passionate professional has evolved into a thriving organization of over <strong>125 talented individuals</strong>, united by one purpose: excellence through technology and teamwork.</p></div><div class="milestone-list"><div class="milestone-title">Key Milestones</div><div class="milestone-item"><span>👥</span><div><strong>From 1 to 125+</strong><div class="m-sub">Growing team of professionals</div></div></div><div class="milestone-item"><span>🏆</span><div><strong>13+ Years of Excellence</strong><div class="m-sub">Consistent quality and innovation</div></div></div><div class="milestone-item"><span>🌐</span><div><strong>Global Impact</strong><div class="m-sub">Expanding reach and influence</div></div></div></div><div class="values-row"><span>Innovation</span><span>Integrity</span><span>Excellence</span></div><span class="page-num page-num-r">2</span></div></div>
<div class="my-page"><div class="page-content inner-page"><div class="ep-header"><div class="section-badge" style="background:#1a73e8">CORE TEAM</div><div class="ep-sub">Page 1 of 4</div></div>${card(emps[0])}${card(emps[1])}<span class="page-num">3</span></div></div>
<div class="my-page"><div class="page-content inner-page"><div class="ep-header"><div class="section-badge" style="background:#1a73e8">CORE TEAM</div><div class="ep-sub">Page 2 of 4</div></div>${card(emps[2])}${card(emps[3])}<span class="page-num page-num-r">4</span></div></div>
<div class="my-page"><div class="page-content inner-page"><div class="ep-header"><div class="section-badge" style="background:#1a73e8">CORE TEAM</div><div class="ep-sub">Page 3 of 4</div></div>${card(emps[4])}${card(emps[5])}<span class="page-num">5</span></div></div>
<div class="my-page"><div class="page-content inner-page"><div class="ep-header"><div class="section-badge" style="background:#1a73e8">CORE TEAM</div><div class="ep-sub">Page 4 of 4</div></div>${card(emps[6])}${card(emps[7])}<span class="page-num page-num-r">6</span></div></div>
<div class="my-page" data-density="hard"><div class="page-content back-page"><div class="back-logo-box"><img src="/images/xonobics_logo.png" class="back-logo" alt="Xonobics"/></div><div class="back-title">XONOBICS</div><div class="back-sub">Call Center &amp; Consulting</div><div class="back-line"></div><div class="back-quote">"Excellence is not a destination;<br/>it is a continuous journey."</div><div class="back-foot"><div>Est. 2012 · Hyderabad, India</div><div>© 2025 Xonobics. All rights reserved.</div></div></div></div>
</div>`

// ── Computed ───────────────────────────────────────────────────────────────
const pageLabel = computed(() => {
  const p = currentPage.value
  if (p <= 0) return 'Cover'
  if (p >= totalPages.value - 1) return 'Back Cover'
  return `Pages ${p}–${p+1}`
})
const atStart   = computed(() => currentPage.value <= 0)
const atEnd     = computed(() => currentPage.value >= totalPages.value - 1)
const dotActive = computed(() => {
  const p = currentPage.value
  if (p <= 0) return 0; if (p <= 2) return 1; if (p <= 4) return 2; return 3
})

// ── Navigation ────────────────────────────────────────────────────────────
const prevPage = () => pf?.flipPrev('bottom')
const nextPage = () => pf?.flipNext('bottom')
const goToDot  = i => pf?.flip([0,1,3,5][i], 'bottom')

// ── Fullscreen — request on document.documentElement, not a child div ─────
const toggleFs = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}
const onFsChange = () => { isFs.value = !!document.fullscreenElement }

// ── Keyboard ──────────────────────────────────────────────────────────────
const onKey = e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextPage()
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prevPage()
  if (e.key === 'Escape' && !document.fullscreenElement) router.visit(route('employee-handbook'))
}

// ── Init ──────────────────────────────────────────────────────────────────
const initBook = () => {
  if (pf) { pf.destroy(); pf = null }

  const headerH = headerEl.value?.offsetHeight  || 52
  const bottomH = bottomEl.value?.offsetHeight  || 52
  const navW    = 130  // two nav buttons + gaps
  const padV    = 24
  const padH    = 20

  const availH  = window.innerHeight - headerH - bottomH - padV
  const availW  = window.innerWidth  - navW - padH

  // Two pages side by side: totalW = 2*pageW + 12(spine)
  const maxByW  = Math.floor((availW - 12) / 2)
  const maxByH  = availH

  // A4 ratio: pageW = pageH * 0.735
  let pageH = Math.min(maxByH, Math.round(maxByW / 0.735))
  let pageW = Math.round(pageH * 0.735)

  // Clamp
  pageH = Math.max(380, Math.min(pageH, window.innerHeight - headerH - bottomH - 20))
  pageW = Math.max(280, Math.min(pageW, maxByW))

  bookHostEl.value.innerHTML = bookHTML()

  pf = new PageFlip(document.getElementById('pf-book'), {
    width:               pageW,
    height:              pageH,
    showCover:           true,
    drawShadow:          true,
    flippingTime:        650,
    usePortrait:         false,
    autoSize:            false,
    maxShadowOpacity:    0.35,
    mobileScrollSupport: false,
    disableFlipByClick:  true,
    startZIndex:         1,
    swipeDistance:       40,
    clickEventForward:   true,
    useMouseEvents:      true,
  })

  pf.loadFromHTML(bookHostEl.value.querySelectorAll('.my-page'))
  pf.on('flip', e => { currentPage.value = e.data })
  pf.on('init', e => { totalPages.value = pf.getPageCount(); currentPage.value = e.data.page })
}

// Re-init on resize (debounced) so book always fills the window
let resizeTimer = null
const onResize = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => { initBook() }, 200)
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)
  document.addEventListener('fullscreenchange', onFsChange)
  // Wait one tick so the header/bottom refs have layout dimensions
  nextTick(() => initBook())
})

onUnmounted(() => {
  clearTimeout(resizeTimer)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('fullscreenchange', onFsChange)
  pf?.destroy()
})
</script>

<style scoped>
/* ──────────────────────────────────────────────────────────────────────────
   ROOT — fills viewport, no overflow:hidden, no filter, no transform.
   These three properties create "containing blocks" that trap StPageFlip's
   absolutely-positioned flip layer, causing the ghost fold.
   ────────────────────────────────────────────────────────────────────────── */
.dir-root {
  position: fixed; inset: 0;   /* fixed so it truly fills the screen */
  background: #05101e;
  display: flex; flex-direction: column;
  font-family: 'Inter', system-ui, sans-serif;
  z-index: 0;
}

/* Orbs — inside their own overflow:hidden container so they don't affect root */
.dir-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.orb    { position: absolute; border-radius: 50%; filter: blur(100px); opacity: .12; }
.orb-a  { width: 700px; height: 700px; background: #1240a0; top:-250px; left:-250px; }
.orb-b  { width: 500px; height: 500px; background: #0a2d80; bottom:-180px; right:-180px; }

/* ── Header ───────────────────────────────────────────────────────────────── */
.dir-header {
  position: relative; z-index: 20; flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 22px;
  background: rgba(5,16,30,.8);
  border-bottom: 1px solid rgba(255,255,255,.07);
  backdrop-filter: blur(14px);
}
.dir-back  { display:flex; align-items:center; gap:6px; font-size:13px; color:rgba(255,255,255,.55); text-decoration:none; transition:color .2s; min-width:70px; }
.dir-back:hover { color:#fff; }
.dir-back svg  { width:15px; height:15px; flex-shrink:0; }
.dir-chip  { font-size:12px; color:rgba(255,255,255,.6); background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.11); border-radius:20px; padding:4px 14px; letter-spacing:.6px; }
.dir-hdr-r { display:flex; align-items:center; gap:10px; min-width:70px; justify-content:flex-end; }
.dir-pg-lbl{ font-size:11px; color:rgba(255,255,255,.3); white-space:nowrap; }
.dir-fsbtn { width:30px; height:30px; border-radius:7px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); color:rgba(255,255,255,.6); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; flex-shrink:0; }
.dir-fsbtn:hover { background:rgba(255,255,255,.16); color:#fff; }
.dir-fsbtn svg { width:14px; height:14px; }

/* ── Book row ─────────────────────────────────────────────────────────────── */
.dir-book-row {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  gap: 18px;
  padding: 12px 10px 8px;
  position: relative; z-index: 10;
  /* CRITICAL: no overflow, no filter, no transform here */
}

/* Nav buttons */
.dir-nav { flex-shrink:0; width:46px; height:46px; border-radius:50%; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.18); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; }
.dir-nav:hover { background:rgba(255,255,255,.2); transform:scale(1.08); }
.dir-nav.invisible { visibility:hidden; }
.dir-nav svg { width:20px; height:20px; }

/* Book host — StPageFlip's territory. NOTHING that creates a containing block. */
.dir-book-host {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
}

/* ── Bottom ───────────────────────────────────────────────────────────────── */
.dir-bottom { flex-shrink: 0; position: relative; z-index: 10; padding-bottom: 8px; }
.dir-dots   { display:flex; justify-content:center; gap:8px; padding:6px 0 3px; }
.dot        { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,.2); border:none; cursor:pointer; transition:all .22s; padding:0; }
.dot--on    { background:#64b5f6; transform:scale(1.45); }
.dir-hint   { text-align:center; font-size:10px; color:rgba(255,255,255,.15); letter-spacing:.7px; padding-bottom:4px; }
</style>

<style>
/* ─── StPageFlip page content — global, not scoped ─────────────────────────── */
#pf-book   { background: transparent; }
.my-page   { overflow: hidden; }

/* Book shadow — on stf__parent which StPageFlip creates inside #pf-book.
   box-shadow does NOT create a containing block — safe to use here. */
.stf__parent { box-shadow: 0 24px 52px rgba(0,0,0,.7), 0 6px 18px rgba(0,0,0,.45) !important; }

.page-content { width:100%; height:100%; box-sizing:border-box; overflow:hidden; }

/* Cover */
.cover-page    { position:relative; background:#0a1628; }
.cover-bg-img  { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.cover-overlay { position:absolute; inset:0; background:linear-gradient(155deg,rgba(10,24,52,.48) 0%,rgba(5,14,38,.9) 100%); }
.cover-body    { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:28px 24px; gap:13px; }
.cover-logo-card { background:rgba(255,255,255,.97); border-radius:14px; padding:13px 24px; box-shadow:0 4px 24px rgba(0,0,0,.35); }
.cover-logo    { height:40px; display:block; object-fit:contain; }
.cover-eyebrow { background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.26); border-radius:24px; padding:5px 14px; font-size:9px; font-weight:700; letter-spacing:2px; color:#fff; text-transform:uppercase; font-family:system-ui,sans-serif; }
.cover-heading { font-size:clamp(28px,5vw,44px); font-weight:900; letter-spacing:4px; color:#fff; text-align:center; line-height:1.1; text-shadow:0 2px 20px rgba(0,0,0,.6); margin:0; font-family:system-ui,sans-serif; }
.cover-rule    { width:56px; height:2px; background:linear-gradient(90deg,transparent,#64b5f6,transparent); }
.cover-sub     { font-size:11px; color:rgba(255,255,255,.55); letter-spacing:1.6px; text-align:center; font-family:system-ui,sans-serif; }
.cover-hint    { font-size:10px; color:rgba(255,255,255,.38); font-family:system-ui,sans-serif; animation:hintP 2.2s ease-in-out infinite; margin-top:6px; }
@keyframes hintP { 0%,100%{opacity:.35} 50%{opacity:.85} }
.cover-footer  { position:absolute; bottom:0; left:0; right:0; display:flex; justify-content:space-between; padding:9px 18px; font-size:10.5px; color:rgba(255,255,255,.36); background:rgba(0,0,0,.22); font-family:system-ui,sans-serif; }

/* Inner pages */
.inner-page  { background:#fff; padding:22px 22px 34px; display:flex; flex-direction:column; gap:9px; font-family:system-ui,sans-serif; position:relative; }
.section-badge { display:inline-block; color:#fff; font-size:9px; font-weight:700; letter-spacing:1.8px; padding:4px 11px; border-radius:4px; text-transform:uppercase; width:fit-content; }
.section-sub   { font-size:10.5px; color:#888; }
.section-icon  { font-size:17px; }
.section-title { font-size:14px; font-weight:700; color:#1a2742; line-height:1.3; margin:0; }
.story-block   { background:#f0f4f8; border-left:3px solid #1a73e8; border-radius:6px; padding:11px 13px; font-size:10.5px; color:#444; line-height:1.65; flex:1; }
.story-block p { margin:0; }
.stat-row   { display:flex; gap:5px; }
.stat-item  { flex:1; text-align:center; background:#f7fafc; border-radius:7px; padding:7px 3px; }
.stat-ico   { font-size:13px; }
.stat-val   { font-size:9.5px; font-weight:700; color:#1a2742; margin-top:3px; }
.stat-lbl   { font-size:8px; color:#888; margin-top:1px; }
.milestone-list  { display:flex; flex-direction:column; gap:5px; flex:1; }
.milestone-title { font-size:11px; font-weight:700; color:#1a2742; margin:0 0 2px; }
.milestone-item  { display:flex; gap:7px; align-items:flex-start; background:#f7fafc; border-radius:7px; padding:7px 9px; font-size:10.5px; color:#444; }
.milestone-item>span { font-size:14px; flex-shrink:0; }
.m-sub  { color:#888; font-size:9.5px; }
.values-row { display:flex; justify-content:space-between; font-size:9.5px; color:#1a73e8; font-weight:600; letter-spacing:.5px; }
.page-footer-text { font-size:8.5px; color:#c0c0c0; text-align:center; letter-spacing:1.5px; }
.page-num   { position:absolute; bottom:10px; left:18px; font-size:10px; color:#ccc; font-style:italic; }
.page-num-r { left:auto; right:18px; }

/* Employee pages */
.ep-header  { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
.ep-sub     { font-size:9.5px; color:#aaa; }
.emp-card   { display:flex; align-items:center; gap:11px; background:#f0f5ff; border:1px solid #dde6f5; border-radius:11px; padding:11px; margin-bottom:9px; }
.emp-ring   { flex-shrink:0; width:64px; height:64px; border-radius:50%; border:3px solid; overflow:hidden; box-shadow:0 3px 10px rgba(26,115,232,.17); }
.emp-photo  { width:100%; height:100%; object-fit:cover; display:block; }
.emp-ini    { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; color:#fff; }
.emp-info   { flex:1; min-width:0; }
.emp-name   { font-size:12.5px; font-weight:700; color:#1a2742; margin:0 0 2px; }
.emp-role   { font-size:10.5px; font-weight:600; margin-bottom:2px; }
.emp-dept   { font-size:10px; color:#666; margin-bottom:2px; }
.emp-joined { font-size:9px; color:#888; }

/* Back cover */
.back-page     { background:linear-gradient(155deg,#0d1f3c 0%,#1a3a6c 50%,#0d1f3c 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:32px 22px; font-family:system-ui,sans-serif; }
.back-logo-box { background:rgba(255,255,255,.96); border-radius:13px; padding:12px 20px; box-shadow:0 4px 16px rgba(0,0,0,.3); margin-bottom:14px; }
.back-logo     { height:36px; object-fit:contain; display:block; }
.back-title    { font-size:24px; font-weight:900; color:#fff; letter-spacing:4px; }
.back-sub      { font-size:10.5px; color:rgba(255,255,255,.48); letter-spacing:2px; margin-top:4px; text-transform:uppercase; }
.back-line     { width:44px; height:2px; background:linear-gradient(90deg,transparent,#64b5f6,transparent); margin:14px auto; }
.back-quote    { font-size:12px; color:rgba(255,255,255,.66); font-style:italic; line-height:1.7; padding:0 14px; }
.back-foot     { margin-top:20px; font-size:10px; color:rgba(255,255,255,.32); line-height:1.8; }
</style>
