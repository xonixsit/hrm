<script setup>
const props = defineProps({ flashcards: Array, progressMap: Object, userStats: Object, isDark: Boolean });
const emit  = defineEmits(['reset-progress']);

function ret(cardKey) {
    const p = props.progressMap[cardKey];
    if (!p?.last_reviewed_at) return 100;
    const elapsed   = Math.max(0, (Date.now() - new Date(p.last_reviewed_at).getTime()) / 86400000);
    const stability = p.stability || p.interval || 1;
    return Math.min(100, Math.max(0, Math.round(Math.exp(-elapsed / stability) * 100)));
}

const totalReviews = props.flashcards.reduce((s, c) => s + (props.progressMap[c.card_key]?.history?.length || 0), 0);
const avgRet       = Math.round(props.flashcards.reduce((s, c) => s + ret(c.card_key), 0) / (props.flashcards.length || 1));
const mastered     = props.flashcards.filter(c => props.progressMap[c.card_key]?.state === 'mastered').length;
</script>

<template>
<div class="space-y-8">
    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div v-for="s in [
            { label:'Total Reviews',  value: totalReviews,                    color:'text-teal-600'   },
            { label:'Retention',      value: avgRet+'%',                      color:'text-emerald-600'},
            { label:'Streak',         value: (userStats?.streak_days||1)+'d', color:'text-amber-600'  },
            { label:'Mastered Items', value: mastered,                        color:'text-teal-700'   },
        ]" :key="s.label"
            class="p-5 rounded-2xl border shadow-sm space-y-1"
            :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
            <p class="text-xs font-bold uppercase tracking-wider" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ s.label }}</p>
            <p class="text-3xl font-extrabold" :class="s.color">{{ s.value }}</p>
        </div>
    </div>

    <!-- Per-card table -->
    <div class="rounded-2xl border shadow-sm" :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b" :class="isDark ? 'border-gray-700' : 'border-slate-200'">
            <div>
                <h2 class="text-xl font-extrabold flex items-center gap-2" :class="isDark ? 'text-white' : 'text-slate-900'">✅ Topic & Item Progress Breakdown</h2>
                <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Per-item review status, interval, and retention score.</p>
            </div>
            <button @click="emit('reset-progress')"
                class="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs transition-colors self-start">
                Reset All Progress
            </button>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead>
                    <tr class="border-b" :class="isDark ? 'border-gray-700 text-gray-400' : 'border-slate-200 text-slate-500'">
                        <th class="py-3 px-4 font-bold uppercase">Prompt</th>
                        <th class="py-3 px-4 font-bold uppercase">Page</th>
                        <th class="py-3 px-4 font-bold uppercase">State</th>
                        <th class="py-3 px-4 font-bold uppercase">Interval</th>
                        <th class="py-3 px-4 font-bold uppercase">Reviews</th>
                        <th class="py-3 px-4 font-bold uppercase">Retention</th>
                    </tr>
                </thead>
                <tbody :class="isDark ? 'divide-y divide-gray-700' : 'divide-y divide-slate-100'">
                    <tr v-for="card in flashcards" :key="card.card_key"
                        class="transition-colors" :class="isDark ? 'hover:bg-gray-700/50' : 'hover:bg-slate-50'">
                        <td class="py-3 px-4 font-medium max-w-xs truncate" :class="isDark ? 'text-white' : 'text-slate-900'">{{ card.prompt }}</td>
                        <td class="py-3 px-4 font-mono" :class="isDark ? 'text-gray-400' : 'text-slate-500'">P{{ card.page_number }}</td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                                :class="progressMap[card.card_key]?.state === 'mastered'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : progressMap[card.card_key]?.state === 'review'
                                        ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                        : 'bg-amber-100 text-amber-800 border border-amber-200'">
                                {{ progressMap[card.card_key]?.state || 'New' }}
                            </span>
                        </td>
                        <td class="py-3 px-4 font-mono" :class="isDark ? 'text-gray-300' : 'text-slate-700'">{{ progressMap[card.card_key]?.interval || 1 }}d</td>
                        <td class="py-3 px-4 font-mono" :class="isDark ? 'text-gray-300' : 'text-slate-700'">{{ progressMap[card.card_key]?.repetition_count || 0 }}</td>
                        <td class="py-3 px-4 font-extrabold text-emerald-600">{{ ret(card.card_key) }}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
</template>
