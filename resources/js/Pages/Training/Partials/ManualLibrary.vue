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
                    class="p-2.5 rounded-xl border disabled:opacity-40 transition-colors"
                    :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'">◀</button>
                <select :value="activePage"
                    @change="e => selectPage(parseInt(e.target.value))"
                    class="flex-1 px-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                    :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                    <option v-for="p in pages" :key="p.page_number" :value="p.page_number">Page {{ p.page_number }}: {{ p.title }}</option>
                </select>
                <button :disabled="activePage !== null && activePage >= 26" @click="selectPage(activePage !== null ? activePage+1 : 2)"
                    class="p-2.5 rounded-xl border disabled:opacity-40 transition-colors"
                    :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'">▶</button>
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

            <!-- Questions summary -->
            <div v-if="cardsForPage(page.page_number).length" class="mt-4 pt-4 border-t space-y-3" :class="isDark ? 'border-gray-700' : 'border-slate-200'">
                <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-teal-600 flex items-center gap-1">✅ Practice Questions:</span>
                    <button @click="practicePageNum = page.page_number"
                        class="px-3 py-1 rounded-lg text-white font-bold text-[11px] flex items-center gap-1 hover:opacity-90 transition-all"
                        style="background:linear-gradient(135deg,#006970,#00a9b4)">
                        ✨ Start Practice
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div v-for="card in cardsForPage(page.page_number)" :key="card.card_key"
                        class="p-3.5 rounded-xl border space-y-2 text-xs"
                        :class="isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-200 shadow-sm'">
                        <div class="flex items-center justify-between">
                            <span class="font-extrabold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ card.title }}</span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                                :class="progressMap[card.card_key]?.state === 'mastered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : progressMap[card.card_key]?.state === 'review' ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'">
                                {{ progressMap[card.card_key]?.state || 'New' }}
                            </span>
                        </div>
                        <p class="line-clamp-2" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ card.prompt }}</p>
                        <div class="flex items-center justify-between pt-1 border-t text-[11px]" :class="isDark ? 'border-gray-600' : 'border-slate-100'">
                            <span :class="isDark ? 'text-gray-500' : 'text-slate-400'">Interval: {{ progressMap[card.card_key]?.interval || 1 }}d</span>
                            <span class="font-extrabold" :class="ret(card.card_key) >= 80 ? 'text-emerald-600' : 'text-amber-600'">Retention: {{ ret(card.card_key) }}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer nav -->
        <div class="px-6 py-3 border-t flex items-center justify-between text-xs font-bold"
            :class="isDark ? 'bg-gray-750 border-gray-700' : 'bg-slate-50 border-slate-200'">
            <button :disabled="page.page_number <= 1" @click="selectPage(page.page_number-1)"
                class="px-3.5 py-1.5 rounded-lg border flex items-center gap-1.5 disabled:opacity-40 transition-colors"
                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'">
                ◀ P{{ page.page_number-1 }}
            </button>
            <span class="font-mono" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Page {{ page.page_number }} of 26</span>
            <button :disabled="page.page_number >= 26" @click="selectPage(page.page_number+1)"
                class="px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-40 text-white hover:opacity-90 transition-all"
                style="background:linear-gradient(135deg,#006970,#00a9b4)">
                P{{ page.page_number+1 }} ▶
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
