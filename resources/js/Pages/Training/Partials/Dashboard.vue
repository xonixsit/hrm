<script setup>
import { ref } from 'vue';

const props = defineProps({
    modules: Array, flashcards: Array, progressMap: Object,
    userStats: Object, dueCount: Number, avgRetrievability: Number,
    stateCounts: Object, isDark: Boolean,
});
const emit = defineEmits(['start-review', 'go-to-module', 'open-study-guide']);

function parsePages(mod) {
    if (Array.isArray(mod.pages)) return mod.pages;
    try { return JSON.parse(mod.pages || '[]'); } catch { return []; }
}
function getFirstPage(mod) {
    const pages = parsePages(mod);
    return pages.length ? pages[0] : 1;
}

const categoryLabels = {
    'mod-1':  'CORE',
    'mod-2':  'GEOGRAPHY',
    'mod-3':  'TAXES',
    'mod-4':  'IMMIGRATION',
    'mod-5':  'FILING',
    'mod-6':  'TAXPAYER ID',
    'mod-7':  'FORMS',
    'mod-8':  'COMPLIANCE',
    'mod-9':  'HEALTHCARE',
    'mod-10': '1099 & 401K',
    'mod-11': 'DEDUCTIONS',
    'mod-12': 'CREDITS',
};
function getCategoryLabel(modKey) {
    return categoryLabels[modKey] || 'MODULE';
}
function masteredInModule(modKey) {
    return (props.flashcards || []).filter(c => c.module_key === modKey && props.progressMap[c.card_key]?.state === 'mastered').length;
}
function cardsInModule(modKey) {
    return (props.flashcards || []).filter(c => c.module_key === modKey).length;
}
function masteryPct(modKey) {
    const total = cardsInModule(modKey);
    return total ? Math.round(masteredInModule(modKey) / total * 100) : 0;
}
</script>

<template>
<div class="space-y-2">

    <!-- Section header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" :class="isDark ? 'border-gray-700' : 'border-slate-200'">
        <div>
            <h2 class="text-xl font-extrabold flex items-center gap-2" :class="isDark ? 'text-white' : 'text-slate-900'">
                📚 Training Manual Modules (12 Modules)
            </h2>
            <p class="text-xs mt-0.5 font-medium" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                100% Verbatim E-Tax Planner USA Manual Content. Click any module to study its pages.
            </p>
        </div>
        <div class="flex items-center gap-2 self-start sm:self-auto">
            <button @click="emit('start-review')"
                class="inline-flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl shadow-sm transition-all hover:opacity-90"
                style="background:linear-gradient(135deg,#006970,#00a9b4)">
                ⚡ Start Review <span v-if="dueCount" class="bg-white/30 text-white px-1.5 py-0.5 rounded-md font-extrabold">{{ dueCount }} Due</span>
            </button>
            <button @click="emit('open-study-guide')"
                class="inline-flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3.5 py-2 rounded-xl transition-colors">
                📊 Progress →
            </button>
        </div>
    </div>

    <!-- Module Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="mod in modules" :key="mod.module_key"
            class="flex flex-col rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md"
            :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">

            <!-- Card body -->
            <div class="flex-1 p-5 space-y-3">
                <!-- Top: PAGES tag + CATEGORY tag + mastered checkmark -->
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border"
                        :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-slate-100 border-slate-200 text-slate-500'">
                        PAGES {{ parsePages(mod).join('-') }}
                    </span>
                    <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border"
                        :class="isDark ? 'bg-teal-900/40 border-teal-700 text-teal-300' : 'bg-slate-100 border-slate-200 text-slate-500'">
                        {{ getCategoryLabel(mod.module_key) }}
                    </span>
                    <span v-if="masteryPct(mod.module_key) >= 90" class="ml-auto text-teal-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </span>
                </div>

                <!-- Title -->
                <h3 class="font-bold text-base leading-snug" :class="isDark ? 'text-white' : 'text-slate-900'">
                    {{ mod.title }}
                </h3>

                <!-- Description -->
                <p class="text-xs leading-relaxed line-clamp-3" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ mod.description }}</p>

                <!-- Proficiency bar -->
                <div class="space-y-1 pt-1">
                    <div class="flex items-center justify-between text-[11px] font-semibold">
                        <span :class="isDark ? 'text-gray-400' : 'text-slate-600'">
                            Proficiency: <strong :class="masteryPct(mod.module_key) > 0 ? 'text-teal-600' : isDark ? 'text-gray-500' : 'text-slate-400'">{{ masteryPct(mod.module_key) }}%</strong>
                        </span>
                        <span :class="masteryPct(mod.module_key) >= 90 ? 'font-bold text-teal-600' : isDark ? 'text-gray-500' : 'text-slate-400'">
                            {{ masteryPct(mod.module_key) >= 90 ? 'Mastered' : masteryPct(mod.module_key) > 0 ? 'In Progress' : 'Not Started' }}
                        </span>
                    </div>
                    <div class="h-1.5 rounded-full overflow-hidden" :class="isDark ? 'bg-gray-700' : 'bg-slate-100'">
                        <div class="h-full rounded-full transition-all duration-500"
                            :style="{ width: masteryPct(mod.module_key)+'%', background: 'linear-gradient(135deg,#006970,#00a9b4)' }"></div>
                    </div>
                </div>
            </div>

            <!-- Full-width CTA button -->
            <div class="px-5 pb-5">
                <button @click="emit('go-to-module', mod.module_key, getFirstPage(mod))"
                    class="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 hover:opacity-90"
                    :class="masteryPct(mod.module_key) >= 90
                        ? isDark ? 'bg-gray-700 text-teal-300 border border-teal-700' : 'bg-slate-100 text-teal-700 border border-teal-200 hover:bg-slate-200'
                        : 'text-white'"
                    :style="masteryPct(mod.module_key) < 90 ? 'background:linear-gradient(135deg,#006970,#00a9b4)' : ''">
                    <span>{{ masteryPct(mod.module_key) >= 90 ? 'Review Content' : 'Start Learning' }}</span>
                    <span>{{ masteryPct(mod.module_key) >= 90 ? '↺' : '→' }}</span>
                </button>
            </div>
        </div>
    </div>
</div>
</template>
