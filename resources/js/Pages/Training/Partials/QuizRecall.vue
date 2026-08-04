<script setup>
import { ref, computed } from 'vue';
const props = defineProps({ flashcards: Array, progressMap: Object, isDark: Boolean });
const emit  = defineEmits(['save-review', 'go-to-page', 'go-to-review']);

const quizCards    = computed(() => props.flashcards.slice(0, 15));
const currentIndex = ref(0);
const selected     = ref(null);
const submitted    = ref(false);
const score        = ref(0);

const card = computed(() => quizCards.value[currentIndex.value]);

const options = computed(() => {
    if (!card.value) return [];
    const correct     = card.value.exact_answer_text;
    const distractors = props.flashcards.filter(c => c.card_key !== card.value.card_key).map(c => c.exact_answer_text).slice(0, 3);
    const all         = [correct, ...distractors];
    all.sort((a, b) => (a.length % 2 === 0 ? 1 : -1));
    return all;
});

function submit() {
    if (!selected.value || !card.value) return;
    submitted.value = true;
    const correct = selected.value === card.value.exact_answer_text;
    if (correct) score.value++;
    emit('save-review', card.value.card_key, correct ? 3 : 1);
}

function next() { selected.value = null; submitted.value = false; currentIndex.value++; }
function restart() { currentIndex.value=0; score.value=0; selected.value=null; submitted.value=false; }

function optStyle(opt) {
    if (!submitted.value) return selected.value===opt
        ? 'bg-teal-50 border-teal-600 text-teal-900 font-medium'
        : 'bg-slate-50 border-slate-200 hover:border-teal-500 text-slate-800';
    if (opt===card.value.exact_answer_text) return 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium';
    if (opt===selected.value) return 'bg-rose-50 border-rose-500 text-rose-900 font-medium';
    return 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
}
</script>

<template>
<div class="max-w-3xl mx-auto space-y-6">
    <div v-if="!card || currentIndex >= quizCards.length"
        class="text-center py-12 rounded-2xl border p-8 space-y-5"
        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
        <div class="text-5xl">🏆</div>
        <h2 class="text-2xl font-extrabold" :class="isDark ? 'text-white' : 'text-slate-900'">Quiz Complete!</h2>
        <p class="text-sm" :class="isDark ? 'text-gray-300' : 'text-slate-600'">
            Score: <strong class="text-emerald-600">{{ score }} / {{ quizCards.length }}</strong>
        </p>
        <!-- Score feedback -->
        <p class="text-xs font-medium px-4" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
            {{ score === quizCards.length ? '🎯 Perfect score! You know this content well.' :
               score >= quizCards.length * 0.7 ? '✅ Good recall! Keep reviewing to reinforce.' :
               '📚 Keep studying — the SM-2 review will help build retention.' }}
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button @click="restart"
                class="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all"
                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'">
                🔁 Retry Quiz
            </button>
            <button @click="emit('go-to-review')"
                class="px-6 py-2.5 text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all flex items-center gap-2"
                style="background:linear-gradient(135deg,#006970,#00a9b4)">
                ⚡ Start SM-2 Review
            </button>
        </div>
        <p class="text-xs font-medium" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
            SM-2 review schedules cards based on your memory strength
        </p>
    </div>

    <template v-else>
        <div class="flex items-center justify-between text-xs font-bold p-4 rounded-xl border"
            :class="isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-slate-200 text-slate-600'">
            <span>❓ Verbatim Active Recall Quiz</span>
            <span>Question {{ currentIndex+1 }} of {{ quizCards.length }} • Score: {{ score }}</span>
        </div>

        <div class="rounded-2xl border p-6 sm:p-8 space-y-6" :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full">Manual Page {{ card.page_number }}</span>
                    <button @click="emit('go-to-page', card.page_number)" class="text-xs text-slate-500 hover:text-teal-600 font-bold underline">📖 Inspect Source</button>
                </div>
                <h2 class="text-xl font-extrabold leading-snug" :class="isDark ? 'text-white' : 'text-slate-900'">{{ card.prompt }}</h2>
            </div>

            <div class="space-y-3">
                <div v-for="(opt, idx) in options" :key="idx"
                    @click="!submitted && (selected = opt)"
                    class="p-3.5 rounded-xl border cursor-pointer transition-all text-xs leading-relaxed flex items-start gap-2.5"
                    :class="optStyle(opt)">
                    <span class="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-[10px] shrink-0 mt-0.5">{{ String.fromCharCode(65+idx) }}</span>
                    <span class="flex-1 font-medium">{{ opt }}</span>
                    <span v-if="submitted && opt===card.exact_answer_text">✅</span>
                    <span v-else-if="submitted && opt===selected">❌</span>
                </div>
            </div>

            <div class="pt-4 border-t" :class="isDark ? 'border-gray-700' : 'border-slate-100'">
                <button v-if="!submitted" @click="submit" :disabled="!selected"
                    class="w-full py-2.5 rounded-xl font-bold text-xs transition-all"
                    :class="selected ? 'text-white hover:opacity-90' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'"
                    :style="selected ? 'background:linear-gradient(135deg,#006970,#00a9b4)' : ''">
                    Check Answer
                </button>
                <button v-else @click="next" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                    Next Question →
                </button>
            </div>
        </div>
    </template>
</div>
</template>
