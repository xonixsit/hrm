<script setup>
import { ref, computed } from 'vue';
import { Head } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import { useTheme } from '@/composables/useTheme';
import TrainingDashboard  from './Partials/Dashboard.vue';
import TrainingReview     from './Partials/ReviewSession.vue';
import TrainingManual     from './Partials/ManualLibrary.vue';
import TrainingQuiz       from './Partials/QuizRecall.vue';
import TrainingAnalytics  from './Partials/Analytics.vue';
import PresentationMode   from './Partials/PresentationMode.vue';

const { isDark } = useTheme();

const props = defineProps({
    modules:     Array,
    pages:       Array,
    flashcards:  Array,
    progressMap: Object,
    userStats:   Object,
});

// ── State ─────────────────────────────────────────────────────────────────────
const activeTab         = ref('review'); // 'review', 'manual', 'quiz', 'analytics'
const reviewMode        = ref('overview'); // 'overview' | 'session'
const showDrawer        = ref(false);
const showPresentation  = ref(false);
const selectedModuleId  = ref(null);
const selectedPageNum   = ref(null);
const localProgressMap  = ref({ ...props.progressMap || {} });
const localStats        = ref({ ...props.userStats || {} });

const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Training Portal', href: route('training.index') },
];

// ── SM-2 logic (client-side mirror) ──────────────────────────────────────────
function calculateRetrievability(prog) {
    if (!prog?.last_reviewed_at) return 100;
    const elapsed   = Math.max(0, (Date.now() - new Date(prog.last_reviewed_at).getTime()) / 86400000);
    const stability = prog.stability || prog.interval || 1;
    return Math.min(100, Math.max(0, Math.round(Math.exp(-elapsed / stability) * 100)));
}

// ── Computed stats ────────────────────────────────────────────────────────────
const dueCards = computed(() => {
    const nowIso = new Date().toISOString();
    return (props.flashcards || []).filter(c => {
        const p = localProgressMap.value[c.card_key];
        if (!p) return true;
        return (p.next_review_at && p.next_review_at <= nowIso) || p.state === 'new' || p.state === 'learning';
    });
});

const avgRetrievability = computed(() => {
    const cards = props.flashcards || [];
    const total = cards.length || 1;
    const sum   = cards.reduce((s, c) => s + calculateRetrievability(localProgressMap.value[c.card_key]), 0);
    return Math.round(sum / total);
});

const stateCounts = computed(() => {
    const counts = { new: 0, learning: 0, review: 0, mastered: 0 };
    (props.flashcards || []).forEach(c => {
        const state = localProgressMap.value[c.card_key]?.state || 'new';
        counts[state] = (counts[state] || 0) + 1;
    });
    return counts;
});

// ── Save review (API + local update) ─────────────────────────────────────────
async function saveReview(cardKey, rating) {
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        const res = await fetch(route('training.review'), {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'X-CSRF-TOKEN': csrfToken, 
                'Accept': 'application/json' 
            },
            body: JSON.stringify({ card_key: cardKey, rating }),
        });
        const data = await res.json();
        if (data.progress) {
            localProgressMap.value = { ...localProgressMap.value, [cardKey]: data.progress };
        }
        if (data.stats) {
            localStats.value = { ...data.stats };
        }
    } catch (e) {
        console.error('[Training] saveReview failed:', e);
    }
}

async function resetProgress() {
    if (!confirm('Reset all learning progress? This cannot be undone.')) return;
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    await fetch(route('training.reset'), { 
        method: 'POST', 
        headers: { 'X-CSRF-TOKEN': csrfToken } 
    });
    localProgressMap.value = {};
}

// ── Navigation helpers ────────────────────────────────────────────────────────
function goToModule(modId, firstPageNum) {
    selectedModuleId.value = modId;
    if (firstPageNum) {
        selectedPageNum.value = firstPageNum;
    } else {
        const mod = (props.modules || []).find(m => m.module_key === modId);
        if (mod) {
            try {
                const pages = Array.isArray(mod.pages) ? mod.pages : JSON.parse(mod.pages || '[]');
                selectedPageNum.value = pages.length ? pages[0] : 1;
            } catch {
                selectedPageNum.value = 1;
            }
        } else {
            selectedPageNum.value = 1;
        }
    }
    activeTab.value = 'manual';
}
function goToPage(pageNum)  { selectedPageNum.value = pageNum; selectedModuleId.value = null; activeTab.value = 'manual'; }
function startReview()     { activeTab.value = 'review'; reviewMode.value = 'session'; }
function finishReview()    { reviewMode.value = 'overview'; }
</script>

<template>
    <Head title="Employee Training Portal" />
    <AuthenticatedLayout>
        <PageLayout
            title="Employee Training Portal"
            subtitle="Interactive Employee Manual, Flashcards & Verification System"
            :breadcrumbs="breadcrumbs"
            maxWidth="full"
            padding="none"
            class="bg-transparent"
        >
            <template #actions>
                <div class="flex items-center gap-3">
                    <div v-for="stat in [
                        { label:'TOTAL MODULES',    value:'12 Units',                                icon:'📚', iconColor:'text-teal-600'   },
                        { label:'STUDY STREAK',     value:(localStats.streak_days||1)+' Days',       icon:'🔥', iconColor:'text-orange-500'  },
                        { label:'OVERALL MASTERY',  value:avgRetrievability+'%',                     icon:'✅', iconColor:'text-emerald-600' },
                        { label:'EST. TIME LEFT',   value:Math.max(0,Math.round(((props.flashcards?.length||0) - (stateCounts?.mastered||0)) * 0.2))+' Hours', icon:'⏱', iconColor:'text-teal-500' },
                    ]" :key="stat.label"
                        class="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl border shadow-sm min-w-[130px]"
                        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
                        <span class="text-xl flex-shrink-0" :class="stat.iconColor">{{ stat.icon }}</span>
                        <div>
                            <p class="text-[10px] font-bold uppercase tracking-wider" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ stat.label }}</p>
                            <p class="text-sm font-extrabold leading-tight" :class="isDark ? 'text-white' : 'text-slate-800'">{{ stat.value }}</p>
                        </div>
                    </div>
                </div>
            </template>

            <div class="space-y-6">
                <!-- HRM Navigation Tab Bar & Action CTAs -->
                <div class="border shadow-sm rounded-xl p-1.5 overflow-x-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3" 
                    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
                    <nav class="flex items-center gap-1.5 overflow-x-auto">
                        <button v-for="tab in [
                            { id:'review',    label: `Daily Review${dueCards.length ? ' ('+dueCards.length+')' : ''}`, icon: '⚡' },
                            { id:'manual',    label: 'Training Manual', icon: '📚' },
                            { id:'quiz',      label: 'Practice Quiz', icon: '❓' },
                            { id:'analytics', label: 'Progress & Analytics', icon: '📈' },
                        ]" :key="tab.id"
                            @click="activeTab = tab.id"
                            class="px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5"
                            :class="activeTab === tab.id
                                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-sm'
                                : isDark 
                                    ? 'text-gray-300 hover:bg-gray-700/70 hover:text-white' 
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-teal-700'">
                            <span>{{ tab.icon }}</span>
                            <span>{{ tab.label }}</span>
                        </button>
                    </nav>

                    <!-- CTAs -->
                    <div class="flex items-center gap-2 shrink-0 px-1">
                        <!-- Presentation launch button -->
                        <button @click="showPresentation = true"
                            class="px-3.5 py-2 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 border shadow-sm whitespace-nowrap"
                            :class="isDark ? 'bg-gray-700 border-gray-600 text-purple-300 hover:bg-gray-600' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'">
                            🎬 <span>Presentation</span>
                        </button>
                        <button @click="startReview"
                            class="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold rounded-lg text-xs shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap">
                            ✨ <span>{{ dueCards.length ? `Start Review (${dueCards.length} Due)` : 'Start Review' }}</span>
                        </button>
                        <button @click="showDrawer = true"
                            class="px-3.5 py-2 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 border shadow-sm whitespace-nowrap"
                            :class="isDark ? 'bg-gray-700 border-gray-600 text-teal-300 hover:bg-gray-650' : 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'">
                            📊 <span>Stats &amp; Study Guide</span>
                            <span class="text-[10px] bg-teal-600 text-white px-1.5 py-0.5 rounded-md font-extrabold ml-0.5">{{ avgRetrievability }}%</span>
                        </button>
                    </div>
                </div>

                <!-- Tab Panels -->
                <div>
                    <!-- Review Tab: Overview (module cards) or active session -->
                    <template v-if="activeTab === 'review'">
                        <!-- Module Overview with Start Review CTA -->
                        <div v-if="reviewMode === 'overview'">
                            <TrainingDashboard
                                :modules="modules" :flashcards="flashcards" :progress-map="localProgressMap"
                                :user-stats="localStats" :due-count="dueCards.length" :avg-retrievability="avgRetrievability"
                                :state-counts="stateCounts" :is-dark="isDark"
                                @start-review="startReview"
                                @open-study-guide="showDrawer = true"
                                @go-to-module="goToModule" />
                        </div>
                        <!-- Flashcard Review Session -->
                        <TrainingReview v-else
                            :queue-cards="dueCards.length ? dueCards : flashcards"
                            :progress-map="localProgressMap" :is-dark="isDark"
                            @save-review="saveReview"
                            @finish="finishReview"
                            @go-to-page="goToPage" />
                    </template>

                    <!-- Manual Tab -->
                    <TrainingManual v-else-if="activeTab === 'manual'"
                        :pages="pages" :flashcards="flashcards" :modules="modules"
                        :progress-map="localProgressMap" :is-dark="isDark"
                        :selected-module-id="selectedModuleId" :selected-page-num="selectedPageNum"
                        @save-review="saveReview" />

                    <!-- Quiz Tab -->
                    <TrainingQuiz v-else-if="activeTab === 'quiz'"
                        :flashcards="flashcards" :progress-map="localProgressMap" :is-dark="isDark"
                        @save-review="saveReview"
                        @go-to-page="goToPage" />

                    <!-- Analytics Tab -->
                    <TrainingAnalytics v-else-if="activeTab === 'analytics'"
                        :flashcards="flashcards" :progress-map="localProgressMap"
                        :user-stats="localStats" :is-dark="isDark"
                        @reset-progress="resetProgress" />
                </div>

                <!-- Right Drawer Modal -->
                <Transition name="drawer">
                    <div v-if="showDrawer" class="fixed inset-0 z-50 overflow-hidden flex justify-end p-3 sm:p-4 md:p-6 pointer-events-none">
                        <!-- Drawer Panel Container -->
                        <div class="relative w-full max-w-md lg:max-w-lg text-white shadow-2xl rounded-2xl border border-teal-700/60 flex flex-col h-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] z-10 overflow-hidden pointer-events-auto" 
                            style="background: linear-gradient(180deg, #005f66 0%, #003c42 100%)">
                            
                            <!-- Fixed Modal Header -->
                            <div class="flex items-center justify-between border-b border-white/15 p-5 shrink-0 bg-teal-900/60 backdrop-blur-md">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-lg shadow-inner">📊</div>
                                    <div>
                                        <h2 class="text-base font-extrabold tracking-tight">Progress &amp; Study Guide</h2>
                                        <p class="text-xs text-teal-200/80 font-medium">E-Tax Planner USA Operational Stats</p>
                                    </div>
                                </div>
                                <button @click="showDrawer = false" 
                                    class="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white focus:outline-none"
                                    title="Close modal">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <!-- Smooth Scrollable Body -->
                            <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
                                <!-- Minimalistic Key Metrics Grid -->
                                <div class="grid grid-cols-2 gap-2.5">
                                    <div v-for="s in [
                                        { label:'Due Today',  value: dueCards.length,             sub: (props.flashcards?.length || 0)+' total',    icon:'⏱' },
                                        { label:'Retention',  value: avgRetrievability+'%',        sub:'Target >80%',                  icon:'📈' },
                                        { label:'Streak',     value:(localStats?.streak_days||1)+'d', sub:'Consecutive Days',            icon:'🔥' },
                                        { label:'Mastered',   value: stateCounts?.mastered||0,     sub:Math.round(((stateCounts?.mastered||0)/(props.flashcards?.length||1))*100)+'% of Manual', icon:'🏆' },
                                    ]" :key="s.label"
                                        class="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col justify-between space-y-1.5 group">
                                        <div class="flex items-center justify-between">
                                            <span class="text-[10px] font-bold uppercase tracking-wider text-teal-200/60 group-hover:text-teal-200 transition-colors">{{ s.label }}</span>
                                            <span class="text-xs opacity-75 group-hover:opacity-100 transition-opacity">{{ s.icon }}</span>
                                        </div>
                                        <div>
                                            <div class="text-xl font-extrabold text-white tracking-tight leading-none">{{ s.value }}</div>
                                            <div class="text-[10px] text-teal-200/50 font-medium mt-1 truncate">{{ s.sub }}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Mastery Breakdown -->
                                <div class="bg-white/10 rounded-2xl p-5 border border-white/15 space-y-4">
                                    <div class="flex items-center gap-2 text-white font-extrabold text-sm">🎯 Mastery Breakdown</div>
                                    <div class="h-3 rounded-full overflow-hidden flex bg-black/25 border border-white/15">
                                        <div :style="{ width: (((stateCounts?.new||0)/(props.flashcards?.length||1))*100)+'%' }" class="bg-sky-400"></div>
                                        <div :style="{ width: (((stateCounts?.learning||0)/(props.flashcards?.length||1))*100)+'%' }" class="bg-amber-400"></div>
                                        <div :style="{ width: (((stateCounts?.review||0)/(props.flashcards?.length||1))*100)+'%' }" class="bg-white/70"></div>
                                        <div :style="{ width: (((stateCounts?.mastered||0)/(props.flashcards?.length||1))*100)+'%' }" class="bg-emerald-400"></div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2 text-xs">
                                        <div v-for="s in [
                                            {label:'New',      count:stateCounts?.new||0,      color:'bg-sky-400'},
                                            {label:'Learning', count:stateCounts?.learning||0, color:'bg-amber-400'},
                                            {label:'Review',   count:stateCounts?.review||0,   color:'bg-white/70'},
                                            {label:'Mastered', count:stateCounts?.mastered||0, color:'bg-emerald-400'},
                                        ]" :key="s.label"
                                            class="bg-white/10 p-2.5 rounded-lg border border-white/15 flex items-center gap-2">
                                            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="s.color"></span>
                                            <span class="text-white/80 text-[11px]">{{ s.label }}: <strong class="text-white font-bold">{{ s.count }}</strong></span>
                                        </div>
                                    </div>
                                    <button @click="showDrawer=false; startReview()"
                                        class="w-full py-3 bg-white text-teal-800 font-bold rounded-xl text-xs shadow-md transition-all hover:bg-teal-50 active:scale-[0.99] flex items-center justify-center gap-2">
                                        ✨ Start Practice Session
                                    </button>
                                </div>

                                <!-- Study Guidelines -->
                                <div class="bg-white/10 rounded-2xl p-5 border border-white/15 space-y-4">
                                    <div class="flex items-center gap-2 text-white font-extrabold text-sm">📄 Employee Study Guidelines</div>
                                    <div class="space-y-2.5 text-xs">
                                        <div v-for="g in [
                                            {title:'1. Daily Active Practice', body:'Completing daily reviews ensures maximum retention with minimal effort.'},
                                            {title:'2. Verbatim Accuracy',    body:'Focus on key tax figures, dollar limits, and form names.'},
                                            {title:'3. Practice Quizzes',     body:'Use the Practice Quiz tab to test verbatim recall against exact manual questions.'},
                                        ]" :key="g.title"
                                            class="p-3 rounded-xl bg-white/10 border border-white/15 space-y-1">
                                            <span class="font-extrabold text-white block text-xs">{{ g.title }}</span>
                                            <p class="text-teal-100/70 text-[11px] leading-relaxed">{{ g.body }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>

                <!-- Footer -->
                <footer class="border-t pt-4 pb-2 text-center text-xs font-medium" 
                    :class="isDark ? 'border-gray-800 text-gray-500' : 'border-slate-200 text-slate-400'">
                    E-TAX PLANNER Employee Training Manual USA • Chicago IL 60659 &nbsp;|&nbsp; 100% Verbatim Content Compliance
                </footer>
            </div>
        </PageLayout>
    </AuthenticatedLayout>

    <!-- Fullscreen Presentation overlay (outside PageLayout, covers everything) -->
    <Teleport to="body">
        <PresentationMode
            v-if="showPresentation"
            :pages="pages"
            :modules="modules"
            :is-dark="isDark"
            @exit="showPresentation = false" />
    </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
}

.custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.25);
    border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.45);
}
</style>
