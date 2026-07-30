<script setup>
import { ref, computed } from 'vue';

const props = defineProps({ queueCards: Array, progressMap: Object, isDark: Boolean });
const emit  = defineEmits(['save-review', 'finish', 'go-to-page']);

const currentIndex   = ref(0);
const isRevealed     = ref(false);
const sessionCount   = ref(0);

const currentCard = computed(() => props.queueCards[currentIndex.value]);
const progress    = computed(() => currentIndex.value / (props.queueCards.length || 1) * 100);

function predictIntervals(prog) {
    const i = prog?.interval || 1, ef = prog?.ease_factor || 2.5, r = prog?.repetition_count || 0;
    return { 1:1, 2:Math.max(1,Math.round(i*1.2)), 3:r===0?1:r===1?6:Math.round(i*ef), 4:r===0?2:r===1?8:Math.round(i*ef*1.3) };
}

function handleRating(rating) {
    if (!currentCard.value) return;
    emit('save-review', currentCard.value.card_key, rating);
    sessionCount.value++;
    isRevealed.value = false;
    if (currentIndex.value + 1 < props.queueCards.length) currentIndex.value++;
    else currentIndex.value = props.queueCards.length;
}

const intervals = computed(() => predictIntervals(props.progressMap[currentCard.value?.card_key]));
</script>

<template>
<div class="max-w-4xl mx-auto space-y-6">

    <!-- Back to modules -->
    <div class="flex items-center gap-3">
        <button @click="emit('finish')"
            class="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors"
            :class="isDark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'">
            ← Back to Modules
        </button>
        <span class="text-xs font-semibold" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Daily Review Session</span>
    </div>

    <!-- Session complete -->
    <div v-if="!currentCard || currentIndex >= queueCards.length"
        class="text-center py-12 rounded-2xl border p-8"
        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
        <div class="text-5xl mb-4">🏆</div>
        <h2 class="text-2xl font-extrabold mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">Daily Review Complete!</h2>
        <p class="text-sm mb-6" :class="isDark ? 'text-gray-300' : 'text-slate-600'">You reviewed <strong>{{ sessionCount }} items</strong> today!</p>
        <button @click="emit('finish')"
            class="px-6 py-2.5 text-white font-bold rounded-xl text-sm transition-all hover:opacity-90"
            style="background:linear-gradient(135deg,#006970,#00a9b4)">
            ← Back to Modules
        </button>
    </div>

    <!-- Active card -->
    <template v-else>
        <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs font-semibold" :class="isDark ? 'text-gray-300' : 'text-slate-600'">
                <span>✨ Daily Practice Queue</span>
                <span>Card {{ currentIndex+1 }} of {{ queueCards.length }}</span>
            </div>
            <div class="h-2 rounded-full overflow-hidden" :class="isDark ? 'bg-gray-700' : 'bg-slate-200'">
                <div class="h-full transition-all duration-300" style="background:linear-gradient(135deg,#006970,#00a9b4)" :style="{ width: progress+'%' }"></div>
            </div>
        </div>

        <div class="rounded-2xl border shadow-md overflow-hidden" :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
            <div class="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
                :class="isDark ? 'bg-gray-750 border-gray-700' : 'bg-slate-50 border-slate-200'">
                <div class="flex items-center gap-2">
                    <span class="px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
                        Page {{ currentCard.page_number }}
                    </span>
                    <span :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ currentCard.category }}</span>
                </div>
                <button @click="emit('go-to-page', currentCard.page_number)"
                    class="text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1 hover:underline">
                    📖 View Manual Page
                </button>
            </div>

            <div class="p-6 sm:p-8 space-y-6">
                <div class="space-y-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-teal-600">Question Prompt:</span>
                    <h2 class="text-xl sm:text-2xl font-extrabold leading-snug" :class="isDark ? 'text-white' : 'text-slate-900'">
                        {{ currentCard.prompt }}
                    </h2>
                </div>

                <div v-if="!isRevealed" class="text-center border-t pt-6" :class="isDark ? 'border-gray-700' : 'border-slate-100'">
                    <p class="text-xs italic mb-4" :class="isDark ? 'text-gray-400' : 'text-slate-400'">Think of the exact answer before revealing.</p>
                    <button @click="isRevealed = true"
                        class="px-8 py-3 text-white font-bold rounded-xl shadow-md transition-all hover:opacity-90 flex items-center gap-2 mx-auto"
                        style="background:linear-gradient(135deg,#006970,#00a9b4)">
                        🔄 Show Verbatim Manual Answer
                    </button>
                </div>

                <div v-else class="border-t pt-6 space-y-4" :class="isDark ? 'border-gray-700' : 'border-slate-100'">
                    <div class="flex items-center justify-between text-xs">
                        <span class="font-bold text-emerald-600 flex items-center gap-1">✅ Exact Source Text (Page {{ currentCard.page_number }}):</span>
                        <span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold">100% Verbatim</span>
                    </div>
                    <div class="p-5 rounded-xl bg-slate-900 text-white font-mono text-sm leading-relaxed whitespace-pre-line">
                        {{ currentCard.exact_answer_text }}
                    </div>
                    <div v-if="currentCard.key_terms?.length" class="flex flex-wrap gap-1.5 text-xs">
                        <span class="text-slate-500 font-semibold">Key Terms:</span>
                        <span v-for="term in currentCard.key_terms" :key="term"
                            class="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-medium">{{ term }}</span>
                    </div>
                </div>
            </div>

            <div v-if="isRevealed" class="border-t p-6 space-y-3" :class="isDark ? 'bg-gray-750 border-gray-700' : 'bg-slate-50 border-slate-200'">
                <span class="text-xs font-bold text-center block uppercase tracking-wider" :class="isDark ? 'text-gray-300' : 'text-slate-600'">
                    How well did you recall this?
                </span>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button @click="handleRating(1)" class="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-center text-xs font-bold transition-all">
                        <div class="font-bold">Need Practice (1)</div><div class="text-slate-500 font-semibold mt-0.5">Tomorrow</div>
                    </button>
                    <button @click="handleRating(2)" class="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-center text-xs font-bold transition-all">
                        <div class="font-bold">Hard (2)</div><div class="text-slate-500 font-semibold mt-0.5">In {{ intervals[2] }}d</div>
                    </button>
                    <button @click="handleRating(3)" class="p-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-center text-xs font-bold transition-all">
                        <div class="font-bold">Good (3)</div><div class="text-slate-500 font-semibold mt-0.5">In {{ intervals[3] }}d</div>
                    </button>
                    <button @click="handleRating(4)" class="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-center text-xs font-bold transition-all">
                        <div class="font-bold">Mastered (4)</div><div class="text-slate-500 font-semibold mt-0.5">In {{ intervals[4] }}d</div>
                    </button>
                </div>
            </div>
        </div>
    </template>
</div>
</template>
