<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import USAMapEmbed from './USAMapEmbed.vue';

const props = defineProps({ pages: Array, modules: Array, isDark: Boolean });
const emit  = defineEmits(['exit']);

// ── core state ────────────────────────────────────────────────────────────────
const idx          = ref(0);
const beatIdx      = ref(-1);
const autoPlay     = ref(false);
const sliding      = ref(false);
const slideDir     = ref(1);
const hovered      = ref(null);
const showThumb    = ref(false);
const heroKey      = ref(0);
const mapMaximized = ref(false);
const slideEl      = ref(null);
let   beatTimer    = null;
let   slideTimer   = null;

// ── Tour ──────────────────────────────────────────────────────────────────────
const showTour  = ref(true);
const tourStep  = ref(0);
const tourSteps = [
    {
        icon: '🎬',
        title: 'Welcome to Presentation Mode',
        body: 'This is your full-screen training slide deck — all 26 manual pages as animated slides. Here\'s a quick guide to get started.',
        kbd: null,
    },
    {
        icon: '⌨️',
        title: 'Navigate Slides',
        body: 'Use keyboard arrows or the bottom buttons to move between slides.',
        keys: [{ k: '←', label: 'Previous slide' }, { k: '→', label: 'Next slide' }],
        highlight: 'footer',
    },
    {
        icon: '✨',
        title: 'Reveal Content Points',
        body: 'Each slide reveals content one point at a time. Press Space or → to show the next point. Click anywhere on the content area to reveal all at once.',
        keys: [{ k: 'Space', label: 'Next point' }, { k: '→', label: 'Also next point' }],
        highlight: 'content',
    },
    {
        icon: '▶',
        title: 'Auto-Play Mode',
        body: 'Toggle Auto-Play in the top bar to automatically step through all points and advance slides every 7 seconds.',
        keys: [{ k: 'Auto', label: 'Button in top bar' }],
        highlight: 'topbar',
    },
    {
        icon: '📋',
        title: 'Slides Panel & Fullscreen',
        body: 'Press T or click the panel button to open the slide list. Press F to go fullscreen. Press Esc to exit at any time.',
        keys: [{ k: 'T', label: 'Slide panel' }, { k: 'F', label: 'Fullscreen' }, { k: 'Esc', label: 'Exit' }],
        highlight: 'topbar',
    },
];
function tourNext() {
    if (tourStep.value < tourSteps.length - 1) { tourStep.value++; }
    else { showTour.value = false; }
}
function tourPrev() { if (tourStep.value > 0) tourStep.value--; }
function skipTour()  { showTour.value = false; }

// ── computed ──────────────────────────────────────────────────────────────────
const total       = computed(() => props.pages?.length ?? 0);
const page        = computed(() => props.pages?.[idx.value] ?? null);
const progress    = computed(() => total.value > 1 ? (idx.value / (total.value - 1)) * 100 : 0);
const allShown    = computed(() => beatIdx.value >= beats.value.length - 1);

const beats = computed(() => {
    const raw = Array.isArray(page.value?.verbatim_text) ? page.value.verbatim_text : [];
    return raw.map((text, i) => ({ id: i, text, type: classify(text) }));
});
const visible = computed(() => beats.value.slice(0, beatIdx.value + 1));

function classify(t) {
    if (!t) return 'normal';
    if (t.startsWith('•') || t.startsWith('❖') || t.startsWith('- ')) return 'bullet';
    if (t === t.toUpperCase() && t.trim().length > 0 && t.length < 80) return 'heading';
    return 'normal';
}

// ── module accent colours ─────────────────────────────────────────────────────
const accents = {
    'mod-1':'#0d9488','mod-2':'#0284c7','mod-3':'#059669','mod-4':'#6366f1',
    'mod-5':'#7c3aed','mod-6':'#0e7490','mod-7':'#0891b2','mod-8':'#10b981',
    'mod-9':'#e11d48','mod-10':'#d97706','mod-11':'#65a30d','mod-12':'#0284c7',
};
const accent = computed(() => accents[page.value?.module_key] ?? '#0d9488');

// ── navigation ────────────────────────────────────────────────────────────────
function reset() {
    beatIdx.value = -1;
    nextTick(() => slideEl.value?.scrollTo({ top:0, behavior:'instant' }));
}
function startBeats() {
    clearTimeout(beatTimer);
    beatIdx.value = -1;
    // Only auto-step through beats when autoPlay is on
    if (!autoPlay.value) return;
    let i = 0;
    const step = () => {
        if (i < beats.value.length) {
            beatIdx.value = i++;
            // Progressive stagger: first beat fast, subsequent ones slower so animation can breathe
            const delay = i === 1 ? 100 : 620;
            beatTimer = setTimeout(step, delay);
        }
    };
    beatTimer = setTimeout(step, 200);
}
function goTo(n, dir = 1) {
    if (sliding.value || n < 0 || n >= total.value) return;
    slideDir.value = dir;
    sliding.value  = true;
    clearTimeout(beatTimer);
    setTimeout(() => {
        idx.value     = n;
        reset();
        sliding.value = false;
        // bump heroKey 80ms after slide settles so keyframes fire on a fresh mount
        setTimeout(() => { heroKey.value++; }, 80);
        startBeats();
    }, 320);
}
function next()      { goTo(idx.value + 1,  1); }
function prev()      { goTo(idx.value - 1, -1); }
function nextBeat()  { if (beatIdx.value < beats.value.length - 1) beatIdx.value++; else next(); }
function prevBeat()  { if (beatIdx.value > 0) beatIdx.value--; else prev(); }

// ── Scroll + highlight latest beat ───────────────────────────────────────────
watch(beatIdx, (newIdx) => {
    if (newIdx < 0) return;
    nextTick(() => {
        if (!slideEl.value) return;
        const el = slideEl.value.querySelector(`[data-beat="${newIdx}"]`);
        if (!el) return;
        // smooth scroll into view within the beats-area container
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // flash highlight
        el.classList.remove('beat-flash');
        void el.offsetWidth; // force reflow to restart animation
        el.classList.add('beat-flash');
        setTimeout(() => el.classList.remove('beat-flash'), 800);
    });
});
watch(autoPlay, v => {
    if (!v) {
        clearTimeout(slideTimer);
        clearTimeout(beatTimer);
    } else {
        // Start stepping remaining beats from current position
        clearTimeout(beatTimer);
        let i = beatIdx.value + 1;
        const step = () => {
            if (i < beats.value.length) {
                beatIdx.value = i++;
                const delay = i === beatIdx.value + 1 ? 100 : 620;
                beatTimer = setTimeout(step, delay);
            }
        };
        beatTimer = setTimeout(step, 200);
    }
});
watch(allShown, shown => {
    if (shown && autoPlay.value)
        slideTimer = setTimeout(() => { if (autoPlay.value) next(); }, 7000);
});

// ── keyboard ──────────────────────────────────────────────────────────────────
function onKey(e) {
    if (showTour.value) {
        if (e.key === 'Escape')     { skipTour(); return; }
        if (e.key === 'ArrowRight') { e.preventDefault(); tourNext(); return; }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); tourPrev(); return; }
        return;
    }
    if (e.key === 'Escape') {
        if (mapMaximized.value) { mapMaximized.value = false; return; }
        emit('exit'); return;
    }
    if (e.key === 'ArrowRight' || e.key === ' ')    { e.preventDefault(); nextBeat(); }
    if (e.key === 'ArrowLeft')                      { e.preventDefault(); prevBeat(); }
    if (e.key === 'f' || e.key === 'F')             { toggleFS(); }
    if (e.key === 't' || e.key === 'T')             { showThumb.value = !showThumb.value; }
}
function toggleFS() {
    const el = document.getElementById('pres-root');
    if (!document.fullscreenElement) el?.requestFullscreen?.();
    else document.exitFullscreen?.();
}

onMounted(()        => { window.addEventListener('keydown', onKey); startBeats(); });
onBeforeUnmount(()  => {
    window.removeEventListener('keydown', onKey);
    clearTimeout(beatTimer); clearTimeout(slideTimer);
    if (document.fullscreenElement) document.exitFullscreen?.();
});
</script>

<template>
<div id="pres-root" class="pres-root" :style="`--accent:${accent}`">

    <!-- animated bg mesh -->
    <div class="pres-bg">
        <div class="mesh-blob blob-1" :style="`background:${accent}22`"></div>
        <div class="mesh-blob blob-2" :style="`background:${accent}15`"></div>
        <div class="mesh-blob blob-3"></div>
    </div>

    <!-- ── TOP BAR ─────────────────────────────────────────────────────────── -->
    <header class="pres-topbar">
        <!-- slide badge -->
        <div class="flex items-center gap-3">
            <span class="slide-badge">{{ idx + 1 }}<span class="opacity-40">/{{ total }}</span></span>
            <span class="module-label hidden sm:block">{{ page?.module_title }}</span>
        </div>

        <!-- progress track -->
        <div class="progress-track">
            <div class="progress-fill" :style="`width:${progress}%;background:${accent}`"></div>
            <!-- slide ticks -->
            <div v-for="(p,i) in pages" :key="i"
                class="tick" :style="`left:${(i/(total-1))*100}%`"
                :class="i === idx ? 'tick-active' : i < idx ? 'tick-done' : 'tick-future'"
                @click="goTo(i, i > idx ? 1 : -1)">
            </div>
        </div>

        <!-- controls -->
        <div class="flex items-center gap-1.5">
            <button class="ctrl-btn" :class="autoPlay && 'ctrl-active'" @click="autoPlay=!autoPlay" title="Auto-play (A)">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path v-if="!autoPlay" d="M8 5v14l11-7z"/>
                    <path v-else d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
            </button>
            <button class="ctrl-btn" :class="showThumb && 'ctrl-active'" @click="showThumb=!showThumb" title="Slides (T)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
            </button>
            <button class="ctrl-btn" @click="toggleFS" title="Fullscreen (F)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                </svg>
            </button>
            <button class="ctrl-exit" @click="emit('exit')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                <span class="hidden sm:inline text-xs font-bold">Exit</span>
            </button>
        </div>
    </header>

    <!-- ── BODY ────────────────────────────────────────────────────────────── -->
    <div class="pres-body">

        <!-- slide panel -->
        <Transition :name="slideDir > 0 ? 'slide-fwd' : 'slide-bwd'" mode="out-in">
        <div :key="idx" class="pres-slide">

            <!-- slide hero header -->
            <div class="slide-hero" :style="`--hue:${accent}`" :key="heroKey">
                <div class="hero-glow" :style="`background:${accent}`"></div>
                <div class="hero-content">
                    <div class="page-eyebrow eyebrow-animate">
                        <span class="eyebrow-chip" :style="`border-color:${accent}60;color:${accent};background:${accent}18`">
                            Page {{ page?.page_number }}
                        </span>
                        <span class="eyebrow-dot" :style="`background:${accent}`"></span>
                        <span class="opacity-60 text-xs font-medium text-white">{{ page?.module_title }}</span>
                    </div>
                    <h1 class="slide-title title-animate">{{ page?.title }}</h1>
                </div>
            </div>

            <!-- content beats -->
            <div ref="slideEl" class="beats-area">
                <TransitionGroup name="beat" tag="div" class="beats-list">
                    <template v-for="beat in visible" :key="beat.id">

                        <!-- HEADING -->
                        <div v-if="beat.type==='heading'" class="beat-heading"
                            :data-beat="beat.id"
                            :style="`transition-delay:${beat.id * 30}ms`">
                            <div class="beat-rule" :style="`background:linear-gradient(90deg,${accent},transparent)`"></div>
                            <span class="beat-heading-text" :style="`color:${accent};border-color:${accent}40;background:${accent}12`">
                                {{ beat.text }}
                            </span>
                            <div class="beat-rule" :style="`background:linear-gradient(270deg,${accent},transparent)`"></div>
                        </div>

                        <!-- BULLET -->
                        <div v-else-if="beat.type==='bullet'" class="beat-bullet"
                            :data-beat="beat.id"
                            :style="`transition-delay:${beat.id * 30}ms`">
                            <span class="bullet-dot" :style="`background:${accent};box-shadow:0 0 8px ${accent}80`"></span>
                            <p class="beat-bullet-text">{{ beat.text.replace(/^[•❖\-]\s*/,'') }}</p>
                        </div>

                        <!-- NORMAL -->
                        <div v-else class="beat-normal"
                            :data-beat="beat.id"
                            :style="`transition-delay:${beat.id * 30}ms`">
                            <p class="beat-normal-text">{{ beat.text }}</p>
                        </div>

                        <!-- page 2 map -->
                        <div v-if="page?.page_number===2 && beat.text==='USA STATES'" :key="'map'" class="mt-3 map-inline-wrap" @click.stop>
                            <!-- Expand button -->
                            <div class="map-expand-bar">
                                <span class="map-expand-label">🗺 United States Map</span>
                                <button class="map-expand-btn" @click.stop="mapMaximized = true" title="Maximize map">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                                    </svg>
                                    <span class="text-xs font-bold">Expand</span>
                                </button>
                            </div>
                            <!-- Inline preview (shorter height) -->
                            <div class="map-inline-preview pointer-events-auto">
                                <USAMapEmbed :is-dark="true"/>
                            </div>
                        </div>

                    </template>
                </TransitionGroup>

                <!-- remaining hint -->
                <Transition name="fade">
                    <div v-if="!allShown && beatIdx >= 0" class="beat-hint" @click.stop="nextBeat">
                        <span class="hint-pill" :style="`border-color:${accent}40;color:${accent}`">
                            <svg class="w-3 h-3 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                            </svg>
                            {{ beats.length - beatIdx - 1 }} more
                        </span>
                    </div>
                </Transition>
            </div>

            <!-- beat progress dots -->
            <div class="beat-dots">
                <div v-for="(_,i) in beats" :key="i"
                    class="beat-dot"
                    :class="i <= beatIdx ? 'dot-on' : 'dot-off'"
                    :style="i <= beatIdx ? `background:${accent}` : ''"
                    @click.stop="beatIdx = i">
                </div>
            </div>

        </div>
        </Transition>

        <!-- ── SIDEBAR ────────────────────────────────────────────────────── -->
        <aside class="pres-sidebar" :class="showThumb ? 'sidebar-open' : 'sidebar-closed'">
            <div class="sidebar-header">
                <span class="sidebar-title">All Slides</span>
                <button class="ctrl-btn" @click="showThumb=false">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="sidebar-list">
                <button v-for="(p,i) in pages" :key="p.page_number"
                    class="sidebar-item"
                    :class="[i===idx && 'item-active', i<idx && 'item-done']"
                    :style="i===idx ? `border-left-color:${accent};background:${accent}18` : ''"
                    @click="goTo(i, i>idx?1:-1)"
                    @mouseenter="hovered=i" @mouseleave="hovered=null">
                    <span class="item-num"
                        :style="i===idx ? `background:${accent}` : i<idx ? `background:${accent}50` : ''">
                        {{ p.page_number }}
                    </span>
                    <span class="item-title">{{ p.title }}</span>
                    <Transition name="fade">
                        <span v-if="i===idx" class="item-indicator" :style="`background:${accent}`"></span>
                    </Transition>
                </button>
            </div>
        </aside>
    </div>

    <!-- ── BOTTOM NAV ──────────────────────────────────────────────────────── -->
    <footer class="pres-footer">
        <button class="nav-btn nav-prev" :disabled="idx===0" @click="prev">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span>Previous</span>
        </button>

        <!-- slide thumb strip -->
        <div class="thumb-strip">
            <button v-for="(p,i) in pages" :key="i"
                class="thumb-pip"
                :style="i===idx ? `background:${accent};width:20px` : i<idx ? `background:${accent}60` : ''"
                @click="goTo(i, i>idx?1:-1)">
            </button>
        </div>

        <button class="nav-btn nav-next" :disabled="idx>=total-1" @click="next"
            :style="`background:${accent}`">
            <span>Next</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
        </button>
    </footer>

    <!-- keyboard hints -->
    <Transition name="fade">
        <div v-if="idx===0 && beatIdx<1 && !showTour" class="kbd-hints">
            <kbd>← →</kbd> slides &nbsp; <kbd>Space</kbd> next point &nbsp; <kbd>T</kbd> panel &nbsp; <kbd>F</kbd> fullscreen &nbsp; <kbd>Esc</kbd> exit
        </div>
    </Transition>

    <!-- ── TOUR OVERLAY ────────────────────────────────────────────────────── -->
    <Transition name="tour-fade">
        <div v-if="showTour" class="tour-overlay" @click.self="skipTour">
            <div class="tour-card">
                <!-- Step dots -->
                <div class="tour-dots">
                    <span v-for="(_, i) in tourSteps" :key="i"
                        class="tour-dot"
                        :class="i === tourStep ? 'dot-active' : i < tourStep ? 'dot-done' : 'dot-future'"
                        @click="tourStep = i">
                    </span>
                </div>

                <!-- Icon -->
                <div class="tour-icon">{{ tourSteps[tourStep].icon }}</div>

                <!-- Content -->
                <Transition name="tour-step" mode="out-in">
                    <div :key="tourStep" class="tour-body">
                        <h2 class="tour-title">{{ tourSteps[tourStep].title }}</h2>
                        <p class="tour-text">{{ tourSteps[tourStep].body }}</p>

                        <!-- Key chips -->
                        <div v-if="tourSteps[tourStep].keys" class="tour-keys">
                            <div v-for="k in tourSteps[tourStep].keys" :key="k.k" class="tour-key-row">
                                <kbd class="tour-kbd">{{ k.k }}</kbd>
                                <span class="tour-key-label">{{ k.label }}</span>
                            </div>
                        </div>
                    </div>
                </Transition>

                <!-- Actions -->
                <div class="tour-actions">
                    <button class="tour-skip" @click="skipTour">Skip tour</button>
                    <div class="flex items-center gap-2">
                        <button v-if="tourStep > 0" class="tour-prev" @click="tourPrev">← Back</button>
                        <button class="tour-next" @click="tourNext">
                            {{ tourStep < tourSteps.length - 1 ? 'Next →' : '🚀 Start Presenting' }}
                        </button>
                    </div>
                </div>

                <!-- Step counter -->
                <p class="tour-counter">{{ tourStep + 1 }} of {{ tourSteps.length }}</p>
            </div>
        </div>
    </Transition>

    <!-- ── MAP FULLSCREEN OVERLAY ──────────────────────────────────────────── -->
    <Teleport to="body">
        <Transition name="map-zoom">
            <div v-if="mapMaximized"
                class="map-fullscreen-overlay"
                @click.self="mapMaximized = false">
                <div class="map-fullscreen-panel" @click.stop>
                    <!-- Header bar -->
                    <div class="map-fs-header">
                        <div class="flex items-center gap-2 text-white">
                            <span class="text-base">🗺</span>
                            <span class="font-extrabold text-sm">United States — 50 States Map &amp; Regional Coverage</span>
                        </div>
                        <button class="map-fs-close" @click="mapMaximized = false" title="Minimize (Esc)">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 9V4H4m0 0l5 5M4 4l5 5m6-5h5m0 0v5m0-5l-5 5M4 20h5m0 0v-5m0 5l-5-5m16 5h-5m0 0v-5m0 5l5-5"/>
                            </svg>
                            <span class="text-xs font-bold">Minimize</span>
                        </button>
                    </div>
                    <!-- Full map -->
                    <div class="map-fs-body">
                        <USAMapEmbed :is-dark="true"/>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

</div>
</template>

<style scoped>
/* ── ROOT ──────────────────────────────────────────────────────────────────── */
.pres-root {
    position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;
    background:#070d1a;color:#fff;user-select:none;overflow:hidden;
    font-family:'Inter',system-ui,sans-serif;
}

/* ── BACKGROUND MESH ─────────────────────────────────────────────────────── */
.pres-bg { position:absolute;inset:0;pointer-events:none;overflow:hidden; }
.mesh-blob {
    position:absolute;border-radius:50%;filter:blur(80px);
    animation:drift 12s ease-in-out infinite alternate;
}
.blob-1 { width:45vw;height:45vw;top:-10%;left:-10%; }
.blob-2 { width:35vw;height:35vw;bottom:-5%;right:-5%;animation-delay:-5s; }
.blob-3 { width:30vw;height:30vw;top:30%;left:40%;background:rgba(255,255,255,0.02);animation-delay:-8s; }
@keyframes drift { from{transform:translate(0,0) scale(1)} to{transform:translate(4%,3%) scale(1.08)} }

/* ── TOP BAR ─────────────────────────────────────────────────────────────── */
.pres-topbar {
    display:flex;align-items:center;justify-content:space-between;
    padding:10px 20px;flex-shrink:0;border-bottom:1px solid rgba(255,255,255,0.07);
    background:rgba(7,13,26,0.85);backdrop-filter:blur(20px);position:relative;z-index:10;
}
.slide-badge {
    font-size:12px;font-weight:800;font-family:monospace;letter-spacing:0.05em;
    padding:4px 10px;border-radius:8px;background:rgba(255,255,255,0.08);color:#fff;
}
.module-label { font-size:11px;font-weight:600;color:rgba(255,255,255,0.45); }

/* progress track */
.progress-track {
    flex:1;margin:0 24px;height:4px;border-radius:9999px;
    background:rgba(255,255,255,0.08);position:relative;cursor:pointer;
}
.progress-fill { height:100%;border-radius:9999px;transition:width 0.5s cubic-bezier(.4,0,.2,1); }
.tick {
    position:absolute;top:50%;transform:translate(-50%,-50%);
    width:8px;height:8px;border-radius:50%;cursor:pointer;transition:all 0.2s;
}
.tick-active { background:#fff;box-shadow:0 0 6px rgba(255,255,255,0.6);width:10px;height:10px; }
.tick-done   { background:rgba(255,255,255,0.5); }
.tick-future { background:rgba(255,255,255,0.15); }
.tick:hover  { transform:translate(-50%,-50%) scale(1.4); }

/* control buttons */
.ctrl-btn {
    padding:6px;border-radius:8px;background:rgba(255,255,255,0.07);
    color:rgba(255,255,255,0.6);border:none;cursor:pointer;transition:all 0.15s;display:flex;
}
.ctrl-btn:hover { background:rgba(255,255,255,0.15);color:#fff; }
.ctrl-active { background:var(--accent) !important;color:#fff !important; }
.ctrl-exit {
    display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
    background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.6);border:none;cursor:pointer;
    transition:all 0.15s;font-size:12px;
}
.ctrl-exit:hover { background:rgba(239,68,68,0.7);color:#fff; }

/* ── BODY ────────────────────────────────────────────────────────────────── */
.pres-body { flex:1;display:flex;overflow:hidden;position:relative; }

/* ── SLIDE ───────────────────────────────────────────────────────────────── */
.pres-slide { flex:1;display:flex;flex-direction:column;overflow:hidden; }

.slide-hero {
    flex-shrink:0;padding:32px 48px 28px;position:relative;overflow:hidden;
}
.hero-glow {
    position:absolute;inset:-60px;filter:blur(70px);
    border-radius:50%;transform:translate(-20%,-30%);pointer-events:none;
    animation: glow-pulse 0.8s cubic-bezier(.16,1,.3,1) 0s both;
}
.hero-content { position:relative;z-index:1; }

/* eyebrow row animates in first */
.eyebrow-animate {
    animation: hero-up 0.6s cubic-bezier(.16,1,.3,1) 0s both;
}
/* title animates in after eyebrow */
.title-animate {
    animation: hero-up 0.75s cubic-bezier(.16,1,.3,1) 0.12s both;
}

@keyframes hero-up {
    0%   { opacity:0; transform:translateY(36px) scale(0.94) blur(4px); filter:blur(4px); }
    60%  { filter:blur(0px); }
    100% { opacity:1; transform:translateY(0)    scale(1);   filter:blur(0px); }
}
@keyframes glow-pulse {
    from { opacity:0; transform:translate(-20%,-30%) scale(0.5); }
    to   { opacity:0.18; transform:translate(-20%,-30%) scale(1); }
}
.page-eyebrow { display:flex;align-items:center;gap:8px;margin-bottom:10px; }
.eyebrow-chip {
    font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;
    padding:3px 10px;border-radius:9999px;border:1px solid;
}
.eyebrow-dot { width:4px;height:4px;border-radius:50%; }
.slide-title {
    font-size:clamp(22px,3.5vw,40px);font-weight:900;color:#fff;
    line-height:1.15;letter-spacing:-0.02em;
    text-shadow:0 2px 20px rgba(0,0,0,0.4);
}

/* ── BEATS ───────────────────────────────────────────────────────────────── */
.beats-area {
    flex:1;overflow-y:auto;padding:20px 48px 12px;
    scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.12) transparent;
    cursor:pointer;
}
.beats-area::-webkit-scrollbar { width:4px; }
.beats-area::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12);border-radius:9999px; }
.beats-list { display:flex;flex-direction:column;gap:10px; }

.beat-heading {
    display:flex;align-items:center;gap:12px;margin:6px 0;
}
.beat-rule { flex:1;height:1px; }
.beat-heading-text {
    font-size:11px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;
    padding:5px 16px;border-radius:9999px;border:1px solid;white-space:nowrap;
    flex-shrink:0;
}

.beat-bullet {
    display:flex;align-items:flex-start;gap:14px;
    padding:14px 18px;border-radius:14px;
    background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);
    backdrop-filter:blur(4px);transition:background 0.2s;
}
.beat-bullet:hover { background:rgba(255,255,255,0.07); }
.bullet-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:6px; }
.beat-bullet-text { font-size:15px;color:rgba(255,255,255,0.88);line-height:1.65;font-weight:500; }

.beat-normal {
    padding:14px 18px;border-radius:14px;
    background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);
    transition:background 0.2s;
}
.beat-normal:hover { background:rgba(255,255,255,0.055); }
.beat-normal-text { font-size:15px;color:rgba(255,255,255,0.82);line-height:1.7; }

/* hint */
.beat-hint { display:flex;justify-content:center;padding:12px 0;pointer-events:none; }
.hint-pill {
    display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;
    padding:5px 14px;border-radius:9999px;border:1px solid;
    pointer-events:auto;cursor:pointer;transition:opacity 0.2s;opacity:0.7;
}
.hint-pill:hover { opacity:1; }

/* beat dots */
.beat-dots {
    flex-shrink:0;display:flex;align-items:center;justify-content:center;
    gap:5px;padding:8px 48px;
}
.beat-dot {
    height:4px;border-radius:9999px;cursor:pointer;transition:all 0.25s cubic-bezier(.4,0,.2,1);
}
.dot-on  { width:16px; }
.dot-off { width:4px;background:rgba(255,255,255,0.18); }

/* ── SIDEBAR ─────────────────────────────────────────────────────────────── */
.pres-sidebar {
    flex-shrink:0;border-left:1px solid rgba(255,255,255,0.07);
    background:rgba(7,13,26,0.92);backdrop-filter:blur(20px);
    display:flex;flex-direction:column;overflow:hidden;
    transition:width 0.35s cubic-bezier(.4,0,.2,1);
}
.sidebar-open  { width:220px; }
.sidebar-closed{ width:0;border-left-color:transparent; }
.sidebar-header {
    display:flex;align-items:center;justify-content:space-between;
    padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.07);flex-shrink:0;
}
.sidebar-title { font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.35); }
.sidebar-list { flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.1) transparent; }
.sidebar-item {
    width:100%;display:flex;align-items:flex-start;gap:9px;
    padding:9px 14px;text-align:left;border:none;background:transparent;cursor:pointer;
    border-left:2px solid transparent;transition:all 0.15s;position:relative;
    border-bottom:1px solid rgba(255,255,255,0.04);
}
.sidebar-item:hover { background:rgba(255,255,255,0.05); }
.item-active { background:rgba(255,255,255,0.06) !important; }
.item-done .item-title { color:rgba(255,255,255,0.4) !important; }
.item-num {
    flex-shrink:0;width:20px;height:20px;border-radius:6px;
    display:flex;align-items:center;justify-content:center;
    font-size:9px;font-weight:800;color:#fff;margin-top:1px;
    background:rgba(255,255,255,0.1);transition:background 0.2s;
}
.item-title { font-size:11px;color:rgba(255,255,255,0.55);line-height:1.4;transition:color 0.15s; }
.item-active .item-title { color:#fff !important;font-weight:700; }
.item-indicator {
    position:absolute;right:0;top:50%;transform:translateY(-50%);
    width:3px;height:60%;border-radius:9999px;
}

/* ── FOOTER ──────────────────────────────────────────────────────────────── */
.pres-footer {
    flex-shrink:0;display:flex;align-items:center;justify-content:space-between;
    padding:10px 24px;border-top:1px solid rgba(255,255,255,0.07);
    background:rgba(7,13,26,0.9);backdrop-filter:blur(16px);
}
.nav-btn {
    display:flex;align-items:center;gap:8px;padding:8px 18px;border-radius:10px;
    font-size:12px;font-weight:700;border:none;cursor:pointer;transition:all 0.18s;
}
.nav-btn:disabled { opacity:0.3;cursor:not-allowed; }
.nav-prev { background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7); }
.nav-prev:hover:not(:disabled) { background:rgba(255,255,255,0.15);color:#fff; }
.nav-next { color:#fff; }
.nav-next:hover:not(:disabled) { filter:brightness(1.15); }

/* thumb pips */
.thumb-strip { display:flex;align-items:center;gap:3px;flex-wrap:nowrap;overflow:hidden;max-width:50%; }
.thumb-pip {
    height:4px;width:6px;border-radius:9999px;border:none;cursor:pointer;
    background:rgba(255,255,255,0.18);transition:all 0.25s cubic-bezier(.4,0,.2,1);
    flex-shrink:0;
}
.thumb-pip:hover { height:6px; }

/* ── KEYBOARD HINTS ──────────────────────────────────────────────────────── */
.kbd-hints {
    position:absolute;bottom:64px;left:50%;transform:translateX(-50%);
    font-size:11px;color:rgba(255,255,255,0.3);white-space:nowrap;pointer-events:none;
}
kbd {
    padding:2px 6px;border-radius:5px;background:rgba(255,255,255,0.1);
    font-family:monospace;font-size:10px;
}

/* ── TOUR OVERLAY ────────────────────────────────────────────────────────── */
.tour-overlay {
    position:absolute;inset:0;z-index:200;
    background:rgba(7,13,26,0.82);backdrop-filter:blur(6px);
    display:flex;align-items:center;justify-content:center;padding:24px;
}
.tour-card {
    width:100%;max-width:480px;border-radius:24px;padding:32px;
    background:linear-gradient(160deg,#0a1e2e 0%,#071020 100%);
    border:1px solid rgba(255,255,255,0.1);
    box-shadow:0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(13,148,136,0.2);
    display:flex;flex-direction:column;gap:20px;
}
.tour-dots {
    display:flex;gap:6px;justify-content:center;
}
.tour-dot {
    width:8px;height:8px;border-radius:50%;cursor:pointer;transition:all 0.25s;
}
.dot-active  { background:linear-gradient(135deg,#006970,#00a9b4);width:24px;border-radius:9999px; }
.dot-done    { background:rgba(0,169,180,0.45); }
.dot-future  { background:rgba(255,255,255,0.15); }

.tour-icon {
    font-size:40px;text-align:center;line-height:1;
    filter:drop-shadow(0 0 20px rgba(0,169,180,0.5));
}
.tour-body { display:flex;flex-direction:column;gap:10px; }
.tour-title {
    font-size:20px;font-weight:900;color:#fff;text-align:center;
    letter-spacing:-0.02em;line-height:1.2;
}
.tour-text {
    font-size:13px;color:rgba(255,255,255,0.65);text-align:center;
    line-height:1.7;
}
.tour-keys {
    display:flex;flex-direction:column;gap:8px;
    background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);
    border-radius:14px;padding:14px 16px;margin-top:4px;
}
.tour-key-row {
    display:flex;align-items:center;gap:10px;
}
.tour-kbd {
    font-family:monospace;font-size:11px;font-weight:800;
    padding:4px 10px;border-radius:7px;border:1px solid rgba(255,255,255,0.15);
    background:rgba(255,255,255,0.08);color:#fff;white-space:nowrap;min-width:52px;
    text-align:center;letter-spacing:0.05em;
    box-shadow:0 2px 0 rgba(0,0,0,0.4);
}
.tour-key-label {
    font-size:12px;color:rgba(255,255,255,0.55);font-weight:500;
}
.tour-actions {
    display:flex;align-items:center;justify-content:space-between;gap:8px;
}
.tour-skip {
    font-size:11px;color:rgba(255,255,255,0.3);background:transparent;
    border:none;cursor:pointer;transition:color 0.15s;padding:4px;
}
.tour-skip:hover { color:rgba(255,255,255,0.6); }
.tour-prev {
    font-size:12px;font-weight:700;padding:8px 16px;border-radius:10px;
    background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);
    color:rgba(255,255,255,0.7);cursor:pointer;transition:all 0.15s;
}
.tour-prev:hover { background:rgba(255,255,255,0.15);color:#fff; }
.tour-next {
    font-size:12px;font-weight:800;padding:10px 22px;border-radius:10px;
    background:linear-gradient(135deg,#006970,#00a9b4);
    border:none;color:#fff;cursor:pointer;transition:all 0.15s;
    box-shadow:0 4px 14px rgba(0,169,180,0.35);
}
.tour-next:hover { filter:brightness(1.1);transform:translateY(-1px); }
.tour-counter {
    font-size:10px;color:rgba(255,255,255,0.2);text-align:center;margin-top:-8px;
}

/* tour transitions */
.tour-fade-enter-active { transition:opacity 0.3s,transform 0.3s cubic-bezier(.16,1,.3,1); }
.tour-fade-leave-active { transition:opacity 0.25s ease; }
.tour-fade-enter-from   { opacity:0;transform:scale(0.96); }
.tour-fade-leave-to     { opacity:0; }

.tour-step-enter-active { transition:all 0.3s cubic-bezier(.16,1,.3,1); }
.tour-step-leave-active { transition:all 0.18s ease; position:absolute;width:100%; }
.tour-step-enter-from   { opacity:0;transform:translateX(20px); }
.tour-step-leave-to     { opacity:0;transform:translateX(-20px); }

/* ── SLIDE TRANSITIONS ───────────────────────────────────────────────────── */
.slide-fwd-enter-active,.slide-bwd-enter-active { transition:all 0.32s cubic-bezier(.4,0,.2,1); }
.slide-fwd-leave-active,.slide-bwd-leave-active { transition:all 0.24s cubic-bezier(.4,0,.2,1); }
.slide-fwd-enter-from { opacity:0;transform:translateX(40px) scale(0.98); }
.slide-fwd-leave-to  { opacity:0;transform:translateX(-40px) scale(0.98); }
.slide-bwd-enter-from { opacity:0;transform:translateX(-40px) scale(0.98); }
.slide-bwd-leave-to  { opacity:0;transform:translateX(40px) scale(0.98); }

/* ── BEAT TRANSITIONS ────────────────────────────────────────────────────── */
.beat-enter-active {
    transition: opacity 0.55s cubic-bezier(.16,1,.3,1),
                transform 0.55s cubic-bezier(.16,1,.3,1);
}
.beat-enter-from {
    opacity: 0;
    transform: translateY(28px) scale(0.95);
}
.beat-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
    position: absolute;
    width: 100%;
}
.beat-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.97);
}

/* ── FADE ────────────────────────────────────────────────────────────────── */
.fade-enter-active { transition:opacity 0.3s; }
.fade-leave-active { transition:opacity 0.8s; }
.fade-enter-from,.fade-leave-to { opacity:0; }

/* ── BEAT FLASH HIGHLIGHT ────────────────────────────────────────────────── */
@keyframes beat-flash-anim {
    0%   { outline: 2px solid var(--accent, #0d9488); outline-offset: 0px; background: rgba(13,148,136,0.18); }
    50%  { outline: 2px solid var(--accent, #0d9488); outline-offset: 3px; }
    100% { outline: 2px solid transparent; outline-offset: 6px; background: transparent; }
}
.beat-flash {
    animation: beat-flash-anim 0.8s cubic-bezier(.4,0,.2,1) forwards !important;
}

/* ── MAP INLINE WRAPPER ──────────────────────────────────────────────────── */
.map-inline-wrap { border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1); }

.map-expand-bar {
    display:flex;align-items:center;justify-content:space-between;
    padding:8px 14px;background:rgba(7,13,26,0.85);backdrop-filter:blur(8px);
    border-bottom:1px solid rgba(255,255,255,0.08);
}
.map-expand-label { font-size:11px;font-weight:700;color:rgba(255,255,255,0.6); }
.map-expand-btn {
    display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:8px;
    background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);
    color:rgba(255,255,255,0.8);cursor:pointer;transition:all 0.15s;
}
.map-expand-btn:hover { background:rgba(255,255,255,0.18);color:#fff; }

/* limit inline map height */
.map-inline-preview {
    max-height:320px;
    overflow:hidden;
    position:relative;
}

/* ── MAP FULLSCREEN OVERLAY ──────────────────────────────────────────────── */
.map-fullscreen-overlay {
    position:fixed;inset:0;z-index:99999;
    background:rgba(0,0,0,0.80);backdrop-filter:blur(10px);
    display:flex;align-items:stretch;justify-content:stretch;
    padding:12px;
    overflow:hidden;
}
.map-fullscreen-panel {
    width:100%;height:100%;
    border-radius:16px;overflow:hidden;display:flex;flex-direction:column;
    border:1px solid rgba(255,255,255,0.12);
    background:#070d1a;box-shadow:0 32px 80px rgba(0,0,0,0.6);
}
.map-fs-header {
    display:flex;align-items:center;justify-content:space-between;
    padding:12px 20px;flex-shrink:0;border-bottom:1px solid rgba(255,255,255,0.08);
    background:rgba(7,13,26,0.95);
    position:sticky;top:0;z-index:10;
}
.map-fs-close {
    display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;
    background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);
    color:rgba(255,255,255,0.7);cursor:pointer;transition:all 0.15s;
}
.map-fs-close:hover { background:rgba(255,255,255,0.18);color:#fff; }
.map-fs-body {
    flex:1;overflow-y:auto;overflow-x:hidden;
    scrollbar-width:thin;
    scrollbar-color:rgba(255,255,255,0.15) transparent;
    display:flex;flex-direction:column;
}
.map-fs-body > * { flex:1; }
.map-fs-body::-webkit-scrollbar { width:5px; }
.map-fs-body::-webkit-scrollbar-track { background:transparent; }
.map-fs-body::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.15);border-radius:9999px; }

/* map-zoom transition */
.map-zoom-enter-active { transition:all 0.3s cubic-bezier(.16,1,.3,1); }
.map-zoom-leave-active { transition:all 0.2s ease; }
.map-zoom-enter-from { opacity:0;transform:scale(0.92); }
.map-zoom-leave-to   { opacity:0;transform:scale(0.95); }
</style>
