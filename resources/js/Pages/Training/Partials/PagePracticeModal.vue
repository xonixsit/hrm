<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
const props = defineProps({ pageNumber: Number, pageTitle: String, cards: Array, progressMap: Object, isDark: Boolean });
const emit = defineEmits(['save-review', 'close']);

const mode = ref('flashcard');
const currentIndex = ref(0);
const isRevealed = ref(false);
const selected = ref(null);
const submitted = ref(false);

// Lock page scroll while modal is open
onMounted(()        => { document.body.style.overflow = 'hidden'; });
onBeforeUnmount(()  => { document.body.style.overflow = ''; });
const quizScore = ref(0);

const card = computed(() => props.cards[currentIndex.value]);

function predictIntervals(prog) {
    const i=prog?.interval||1, ef=prog?.ease_factor||2.5, r=prog?.repetition_count||0;
    return {1:1,2:Math.max(1,Math.round(i*1.2)),3:r===0?1:r===1?6:Math.round(i*ef),4:r===0?2:r===1?8:Math.round(i*ef*1.3)};
}
const intervals = computed(() => predictIntervals(props.progressMap[card.value?.card_key]));

const options = computed(() => {
    if (!card.value) return [];
    const correct = card.value.exact_answer_text;
    const others  = props.cards.filter(c => c.card_key !== card.value.card_key).map(c => c.exact_answer_text).slice(0, 3);
    const all     = [correct, ...others];
    all.sort((a, b) => (a.length % 2 === 0 ? 1 : -1));
    return all;
});

function handleRating(rating) {
    if (!card.value) return;
    emit('save-review', card.value.card_key, rating);
    isRevealed.value = false;
    advance();
}

function submitQuiz() {
    if (!selected.value || !card.value) return;
    submitted.value = true;
    if (selected.value === card.value.exact_answer_text) quizScore.value++;
    emit('save-review', card.value.card_key, selected.value === card.value.exact_answer_text ? 3 : 1);
}

function nextQuiz() { selected.value = null; submitted.value = false; advance(); }
function advance()  { if (currentIndex.value + 1 < props.cards.length) currentIndex.value++; else currentIndex.value = props.cards.length; }
function restart()  { currentIndex.value=0; isRevealed.value=false; selected.value=null; submitted.value=false; quizScore.value=0; }

function optStyle(opt) {
    if (!submitted.value) return selected.value===opt
        ? 'bg-teal-50 border-teal-600 text-teal-900 font-medium'
        : 'bg-slate-50 border-slate-200 hover:border-teal-400 text-slate-800';
    if (opt===card.value.exact_answer_text) return 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium';
    if (opt===selected.value) return 'bg-rose-50 border-rose-500 text-rose-900 font-medium';
    return 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
}
</script>

<template>
<Teleport to="body">
<div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
<div class="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col" style="height:calc(100vh - 2rem);max-height:calc(100vh - 2rem)">

    <!-- Header -->
    <div class="text-white p-5 border-b border-teal-800 flex items-center justify-between shrink-0" style="background:linear-gradient(135deg,#006970,#00a9b4)">
        <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-mono font-bold text-xs">P{{ pageNumber }}</span>
            <div>
                <p class="text-base font-extrabold">✨ Practice Page {{ pageNumber }} Questions</p>
                <p class="text-xs text-white/70 truncate">{{ pageTitle }}</p>
            </div>
        </div>
        <button @click="emit('close')" class="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">✕</button>
    </div>

    <!-- Mode toggle -->
    <div v-if="cards.length > 0 && currentIndex < cards.length"
        class="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
        <div class="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
            <button @click="mode='flashcard'; isRevealed=false"
                class="px-3 py-1 rounded-lg font-bold transition-all"
                :class="mode==='flashcard' ? 'text-white' : 'text-slate-700 hover:text-slate-900'"
                :style="mode==='flashcard' ? 'background:linear-gradient(135deg,#006970,#00a9b4)' : ''">
                Flashcards (SM-2)
            </button>
            <button @click="mode='quiz'; selected=null; submitted=false"
                class="px-3 py-1 rounded-lg font-bold transition-all"
                :class="mode==='quiz' ? 'text-white' : 'text-slate-700 hover:text-slate-900'"
                :style="mode==='quiz' ? 'background:linear-gradient(135deg,#006970,#00a9b4)' : ''">
                Multiple Choice Quiz
            </button>
        </div>
        <span class="font-mono text-slate-600 font-bold">{{ currentIndex+1 }} of {{ cards.length }}</span>
    </div>

    <!-- Body -->
    <div class="p-6 overflow-y-auto flex-1 space-y-6">

        <div v-if="cards.length === 0" class="text-center py-10 space-y-3">
            <p class="text-3xl">📖</p>
            <p class="font-bold text-slate-800">No practice questions for Page {{ pageNumber }} yet.</p>
        </div>

        <!-- Completed -->
        <div v-else-if="currentIndex >= cards.length" class="text-center py-8 space-y-5">
            <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">🏆</div>
            <h4 class="text-2xl font-extrabold text-slate-900">
                {{ mode === 'flashcard' ? 'SM-2 Review Complete!' : 'Quiz Complete!' }}
            </h4>
            <p class="text-xs text-slate-600">You went through all {{ cards.length }} questions.</p>
            <p v-if="mode==='quiz'" class="text-sm font-bold"
                :class="quizScore === cards.length ? 'text-emerald-600' : quizScore >= cards.length * 0.7 ? 'text-teal-600' : 'text-amber-600'">
                Score: {{ quizScore }} / {{ cards.length }}
                {{ quizScore === cards.length ? ' 🎯 Perfect!' : quizScore >= cards.length * 0.7 ? ' ✅ Good job!' : ' 📚 Keep practicing!' }}
            </p>

            <!-- Cross-navigation -->
            <div class="rounded-xl border border-slate-200 p-4 bg-slate-50 text-left space-y-2">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {{ mode === 'flashcard' ? 'Now test your recall:' : 'Reinforce with spaced repetition:' }}
                </p>
                <button
                    @click="restart(); mode = mode === 'flashcard' ? 'quiz' : 'flashcard'"
                    class="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    style="background:linear-gradient(135deg,#006970,#00a9b4)">
                    {{ mode === 'flashcard' ? '❓ Switch to Multiple Choice Quiz' : '⚡ Switch to SM-2 Flashcard Review' }}
                </button>
            </div>

            <div class="flex gap-3">
                <button @click="restart()"
                    class="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all">
                    🔁 Restart {{ mode === 'flashcard' ? 'SM-2' : 'Quiz' }}
                </button>
                <button @click="emit('close')"
                    class="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all">
                    ✕ Close
                </button>
            </div>
        </div>

        <!-- Flashcard mode -->
        <div v-else-if="mode==='flashcard'" class="space-y-6">
            <div class="space-y-2">
                <span class="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">{{ card.category }} • Page {{ pageNumber }}</span>
                <h4 class="text-lg font-extrabold text-slate-900 leading-snug">{{ card.prompt }}</h4>
            </div>
            <div v-if="!isRevealed" class="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                <p class="text-xs text-slate-500 italic">Think of the exact answer before revealing.</p>
                <button @click="isRevealed = true"
                    class="px-6 py-3 rounded-xl text-white font-bold text-xs flex items-center gap-2 mx-auto hover:opacity-90 transition-all"
                    style="background:linear-gradient(135deg,#006970,#00a9b4)">
                    🔄 Reveal Exact Verbatim Answer
                </button>
            </div>
            <div v-else class="space-y-4">
                <div class="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs leading-relaxed whitespace-pre-line">{{ card.exact_answer_text }}</div>
                <div v-if="card.key_terms?.length" class="flex flex-wrap gap-1.5 text-xs">
                    <span class="text-slate-500 font-bold text-[11px]">Key Terms:</span>
                    <span v-for="t in card.key_terms" :key="t" class="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-semibold text-[11px]">{{ t }}</span>
                </div>
                <div class="pt-3 border-t border-slate-200 space-y-2">
                    <span class="text-xs font-bold text-slate-700 block text-center uppercase tracking-wider">How well did you recall this?</span>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button @click="handleRating(1)" class="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold">Need Practice (1)</button>
                        <button @click="handleRating(2)" class="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold">Hard (2)</button>
                        <button @click="handleRating(3)" class="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold">Good (3)</button>
                        <button @click="handleRating(4)" class="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">Mastered (4)</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quiz mode -->
        <div v-else class="space-y-5">
            <div class="space-y-2">
                <span class="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">Multiple Choice</span>
                <h4 class="text-base font-extrabold text-slate-900 leading-snug">{{ card.prompt }}</h4>
            </div>
            <div class="space-y-2.5">
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
            <div class="pt-3 border-t border-slate-100">
                <button v-if="!submitted" @click="submitQuiz" :disabled="!selected"
                    class="w-full py-2.5 rounded-xl font-bold text-xs transition-all"
                    :class="selected ? 'text-white hover:opacity-90' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'"
                    :style="selected ? 'background:linear-gradient(135deg,#006970,#00a9b4)' : ''">
                    Check Answer
                </button>
                <button v-else @click="nextQuiz"
                    class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2">
                    Next Question →
                </button>
            </div>
        </div>
    </div>
</div>
</div>
</Teleport>
</template>
