<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Employee Directory — Xonobics</title>
<script src="{{ asset('page-flip.browser.js') }}"></script>
<style>
*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
    width: 100%; height: 100%;
    background: #05101e;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    overflow: hidden;
    user-select: none;
}

/* ── Ambient ─────────────────────────────────────────────────────── */
.bg-orb {
    position: fixed; border-radius: 50%;
    filter: blur(100px); opacity: .13; pointer-events: none; z-index: 0;
}
.orb-a { width:700px;height:700px;background:#1240a0;top:-250px;left:-250px; }
.orb-b { width:500px;height:500px;background:#0a2d80;bottom:-180px;right:-180px; }

/* ── Header ──────────────────────────────────────────────────────── */
#header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 22px;
    background: rgba(5,16,30,.85);
    border-bottom: 1px solid rgba(255,255,255,.07);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    height: 50px;
}
#header a {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; color: rgba(255,255,255,.55);
    text-decoration: none; transition: color .2s; min-width: 70px;
}
#header a:hover { color: #fff; }
#header a svg   { width: 15px; height: 15px; flex-shrink: 0; }
.h-chip {
    font-size: 12px; color: rgba(255,255,255,.6);
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.11);
    border-radius: 20px; padding: 4px 14px; letter-spacing: .6px;
}
.h-right { display: flex; align-items: center; gap: 10px; min-width: 70px; justify-content: flex-end; }
#pg-label { font-size: 11px; color: rgba(255,255,255,.3); white-space: nowrap; }
#fs-btn {
    width: 30px; height: 30px; border-radius: 7px;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.12);
    color: rgba(255,255,255,.6); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s;
}
#fs-btn:hover { background: rgba(255,255,255,.18); color: #fff; }
#fs-btn svg { width: 14px; height: 14px; }

/* ── Stage ────────────────────────────────────────────────────────── */
#stage {
    position: fixed;
    top: 50px; left: 0; right: 0; bottom: 50px;
    display: flex; align-items: stretch; justify-content: center;
    gap: 18px;
    z-index: 10;
    padding: 8px 0;
}

/* ── Nav buttons ─────────────────────────────────────────────────── */
.nav-btn {
    flex-shrink: 0; width: 46px; height: 46px; border-radius: 50%;
    align-self: center;
    background: rgba(255,255,255,.1);
    border: 1px solid rgba(255,255,255,.18);
    color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s; z-index: 20;
}
.nav-btn:hover { background: rgba(255,255,255,.22); transform: scale(1.08); }
.nav-btn.hidden { visibility: hidden; }
.nav-btn svg { width: 20px; height: 20px; }

/* ── Book host — NOTHING that creates a containing block ─────────── */
#book-host {
    flex: 1;
    height: 100%;
    display: flex; align-items: stretch; justify-content: center;
}

/* ── Bottom bar ──────────────────────────────────────────────────── */
#bottom {
    position: fixed; bottom: 0; left: 0; right: 0;
    height: 50px; z-index: 100;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 4px;
    background: rgba(5,16,30,.6);
}
#dots { display: flex; gap: 8px; }
.dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(255,255,255,.2); border: none; cursor: pointer;
    transition: all .22s; padding: 0;
}
.dot.on { background: #64b5f6; transform: scale(1.45); }
#hint { font-size: 10px; color: rgba(255,255,255,.15); letter-spacing: .7px; }

/* ── StPageFlip shadow ────────────────────────────────────────────── */
.stf__parent {
    box-shadow: 0 24px 52px rgba(0,0,0,.7), 0 6px 18px rgba(0,0,0,.5) !important;
}

/* ══════════════════════════════════════════════════════════════════
   PAGE CONTENT
══════════════════════════════════════════════════════════════════ */
.page-content { width:100%; height:100%; box-sizing:border-box; overflow:hidden; display:flex; flex-direction:column; }

/* Cover */
.cover-page    { position:relative; background:#0a1628; }
.cover-bg-img  { position:absolute;inset:0;width:100%;height:100%;object-fit:cover; }
.cover-overlay { position:absolute;inset:0;background:linear-gradient(155deg,rgba(10,24,52,.48) 0%,rgba(5,14,38,.9) 100%); }
.cover-body    { position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 24px;gap:13px; }
.cover-logo-card { background:rgba(255,255,255,.97);border-radius:14px;padding:13px 24px;box-shadow:0 4px 24px rgba(0,0,0,.35); }
.cover-logo    { height:40px;display:block;object-fit:contain; }
.cover-eyebrow { background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.26);border-radius:24px;padding:5px 14px;font-size:9px;font-weight:700;letter-spacing:2px;color:#fff;text-transform:uppercase; }
.cover-heading { font-size:clamp(26px,5vw,44px);font-weight:900;letter-spacing:4px;color:#fff;text-align:center;line-height:1.1;text-shadow:0 2px 20px rgba(0,0,0,.6);margin:0; }
.cover-rule    { width:56px;height:2px;background:linear-gradient(90deg,transparent,#64b5f6,transparent); }
.cover-sub     { font-size:11px;color:rgba(255,255,255,.55);letter-spacing:1.6px;text-align:center; }
.cover-hint    { font-size:10px;color:rgba(255,255,255,.38);margin-top:6px;animation:hintP 2.2s ease-in-out infinite; }
@keyframes hintP { 0%,100%{opacity:.35} 50%{opacity:.85} }
.cover-footer  { position:absolute;bottom:0;left:0;right:0;display:flex;justify-content:space-between;padding:9px 18px;font-size:10.5px;color:rgba(255,255,255,.36);background:rgba(0,0,0,.22); }

/* Inner pages */
.inner-page  { background:#fff;padding:3% 4% 2.5%;display:flex;flex-direction:column;gap:clamp(8px,1.2vh,16px);position:relative;flex:1;height:100%;box-sizing:border-box; }
.section-badge { display:inline-block;color:#fff;font-size:clamp(9px,1vw,12px);font-weight:700;letter-spacing:1.4px;padding:clamp(5px,.7vh,10px) clamp(12px,1.5vw,22px);border-radius:6px;text-transform:uppercase;width:fit-content; }
.section-sub   { font-size:clamp(10px,1.1vw,13px);color:#777;margin-top:1px; }
.title-row  { display:flex;align-items:center;gap:clamp(8px,1vw,14px);margin-top:2px; }
.section-title { font-size:clamp(13px,1.4vw,18px);font-weight:700;color:#1a2742;line-height:1.3;margin:0; }
.story-block   { background:#e8eff8;border-radius:12px;padding:clamp(14px,2vh,24px) clamp(14px,1.8vw,24px);font-size:clamp(11px,1.2vw,15px);color:#444;line-height:1.8;text-align:center;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:space-between; }
.story-block p { margin:0; }
.story-illustration { width:100%;display:flex;justify-content:center;padding-top:clamp(10px,1.5vh,20px);flex-shrink:0; }
.story-unsplash { width:100%;max-width:340px;height:clamp(80px,12vh,160px);border-radius:10px;object-fit:cover;opacity:.75; }
.stat-row  { display:flex;gap:clamp(4px,.5vw,8px);margin-top:2px; }
.stat-item { flex:1;text-align:center;padding:clamp(6px,1vh,12px) 2px;display:flex;flex-direction:column;align-items:center;gap:clamp(4px,.6vh,8px); }
.stat-val  { font-size:clamp(10px,1.1vw,14px);font-weight:700;color:#1a2742; }
.stat-lbl  { font-size:clamp(8px,.9vw,12px);color:#888;margin-top:0; }
.milestone-list  { display:flex;flex-direction:column;gap:clamp(5px,.8vh,10px);flex:1; }
.milestone-title { font-size:clamp(12px,1.3vw,16px);font-weight:700;color:#1a2742;margin:0 0 4px; }
.milestone-item  { display:flex;gap:clamp(7px,.9vw,13px);align-items:flex-start;background:#f0f5fb;border-radius:8px;padding:clamp(7px,1vh,12px) clamp(9px,1.2vw,15px);font-size:clamp(10px,1.1vw,14px);color:#444; }
.m-sub  { color:#888;font-size:clamp(9px,1vw,12px);margin-top:2px; }
.values-row { display:flex;justify-content:space-between;font-size:clamp(9px,1vw,13px);color:#1a73e8;font-weight:600;letter-spacing:.5px; }
.page-footer-text { font-size:clamp(9px,1vw,13px);color:#aaa;text-align:center;letter-spacing:1.5px;margin-top:2px; }
.page-num   { position:absolute;bottom:10px;left:18px;font-size:10px;color:#ccc;font-style:italic; }
.page-num-r { left:auto;right:18px; }

/* ── Sections with icon (Growth, Vision pages) ─────────────────────── */
.sp-section   { display:flex;gap:clamp(10px,1.2vw,18px);align-items:flex-start;flex:1; }
.sp-icon-wrap { flex-shrink:0;width:clamp(42px,4vw,60px);height:clamp(42px,4vw,60px);border-radius:50%;background:#e8f0f8;display:flex;align-items:center;justify-content:center; }
.sp-text      { flex:1;min-width:0;display:flex;flex-direction:column;justify-content:flex-start; }
.sp-title     { font-size:clamp(13px,1.5vw,20px);font-weight:700;color:#1a2742;margin-bottom:clamp(5px,.7vh,10px); }
.sp-body      { font-size:clamp(11px,1.2vw,15px);color:#555;line-height:1.85;margin:0; }
.sp-svg-fill  { margin-top:auto;padding-top:clamp(8px,1.2vh,16px);width:100%; }
.sp-img-fill  { margin-top:auto;padding-top:clamp(8px,1.2vh,16px);width:100%; }
.sp-unsplash  { width:100%;height:clamp(70px,10vh,130px);object-fit:cover;border-radius:8px;opacity:.72; }
.sp-img-wrap  { display:flex;justify-content:center;margin:2px 0; }
.sp-img       { width:100%;max-height:clamp(80px,12vh,140px);object-fit:cover;border-radius:8px; }
.sp-footer-row{ display:flex;justify-content:space-between;font-size:clamp(9px,1vw,13px);color:#888;padding-top:6px;border-top:1px solid #eee;margin-top:auto;flex-shrink:0; }

/* ── Horizontal cards (Guiding Principles) ───────────────────────── */
.hc-list { display:flex;flex-direction:column;gap:clamp(7px,1vh,14px);flex:1; }
.hc-card { display:flex;align-items:center;gap:clamp(10px,1.2vw,18px);background:#f0f5fb;border:1px solid #dce8f5;border-radius:12px;padding:clamp(10px,1.4vh,18px) clamp(12px,1.4vw,20px);flex:1; }
.hc-icon { flex-shrink:0;width:clamp(40px,3.8vw,56px);height:clamp(40px,3.8vw,56px);border-radius:50%;background:#e0ecf8;display:flex;align-items:center;justify-content:center; }
.hc-text { flex:1;min-width:0; }
.hc-title{ font-size:clamp(12px,1.3vw,16px);font-weight:700;color:#1a2742;margin-bottom:4px; }
.hc-body { font-size:clamp(10px,1.1vw,13px);color:#555;line-height:1.6;margin:0; }

/* ── Legacy & Future page ──────────────────────────────────────────── */
.lf-page     { gap:clamp(10px,1.5vh,18px); }
.lf-logo-wrap{ display:flex;justify-content:center;margin:4px 0; }
.lf-logo-card{ background:#fff;border:1px solid #e0e8f0;border-radius:14px;padding:14px 28px;box-shadow:0 2px 14px rgba(0,0,0,.08); }
.lf-logo     { height:34px;object-fit:contain;display:block; }
.lf-dairy-img { width:100%;max-width:220px;height:clamp(60px,9vh,110px);object-fit:contain;opacity:.85;border-radius:8px; }
.lf-heading  { font-size:clamp(15px,1.8vw,22px);font-weight:700;color:#1a2742;text-align:center;line-height:1.3;margin:0; }
.lf-story    { text-align:center;font-size:clamp(11px,1.2vw,15px);line-height:1.85;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:space-between; }
.lf-footer   { font-size:clamp(9px,1vw,13px); }

/* Employee pages */
.ep-header  { display:flex;align-items:center;justify-content:space-between;margin-bottom:6px; }
.ep-sub     { font-size:clamp(8px,.9vw,11px);color:#aaa; }
.emp-card   { display:flex;align-items:center;gap:clamp(8px,1vw,14px);background:#f0f5ff;border:1px solid #dde6f5;border-radius:11px;padding:clamp(8px,1.2vh,14px);margin-bottom:clamp(6px,.9vh,12px); }
.emp-ring   { flex-shrink:0;width:clamp(52px,5vw,72px);height:clamp(52px,5vw,72px);border-radius:50%;border:3px solid;overflow:hidden;box-shadow:0 3px 10px rgba(26,115,232,.17); }
.emp-photo  { width:100%;height:100%;object-fit:cover;display:block; }
.emp-ini    { width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:clamp(16px,2vw,24px);font-weight:700;color:#fff; }
.emp-info   { flex:1;min-width:0; }
.emp-name   { font-size:clamp(11px,1.2vw,15px);font-weight:700;color:#1a2742;margin:0 0 2px; }
.emp-role   { font-size:clamp(9.5px,1vw,13px);font-weight:600;margin-bottom:2px; }
.emp-dept   { font-size:clamp(9px,.95vw,12px);color:#666;margin-bottom:2px; }
.emp-joined { font-size:clamp(8px,.9vw,11px);color:#888; }

/* ── Employee Directory pages (4 per page) ────────────────────────── */
.ed-page   { gap:clamp(8px,1.2vh,14px); }
.ed-header { display:flex;align-items:flex-start;justify-content:space-between; }
.ed-page-counter { font-size:clamp(9px,1vw,13px);color:#aaa;font-weight:600;margin-top:6px;letter-spacing:.5px; }
.ed-list   { display:flex;flex-direction:column;gap:clamp(7px,1vh,12px);flex:1; }
.ed-card   { display:flex;align-items:center;gap:clamp(10px,1.2vw,16px);background:#f5f8fd;border:1px solid #dce8f5;border-radius:12px;padding:clamp(9px,1.3vh,16px) clamp(10px,1.3vw,18px);position:relative;overflow:hidden;flex:1; }
.ed-accent { position:absolute;left:0;top:0;bottom:0;width:4px;border-radius:12px 0 0 12px; }
.ed-photo-wrap { flex-shrink:0;width:clamp(50px,5vw,70px);height:clamp(50px,5vw,70px);border-radius:50%;border:2.5px solid;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.12); }
.ed-photo  { width:100%;height:100%;object-fit:cover;display:block; }
.ed-ini    { width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:clamp(16px,2vw,24px);font-weight:700;color:#fff; }
.ed-info   { flex:1;min-width:0;padding-left:2px; }
.ed-name   { font-size:clamp(12px,1.3vw,16px);font-weight:700;color:#1a2742;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.ed-role   { font-size:clamp(10px,1.1vw,14px);font-weight:600;margin-bottom:clamp(3px,.5vh,7px); }
.ed-meta   { display:flex;flex-direction:column;gap:clamp(2px,.4vh,5px); }
.ed-dept,.ed-joined { display:flex;align-items:center;gap:4px;font-size:clamp(9px,1vw,13px);color:#777; }
.ed-dept svg,.ed-joined svg { flex-shrink:0;opacity:.6; }
.ed-footer { display:flex;align-items:center;justify-content:center;gap:6px;font-size:clamp(9px,1vw,13px);color:#aaa;letter-spacing:.4px;padding-top:4px;border-top:1px solid #eef2f8;flex-shrink:0; }

/* ── Individual Journey pages ─────────────────────────────────────── */
/* Profile intro page */
.pj-page      { gap:clamp(8px,1.2vh,16px); align-items:center; }
.pj-photo-wrap { width:clamp(90px,10vw,140px);height:clamp(90px,10vw,140px);border-radius:50%;border:3px solid;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,.15);flex-shrink:0; }
.pj-photo     { width:100%;height:100%;object-fit:cover;display:block; }
.pj-ini       { width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:clamp(24px,3vw,40px);font-weight:700;color:#fff; }
.pj-identity  { text-align:center;width:100%; }
.pj-name      { font-size:clamp(16px,2vw,26px);font-weight:800;color:#1a2742;margin:0 0 4px; }
.pj-role      { font-size:clamp(12px,1.4vw,18px);font-weight:700;margin-bottom:3px; }
.pj-dept      { font-size:clamp(10px,1.1vw,14px);color:#777; }
.pj-quote     { width:100%;font-size:clamp(10px,1.1vw,14px);color:#666;font-style:italic;text-align:center;padding:clamp(6px,1vh,12px) 10px;border-top:1px solid #eef2f8;flex-shrink:0; }

/* Career progression / Leadership page */
.cp-page      { gap:clamp(8px,1.2vh,16px); }
.cp-layout    { display:flex;gap:clamp(12px,1.5vw,20px);flex:1;align-items:stretch; }
.cp-left      { flex:1.3;display:flex;flex-direction:column;gap:clamp(10px,1.3vh,16px); }
.cp-right     { flex:1;display:flex;flex-direction:column;gap:clamp(10px,1.3vh,16px); }
.cp-milestones{ background:#f5f8fd;border-radius:10px;padding:clamp(10px,1.4vh,18px) clamp(12px,1.4vw,18px);flex:1; }
.cp-ml-title  { font-size:clamp(12px,1.4vw,17px);font-weight:700;color:#1a2742;margin-bottom:clamp(6px,1vh,12px); }
.cp-ml-item   { display:flex;align-items:flex-start;gap:clamp(8px,1vw,14px);margin-bottom:clamp(6px,1vh,12px); }
.cp-ml-item:last-child { margin-bottom:0; }
.cp-ml-icon   { flex-shrink:0;margin-top:1px; }
.cp-ml-name   { font-size:clamp(11px,1.2vw,15px);font-weight:700;color:#1a2742;margin-bottom:1px; }
.cp-ml-sub    { font-size:clamp(9px,1vw,13px);color:#777; }

/* Back cover */
.back-page     { background:linear-gradient(155deg,#0d1f3c 0%,#1a3a6c 50%,#0d1f3c 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px 22px; }
.back-logo-box { background:rgba(255,255,255,.96);border-radius:13px;padding:12px 20px;box-shadow:0 4px 16px rgba(0,0,0,.3);margin-bottom:14px; }
.back-logo     { height:36px;object-fit:contain;display:block; }
.back-title    { font-size:24px;font-weight:900;color:#fff;letter-spacing:4px; }
.back-sub      { font-size:10.5px;color:rgba(255,255,255,.48);letter-spacing:2px;margin-top:4px;text-transform:uppercase; }
.back-line     { width:44px;height:2px;background:linear-gradient(90deg,transparent,#64b5f6,transparent);margin:14px auto; }
.back-quote    { font-size:12px;color:rgba(255,255,255,.66);font-style:italic;line-height:1.7;padding:0 14px; }
.back-foot     { margin-top:20px;font-size:10px;color:rgba(255,255,255,.32);line-height:1.8; }
</style>
</head>
<body>

<div class="bg-orb orb-a"></div>
<div class="bg-orb orb-b"></div>

<!-- Header -->
<div id="header">
  <a href="{{ route('employee-handbook') }}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m7-7-7 7 7 7"/></svg>
    Back
  </a>
  <span class="h-chip">📖 Employee Directory 2025</span>
  <div class="h-right">
    <span id="pg-label">Cover</span>
    <button id="fs-btn" title="Fullscreen">
      <svg id="fs-icon-expand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/></svg>
      <svg id="fs-icon-shrink" style="display:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"/></svg>
    </button>
  </div>
</div>

<!-- Stage -->
<div id="stage">
  <button class="nav-btn hidden" id="btn-prev">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
  </button>

  <!-- StPageFlip will create its wrapper INSIDE this div -->
  <div id="book-host">

    <!-- The book — exactly as the demo does it -->
    <div id="book">

      <div class="my-page" data-density="hard">
        <div class="page-content cover-page">
          <img src="/images/cover-cityscape.jpg" class="cover-bg-img" alt=""/>
          <div class="cover-overlay"></div>
          <div class="cover-body">
            <div class="cover-logo-card"><img src="/images/xonobics_logo.png" class="cover-logo" alt="Xonobics"/></div>
            <div class="cover-eyebrow">CORPORATE DIRECTORY 2025</div>
            <h1 class="cover-heading">EMPLOYEE<br/>DIRECTORY</h1>
            <div class="cover-rule"></div>
            <p class="cover-sub">Core Team · Leadership · Excellence</p>
            <div class="cover-hint">▶ Drag corner or use arrows</div>
          </div>
          <div class="cover-footer"><span>Xonobics</span><span>Call Center &amp; Consulting</span></div>
        </div>
      </div>

      <div class="my-page">
        <div class="page-content inner-page">

          <!-- Badge -->
          <div class="section-badge" style="background:#1565c0">THE JOURNEY OF XONOBICS</div>
          <div class="section-sub">The Beginning • 2012</div>

          <!-- Title row: icon + heading -->
          <div class="title-row">
            <!-- Calendar icon matching the screenshot -->
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px">
              <rect x="3" y="4" width="18" height="17" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="9" x2="21" y2="9"/>
            </svg>
            <h2 class="section-title" style="color:#1a2742;font-size:15px;font-weight:700;margin:0;line-height:1.3">The Genesis of a Relentless Journey</h2>
          </div>

          <!-- Story block — light blue bg, centered text, full story -->
          <div class="story-block">
            <p>The company's professional journey began with its first official conversation with a Chartered Accountant on January 12, 2012. It was formally registered with the Indian Government on February 21, 2012. In the first week of March 2012, two employees were hired, and operations officially commenced on March 11, 2012, under the name ETP. At inception, the organization consisted of just three members — two employees and one director — operating from a small shutter shop within a commercial complex, with minimal facilities but immense determination.</p>

            <!-- Growth illustration -->
            <div class="story-illustration">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80&auto=format&fit=crop" 
                   alt="Growth" class="story-unsplash"/>
            </div>
          </div>

          <!-- Stats row -->
          <div class="stat-row">
            <div class="stat-item">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <div class="stat-val">3 Members</div>
              <div class="stat-lbl">Founding Team</div>
            </div>
            <div class="stat-item">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              <div class="stat-val">ETP Origins</div>
              <div class="stat-lbl">Company Name</div>
            </div>
            <div class="stat-item">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8"  y1="2" x2="8"  y2="6"/>
                <line x1="3"  y1="9" x2="21" y2="9"/>
              </svg>
              <div class="stat-val">March 11, 2012</div>
              <div class="stat-lbl">Operations Start</div>
            </div>
          </div>

          <!-- Footer text -->
          <div class="page-footer-text">Determination • Vision • Growth</div>
          <span class="page-num">1</span>

        </div>
      </div>

      <div class="my-page">
        <div class="page-content inner-page">
          <div class="section-badge" style="background:#1565c0">OUR FOUNDATION</div>
          <div class="section-sub">From Vision to Reality • 2012–2025</div>

          <!-- Title row: building SVG + heading -->
          <div class="title-row">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px">
              <path d="M3 22V8l9-6 9 6v14"/>
              <path d="M9 22V12h6v10"/>
              <line x1="3" y1="22" x2="21" y2="22"/>
            </svg>
            <h2 class="section-title">Building a Legacy of Excellence</h2>
          </div>

          <!-- Story block -->
          <div class="story-block">
            <p>Founded over 13 years ago, XONOBICS began with a simple vision — to redefine excellence through innovation, integrity, and unwavering commitment to quality. What started with one passionate professional has evolved into a thriving organization of over <strong>125 talented individuals</strong>, united by one purpose: excellence through technology and teamwork.</p>

            <!-- Team illustration -->
            <div class="story-illustration">
              <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80&auto=format&fit=crop"
                   alt="Team Collaboration" class="story-unsplash"/>
            </div>
          </div>

          <!-- Milestones with SVG icons -->
          <div class="milestone-list">
            <div class="milestone-title">Key Milestones</div>

            <div class="milestone-item">
              <!-- People / growth icon -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <div>
                <strong>From 1 to 125+</strong>
                <div class="m-sub">Growing team of professionals</div>
              </div>
            </div>

            <div class="milestone-item">
              <!-- Trophy / award icon -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px">
                <path d="M6 9H4a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1h2"/>
                <path d="M18 9h2a2 2 0 0 0 2-2V5a1 1 0 0 0-1-1h-2"/>
                <path d="M12 17c-3.87 0-7-3.13-7-7V4h14v6c0 3.87-3.13 7-7 7z"/>
                <path d="M12 17v4"/>
                <path d="M8 21h8"/>
              </svg>
              <div>
                <strong>13+ Years of Excellence</strong>
                <div class="m-sub">Consistent quality and innovation</div>
              </div>
            </div>

            <div class="milestone-item">
              <!-- Globe / global icon -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <div>
                <strong>Global Impact</strong>
                <div class="m-sub">Expanding reach and influence</div>
              </div>
            </div>

          </div>

          <div class="values-row"><span>Innovation</span><span>Integrity</span><span>Excellence</span></div>
          <span class="page-num page-num-r">2</span>
        </div>
      </div>

      {{-- ══ PAGE 3: GROWTH & EVOLUTION ══════════════════════════════════════ --}}
      <div class="my-page">
        <div class="page-content inner-page">
          <div class="section-badge" style="background:#1565c0">GROWTH &amp; EVOLUTION</div>
          <div class="section-sub">Building Excellence • 2012–2025</div>

          <div class="sp-section">
            <div class="sp-icon-wrap">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <div class="sp-text">
              <div class="sp-title">Steady Growth &amp; Impact</div>
              <p class="sp-body">From its humble beginnings, XONOBICS has grown steadily, not just in size, but in purpose, capability, and impact. Each milestone in our journey has been shaped by dedication, strategic thinking, and a relentless pursuit of improvement. Over the years, we have expanded our expertise across IT Services, Compliance, Finance.</p>
              <div class="sp-img-fill"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80&auto=format&fit=crop" alt="Growth" class="sp-unsplash"/></div>
            </div>
          </div>

          <div class="sp-section">
            <div class="sp-icon-wrap">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div class="sp-text">
              <div class="sp-title">People-First Culture</div>
              <p class="sp-body">Our success is deeply rooted in our people-first culture. At XONOBICS, every individual is valued as a key contributor to the organization's progress. We believe that true growth happens when passion meets opportunity — and that belief reflects in every project we undertake and every milestone we achieve.</p>
              <div class="sp-img-fill"><img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&q=80&auto=format&fit=crop" alt="People" class="sp-unsplash"/></div>
            </div>
          </div>

          <div class="sp-footer-row">
            <span>IT Services</span><span>Compliance &amp; Finance</span><span>Technology Solutions</span>
          </div>
          <span class="page-num">3</span>
        </div>
      </div>

      {{-- ══ PAGE 4: OUR VISION & VALUES ════════════════════════════════════ --}}
      <div class="my-page">
        <div class="page-content inner-page">
          <div class="section-badge" style="background:#1565c0">OUR VISION &amp; VALUES</div>
          <div class="section-sub">Building the Future • Since 2012</div>

          <div class="sp-section">
            <div class="sp-icon-wrap">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div class="sp-text">
              <div class="sp-title">Evolution of a Vision</div>
              <p class="sp-body">The story of XONOBICS is not just about growth in numbers, but about the evolution of a shared vision — from a small team of dreamers to a structured, forward-thinking enterprise built on discipline, innovation, and integrity.</p>
              <div class="sp-img-fill">
                <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80&auto=format&fit=crop" alt="Vision" class="sp-unsplash"/>
              </div>
            </div>
          </div>

          <div class="sp-section">
            <div class="sp-icon-wrap">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <div class="sp-text">
              <div class="sp-title">Commitment to Excellence</div>
              <p class="sp-body">As we continue to move forward, we remain committed to the principles that shaped our foundation — quality, transparency, and people-first thinking in everything we do.</p>
              <div class="sp-img-fill">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80&auto=format&fit=crop" alt="Excellence" class="sp-unsplash"/>
              </div>
            </div>
          </div>

          <div class="sp-footer-row">
            <span>13+ Years of Excellence</span><span>125+ Professionals</span><span>+91 40 6999 9160</span>
          </div>
          <span class="page-num page-num-r">4</span>
        </div>
      </div>

      {{-- ══ PAGE 5: OUR GUIDING PRINCIPLES ════════════════════════════════ --}}
      <div class="my-page">
        <div class="page-content inner-page">
          <div class="section-badge" style="background:#1565c0">OUR GUIDING PRINCIPLES</div>
          <div class="section-sub">Building the Future • 2025 &amp; Beyond</div>

          <div class="hc-list">
            <div class="hc-card">
              <div class="hc-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="6"/>
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
              </div>
              <div class="hc-text">
                <div class="hc-title">Consistency in Quality</div>
                <div class="hc-body">Delivering reliable, high-standard solutions that exceed expectations in every engagement.</div>
              </div>
            </div>
            <div class="hc-card">
              <div class="hc-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div class="hc-text">
                <div class="hc-title">Transparency in Operations</div>
                <div class="hc-body">Open communication and clear processes in all business dealings with clients and teams.</div>
              </div>
            </div>
            <div class="hc-card">
              <div class="hc-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <div class="hc-text">
                <div class="hc-title">Innovation in Every Approach</div>
                <div class="hc-body">Embracing new technologies and creative solutions for evolving challenges across domains.</div>
              </div>
            </div>
            <div class="hc-card">
              <div class="hc-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="hc-text">
                <div class="hc-title">Empowerment of People</div>
                <div class="hc-body">Investing in our team and fostering growth opportunities for every individual at all levels.</div>
              </div>
            </div>
          </div>

          <div class="sp-footer-row">
            <span>Perseverance &amp; Progress</span><span>Global Excellence</span><span>Building Tomorrow</span>
          </div>
          <span class="page-num">5</span>
        </div>
      </div>

      {{-- ══ PAGE 6: OUR LEGACY & FUTURE ════════════════════════════════════ --}}
      <div class="my-page">
        <div class="page-content inner-page lf-page">
          <div class="section-badge" style="background:#1565c0">OUR LEGACY &amp; FUTURE</div>
          <div class="section-sub">Standing Strong • Looking Forward</div>

          <h2 class="lf-heading">A Symbol of Perseverance and Progress</h2>

          <div class="story-block lf-story">
            <p>Today, XONOBICS stands as a symbol of perseverance and progress — a company that has evolved with time, adapted to change, and continuously redefined standards in every domain it touches. With a growing team, expanding global footprint, and unwavering core values, we look ahead to the next decade with renewed energy and vision — to build, empower, and inspire.</p>
            <!-- Brand image inside the story block, below text -->
            <div class="story-illustration">
              <img src="/images/xonobics_dairy1.png" class="lf-dairy-img" alt="Xonobics"/>
            </div>
          </div>

          <div class="sp-footer-row lf-footer">
            <span>Building Tomorrow</span><span>Empowering Today</span><span>Inspiring Always</span>
          </div>
          <span class="page-num page-num-r">6</span>
        </div>
      </div>

      @php
        $team = [
          ['name'=>'Mohd Naseer Uddin',       'title'=>'Manager',            'dept'=>'Operations',                   'joined'=>'2015',             'img'=>'/images/management/naseer.jpg',   'color'=>'#1565c0'],
          ['name'=>'Abdul Ateeq',             'title'=>'Billing Head',       'dept'=>'Finance',                      'joined'=>'2016',             'img'=>'/images/management/ateeq.jpg',    'color'=>'#0f7a45'],
          ['name'=>'Mohd Kashif',             'title'=>'Business Manager',   'dept'=>'Sales & Business Development', 'joined'=>'2017',             'img'=>'/images/management/kashif.jpg',   'color'=>'#b35a00'],
          ['name'=>'Mohammed Ghouse',         'title'=>'Compliance Manager', 'dept'=>'Operations',                   'joined'=>'Oct 2020',         'img'=>'/images/management/ghouse.jpg',   'color'=>'#1565c0'],
          ['name'=>'Jitendra Kamal Chowdary', 'title'=>'Query Head',         'dept'=>'Operations',                   'joined'=>'February 7, 2022', 'img'=>'/images/management/jitendra.jpg', 'color'=>'#1565c0'],
          ['name'=>'Mike Gill Christ',        'title'=>'Trainer',            'dept'=>'Human Resources',              'joined'=>'December 4, 2022', 'img'=>'/images/management/mike.jpg',     'color'=>'#7b2fa0'],
          ['name'=>'Gogunta Mani',              'title'=>'Sr. Tax Analyst',    'dept'=>'Finance',                      'joined'=>'Feb, 2023',        'img'=>'/images/mani.jpg',                 'color'=>'#0f7a45'],
          ['name'=>'Vishal',                  'title'=>'Executive',          'dept'=>'Operations',                   'joined'=>'2023',             'img'=>'/images/vishal.jpg',               'color'=>'#1565c0'],
        ];
        $chunks    = array_chunk($team, 4);   // 4 employees per page
        $totalPages = count($chunks);
        $startNum  = 7;  // page numbers continue from 7
      @endphp

      @foreach($chunks as $idx => $group)
      <div class="my-page">
        <div class="page-content inner-page ed-page">

          <!-- Header -->
          <div class="ed-header">
            <div>
              <div class="section-badge" style="background:#1565c0">EMPLOYEE DIRECTORY</div>
              <div class="section-sub" style="margin-top:4px">Core Team • Xonobics</div>
            </div>
            <div class="ed-page-counter">{{ $idx+1 }} / {{ $totalPages }}</div>
          </div>

          <!-- 4 employee cards -->
          <div class="ed-list">
            @foreach($group as $emp)
            <div class="ed-card">
              <!-- Photo -->
              <div class="ed-photo-wrap" style="border-color:{{ $emp['color'] }}">
                <img src="{{ $emp['img'] }}" class="ed-photo"
                  onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
                <div class="ed-ini" style="display:none;background:{{ $emp['color'] }}">
                  {{ strtoupper(substr($emp['name'],0,1).substr(strstr($emp['name'],' '),1,1)) }}
                </div>
              </div>
              <!-- Info -->
              <div class="ed-info">
                <div class="ed-name">{{ $emp['name'] }}</div>
                <div class="ed-role" style="color:{{ $emp['color'] }}">{{ $emp['title'] }}</div>
                <div class="ed-meta">
                  <span class="ed-dept">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                    {{ $emp['dept'] }}
                  </span>
                  <span class="ed-joined">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
                    Since {{ $emp['joined'] }}
                  </span>
                </div>
              </div>
              <!-- Accent bar -->
              <div class="ed-accent" style="background:{{ $emp['color'] }}"></div>
            </div>
            @endforeach
          </div>

          <!-- Footer -->
          <div class="ed-footer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Xonobics &nbsp;·&nbsp; Excellence Through People
          </div>

          <span class="page-num{{ $idx%2==1?' page-num-r':'' }}">{{ $startNum + $idx }}</span>
        </div>
      </div>
      @endforeach

      {{-- ══════════════════════════════════════════════════════════════════
           INDIVIDUAL EMPLOYEE JOURNEYS  (3 pages each: profile, career, future)
      ══════════════════════════════════════════════════════════════════════ --}}
      @php
      $journeys = [
        [
          'name'       => 'Mohd Naseer Uddin',
          'title'      => 'Manager',
          'dept'       => 'Operations Management & Team Leadership',
          'color'      => '#1565c0',
          'img'        => '/images/management/naseer.jpg',
          'badge_sub'  => 'Mohd Naseer Uddin - Manager',
          'intro'      => 'I began my career with Xonobics IT Services Pvt. Ltd. in 2015 as a Tax Analyst, and over the past nine years, I\'ve had the privilege of evolving through multiple roles and responsibilities. Through dedication, consistency, and a commitment to excellence, I\'ve grown both professionally and personally within the organization.',
          'quote'      => '"From Tax Analyst to Manager — A journey of dedication and growth"',
          'career_sub' => 'Mohd Naseer Uddin - From Analyst to Manager',
          'milestones_title' => 'Leadership Milestones',
          'milestones' => [
            ['icon'=>'trophy',  'title'=>'Manager Role',            'sub'=>'2022 promotion overseeing multiple functions'],
            ['icon'=>'doc',     'title'=>'Operational Efficiency',  'sub'=>'Driving efficiency and leading dynamic teams'],
            ['icon'=>'target',  'title'=>'10 Years of Growth',      'sub'=>'Consistent progression through dedication'],
          ],
          'career_story' => 'Starting as a Tax Analyst in 2015, I was promoted to the Data Team in 2016, and subsequently advanced to Data In-charge in 2017. In 2019, I transitioned into the Admin Department, and in 2020, I was elevated to Assistant Manager. My continued efforts and contributions led to my promotion as Manager in 2022, a role in which I currently oversee multiple functions, drive operational efficiency, and lead dynamic teams toward achieving organizational goals.',
          'career_footer' => ['Growth', 'Leadership', 'Excellence'],
          'future_sub'   => 'Mohd Naseer Uddin - Vision for Excellence',
          'future_paras' => [
            'Each phase of this journey has been an opportunity to embrace new challenges, enhance my leadership capabilities, and contribute meaningfully to the company\'s growth. I remain deeply grateful for the trust, support, and mentorship of my seniors, whose guidance — rooted in transparency, empowerment, and collaboration — has been instrumental in shaping my professional journey.',
            'As I look toward the future, I remain steadfast in my pursuit of excellence. I am committed to further enhancing my skill set, taking on new challenges, and contributing to my organization\'s long-term success. Every step of this journey has fueled my passion for learning and growing.',
          ],
          'future_footer' => ['Dedication', 'Growth', 'Excellence'],
          'extra_pages'  => [
            [
              'badge'    => 'PERSONAL VALUES',
              'sub'      => 'Mohd Naseer Uddin - What Drives Me',
              'values_title' => 'What Drives Me',
              'values'   => [
                ['icon'=>'heart',  'title'=>'Dedication & Patience',      'sub'=>'Foundation of hard work and perseverance'],
                ['icon'=>'star',   'title'=>'Continuous Learning',        'sub'=>'Passion for growth and new challenges'],
                ['icon'=>'trophy', 'title'=>'Mentorship & Gratitude',     'sub'=>'Valuing guidance rooted in transparency'],
              ],
              'story'    => 'I look forward to what lies ahead as I continue to build on the foundation of dedication, patience, and hard work that has served me so well over these remarkable years.',
              'footer'   => ['Dedication', 'Patience', 'Excellence'],
            ],
          ],
        ],
        [
          'name'       => 'Abdul Ateeq',
          'title'      => 'Billing Head',
          'dept'       => 'Financial Operations & Process Excellence',
          'color'      => '#0f7a45',
          'img'        => '/images/management/ateeq.jpg',
          'badge_sub'  => 'Abdul Ateeq - Billing Head',
          'intro'      => 'I began my career with Xonobics IT Services Pvt. Ltd. in 2016 as a Tax Analyst, marking the beginning of a journey characterized by continuous growth, learning, and unwavering dedication. Over the years, I have progressed through multiple roles that have not only strengthened my professional expertise but also shaped my leadership capabilities.',
          'quote'      => '"From Tax Analyst to Billing Head — A journey of growth and leadership"',
          'career_sub' => 'Abdul Ateeq - From Tax Analyst to Global Operations',
          'milestones_title' => 'Career Milestones',
          'milestones' => [
            ['icon'=>'trophy',  'title'=>'Query Manager (2017)',    'sub'=>'Managing client queries and optimizing accuracy'],
            ['icon'=>'globe',   'title'=>'Dubai Branch (2019–2022)','sub'=>'Overseeing international financial operations'],
            ['icon'=>'target',  'title'=>'9 Years of Growth',       'sub'=>'Strengthened financial and communication skills'],
          ],
          'career_story' => 'Starting as a Tax Analyst (2016), I was promoted to Query Manager (2017), where I took on broader responsibilities — managing client queries, optimizing accuracy, and enhancing overall process efficiency. In 2019, I was presented with the opportunity to work with our Dubai branch, where I spent three enriching years (2019–2022) overseeing financial operations, collaborating with international teams, and driving cross-border workflow efficiency.',
          'career_footer' => ['Growth', 'Leadership', 'Global'],
          'future_sub'   => 'Abdul Ateeq - Return to India and Senior Roles',
          'future_paras' => [
            'Upon returning to India in 2022, I transitioned into the role of Billing Head, where I implemented automation initiatives and streamlined workflow systems to improve accuracy, transparency, and turnaround times. Later that same year, I was promoted to Floor Manager, a position in which I currently lead multiple teams, foster collaboration, and ensure smooth day-to-day operations aligned with organizational objectives.',
          ],
          'future_milestones_title' => 'Leadership Achievements',
          'future_milestones' => [
            ['icon'=>'trending', 'title'=>'Billing Head (2022)',      'sub'=>'Implemented automation and streamlined workflows'],
            ['icon'=>'crown',    'title'=>'Floor Manager (2022)',     'sub'=>'Leading multiple teams and fostering collaboration'],
            ['icon'=>'target',   'title'=>'Operational Excellence',  'sub'=>'Ensuring smooth day-to-day operations'],
          ],
          'future_footer' => ['Leadership', 'Innovation', 'Operations'],
          'extra_pages'  => [
            [
              'badge'    => 'CURRENT LEADERSHIP',
              'sub'      => 'Abdul Ateeq - Floor Manager Responsibilities',
              'values_title' => 'Leadership Skills',
              'values'   => [
                ['icon'=>'people',  'title'=>'Team Leadership',          'sub'=>'Leading multiple teams with collaboration focus'],
                ['icon'=>'bulb',    'title'=>'Process Optimization',     'sub'=>'Ensuring smooth day-to-day operations'],
                ['icon'=>'target',  'title'=>'Organizational Alignment', 'sub'=>'Operations aligned with company objectives'],
              ],
              'story'    => 'As Floor Manager, I currently lead multiple teams, foster collaboration, and ensure smooth day-to-day operations aligned with organizational objectives. Every stage of this journey has been more than a title — it has been an opportunity to learn, adapt, and make meaningful contributions to the company\'s success.',
              'footer'   => ['Leadership', 'Operations', 'Impact'],
            ],
            [
              'badge'    => 'GRATITUDE & FUTURE',
              'sub'      => 'Abdul Ateeq - Commitment to Excellence',
              'values_title' => 'Professional Values',
              'values'   => [
                ['icon'=>'heart',  'title'=>'Deep Gratitude',          'sub'=>'For trust, mentorship, and guidance from leadership'],
                ['icon'=>'star',   'title'=>'Continuous Learning',     'sub'=>'Committed to ongoing professional development'],
                ['icon'=>'trophy', 'title'=>'Operational Excellence',  'sub'=>'Driving sustained growth and success'],
              ],
              'story'    => 'I am deeply grateful for the trust, mentorship, and guidance extended by the leadership team at Xonobics, whose support has been instrumental in my professional evolution. Looking ahead, I remain committed to continuous learning, operational excellence, and contributing to the sustained growth and success of Xonobics IT Services Pvt. Ltd.',
              'footer'   => ['Gratitude', 'Growth', 'Excellence'],
            ],
          ],
        ],
        [
          'name'       => 'Mohd Kashif',
          'title'      => 'Business Manager',
          'dept'       => 'Sales & Business Development',
          'color'      => '#b35a00',
          'img'        => '/images/management/kashif.jpg',
          'badge_sub'  => 'Mohd Kashif - Business Manager',
          'intro'      => 'I began my journey with Xonobics IT Services in 2017 as a Tax Analyst. In my very first year, I successfully completed over 130 client files, earning recognition in the form of a mobile reward and a performance bonus. My consistent results and growing expertise led to my promotion to the Query Team, where I worked under the mentorship of Mr. Abdul Abdul Ateeq.',
          'quote'      => '"From Tax Analyst to Business Manager - A journey of growth and dedication"',
          'career_sub' => 'Mohd Kashif - From Analyst to Leadership Roles',
          'milestones_title' => 'Early Achievements',
          'milestones' => [
            ['icon'=>'trophy',  'title'=>'130+ Client Files Completed',        'sub'=>'First year performance milestone'],
            ['icon'=>'star',    'title'=>'Mobile Reward & Performance Bonus',  'sub'=>'Recognition for outstanding results'],
          ],
          'career_story' => 'My consistent results and growing expertise led to my promotion to the Query Team, where I worked under the mentorship of Mr. Abdul Abdul Ateeq. Through dedication and steady performance, I advanced to Query Department Head, managing and successfully closing more than 400 files.',
          'career_footer' => ['Growth', 'Leadership', 'Excellence'],
          'future_sub'   => 'Mohd Kashif - Strategic Leadership',
          'future_paras' => [
            'After a year of leading the department, I transitioned into the Billing Division, where I consistently achieved performance targets and was soon promoted to Billing Head.',
          ],
          'future_footer' => ['Strategy', 'Growth', 'Excellence'],
          'extra_pages'  => [
            [
              'badge'    => 'CURRENT ROLE & VALUES',
              'sub'      => 'Mohd Kashif - Strategic Leadership',
              'values_title' => 'Leadership Milestones',
              'values'   => [
                ['icon'=>'crown',   'title'=>'Query Department Head',       'sub'=>'Leading the department for one year'],
                ['icon'=>'doc',     'title'=>'400+ Files Managed',          'sub'=>'Successfully closed under leadership'],
                ['icon'=>'heart',   'title'=>'Billing Division Transition', 'sub'=>'Consistent performance targets achieved'],
                ['icon'=>'target',  'title'=>'8 Years of excellence',       'sub'=>'Outstanding achievements in performance'],
              ],
              'story'    => 'With each milestone, I took on broader responsibilities — from managing individual client files to overseeing business client operations and filings. My continuous progress and contribution to organizational goals led to my promotion as Business Manager, a role that allows me to support the company\'s growth through strategic execution and collaborative leadership.',
              'footer'   => ['Integrity', 'Innovation', 'Progress'],
            ],
            [
              'badge'    => 'COMPANY EXCELLENCE',
              'sub'      => 'Mohd Kashif - Why Xonobics Stands Out',
              'values_title' => 'What I Value Most',
              'values'   => [
                ['icon'=>'heart',   'title'=>'Supportive Environment',       'sub'=>'Fair opportunities and transparent recognition'],
                ['icon'=>'star',    'title'=>'Well-Structured Incentives',   'sub'=>'Rewards effort and dedication'],
                ['icon'=>'trophy',  'title'=>'Career Advancement',           'sub'=>'Opportunities for continuous growth'],
              ],
              'story'    => 'Xonobics is an ideal platform for beginners and professionals alike, offering hands-on experience, continuous learning, and exposure to multiple departments. With strong management support and a culture that nurtures both personal and professional growth, I take pride in being part of an organization that stands for integrity, innovation, and progress.',
              'footer'   => ['Integrity', 'Innovation', 'Progress'],
            ],
          ],
        ],
        [
          'name'       => 'Mohammed Ghouse',
          'title'      => 'Compliance Manager',
          'dept'       => 'Operations & Compliance',
          'color'      => '#1565c0',
          'img'        => '/images/management/ghouse.png',
          'badge_sub'  => 'Mohammed Ghouse - Compliance Manager',
          'intro'      => 'I joined Xonobics in October 2020, bringing with me a strong background in compliance and operations management. Since joining, I have been committed to upholding the highest standards of regulatory compliance and operational integrity across all organizational functions.',
          'quote'      => '"Compliance is not just a requirement — it is a commitment to excellence"',
          'career_sub' => 'Mohammed Ghouse - Building Compliance Excellence',
          'milestones_title' => 'Compliance Milestones',
          'milestones' => [
            ['icon'=>'trophy',  'title'=>'Compliance Manager',      'sub'=>'Overseeing all compliance functions'],
            ['icon'=>'doc',     'title'=>'Regulatory Standards',    'sub'=>'Ensuring 100% compliance adherence'],
            ['icon'=>'target',  'title'=>'5 Years of Excellence',   'sub'=>'Consistent compliance leadership'],
          ],
          'career_story' => 'Joining Xonobics as a compliance professional in 2020, I immediately took ownership of establishing and strengthening the compliance framework. Through systematic process improvements and team training, I have built a culture of compliance that protects the organization and ensures adherence to all regulatory requirements. My promotion to Compliance Manager reflects the trust the organization has placed in my ability to lead this critical function.',
          'career_footer' => ['Compliance', 'Integrity', 'Excellence'],
          'future_sub'   => 'Mohammed Ghouse - Vision for Compliance',
          'future_paras' => [
            'Building a strong compliance culture requires continuous effort, clear communication, and unwavering commitment. My time at Xonobics has reinforced my belief that compliance and business growth are not mutually exclusive — they are complementary.',
            'Moving forward, I aim to further strengthen our compliance framework, leverage technology for better monitoring, and ensure Xonobics remains a model of regulatory excellence in our industry.',
          ],
          'future_footer' => ['Compliance', 'Growth', 'Excellence'],
        ],
        [
          'name'       => 'Jitendra Kamal Chowdary',
          'title'      => 'Query Head',
          'dept'       => 'Operations & Query Management',
          'color'      => '#1565c0',
          'img'        => '/images/management/jitendra.jpg',
          'badge_sub'  => 'Jitendra Kamal Chowdary - Query Head',
          'intro'      => 'I joined Xonobics on February 7, 2022, stepping into a role that required both analytical precision and strong team coordination. As Query Head, I manage complex operational queries, oversee resolution processes, and ensure seamless communication across departments.',
          'quote'      => '"Every query resolved is a step toward operational perfection"',
          'career_sub' => 'Jitendra Kamal Chowdary - Operations Excellence',
          'milestones_title' => 'Operational Milestones',
          'milestones' => [
            ['icon'=>'trophy',  'title'=>'Query Head',              'sub'=>'Leading query resolution operations'],
            ['icon'=>'doc',     'title'=>'Process Efficiency',      'sub'=>'Streamlining query management systems'],
            ['icon'=>'target',  'title'=>'3+ Years of Impact',      'sub'=>'Consistent operational excellence'],
          ],
          'career_story' => 'Since joining in February 2022, I have built and refined the query management framework at Xonobics. By implementing structured resolution processes, training the team on best practices, and establishing clear escalation paths, I have significantly reduced query resolution times and improved client satisfaction. The Query Head role has allowed me to combine my analytical skills with leadership capabilities to deliver measurable operational improvements.',
          'career_footer' => ['Efficiency', 'Leadership', 'Excellence'],
          'future_sub'   => 'Jitendra - Vision for Operations',
          'future_paras' => [
            'Operations excellence is a continuous journey, not a destination. At Xonobics, I have found an environment that encourages innovation, rewards dedication, and supports professional growth.',
            'My vision is to build a world-class query management system that serves as a benchmark within our industry, while developing a team of skilled professionals who are equipped to handle any operational challenge with confidence.',
          ],
          'future_footer' => ['Efficiency', 'Innovation', 'Excellence'],
        ],
        [
          'name'       => 'Mike Gill Christ',
          'title'      => 'Trainer',
          'dept'       => 'Human Resources & Training',
          'color'      => '#7b2fa0',
          'img'        => '/images/management/mike.jpg',
          'badge_sub'  => 'Mike Gill Christ - Trainer',
          'intro'      => 'I joined Xonobics on December 4, 2022, as a Trainer with a mission to build capability and nurture talent within the organization. My role is to design and deliver training programs that empower employees to perform at their best and align with the company\'s vision of excellence.',
          'quote'      => '"Great organizations are built by great people — and great people are built through great training"',
          'career_sub' => 'Mike Gill Christ - Building Human Excellence',
          'milestones_title' => 'Training Milestones',
          'milestones' => [
            ['icon'=>'trophy',  'title'=>'Lead Trainer',            'sub'=>'Designing organizational training programs'],
            ['icon'=>'doc',     'title'=>'Capability Building',     'sub'=>'Developing employee competencies'],
            ['icon'=>'target',  'title'=>'2+ Years of Impact',      'sub'=>'Consistent training excellence'],
          ],
          'career_story' => 'Joining as a Trainer, I immediately set about understanding the organization\'s learning needs and designing programs that address both technical and soft skill requirements. From onboarding new employees to upskilling existing team members, I have built a comprehensive training ecosystem at Xonobics. My approach combines structured curriculum design with engaging delivery methods to ensure maximum learning retention and application.',
          'career_footer' => ['Training', 'Development', 'Excellence'],
          'future_sub'   => 'Mike Gill Christ - Vision for People Development',
          'future_paras' => [
            'Training is not just about imparting knowledge — it is about transforming potential into performance. At Xonobics, I have had the opportunity to make a real difference in people\'s professional journeys, and that inspires me every day.',
            'My future focus is on building a learning culture at Xonobics, introducing digital learning tools, and creating development pathways that allow every employee to grow and contribute meaningfully to the organization\'s success.',
          ],
          'future_footer' => ['Learning', 'Growth', 'Excellence'],
        ],
        [
          'name'       => 'Gogunta Mani',
          'title'      => 'Sr. Tax Analyst',
          'dept'       => 'Finance & Taxation',
          'color'      => '#0f7a45',
          'img'        => '/images/mani.jpg',
          'badge_sub'  => 'Gogunta Mani - Sr. Tax Analyst',
          'intro'      => 'I joined Xonobics in February 2023 as a Sr. Tax Analyst, bringing specialized expertise in taxation and financial compliance. My focus has been on ensuring accurate tax computations, maintaining regulatory compliance, and supporting the financial health of the organization.',
          'quote'      => '"Precision in taxation is the foundation of financial trust"',
          'career_sub' => 'Gogunta Mani - Tax Expertise & Financial Precision',
          'milestones_title' => 'Professional Milestones',
          'milestones' => [
            ['icon'=>'trophy',  'title'=>'Sr. Tax Analyst',         'sub'=>'Leading tax analysis and compliance'],
            ['icon'=>'doc',     'title'=>'Tax Compliance',          'sub'=>'Ensuring regulatory adherence'],
            ['icon'=>'target',  'title'=>'2+ Years of Excellence',  'sub'=>'Consistent analytical performance'],
          ],
          'career_story' => 'Since joining Xonobics in 2023, I have taken ownership of the tax analysis function, establishing systematic approaches to tax computation, filing, and compliance. My expertise in taxation has helped the organization navigate complex regulatory requirements while optimizing financial outcomes. I work closely with the finance team to ensure that all tax obligations are met accurately and on time, contributing to the organization\'s financial integrity.',
          'career_footer' => ['Taxation', 'Compliance', 'Excellence'],
          'future_sub'   => 'Gogunta Mani - Vision for Financial Excellence',
          'future_paras' => [
            'The field of taxation is constantly evolving, and staying ahead requires continuous learning and adaptation. At Xonobics, I have found a supportive environment that encourages professional development and rewards expertise.',
            'My vision is to further deepen my tax expertise, explore advanced areas of financial planning, and contribute to building a tax function that serves as a strategic asset for the organization\'s long-term financial goals.',
          ],
          'future_footer' => ['Precision', 'Growth', 'Excellence'],
        ],
        [
          'name'       => 'Vishal',
          'title'      => 'Executive',
          'dept'       => 'Operations',
          'color'      => '#1565c0',
          'img'        => '/images/vishal.jpg',
          'badge_sub'  => 'Vishal - Executive',
          'intro'      => 'I joined Xonobics in 2023 as an Executive in Operations, bringing energy, dedication, and a commitment to contributing to the organization\'s growth. Since joining, I have been actively involved in supporting operational functions and learning from experienced colleagues.',
          'quote'      => '"Every day is an opportunity to learn, grow, and contribute"',
          'career_sub' => 'Vishal - Building Operational Foundation',
          'milestones_title' => 'Professional Milestones',
          'milestones' => [
            ['icon'=>'trophy',  'title'=>'Operations Executive',    'sub'=>'Supporting core operational functions'],
            ['icon'=>'doc',     'title'=>'Team Collaboration',      'sub'=>'Contributing to team efficiency'],
            ['icon'=>'target',  'title'=>'Growing Excellence',      'sub'=>'Continuous professional development'],
          ],
          'career_story' => 'Joining Xonobics as an Operations Executive in 2023, I have embraced every opportunity to learn and contribute. Working alongside experienced professionals, I have developed a strong understanding of operational processes and the high standards Xonobics maintains. I am committed to growing within the organization and taking on increasing responsibilities as I build my expertise.',
          'career_footer' => ['Operations', 'Learning', 'Excellence'],
          'future_sub'   => 'Vishal - Vision for Professional Growth',
          'future_paras' => [
            'Starting my career at Xonobics has been an incredible experience. The culture of excellence, the mentorship of senior colleagues, and the opportunities for growth have shaped my professional foundations.',
            'I aspire to grow within Xonobics, take on leadership responsibilities, and contribute to the organization\'s mission of delivering excellence. I am committed to continuous learning and bringing my best to every challenge.',
          ],
          'future_footer' => ['Growth', 'Excellence', 'Leadership'],
        ],
      ];
      // SVG icons for milestones
      $icons = [
        'trophy' => '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a1 1 0 0 0-1-1h-2"/><path d="M12 17c-3.87 0-7-3.13-7-7V4h14v6c0 3.87-3.13 7-7 7z"/><path d="M12 17v4"/><path d="M8 21h8"/></svg>',
        'doc'    => '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
        'target' => '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        'heart'    => '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        'star'     => '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'globe'    => '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        'trending' => '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        'crown'    => '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 19h20M3 19l2-9 4.5 4.5L12 5l2.5 9.5L19 10l2 9"/></svg>',
        'people'   => '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        'bulb'     => '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
      ];
      $personStartPage = 9; // pages 7-8 used by directory, journeys start at 9
      @endphp

      {{-- ══════════════════════════════════════════════════════════════════
           HARDCODED EMPLOYEE JOURNEY PAGES
           Each employee has custom-designed pages with full control
      ══════════════════════════════════════════════════════════════════ --}}
      @include('employee-directory-hardcoded')

      {{-- Back cover starts here --}}
      <div class="my-page" data-density="hard">
        <div class="page-content back-page">
          <div class="back-logo-box"><img src="/images/xonobics_logo.png" class="back-logo" alt="Xonobics"/></div>
          <div class="back-title">XONOBICS</div>
          <div class="back-sub">Call Center &amp; Consulting</div>
          <div class="back-line"></div>
          <div class="back-quote">"Excellence is not a destination;<br/>it is a continuous journey."</div>
          <div class="back-foot"><div>Est. 2012 · Hyderabad, India</div><div>© 2025 Xonobics. All rights reserved.</div></div>
        </div>
      </div>

    </div><!-- /#book -->
  </div><!-- /#book-host -->

  <button class="nav-btn" id="btn-next">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
  </button>
</div>

<!-- Bottom -->
<div id="bottom">
  <div id="dots">
    <button class="dot on" data-spread="0"></button>
    <button class="dot" data-spread="1"></button>
    <button class="dot" data-spread="2"></button>
    <button class="dot" data-spread="3"></button>
  </div>
  <div id="hint">Drag corners to flip · ← → arrow keys · Swipe</div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
  // ── Fixed page size — StPageFlip uses stretch to fill the stage ──
  // Base size is a reference dimension; the library scales with
  // size:"stretch" + minWidth/maxWidth/minHeight/maxHeight.
  const pageW = 500;
  const pageH = 700;

  // ── Init PageFlip ─────────────────────────────────────────────────
  const pf = new St.PageFlip(document.getElementById('book'), {
    width:               pageW,
    height:              pageH,
    size:                'stretch',
    minWidth:            250,
    maxWidth:            600,
    minHeight:           350,
    maxHeight:           900,
    showCover:           true,
    drawShadow:          true,
    flippingTime:        650,
    usePortrait:         false,
    autoSize:            true,
    maxShadowOpacity:    0.35,
    mobileScrollSupport: false,
    disableFlipByClick:  true,
    startZIndex:         1,
    swipeDistance:       40,
    clickEventForward:   true,
    useMouseEvents:      true,
  });

  pf.loadFromHTML(document.querySelectorAll('.my-page'));

  // ── Page tracking ─────────────────────────────────────────────────
  const pgLabel = document.getElementById('pg-label');
  const dots    = document.querySelectorAll('.dot');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const total   = { pages: 7 };

  const dotMap = [0, 1, 3, 5]; // page index for each dot

  pf.on('init', e => {
    total.pages = pf.getPageCount();
    updateUI(e.data.page);
  });
  pf.on('flip', e => updateUI(e.data));

  function updateUI(page) {
    if (page <= 0)               pgLabel.textContent = 'Cover';
    else if (page >= total.pages-1) pgLabel.textContent = 'Back Cover';
    else                         pgLabel.textContent = 'Pages '+page+'–'+(page+1);

    btnPrev.classList.toggle('hidden', page <= 0);
    btnNext.classList.toggle('hidden', page >= total.pages - 1);

    // Active dot
    let di = 0;
    if (page <= 0) di = 0;
    else if (page <= 2) di = 1;
    else if (page <= 4) di = 2;
    else di = 3;
    dots.forEach((d,i) => d.classList.toggle('on', i === di));
  }

  // ── Navigation ────────────────────────────────────────────────────
  btnPrev.addEventListener('click', () => pf.flipPrev());
  btnNext.addEventListener('click', () => pf.flipNext());
  dots.forEach((d, i) => {
    d.addEventListener('click', () => pf.flip(dotMap[i]));
  });

  // ── Keyboard ──────────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') pf.flipNext();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   pf.flipPrev();
    if (e.key === 'Escape' && !document.fullscreenElement)
      window.location.href = '{{ route("employee-handbook") }}';
  });

  // ── Fullscreen ────────────────────────────────────────────────────
  const fsBtn    = document.getElementById('fs-btn');
  const fsExpand = document.getElementById('fs-icon-expand');
  const fsShrink = document.getElementById('fs-icon-shrink');

  fsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen().catch(()=>{});
  });
  document.addEventListener('fullscreenchange', () => {
    const fs = !!document.fullscreenElement;
    fsExpand.style.display = fs ? 'none' : '';
    fsShrink.style.display = fs ? '' : 'none';
  });

});
</script>
</body>
</html>
