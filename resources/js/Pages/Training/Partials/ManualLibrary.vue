<script setup>
import { ref, computed, watch } from 'vue';
import PagePracticeModal from './PagePracticeModal.vue';
import USAMapEmbed from './USAMapEmbed.vue';

const props = defineProps({
    pages: Array, flashcards: Array, modules: Array,
    progressMap: Object, isDark: Boolean,
    selectedModuleId: String, selectedPageNum: Number,
});
const emit = defineEmits(['save-review']);

const searchQuery     = ref('');
const activeModule    = ref(props.selectedModuleId || (props.modules?.[0]?.module_key ?? null));
const activePage      = ref(props.selectedPageNum  || 1);
const practicePageNum = ref(null);
const pillsRef        = ref(null);

watch(() => props.selectedModuleId, v => { if (v) activeModule.value = v; });
watch(() => props.selectedPageNum,  v => { if (v) activePage.value  = v; });

// When module changes, jump to its first page
watch(activeModule, modKey => {
    if (!modKey) return;
    const mod = (props.modules || []).find(m => m.module_key === modKey);
    if (mod) {
        const pages = parsePages(mod);
        if (pages.length) activePage.value = pages[0];
    }
});

function parsePages(mod) {
    if (Array.isArray(mod.pages)) return mod.pages;
    try { return JSON.parse(mod.pages || '[]'); } catch { return []; }
}

const filteredPages = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    return props.pages.filter(p => {
        // If searching, show all matching pages across the module
        if (q) {
            const inModule = activeModule.value
                ? props.modules.find(m => m.module_key === activeModule.value)
                    ? parsePages(props.modules.find(m => m.module_key === activeModule.value)).includes(p.page_number)
                    : true
                : true;
            if (!inModule) return false;
            return p.title.toLowerCase().includes(q) || p.verbatim_text?.some(t => t.toLowerCase().includes(q));
        }
        // No search: show only the active single page
        return p.page_number === activePage.value;
    });
});

function cardsForPage(n) { return props.flashcards.filter(c => c.page_number === n); }

function ret(cardKey) {
    const p = props.progressMap[cardKey];
    if (!p?.last_reviewed_at) return 100;
    const elapsed = Math.max(0, (Date.now() - new Date(p.last_reviewed_at).getTime()) / 86400000);
    return Math.min(100, Math.max(0, Math.round(Math.exp(-elapsed / (p.stability || p.interval || 1)) * 100)));
}

function selectPage(n) {
    activePage.value = n;
    if (n !== null) {
        const mod = props.modules.find(m => parsePages(m).includes(n));
        if (mod) activeModule.value = mod.module_key;
    }
    searchQuery.value = ''; // clear search when navigating pages
}
</script>

<template>
<div class="space-y-6">

    <!-- Filters -->
    <div class="rounded-2xl p-5 border shadow-sm space-y-4" :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Search -->
            <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input v-model="searchQuery" type="text" placeholder="Search (W2, ITIN, 183 days)..."
                    class="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-teal-500 transition-colors"
                    :class="isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'" />
                <button v-if="searchQuery" @click="searchQuery=''" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>
            <!-- Module filter -->
            <select v-model="activeModule"
                class="w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                <option v-for="m in modules" :key="m.module_key" :value="m.module_key">{{ m.title }}</option>
            </select>
            <!-- Page jump -->
            <div class="flex items-center gap-1.5">
                <button :disabled="activePage !== null && activePage <= 1" @click="selectPage(activePage !== null ? activePage-1 : 1)"
                    class="p-2 rounded-xl border disabled:opacity-40 transition-colors shrink-0"
                    :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-600'">◀</button>
                <select :value="activePage"
                    @change="e => selectPage(parseInt(e.target.value))"
                    class="flex-1 px-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                    :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                    <option v-for="p in pages" :key="p.page_number" :value="p.page_number">Page {{ p.page_number }}: {{ p.title }}</option>
                </select>
                <button :disabled="activePage !== null && activePage >= 26" @click="selectPage(activePage !== null ? activePage+1 : 2)"
                    class="p-2 rounded-xl border disabled:opacity-40 transition-colors shrink-0"
                    :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-600'">▶</button>
            </div>
        </div>

        <!-- Page strip -->
        <div class="pt-3 border-t" :class="isDark ? 'border-gray-700' : 'border-slate-200'">
            <div class="flex items-center gap-2">
                <button @click="pillsRef?.scrollBy({left:-260,behavior:'smooth'})"
                    class="p-2 rounded-xl border text-xs shrink-0 transition-colors"
                    :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-600'">◀</button>
                <div ref="pillsRef" class="flex gap-1.5 overflow-x-auto py-1 [scrollbar-width:none]">
                    <button v-for="p in pages" :key="p.page_number"
                        @click="selectPage(p.page_number)"
                        class="px-3 py-1 rounded-lg font-mono text-xs font-semibold shrink-0 transition-all"
                        :class="activePage === p.page_number
                            ? 'text-white ring-2 ring-teal-500 ring-offset-1'
                            : isDark ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:text-teal-300' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:text-teal-600'"
                        :style="activePage === p.page_number ? 'background:linear-gradient(135deg,#006970,#00a9b4)' : ''">
                        P{{ p.page_number }}
                    </button>
                </div>
                <button @click="pillsRef?.scrollBy({left:260,behavior:'smooth'})"
                    class="p-2 rounded-xl border text-xs shrink-0 transition-colors"
                    :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-600'">▶</button>
            </div>
        </div>
    </div>

    <!-- Empty -->
    <div v-if="filteredPages.length === 0" class="text-center py-12 rounded-2xl border" :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
        <p class="text-2xl mb-2">📄</p>
        <p class="font-bold" :class="isDark ? 'text-white' : 'text-slate-800'">No pages match your search.</p>
        <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Try terms like "W2", "1095", "183 days".</p>
    </div>

    <!-- Pages -->
    <div v-for="page in filteredPages" :key="page.page_number" class="rounded-2xl border shadow-sm overflow-hidden" :class="isDark ? 'border-gray-700' : 'border-slate-200'">
        <!-- Page header -->
        <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b text-white" style="background:linear-gradient(135deg,#006970,#00a9b4)">
            <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-mono font-bold text-xs">P{{ page.page_number }}</span>
                <div>
                    <h2 class="text-base font-extrabold">{{ page.title }}</h2>
                    <span class="text-xs text-white/70">{{ page.module_title }}</span>
                </div>
            </div>
            <div class="flex items-center gap-3 text-xs">
                <span class="text-white/80">{{ cardsForPage(page.page_number).length }} Questions</span>
                <button @click="practicePageNum = page.page_number"
                    class="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold flex items-center gap-1 transition-colors">
                    ✨ Practice Page {{ page.page_number }}
                </button>
            </div>
        </div>

        <!-- Verbatim text -->
        <div class="p-6 sm:p-8 space-y-3" :class="isDark ? 'bg-gray-800' : 'bg-white'">
            <template v-for="(para, i) in page.verbatim_text" :key="i">
                <p class="p-3 rounded-lg text-sm leading-relaxed transition-colors"
                    :class="para.startsWith('•') || para.startsWith('❖')
                        ? isDark ? 'bg-gray-700/60 border border-gray-600 text-gray-200 font-medium pl-6' : 'bg-teal-50/50 border border-teal-100 text-slate-900 font-medium pl-6'
                        : para.toUpperCase() === para && para.length < 60
                            ? isDark ? 'bg-teal-900/30 border-l-4 border-teal-500 text-teal-300 font-extrabold text-base' : 'bg-teal-50 border-l-4 border-teal-600 text-teal-900 font-extrabold text-base'
                            : isDark ? 'bg-gray-750 border border-gray-700 text-gray-200 hover:border-gray-600' : 'bg-slate-50 border border-slate-200 text-slate-800 hover:border-slate-300'">{{ para }}</p>
                <!-- USA Map embed: inject after "USA STATES" heading on page 2 -->
                <USAMapEmbed v-if="page.page_number === 2 && para === 'USA STATES'" :is-dark="isDark" class="mt-2" />
            </template>

            <!-- Practice Questions Section -->
            <div v-if="cardsForPage(page.page_number).length"
                class="mt-6 rounded-2xl border overflow-hidden"
                :class="isDark ? 'border-gray-700' : 'border-slate-200'">

                <!-- Section header — matches reference -->
                <div class="flex items-center justify-between px-5 py-4 border-b"
                    :class="isDark ? 'bg-gray-750 border-gray-700' : 'bg-white border-slate-100'">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl flex items-center justify-center text-teal-600"
                            :class="isDark ? 'bg-teal-900/40' : 'bg-teal-50'">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-extrabold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">Practice Questions</p>
                            <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Test your knowledge of the concepts on this page</p>
                        </div>
                    </div>
                    <button @click="practicePageNum = page.page_number"
                        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm transition-all hover:opacity-90"
                        style="background:linear-gradient(135deg,#006970,#00a9b4)">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        Start Practice
                    </button>
                </div>

                <!-- Question cards -->
                <div class="divide-y" :class="isDark ? 'divide-gray-700' : 'divide-slate-100'">
                    <div v-for="card in cardsForPage(page.page_number)" :key="card.card_key"
                        class="px-5 py-4 space-y-2"
                        :class="isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-slate-50/60'">

                        <!-- Title + state badge -->
                        <div class="flex items-start justify-between gap-3">
                            <p class="font-bold text-sm leading-snug" :class="isDark ? 'text-white' : 'text-slate-900'">
                                {{ card.title }}
                            </p>
                            <span class="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide"
                                :class="progressMap[card.card_key]?.state === 'mastered'
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    : progressMap[card.card_key]?.state === 'review'
                                        ? 'bg-teal-100 text-teal-700 border border-teal-200'
                                        : 'bg-amber-100 text-amber-700 border border-amber-200'">
                                {{ progressMap[card.card_key]?.state || 'New' }}
                            </span>
                        </div>

                        <!-- Prompt text -->
                        <p class="text-sm leading-relaxed line-clamp-2" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                            {{ card.prompt }}
                        </p>

                        <!-- Meta row: Interval · Difficulty · Retention bar -->
                        <div class="flex items-center gap-4 pt-1 text-xs"
                            :class="isDark ? 'text-gray-500' : 'text-slate-400'">
                            <span class="flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                Interval: {{ progressMap[card.card_key]?.interval || 1 }}d
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                                </svg>
                                Difficulty: {{ progressMap[card.card_key]?.ease_factor >= 2.5 ? 'Easy' : progressMap[card.card_key]?.ease_factor >= 2.0 ? 'Medium' : 'Hard' }}
                            </span>
                            <div class="flex items-center gap-2 ml-auto">
                                <span class="font-extrabold uppercase tracking-wider text-[10px]"
                                    :class="ret(card.card_key) >= 80 ? (isDark ? 'text-teal-400' : 'text-teal-600') : 'text-amber-500'">
                                    Retention: {{ ret(card.card_key) }}%
                                </span>
                                <div class="w-24 h-1.5 rounded-full overflow-hidden" :class="isDark ? 'bg-gray-700' : 'bg-slate-200'">
                                    <div class="h-full rounded-full transition-all duration-500"
                                        :style="`width:${ret(card.card_key)}%;background:${ret(card.card_key) >= 80 ? 'linear-gradient(135deg,#006970,#00a9b4)' : '#f59e0b'}`">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer nav — Prev / Next -->
        <div class="px-6 py-4 border-t flex items-center justify-between gap-4"
            :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'">
            <button :disabled="page.page_number <= 1" @click="selectPage(page.page_number - 1)"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold disabled:opacity-40 transition-all hover:shadow-sm"
                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                <span>Previous Page (P{{ page.page_number - 1 }})</span>
            </button>

            <span class="text-xs font-semibold" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                Page {{ page.page_number }} of 26
            </span>

            <button :disabled="page.page_number >= 26" @click="selectPage(page.page_number + 1)"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-40 transition-all hover:opacity-90 text-white"
                style="background:linear-gradient(135deg,#006970,#00a9b4)">
                <span>Next Page (P{{ page.page_number + 1 }})</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
            </button>
        </div>
    </div>

    <!-- Practice Modal -->
    <PagePracticeModal v-if="practicePageNum !== null"
        :page-number="practicePageNum"
        :page-title="pages.find(p => p.page_number === practicePageNum)?.title || ''"
        :cards="flashcards.filter(c => c.page_number === practicePageNum)"
        :progress-map="progressMap" :is-dark="isDark"
        @save-review="(key, rating) => emit('save-review', key, rating)"
        @close="practicePageNum = null" />
</div>
</template>
