<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { router } from '@inertiajs/vue3';

const emit = defineEmits(['close']);
const props = defineProps({ categories: Object });

const title       = ref('');
const description = ref('');
const category    = ref('lead_conversion');
const phase       = ref('writing');
const titleRef    = ref(null);
const inkClass    = ref('');
const showCatMenu = ref(false);

// Text-only icons (no emoji — avoids encoding issues)
const categoryIcons = {
    lead_conversion:  '[Call]',
    sales_strategy:   '[Sales]',
    client_retention: '[Client]',
    tax_consultation: '[Tax]',
    payment_process:  '[Pay]',
    team_process:     '[Team]',
    other:            '[Idea]',
};

function selectCategory(key) {
    category.value = key;
    showCatMenu.value = false;
}

function onDescriptionInput() {
    inkClass.value = '';
    nextTick(() => { inkClass.value = 'ink-new'; });
}

function send() {
    if (!canSend.value) return;
    phase.value = 'folding';
    setTimeout(() => {
        phase.value = 'flying';
        setTimeout(() => {
            router.post(route('ideas.store'), {
                title: title.value, description: description.value, category: category.value,
            }, {
                preserveScroll: true,
                onSuccess: () => { phase.value = 'sent'; setTimeout(() => emit('close'), 2200); },
                onError:   () => { phase.value = 'writing'; },
            });
        }, 800);
    }, 600);
}

function close() { if (phase.value === 'writing') emit('close'); }
function onKey(e) {
    if (e.key === 'Escape') {
        if (showCatMenu.value) { showCatMenu.value = false; }
        else if (phase.value === 'writing') emit('close');
    }
}

onMounted(() => {
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    if (!document.getElementById('caveat-font')) {
        const link = document.createElement('link');
        link.id = 'caveat-font'; link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap';
        document.head.appendChild(link);
    }
    nextTick(() => setTimeout(() => titleRef.value?.focus(), 120));
});
onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKey);
    document.body.style.overflow = '';
});

const charCount      = computed(() => description.value.length);
const canSend        = computed(() => title.value.trim().length >= 3 && description.value.trim().length >= 20);
const activeCatLabel = computed(() => {
    const full = props.categories?.[category.value] || category.value;
    // Strip leading emoji/icon — return just the text part after first space
    return full.replace(/^[^\s]+\s*/, '');
});
</script>

<template>
<div class="idea-backdrop" @click.self="close">

    <Transition name="paper-in">
        <div v-if="phase === 'writing'" class="idea-paper">

            <!-- Header -->
            <div class="paper-header">
                <div class="paper-holes">
                    <div class="hole"></div>
                    <div class="hole"></div>
                    <div class="hole"></div>
                </div>
                <span class="paper-label">Idea Box</span>
                <button @click="close" class="paper-close" title="Close">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>

            <div class="margin-line"></div>

            <!-- Category row -->
            <div class="paper-category-row" @click.stop>
                <span class="line-label">Re:</span>
                <div class="cat-selector-wrap">
                    <button @click="showCatMenu = !showCatMenu" class="cat-pill">
                        <span class="cat-pill-text">{{ activeCatLabel }}</span>
                        <span class="cat-caret">{{ showCatMenu ? '&#9650;' : '&#9660;' }}</span>
                    </button>
                    <Transition name="cat-drop">
                        <div v-if="showCatMenu" class="cat-menu">
                            <button v-for="(label, key) in categories" :key="key"
                                @click="selectCategory(key)"
                                class="cat-option"
                                :class="{ 'cat-option-active': category === key }">
                                {{ label.replace(/^[^\s]+\s*/, '') }}
                            </button>
                        </div>
                    </Transition>
                </div>
            </div>

            <!-- Subject -->
            <div class="paper-subject-row">
                <span class="line-label">Subject:</span>
                <input ref="titleRef" v-model="title" maxlength="120"
                    placeholder="Write the subject of your idea..."
                    class="title-input" spellcheck="false"/>
            </div>
            <div class="subject-rule"></div>

            <!-- Body -->
            <div class="paper-body-area">
                <div class="lined-paper"></div>
                <textarea v-model="description" maxlength="1500"
                    placeholder="Describe your idea in detail...&#10;How does it improve sales, leads, tax filing or payments?"
                    class="idea-textarea" :class="inkClass"
                    spellcheck="false" @input="onDescriptionInput">
                </textarea>
            </div>

            <!-- Footer -->
            <div class="paper-footer">
                <span class="char-count" :class="charCount < 20 ? 'insufficient' : 'sufficient'">
                    {{ charCount < 20 ? (20 - charCount) + ' more chars needed' : charCount + '/1500' }}
                </span>
                <button @click="send" :disabled="!canSend"
                    class="send-btn" :class="canSend ? 'send-active' : 'send-disabled'">
                    Send Idea
                </button>
            </div>
        </div>
    </Transition>

    <!-- Folding animation — paper squeezes into envelope shape -->
    <div v-if="phase === 'folding'" class="folding-wrap">
        <div class="folding-paper">
            <div class="fold-stripe fold-stripe-top"></div>
            <div class="fold-stripe fold-stripe-bottom"></div>
            <div class="fold-content">
                <div class="fold-line"></div>
                <div class="fold-line"></div>
                <div class="fold-line short"></div>
            </div>
        </div>
    </div>

    <!-- Flying envelope -->
    <div v-if="phase === 'flying'" class="flying-envelope">
        <svg width="72" height="54" viewBox="0 0 72 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Envelope body -->
            <rect x="1" y="1" width="70" height="52" rx="5" fill="#fdf9f0" stroke="#c9a844" stroke-width="2"/>
            <!-- Flap fold lines -->
            <path d="M1 6l35 26L71 6" stroke="#c9a844" stroke-width="2" stroke-linecap="round"/>
            <!-- Bottom triangle folds -->
            <path d="M1 54L28 30" stroke="#ddd0a0" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M71 54L44 30" stroke="#ddd0a0" stroke-width="1.5" stroke-linecap="round"/>
            <!-- Motion lines -->
            <path d="M-8 20h6M-12 30h8M-8 40h5" stroke="#00a9b4" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
        </svg>
    </div>

    <!-- Sent confirmation -->
    <Transition name="sent-pop">
        <div v-if="phase === 'sent'" class="sent-card">
            <!-- Animated envelope with checkmark -->
            <div class="sent-envelope-wrap">
                <svg class="sent-envelope" width="90" height="68" viewBox="0 0 90 68" fill="none">
                    <!-- Body -->
                    <rect x="1" y="1" width="88" height="66" rx="6" fill="#fdf9f0" stroke="#006970" stroke-width="2.5"/>
                    <!-- Flap -->
                    <path d="M1 8l44 32 44-32" stroke="#006970" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
                <!-- Checkmark circle -->
                <div class="sent-check-circle">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="15" fill="#006970"/>
                        <path d="M9 16l5 5 9-10" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
            <h3 class="sent-title">Idea Sent!</h3>
            <p class="sent-sub">Your idea is on its way to the admin inbox. Thank you for contributing!</p>
        </div>
    </Transition>
</div>
</template>

<style scoped>
.idea-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(15,15,30,0.78); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
}
.idea-paper {
    position: relative; width: 100%; max-width: 560px;
    background: #fdf9f0; border-radius: 3px 3px 2px 2px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2),
                inset 0 0 0 1px rgba(180,140,80,0.25);
    overflow: visible;
}
.paper-header {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 16px 9px;
    background: #f5eddc; border-bottom: 1px solid #e8d9b5;
    border-radius: 3px 3px 0 0;
}
.paper-holes { display: flex; flex-direction: column; gap: 7px; }
.hole { width: 10px; height: 10px; border-radius: 50%; background: #d4c4a0; border: 1px solid #c4b48a; }
.paper-label {
    flex: 1; font-family: 'Caveat', cursive; font-size: 16px; font-weight: 700; color: #8b6914;
}
.paper-close {
    width: 26px; height: 26px; border-radius: 50%; background: transparent; border: none;
    cursor: pointer; color: #9b7d3a; display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
}
.paper-close:hover { background: rgba(155,125,58,0.18); }

.margin-line {
    position: absolute; left: 54px; top: 0; bottom: 0; width: 1.5px;
    background: #f87171; opacity: 0.55; pointer-events: none; z-index: 5;
}

.paper-category-row {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 16px 8px 66px; border-bottom: 1px dashed #e0d0a8;
    position: relative; z-index: 20; overflow: visible;
}
.line-label {
    font-family: 'Caveat', cursive; font-size: 14px; font-weight: 600;
    color: #9b7d3a; white-space: nowrap;
}
.cat-selector-wrap { position: relative; }
.cat-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px 4px 12px;
    border: 1.5px solid #c9a84c; border-radius: 20px;
    background: #fef3d0; cursor: pointer;
    font-family: 'Caveat', cursive; font-size: 15px; color: #7a5c0a; font-weight: 600;
    box-shadow: 0 1px 4px rgba(180,140,50,0.2); transition: background 0.15s;
}
.cat-pill:hover { background: #fde8a0; }
.cat-pill:focus { outline: none; }
.cat-caret { font-size: 8px; opacity: 0.6; }
.cat-menu {
    position: absolute; top: calc(100% + 6px); left: 0;
    background: #fdf6e3; border: 1.5px solid #d9c07a; border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18); overflow: hidden; min-width: 200px; z-index: 100;
}
.cat-option {
    display: block; width: 100%; text-align: left;
    padding: 9px 14px; border: none; background: transparent; cursor: pointer;
    font-family: 'Caveat', cursive; font-size: 15px; color: #5a4000;
    transition: background 0.12s;
}
.cat-option:hover { background: #fde8a0; }
.cat-option-active { background: #fde099; font-weight: 700; color: #7a5c0a; }
.cat-drop-enter-active { transition: all 0.2s cubic-bezier(.16,1,.3,1); }
.cat-drop-leave-active { transition: all 0.15s ease; }
.cat-drop-enter-from   { opacity: 0; transform: translateY(-8px) scale(0.96); }
.cat-drop-leave-to     { opacity: 0; transform: translateY(-4px); }

.paper-subject-row {
    display: flex; align-items: center; gap: 8px; padding: 8px 16px 0 66px;
}
.title-input {
    flex: 1; background: transparent; border: none; outline: none;
    font-family: 'Caveat', cursive; font-size: 22px; font-weight: 700;
    color: #1a1a2e; padding: 2px 0 4px; caret-color: #c9a844;
}
.title-input::placeholder { color: #c9b880; font-weight: 400; font-style: italic; }
.subject-rule { height: 1.5px; background: #d0c09a; margin: 3px 16px 0 66px; }

.paper-body-area { position: relative; height: 270px; overflow: hidden; margin-top: 2px; }
.lined-paper {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image: repeating-linear-gradient(transparent, transparent 27px, #ddd0b0 27px, #ddd0b0 28.5px);
    background-position: 0 10px;
}
.idea-textarea {
    position: absolute; inset: 0; width: 100%; height: 100%;
    background: transparent; border: none; outline: none; resize: none;
    font-family: 'Caveat', cursive; font-size: 20px; font-weight: 400;
    color: #1a1a2e; caret-color: #c9a844;
    padding: 10px 16px 10px 66px; line-height: 27px; z-index: 2;
}
.idea-textarea::placeholder { color: #c9b880; font-size: 17px; }
@keyframes inkAppear {
    from { opacity: 0.5; transform: scaleX(0.97); }
    to   { opacity: 1;   transform: scaleX(1); }
}
.ink-new { animation: inkAppear 0.12s ease-out; }

.paper-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 9px 16px 13px 66px;
    background: #f5eddc; border-top: 1px solid #e8d9b5;
}
.char-count { font-size: 11px; font-family: sans-serif; }
.insufficient { color: #e05050; }
.sufficient   { color: #9b8c6a; }
.send-btn {
    display: flex; align-items: center; gap: 6px; padding: 8px 22px; border-radius: 22px;
    font-family: 'Caveat', cursive; font-size: 17px; font-weight: 700;
    border: none; cursor: pointer; transition: all 0.2s;
}
.send-active  {
    background: linear-gradient(135deg, #006970, #00a9b4); color: #fff;
    box-shadow: 0 4px 14px rgba(0,105,112,0.4);
}
.send-active:hover { filter: brightness(1.1); transform: translateY(-1px); }
.send-disabled { background: #e0d0a8; color: #a89060; cursor: not-allowed; }

.paper-in-enter-active { transition: all 0.38s cubic-bezier(.16,1,.3,1); }
.paper-in-leave-active { transition: all 0.28s ease; }
.paper-in-enter-from   { opacity: 0; transform: translateY(44px) rotate(-3deg) scale(0.9); }
.paper-in-leave-to     { opacity: 0; transform: translateY(-24px) rotate(4deg) scale(0.82); }

/* ── FOLDING ─────────────────────────────────────────────────────────── */
.folding-wrap {
    display: flex; align-items: center; justify-content: center;
}
.folding-paper {
    width: 220px; height: 160px;
    background: #fdf9f0;
    border: 1.5px solid #c9a844; border-radius: 4px;
    position: relative; overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    animation: paperFold 0.55s cubic-bezier(.4,0,.6,1) forwards;
}
.fold-stripe {
    position: absolute; left: 0; right: 0; height: 50%;
    background: #f0e6cc;
    transform-origin: center;
}
.fold-stripe-top {
    top: 0;
    animation: foldStripeTop 0.55s ease-in forwards;
}
.fold-stripe-bottom {
    bottom: 0;
    animation: foldStripeBottom 0.55s ease-in 0.05s forwards;
}
.fold-content {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; justify-content: center;
    padding: 20px 28px; gap: 8px;
}
.fold-line {
    height: 2px; background: #d0c09a; border-radius: 9999px;
    animation: fadeLineOut 0.4s ease forwards;
}
.fold-line.short { width: 60%; }

@keyframes paperFold {
    0%   { transform: scale(1); opacity: 1; }
    40%  { transform: scaleY(0.55) scaleX(0.9); }
    70%  { transform: scaleY(0.18) scaleX(0.75); }
    100% { transform: scaleY(0.08) scaleX(0.6); opacity: 0.6; }
}
@keyframes foldStripeTop {
    0%   { transform: scaleY(1); opacity: 1; }
    60%  { transform: scaleY(0) translateY(-50%); }
    100% { transform: scaleY(0) translateY(-50%); opacity: 0; }
}
@keyframes foldStripeBottom {
    0%   { transform: scaleY(1); opacity: 1; }
    60%  { transform: scaleY(0) translateY(50%); }
    100% { transform: scaleY(0) translateY(50%); opacity: 0; }
}
@keyframes fadeLineOut { 0% { opacity: 0.8; } 100% { opacity: 0; } }

/* ── FLYING ──────────────────────────────────────────────────────────── */
.flying-envelope {
    animation: flyEnvelope 0.9s cubic-bezier(.2,0,.4,1) forwards;
    transform-origin: left center;
}
@keyframes flyEnvelope {
    0%   { transform: scale(0.6) translate(-60px, 20px) rotate(-8deg); opacity: 0; }
    15%  { transform: scale(1.05) translate(0px, 0px) rotate(0deg);   opacity: 1; }
    40%  { transform: scale(1)    translate(20px, -10px) rotate(-3deg); }
    100% { transform: scale(0.4)  translate(300px, -200px) rotate(-15deg); opacity: 0; }
}

/* ── SENT ─────────────────────────────────────────────────────────────── */
.sent-card {
    text-align: center; color: #fff; padding: 36px;
    display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.sent-envelope-wrap {
    position: relative; display: inline-flex;
    animation: sentEnvelopePop 0.5s cubic-bezier(.16,1,.3,1) both;
}
.sent-envelope {
    filter: drop-shadow(0 6px 20px rgba(0,105,112,0.4));
}
.sent-check-circle {
    position: absolute; bottom: -8px; right: -8px;
    animation: checkPop 0.4s cubic-bezier(.16,1,.3,1) 0.3s both;
}
.sent-title { font-size: 28px; font-weight: 800; font-family: 'Caveat', cursive; }
.sent-sub   { font-size: 14px; opacity: 0.8; max-width: 260px; line-height: 1.5; }

@keyframes sentEnvelopePop {
    0%   { opacity: 0; transform: scale(0.5) rotate(-15deg); }
    60%  { transform: scale(1.08) rotate(3deg); }
    100% { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes checkPop {
    0%   { opacity: 0; transform: scale(0) rotate(-30deg); }
    60%  { transform: scale(1.2) rotate(5deg); }
    100% { opacity: 1; transform: scale(1) rotate(0); }
}
</style>
