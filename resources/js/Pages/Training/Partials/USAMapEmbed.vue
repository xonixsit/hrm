<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({ isDark: Boolean });

const mapContainer  = ref(null);
const selectorStrip = ref(null);          // the scrollable chip row
const activeView    = ref('map');         // 'map' | 'tz' | 'list'
const activeState   = ref('IL');          // currently highlighted state
const activeTZ      = ref(null);          // selected time-zone key or null
let   leafletMap    = null;
let   markers       = {};                 // { abbr: L.Marker }

// ── State data (alphabetical) ─────────────────────────────────────────────────
const states = [
    { abbr:'AL', name:'Alabama',         lat:32.8,  lng:-86.8  },
    { abbr:'AK', name:'Alaska',          lat:64.2,  lng:-153.4 },
    { abbr:'AZ', name:'Arizona',         lat:34.3,  lng:-111.1 },
    { abbr:'AR', name:'Arkansas',        lat:34.8,  lng:-92.2  },
    { abbr:'CA', name:'California',      lat:36.8,  lng:-119.4 },
    { abbr:'CO', name:'Colorado',        lat:39.0,  lng:-105.5 },
    { abbr:'CT', name:'Connecticut',     lat:41.6,  lng:-72.7  },
    { abbr:'DE', name:'Delaware',        lat:38.9,  lng:-75.5  },
    { abbr:'DC', name:'District of Col', lat:38.9,  lng:-77.0  },
    { abbr:'FL', name:'Florida',         lat:27.8,  lng:-81.7  },
    { abbr:'GA', name:'Georgia',         lat:32.2,  lng:-83.4  },
    { abbr:'HI', name:'Hawaii',          lat:20.3,  lng:-156.4 },
    { abbr:'ID', name:'Idaho',           lat:44.3,  lng:-114.5 },
    { abbr:'IL', name:'Illinois',        lat:40.0,  lng:-89.2  },
    { abbr:'IN', name:'Indiana',         lat:40.3,  lng:-86.1  },
    { abbr:'IA', name:'Iowa',            lat:42.0,  lng:-93.2  },
    { abbr:'KS', name:'Kansas',          lat:38.5,  lng:-98.4  },
    { abbr:'KY', name:'Kentucky',        lat:37.7,  lng:-84.9  },
    { abbr:'LA', name:'Louisiana',       lat:31.2,  lng:-92.1  },
    { abbr:'ME', name:'Maine',           lat:44.7,  lng:-69.4  },
    { abbr:'MD', name:'Maryland',        lat:39.1,  lng:-76.8  },
    { abbr:'MA', name:'Massachusetts',   lat:42.2,  lng:-71.5  },
    { abbr:'MI', name:'Michigan',        lat:44.3,  lng:-85.4  },
    { abbr:'MN', name:'Minnesota',       lat:46.4,  lng:-93.1  },
    { abbr:'MS', name:'Mississippi',     lat:32.7,  lng:-89.7  },
    { abbr:'MO', name:'Missouri',        lat:38.5,  lng:-92.5  },
    { abbr:'MT', name:'Montana',         lat:47.0,  lng:-110.5 },
    { abbr:'NE', name:'Nebraska',        lat:41.5,  lng:-99.9  },
    { abbr:'NV', name:'Nevada',          lat:38.5,  lng:-117.1 },
    { abbr:'NH', name:'New Hampshire',   lat:43.7,  lng:-71.6  },
    { abbr:'NJ', name:'New Jersey',      lat:40.1,  lng:-74.5  },
    { abbr:'NM', name:'New Mexico',      lat:34.8,  lng:-106.2 },
    { abbr:'NY', name:'New York',        lat:42.9,  lng:-75.5  },
    { abbr:'NC', name:'North Carolina',  lat:35.6,  lng:-79.8  },
    { abbr:'ND', name:'North Dakota',    lat:47.5,  lng:-100.5 },
    { abbr:'OH', name:'Ohio',            lat:40.4,  lng:-82.8  },
    { abbr:'OK', name:'Oklahoma',        lat:35.6,  lng:-97.5  },
    { abbr:'OR', name:'Oregon',          lat:44.0,  lng:-120.5 },
    { abbr:'PA', name:'Pennsylvania',    lat:40.9,  lng:-77.8  },
    { abbr:'RI', name:'Rhode Island',    lat:41.7,  lng:-71.5  },
    { abbr:'SC', name:'South Carolina',  lat:33.9,  lng:-80.9  },
    { abbr:'SD', name:'South Dakota',    lat:44.4,  lng:-100.2 },
    { abbr:'TN', name:'Tennessee',       lat:35.9,  lng:-86.7  },
    { abbr:'TX', name:'Texas',           lat:31.5,  lng:-99.3  },
    { abbr:'UT', name:'Utah',            lat:39.3,  lng:-111.5 },
    { abbr:'VT', name:'Vermont',         lat:44.0,  lng:-72.7  },
    { abbr:'VA', name:'Virginia',        lat:37.8,  lng:-78.2  },
    { abbr:'WA', name:'Washington',      lat:47.4,  lng:-120.4 },
    { abbr:'WV', name:'West Virginia',   lat:38.6,  lng:-80.6  },
    { abbr:'WI', name:'Wisconsin',       lat:44.3,  lng:-89.8  },
    { abbr:'WY', name:'Wyoming',         lat:43.0,  lng:-107.5 },
];

// ── Time-zone helpers ─────────────────────────────────────────────────────────
const tzZones = {
    eastern:  ['ME','NH','VT','MA','RI','CT','NY','NJ','PA','DE','MD','VA','WV','NC','SC','GA','FL','OH','IN','MI','KY','TN','DC'],
    central:  ['WI','IL','MO','AR','LA','MS','AL','MN','IA','OK','TX','KS','NE','SD','ND'],
    mountain: ['MT','WY','CO','NM','ID','UT','AZ'],
    pacific:  ['WA','OR','CA','NV'],
    alaska:   ['AK'],
    hawaii:   ['HI'],
};
const tzColors  = { eastern:'#0ea5e9', central:'#10b981', mountain:'#f59e0b', pacific:'#8b5cf6', alaska:'#06b6d4', hawaii:'#ec4899', default:'#64748b' };
const tzLabels  = { eastern:'Eastern (EST)', central:'Central (CST)', mountain:'Mountain (MST)', pacific:'Pacific (PST)', alaska:'Alaska (AKT)', hawaii:'Hawaii (HAST)', default:'Unknown' };

function getTZ(abbr)      { for (const [z,l] of Object.entries(tzZones)) if (l.includes(abbr)) return z; return 'default'; }
function getTZColor(abbr) { return tzColors[getTZ(abbr)]; }
function getTZLabel(abbr) { return tzLabels[getTZ(abbr)]; }

// ── Filtered states for chip strip ───────────────────────────────────────────
const visibleStates = computed(() => {
    if (activeTZ.value && tzZones[activeTZ.value]) {
        return states.filter(s => tzZones[activeTZ.value].includes(s.abbr));
    }
    return states;
});
function flyToTZ(zoneKey) {
    if (activeTZ.value === zoneKey) {
        activeTZ.value = null;
        if (leafletMap) leafletMap.flyTo([39.5, -98.35], 4, { animate: true, duration: 0.8 });
        updateMarkerIcons();
        nextTick(() => { if (selectorStrip.value) selectorStrip.value.scrollLeft = 0; });
        return;
    }
    activeTZ.value    = zoneKey;
    activeState.value = null;
    updateMarkerIcons();
    // scroll strip to start so filtered chips show from beginning
    nextTick(() => { if (selectorStrip.value) selectorStrip.value.scrollLeft = 0; });

    if (!leafletMap || !window.L) return;
    const L          = window.L;
    const zoneAbbrs  = tzZones[zoneKey] || [];
    const zoneStates = states.filter(s => zoneAbbrs.includes(s.abbr));
    if (!zoneStates.length) return;
    const bounds = L.latLngBounds(zoneStates.map(s => [s.lat, s.lng]));
    leafletMap.flyToBounds(bounds.pad(0.25), { animate: true, duration: 0.9 });
}

// ── Hover pan (no state change, no popup) ────────────────────────────────────
let hoverTimer = null;
function hoverToState(s) {
    // debounce slightly so quick mouse sweeps don't thrash
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
        if (!leafletMap || activeState.value === s.abbr) return;
        leafletMap.flyTo([s.lat, s.lng], 5, { animate: true, duration: 0.45 });
        // highlight marker temporarily
        const m = markers[s.abbr];
        if (m && window.L) {
            const L = window.L;
            const hoverIcon = L.divIcon({
                className: '',
                html: `<div style="
                    background:${getTZColor(s.abbr)};
                    border:3px solid #fff;border-radius:50%;
                    width:32px;height:32px;display:flex;align-items:center;justify-content:center;
                    font-size:8px;font-weight:900;color:white;font-family:monospace;
                    box-shadow:0 4px 14px rgba(0,0,0,0.5);
                    transition:all 0.2s;
                ">${s.abbr}</div>`,
                iconSize:[32,32], iconAnchor:[16,16],
            });
            m.setIcon(hoverIcon);
        }
    }, 60);
}

function leaveState(s) {
    clearTimeout(hoverTimer);
    // restore original icon
    if (window.L && markers[s.abbr]) markers[s.abbr].setIcon(makeIcon(window.L, s.abbr));
    // pan back to active state, or full USA if none
    if (!leafletMap) return;
    if (activeState.value) {
        const active = states.find(st => st.abbr === activeState.value);
        if (active) leafletMap.flyTo([active.lat, active.lng], 6, { animate: true, duration: 0.5 });
    } else {
        leafletMap.flyTo([39.5, -98.35], 4, { animate: true, duration: 0.5 });
    }
}

// ── Selector strip: hover arrow = butter-smooth rAF scroll ───────────────────
let rafId = null;
const SCROLL_SPEED = 0.6; // px per frame (~36px/s at 60fps — slow drift)

function scrollStrip(dir) {
    selectorStrip.value?.scrollBy({ left: dir * 260, behavior: 'smooth' });
}
function startScroll(dir) {
    stopScroll();
    const el = selectorStrip.value;
    if (!el) return;
    const step = () => {
        el.scrollLeft += dir * SCROLL_SPEED;
        rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
}
function stopScroll() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

// ── Fly map to state & set active ─────────────────────────────────────────────
function flyToState(s) {
    activeState.value = s.abbr;
    activeTZ.value    = null;          // clear TZ filter when picking a specific state
    // scroll the chip into view in the strip
    const chip = selectorStrip.value?.querySelector(`[data-abbr="${s.abbr}"]`);
    chip?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    // fly map
    if (leafletMap) {
        leafletMap.flyTo([s.lat, s.lng], 6, { animate: true, duration: 0.8 });
        const m = markers[s.abbr];
        if (m) setTimeout(() => m.openPopup(), 900);
    }
}

// ── Leaflet bootstrap ─────────────────────────────────────────────────────────
async function initMap() {
    if (!mapContainer.value) return;

    if (!document.getElementById('leaflet-css')) {
        const link  = document.createElement('link');
        link.id     = 'leaflet-css';
        link.rel    = 'stylesheet';
        link.href   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }
    if (!window.L) {
        await new Promise((res, rej) => {
            const s   = document.createElement('script');
            s.src     = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            s.onload  = res;
            s.onerror = rej;
            document.head.appendChild(s);
        });
    }

    const L = window.L;
    if (leafletMap) { leafletMap.remove(); leafletMap = null; markers = {}; }

    leafletMap = L.map(mapContainer.value, {
        center: [39.5, -98.35], zoom: 4,
        zoomControl: true, attributionControl: true, preferCanvas: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap);

    buildMarkers(L);
}

function markerColor(abbr) {
    if (activeView.value === 'tz' || activeTZ.value) return getTZColor(abbr);
    return abbr === activeState.value ? '#004d52' : '#006970';
}

function buildMarkers(L) {
    Object.values(markers).forEach(m => m.remove());
    markers = {};

    states.forEach(s => {
        const icon = makeIcon(L, s.abbr);
        const m = L.marker([s.lat, s.lng], { icon })
            .addTo(leafletMap)
            .bindPopup(popupHtml(s), { maxWidth: 160 });

        // clicking marker also activates the chip
        m.on('click', () => { activeState.value = s.abbr; });
        markers[s.abbr] = m;
    });
}

function makeIcon(L, abbr) {
    const inActiveTZ = activeTZ.value ? (tzZones[activeTZ.value] || []).includes(abbr) : true;
    const color      = markerColor(abbr);
    const active     = abbr === activeState.value;
    const opacity    = (!inActiveTZ && activeTZ.value) ? 0.25 : 1;
    const size       = (active || inActiveTZ && activeTZ.value) ? 30 : 26;
    return L.divIcon({
        className: '',
        html: `<div style="
            background:${color};
            border:${active ? '3px solid #fff' : '2px solid rgba(255,255,255,0.8)'};
            border-radius:50%;
            width:${size}px;height:${size}px;
            display:flex;align-items:center;justify-content:center;
            font-size:${size > 26 ? 8 : 7}px;font-weight:800;color:white;font-family:monospace;
            box-shadow:${active ? '0 3px 10px rgba(0,0,0,0.45)' : '0 2px 6px rgba(0,0,0,0.3)'};
            cursor:pointer;transition:all 0.2s;opacity:${opacity};
        ">${abbr}</div>`,
        iconSize:   [size, size],
        iconAnchor: [size/2, size/2],
    });
}

function popupHtml(s) {
    return `<div style="font-family:sans-serif;text-align:center;padding:4px 8px;min-width:110px">
        <div style="font-size:20px;font-weight:900;color:#006970;letter-spacing:-0.5px">${s.abbr}</div>
        <div style="font-size:12px;font-weight:700;color:#1e293b;margin:2px 0">${s.name}</div>
        <div style="font-size:10px;color:#64748b">${getTZLabel(s.abbr)}</div>
    </div>`;
}

function switchTab(id) {
    activeView.value = id;
    if (id === 'map') {
        activeTZ.value    = null;
        activeState.value = null;
        updateMarkerIcons();
        nextTick(() => {
            if (selectorStrip.value) selectorStrip.value.scrollLeft = 0;
        });
        if (leafletMap) {
            leafletMap.flyTo([39.5, -98.35], 4, { animate: true, duration: 0.8 });
        }
        if (window.L && leafletMap) refreshMarkers();
    } else if (id === 'tz') {
        if (window.L && leafletMap) refreshMarkers();
    }
}

function refreshMarkers() {
    if (!window.L || !leafletMap) return;
    buildMarkers(window.L);
}

// Re-render marker icons when activeState changes (highlight update)
function updateMarkerIcons() {
    if (!window.L || !leafletMap) return;
    const L = window.L;
    states.forEach(s => {
        const m = markers[s.abbr];
        if (m) m.setIcon(makeIcon(L, s.abbr));
    });
}

onMounted(() => { initMap(); });
onBeforeUnmount(() => {
    if (leafletMap) { leafletMap.remove(); leafletMap = null; }
    clearTimeout(hoverTimer);
    stopScroll();
});

// ── Self-contained fullscreen ─────────────────────────────────────────────────
const mapFS = ref(false);
function openFS()  { mapFS.value = true; nextTick(() => { if (leafletMap) leafletMap.invalidateSize(); }); }
function closeFS() { mapFS.value = false; nextTick(() => { if (leafletMap) leafletMap.invalidateSize(); }); }
function onFSKey(e) { if (e.key === 'Escape') closeFS(); }
watch(mapFS, v => {
    if (v) window.addEventListener('keydown', onFSKey);
    else   window.removeEventListener('keydown', onFSKey);
});
</script>

<template>
<div class="rounded-2xl border overflow-hidden shadow-md" :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">

    <!-- ── Header ───────────────────────────────────────────────────────────── -->
    <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-white" style="background:linear-gradient(135deg,#006970,#00a9b4)">
        <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-base">🗺️</span>
            <div>
                <p class="text-sm font-extrabold">United States 50 States Map &amp; Regional Coverage</p>
                <p class="text-[11px] text-white/70">Quick-reference state locator system for all US states, DC (6 time zones, DC administration regions)</p>
            </div>
        </div>
        <div class="flex items-center gap-2 text-xs shrink-0">
            <span class="px-2.5 py-1 rounded-md bg-white/20 font-bold">50 States</span>
            <span class="px-2.5 py-1 rounded-md bg-white/20 font-bold">DC &amp; 6 Time Zones</span>
            <!-- Fullscreen toggle -->
            <button @click="openFS"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/30 font-bold transition-all"
                title="Expand fullscreen">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                </svg>
                <span>Expand</span>
            </button>
        </div>
    </div>

    <!-- ── View tabs ────────────────────────────────────────────────────────── -->
    <div class="flex items-center gap-1.5 px-4 py-2 border-b text-xs font-bold"
        :class="isDark ? 'bg-gray-750 border-gray-700' : 'bg-slate-50 border-slate-200'">
        <button v-for="v in [{id:'map',label:'🗺 States Map'},{id:'tz',label:'🕐 Time Zones'},{id:'list',label:'📋 State List'}]"
            :key="v.id"
            @click="switchTab(v.id)"
            class="px-3 py-1.5 rounded-lg transition-all"
            :class="activeView === v.id ? 'text-white shadow-sm' : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-slate-600 hover:bg-slate-200'"
            :style="activeView === v.id ? 'background:linear-gradient(135deg,#006970,#00a9b4)' : ''">
            {{ v.label }}
        </button>
    </div>

    <!-- ── Scrollable state selector strip ──────────────────────────────────── -->
    <div class="border-b" :class="isDark ? 'border-gray-700 bg-gray-800' : 'border-slate-200 bg-white'">

        <!-- Label row -->
        <div class="flex items-center justify-between px-4 pt-2 pb-0.5 text-[11px]"
            :class="isDark ? 'text-gray-400' : 'text-slate-500'">
            <div class="flex items-center gap-2">
                <span class="font-bold">50 States + DC Quick Selector:</span>
                <span v-if="activeState" class="px-2.5 py-0.5 rounded-full text-white font-bold text-[11px]"
                    style="background:linear-gradient(135deg,#006970,#00a9b4)">
                    Active: {{ activeState }} – {{ states.find(s => s.abbr === activeState)?.name }}
                </span>
            </div>
            <span class="hidden sm:block italic" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
                Hover arrows to scroll • Click state to locate on map
            </span>
        </div>

        <!-- Strip row: arrows + chips -->
        <div class="flex items-center gap-1 px-3 py-2">

            <!-- Left arrow — hover to auto-scroll -->
            <button @mouseenter="startScroll(-1)" @mouseleave="stopScroll" @click="scrollStrip(-1)"
                class="shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-colors hover:shadow-sm z-10"
                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
                </svg>
            </button>

            <!-- Chips -->
            <div ref="selectorStrip"
                class="flex items-center gap-1.5 overflow-x-auto flex-1 py-0.5"
                style="scrollbar-width:none;-ms-overflow-style:none;">
                <button
                    v-for="s in visibleStates" :key="s.abbr" :data-abbr="s.abbr"
                    @click="flyToState(s); updateMarkerIcons()"
                    @mouseenter="hoverToState(s)" @mouseleave="leaveState(s)"
                    class="shrink-0 flex items-center gap-0 rounded-lg border overflow-hidden transition-all text-xs font-semibold hover:shadow-md"
                    :class="activeState === s.abbr
                        ? 'border-teal-600 shadow-md ring-1 ring-teal-500 scale-105'
                        : isDark ? 'border-gray-600 hover:border-teal-500' : 'border-slate-300 hover:border-teal-400'">
                    <span class="px-2 py-1.5 font-extrabold text-white text-[11px] leading-none"
                        :style="`background:${activeState === s.abbr ? 'linear-gradient(135deg,#006970,#00a9b4)' : getTZColor(s.abbr)}`">
                        {{ s.abbr }}
                    </span>
                    <span class="px-2 py-1.5 whitespace-nowrap leading-none"
                        :class="activeState === s.abbr
                            ? isDark ? 'bg-teal-900/40 text-teal-200' : 'bg-teal-50 text-teal-800'
                            : isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-slate-700'">
                        {{ s.name }}
                    </span>
                </button>
            </div>

            <!-- Right arrow — hover to auto-scroll -->
            <button @mouseenter="startScroll(1)" @mouseleave="stopScroll" @click="scrollStrip(1)"
                class="shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-colors hover:shadow-sm z-10"
                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                </svg>
            </button>
        </div>
    </div>

    <!-- ── Map canvas ────────────────────────────────────────────────────────── -->
    <div v-show="activeView !== 'list'" :class="isDark ? 'bg-gray-900' : 'bg-slate-50'">
        <div ref="mapContainer" style="height:360px;width:100%;z-index:1;"></div>
    </div>

    <!-- ── Time zone legend ──────────────────────────────────────────────────── -->
    <div v-if="activeView === 'tz'" class="p-4 border-t"
        :class="isDark ? 'border-gray-700 bg-gray-800' : 'border-slate-200 bg-white'">
        <p class="text-[11px] font-semibold mb-3 flex items-center gap-1.5"
            :class="isDark ? 'text-gray-400' : 'text-slate-500'">
            <span>🕐</span> Click a time zone to focus the map on those states
            <span v-if="activeTZ" class="ml-auto text-xs font-bold text-teal-600 cursor-pointer hover:underline" @click="flyToTZ(activeTZ)">
                ✕ Clear selection
            </span>
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <button v-for="tz in [
                { key:'eastern',  name:'Eastern (EST)',  color:'#0ea5e9', cities:'NY, DC, Miami'   },
                { key:'central',  name:'Central (CST)',  color:'#10b981', cities:'Chicago, Dallas' },
                { key:'mountain', name:'Mountain (MST)', color:'#f59e0b', cities:'Denver, Phoenix' },
                { key:'pacific',  name:'Pacific (PST)',  color:'#8b5cf6', cities:'L.A., Seattle'   },
                { key:'alaska',   name:'Alaska (AKT)',   color:'#06b6d4', cities:'Anchorage'       },
                { key:'hawaii',   name:'Hawaii (HAST)',  color:'#ec4899', cities:'Honolulu'        },
            ]" :key="tz.key"
                @click="flyToTZ(tz.key); activeView = 'tz'"
                class="flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all hover:shadow-md group"
                :class="activeTZ === tz.key
                    ? isDark ? 'border-2 shadow-lg bg-gray-700' : 'border-2 shadow-lg bg-white'
                    : isDark ? 'bg-gray-700 border-gray-600 hover:border-gray-500 opacity-80 hover:opacity-100'
                             : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'"
                :style="activeTZ === tz.key ? `border-color:${tz.color}` : ''">
                <!-- Dot — pulses when active -->
                <span class="shrink-0 mt-0.5 rounded-full transition-all"
                    :style="`background:${tz.color};width:${activeTZ === tz.key ? 14 : 12}px;height:${activeTZ === tz.key ? 14 : 12}px;
                    box-shadow:${activeTZ === tz.key ? '0 0 0 3px '+tz.color+'33' : 'none'}`">
                </span>
                <div class="min-w-0">
                    <div class="font-extrabold text-[11px] leading-tight"
                        :class="activeTZ === tz.key
                            ? '' : isDark ? 'text-white' : 'text-slate-800'"
                        :style="activeTZ === tz.key ? `color:${tz.color}` : ''">
                        {{ tz.name }}
                    </div>
                    <div class="text-[10px] mt-0.5 truncate"
                        :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ tz.cities }}</div>
                    <div v-if="activeTZ === tz.key" class="text-[10px] font-bold mt-1" :style="`color:${tz.color}`">
                        {{ (tzZones[tz.key] || []).length }} states selected ↑
                    </div>
                </div>
            </button>
        </div>
    </div>

    <!-- ── State list view ───────────────────────────────────────────────────── -->
    <div v-if="activeView === 'list'" class="p-4" :class="isDark ? 'bg-gray-800' : 'bg-white'">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            <button v-for="s in states" :key="s.abbr"
                @click="activeView = 'map'; flyToState(s); updateMarkerIcons()"
                class="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:shadow-sm text-left"
                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-200 hover:border-teal-600' : 'bg-white border-slate-200 text-slate-800 hover:border-teal-400'">
                <span class="w-8 h-5 rounded flex items-center justify-center text-[10px] font-extrabold text-white shrink-0"
                    :style="`background:${getTZColor(s.abbr)}`">{{ s.abbr }}</span>
                <span class="truncate">{{ s.name }}</span>
            </button>
        </div>
    </div>

    <!-- ── Footer stats ──────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-4 border-t divide-x"
        :class="isDark ? 'border-gray-700 divide-gray-700' : 'border-slate-200 divide-slate-200'">
        <div v-for="stat in [
            { label:'Official US States', value:'50' },
            { label:'District of Columbia', value:'DC' },
            { label:'Training Covers', value:'50+DC' },
            { label:'Time Zones', value:'6' },
        ]" :key="stat.label"
            class="px-3 py-3 text-center"
            :class="isDark ? 'bg-gray-800' : 'bg-white'">
            <div class="text-base font-extrabold" :class="isDark ? 'text-teal-400' : 'text-teal-700'">{{ stat.value }}</div>
            <div class="text-[10px] font-semibold mt-0.5" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ stat.label }}</div>
        </div>
    </div>
</div>

<!-- ── Fullscreen overlay (Teleport to body) ─────────────────────────────── -->
<Teleport to="body">
    <Transition name="map-fs-zoom">
        <div v-if="mapFS"
            class="map-fs-overlay"
            @click.self="closeFS">
            <div class="map-fs-panel" @click.stop>
                <!-- Header -->
                <div class="map-fs-hdr">
                    <div class="flex items-center gap-2 text-white">
                        <span>🗺️</span>
                        <span class="font-extrabold text-sm">United States — 50 States Map &amp; Regional Coverage</span>
                    </div>
                    <button class="map-fs-close-btn" @click="closeFS" title="Minimize (Esc)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 9V4H4m0 0l5 5M4 4l5 5m6-5h5m0 0v5m0-5l-5 5M4 20h5m0 0v-5m0 5l-5-5m16 5h-5m0 0v-5m0 5l5-5"/>
                        </svg>
                        <span class="text-xs font-bold">Minimize</span>
                    </button>
                </div>
                <!-- Tabs row (reuse same view tabs) -->
                <div class="map-fs-tabs">
                    <button v-for="v in [{id:'map',label:'🗺 States Map'},{id:'tz',label:'🕐 Time Zones'},{id:'list',label:'📋 State List'}]"
                        :key="v.id" @click="switchTab(v.id)"
                        class="map-fs-tab"
                        :class="activeView === v.id ? 'map-fs-tab-active' : ''">
                        {{ v.label }}
                    </button>
                </div>
                <!-- Body — reuse map container via same ref -->
                <div class="map-fs-body">
                    <!-- strip -->
                    <div class="map-fs-strip-wrap border-b" :class="isDark ? 'border-gray-700 bg-gray-800' : 'border-slate-200 bg-white'">
                        <div class="flex items-center gap-1 px-3 py-2">
                            <button @mouseenter="startScroll(-1)" @mouseleave="stopScroll" @click="scrollStrip(-1)"
                                class="shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-slate-300 text-slate-600'">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <div ref="selectorStrip" class="flex items-center gap-1.5 overflow-x-auto flex-1 py-0.5" style="scrollbar-width:none">
                                <button v-for="s in visibleStates" :key="s.abbr" :data-abbr="s.abbr"
                                    @click="flyToState(s); updateMarkerIcons()" @mouseenter="hoverToState(s)" @mouseleave="leaveState(s)"
                                    class="shrink-0 flex items-center gap-0 rounded-lg border overflow-hidden text-xs font-semibold hover:shadow-md"
                                    :class="activeState === s.abbr ? 'border-teal-600 ring-1 ring-teal-500' : isDark ? 'border-gray-600' : 'border-slate-300'">
                                    <span class="px-2 py-1.5 font-extrabold text-white text-[11px]"
                                        :style="`background:${activeState === s.abbr ? 'linear-gradient(135deg,#006970,#00a9b4)' : getTZColor(s.abbr)}`">{{ s.abbr }}</span>
                                    <span class="px-2 py-1.5 whitespace-nowrap" :class="isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-slate-700'">{{ s.name }}</span>
                                </button>
                            </div>
                            <button @mouseenter="startScroll(1)" @mouseleave="stopScroll" @click="scrollStrip(1)"
                                class="shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-slate-300 text-slate-600'">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
                            </button>
                        </div>
                    </div>
                    <!-- Map -->
                    <div v-show="activeView !== 'list'" class="map-fs-map-wrap">
                        <div ref="mapContainer" style="width:100%;height:100%;z-index:1;"></div>
                    </div>
                    <!-- TZ legend -->
                    <div v-if="activeView === 'tz'" class="map-fs-tz-legend">
                        <button v-for="tz in [{key:'eastern',name:'Eastern (EST)',color:'#0ea5e9',cities:'NY, DC, Miami'},{key:'central',name:'Central (CST)',color:'#10b981',cities:'Chicago, Dallas'},{key:'mountain',name:'Mountain (MST)',color:'#f59e0b',cities:'Denver, Phoenix'},{key:'pacific',name:'Pacific (PST)',color:'#8b5cf6',cities:'L.A., Seattle'},{key:'alaska',name:'Alaska (AKT)',color:'#06b6d4',cities:'Anchorage'},{key:'hawaii',name:'Hawaii (HAST)',color:'#ec4899',cities:'Honolulu'}]"
                            :key="tz.key" @click="flyToTZ(tz.key)"
                            class="map-fs-tz-card" :class="activeTZ===tz.key ? 'tz-card-active' : ''"
                            :style="activeTZ===tz.key ? `border-color:${tz.color}` : ''">
                            <span class="tz-dot" :style="`background:${tz.color};box-shadow:${activeTZ===tz.key ? '0 0 0 3px '+tz.color+'33' : 'none'}`"></span>
                            <div>
                                <div class="font-extrabold text-[11px]" :class="isDark ? 'text-white' : 'text-slate-800'" :style="activeTZ===tz.key ? `color:${tz.color}` : ''">{{ tz.name }}</div>
                                <div class="text-[10px]" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ tz.cities }}</div>
                            </div>
                        </button>
                    </div>
                    <!-- List -->
                    <div v-if="activeView === 'list'" class="p-4 overflow-y-auto" :class="isDark ? 'bg-gray-800' : 'bg-white'">
                        <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                            <button v-for="s in states" :key="s.abbr" @click="switchTab('map'); flyToState(s); updateMarkerIcons()"
                                class="flex items-center gap-2 px-2 py-1.5 rounded-xl border text-xs font-semibold"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-slate-200 text-slate-800'">
                                <span class="w-7 h-4 rounded text-[9px] font-extrabold text-white flex items-center justify-center shrink-0"
                                    :style="`background:${getTZColor(s.abbr)}`">{{ s.abbr }}</span>
                                <span class="truncate">{{ s.name }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</Teleport>
</template>

<style scoped>
/* Hide scrollbar on the chip strip */
div[ref="selectorStrip"]::-webkit-scrollbar { display: none; }

/* ── Fullscreen overlay ───────────────────────────────────────────────────── */
.map-fs-overlay {
    position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.80);
    backdrop-filter:blur(10px);display:flex;align-items:stretch;
    justify-content:stretch;padding:12px;overflow:hidden;
}
.map-fs-panel {
    width:100%;height:100%;border-radius:16px;overflow:hidden;
    display:flex;flex-direction:column;border:1px solid rgba(255,255,255,0.12);
    background:#070d1a;box-shadow:0 32px 80px rgba(0,0,0,0.6);
}
.map-fs-hdr {
    display:flex;align-items:center;justify-content:space-between;
    padding:10px 18px;flex-shrink:0;border-bottom:1px solid rgba(255,255,255,0.08);
    background:linear-gradient(135deg,#006970,#00a9b4);
}
.map-fs-close-btn {
    display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:8px;
    background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);
    color:#fff;cursor:pointer;transition:all 0.15s;
}
.map-fs-close-btn:hover { background:rgba(255,255,255,0.25); }
.map-fs-tabs {
    display:flex;gap:6px;padding:8px 14px;flex-shrink:0;
    border-bottom:1px solid rgba(255,255,255,0.07);background:rgba(7,13,26,0.9);
}
.map-fs-tab {
    padding:5px 14px;border-radius:8px;font-size:11px;font-weight:700;
    color:rgba(255,255,255,0.5);border:none;cursor:pointer;transition:all 0.15s;
    background:transparent;
}
.map-fs-tab:hover { background:rgba(255,255,255,0.08);color:#fff; }
.map-fs-tab-active { background:linear-gradient(135deg,#006970,#00a9b4) !important;color:#fff !important; }
.map-fs-body {
    flex:1;display:flex;flex-direction:column;overflow:hidden;
}
.map-fs-strip-wrap { flex-shrink:0; }
.map-fs-map-wrap {
    flex:1;min-height:0;
}
.map-fs-tz-legend {
    flex-shrink:0;display:grid;grid-template-columns:repeat(6,1fr);gap:8px;
    padding:12px 16px;border-top:1px solid rgba(255,255,255,0.07);
    background:rgba(7,13,26,0.9);
}
.map-fs-tz-card {
    display:flex;align-items:flex-start;gap:8px;padding:10px 12px;
    border-radius:12px;border:1px solid rgba(255,255,255,0.08);
    background:rgba(255,255,255,0.04);cursor:pointer;transition:all 0.15s;text-align:left;
}
.map-fs-tz-card:hover { background:rgba(255,255,255,0.08); }
.tz-card-active { background:rgba(255,255,255,0.1) !important;border-width:2px !important; }
.tz-dot { width:12px;height:12px;border-radius:50%;flex-shrink:0;margin-top:2px;transition:all 0.2s; }

/* transition */
.map-fs-zoom-enter-active { transition:all 0.3s cubic-bezier(.16,1,.3,1); }
.map-fs-zoom-leave-active { transition:all 0.2s ease; }
.map-fs-zoom-enter-from   { opacity:0;transform:scale(0.94); }
.map-fs-zoom-leave-to     { opacity:0;transform:scale(0.96); }
</style>
