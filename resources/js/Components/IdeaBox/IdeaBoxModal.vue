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
const showCatMenu = ref(false);

// Text-only icons (no emoji â€” avoids encoding issues)
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
    // No animation on input — smooth native typing only
}

function send() {
    if (!canSend.value) return;
    phase.value = 'folding';
    setTimeout(() => {
        router.post(route('ideas.store'), {
            title: title.value, description: description.value, category: category.value,
        }, {
            preserveScroll: true,
            onSuccess: () => { phase.value = 'sent'; setTimeout(() => emit('close'), 2500); },
            onError:   () => { phase.value = 'writing'; },
        });
    }, 1200);
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
    // Show full label including emoji in pill
    return full;
});
</script>

<template>
<div class="idea-backdrop" @click.self="close">

    <Transition name="paper-in">
        <div v-if="phase === 'writing'" class="idea-paper">

            <!-- Header -->
            <div class="paper-header">
                <span class="paper-label">
                    <img src="/images/getanidea.svg" alt="" style="display:inline-block;vertical-align:middle;width:28px;height:28px;margin-right:6px;" />Idea Box
                </span>
                <button @click="close" class="paper-close" title="Close">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>

            <!-- Cartoon absolutely positioned to idea-paper, overlaying header+category -->
            <img src="/images/getanidea.svg" alt=""
                style="position:absolute;right:56px;top:0px;width:100px;height:100px;pointer-events:none;z-index:5;" />

            <!-- No margin line -->

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
                                {{ label }}
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
                    class="title-input" spellcheck="false"
                    @paste.prevent />
            </div>
            <div class="subject-rule"></div>

            <!-- Body -->
            <div class="paper-body-area">
                <div class="lined-paper"></div>
                <textarea v-model="description" maxlength="1500"
                    placeholder="Describe your idea in detail...&#10;How does it improve sales, leads, tax filing or payments?"
                    class="idea-textarea"
                    spellcheck="false" @input="onDescriptionInput"
                    @paste.prevent>
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

    <!-- Mail animation SVG (replaces folding + flying) -->
    <div v-if="phase === 'folding' || phase === 'flying'" class="mail-anim-wrap">
        <img src="/images/mail_anim.svg" alt="Sending..." class="mail-anim-img" />
        <p class="mail-anim-label">Sending your idea...</p>
    </div>

    <!-- Sent confirmation -->
    <Transition name="sent-pop">
        <div v-if="phase === 'sent'" class="sent-card">
            <img src="/images/mail_sent2.svg" alt="Idea Sent" class="sent-svg" />
            <h3 class="sent-title">Idea Sent!</h3>
            <p class="sent-sub">Your idea is on its way to the admin inbox. Thank you!</p>
        </div>
    </Transition>

</div>
</template>

<style scoped>
.idea-backdrop {position:fixed;inset:0;z-index:9999;background:rgba(0,40,45,.82);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px;}
.idea-paper{position:relative;width:100%;max-width:560px;background:#ffffff;border-radius:6px 6px 3px 3px;box-shadow:0 24px 64px rgba(0,105,112,.3),0 2px 8px rgba(0,0,0,.15),inset 0 0 0 1px rgba(0,169,180,.2);overflow:visible;}
.paper-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px 10px;background:linear-gradient(135deg,#006970,#00a9b4);border-radius:6px 6px 0 0;position:relative;overflow:visible;}
.header-right{display:flex;align-items:center;position:relative;}
.paper-holes{display:none;}
.hole{display:none;}
.paper-title-area{flex:1;display:flex;align-items:center;justify-content:space-between;}
.paper-label{font-family:'Caveat',cursive;font-size:16px;font-weight:700;color:#fff;letter-spacing:.02em;}
.paper-close{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.15);border:none;cursor:pointer;color:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;transition:background .15s;}
.paper-close:hover{background:rgba(255,255,255,.28);}
.margin-line{display:none;}
.paper-category-row{display:flex;align-items:center;gap:10px;padding:9px 16px 8px 16px;border-bottom:1px dashed rgba(0,169,180,.25);position:relative;z-index:20;overflow:visible;background:rgba(0,169,180,.03);}
.line-label{font-family:'Caveat',cursive;font-size:14px;font-weight:600;color:#006970;white-space:nowrap;}
.paper-subject-row{display:flex;align-items:center;gap:8px;padding:8px 16px 0 16px;}
.title-input{flex:1;background:transparent;border:none;outline:none !important;box-shadow:none !important;font-family:'Caveat',cursive;font-size:22px;font-weight:700;color:#006970;padding:2px 0 4px;caret-color:#006970;-webkit-appearance:none;}
.title-input:focus{outline:none !important;box-shadow:none !important;border:none !important;}
.title-input::placeholder{color:rgba(0,169,180,.4);font-weight:400;font-style:italic;}
.subject-rule{height:1.5px;background:rgba(0,169,180,.2);margin:3px 16px 0 16px;}
.cat-selector-wrap{position:relative;}
.cat-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 10px 4px 12px;border:1.5px solid rgba(0,169,180,.4);border-radius:20px;background:rgba(0,169,180,.08);cursor:pointer;font-family:'Caveat',cursive;font-size:15px;color:#006970;font-weight:600;box-shadow:0 1px 4px rgba(0,105,112,.1);transition:background .15s,border-color .15s;}
.cat-pill:hover{background:rgba(0,169,180,.15);border-color:rgba(0,169,180,.6);}
.cat-pill:focus{outline:none;}
.cat-caret{font-size:8px;opacity:.6;}
.cat-menu{position:absolute;top:calc(100% + 6px);left:0;background:#f0fffe;border:1.5px solid rgba(0,169,180,.3);border-radius:12px;box-shadow:0 8px 24px rgba(0,105,112,.18);overflow:hidden;min-width:200px;z-index:100;}
.cat-option{display:block;width:100%;text-align:left;padding:9px 14px;border:none;background:transparent;cursor:pointer;font-family:'Caveat',cursive;font-size:15px;color:#004d52;transition:background .12s;}
.cat-option:hover{background:rgba(0,169,180,.12);}
.cat-option-active{background:rgba(0,169,180,.18);font-weight:700;color:#006970;}
.cat-drop-enter-active{transition:all .2s cubic-bezier(.16,1,.3,1);}
.cat-drop-leave-active{transition:all .15s ease;}
.cat-drop-enter-from{opacity:0;transform:translateY(-8px) scale(.96);}
.cat-drop-leave-to{opacity:0;transform:translateY(-4px);}
.paper-subject-row{display:flex;align-items:center;gap:8px;padding:8px 16px 0 6px;}
.title-input{flex:1;background:transparent;border:none;outline:none;font-family:'Caveat',cursive;font-size:22px;font-weight:700;color:#003d42;padding:2px 0 4px;caret-color:#006970;}
.title-input::placeholder{color:rgba(0,169,180,.4);font-weight:400;font-style:italic;}
.subject-rule{height:1.5px;background:rgba(0,169,180,.2);margin:3px 16px 0 66px;}
.paper-body-area{position:relative;height:270px;overflow:hidden;margin-top:2px;}
.lined-paper{display:none;}
.idea-textarea{position:absolute;inset:0;width:100%;height:100%;background:#ffffff;border:none;outline:none !important;box-shadow:none !important;resize:none;-webkit-appearance:none;font-family:'Caveat',cursive;font-size:20px;font-weight:400;color:#006970;caret-color:#006970;padding:10px 16px;line-height:27px;z-index:2;}
.idea-textarea:focus{outline:none !important;box-shadow:none !important;border:none !important;}
.idea-textarea::placeholder{color:rgba(0,169,180,.4);font-size:17px;}
.idea-textarea::placeholder{color:rgba(0,169,180,.4);font-size:17px;}
@keyframes inkAppear{from{opacity:.5;transform:scaleX(.97)}to{opacity:1;transform:scaleX(1)}}
.ink-new{animation:inkAppear .12s ease-out;}
.paper-footer{display:flex;align-items:center;justify-content:space-between;padding:9px 16px 13px 16px;background:rgba(0,169,180,.05);border-top:1px solid rgba(0,169,180,.15);}
.char-count{font-size:11px;font-family:sans-serif;}
.insufficient{color:#e05050;}
.sufficient{color:#006970;opacity:.7;}
.send-btn{display:flex;align-items:center;gap:6px;padding:8px 22px;border-radius:22px;font-family:'Caveat',cursive;font-size:17px;font-weight:700;border:none;cursor:pointer;transition:all .2s;}
.send-active{background:linear-gradient(135deg,#006970,#00a9b4);color:#fff;box-shadow:0 4px 14px rgba(0,105,112,.4);}
.send-active:hover{filter:brightness(1.1);transform:translateY(-1px);}
.send-disabled{background:rgba(0,169,180,.1);color:rgba(0,105,112,.4);cursor:not-allowed;}
.paper-in-enter-active{transition:all .38s cubic-bezier(.16,1,.3,1);}
.paper-in-leave-active{transition:all .28s ease;}
.paper-in-enter-from{opacity:0;transform:translateY(44px) rotate(-3deg) scale(.9);}
.paper-in-leave-to{opacity:0;transform:translateY(-24px) rotate(4deg) scale(.82);}
.folding-wrap{display:flex;align-items:center;justify-content:center;}
.folding-paper{width:220px;height:160px;background:#f8fffe;border:1.5px solid rgba(0,169,180,.35);border-radius:4px;position:relative;overflow:hidden;box-shadow:0 8px 32px rgba(0,105,112,.2);display:flex;align-items:center;justify-content:center;animation:paperFold .55s cubic-bezier(.4,0,.6,1) forwards;}
.fold-stripe{position:absolute;left:0;right:0;height:50%;transform-origin:center;}
.fold-stripe-top{top:0;background:rgba(0,169,180,.1);animation:foldStripeTop .55s ease-in forwards;}
.fold-stripe-bottom{bottom:0;background:rgba(0,169,180,.06);animation:foldStripeBottom .55s ease-in .05s forwards;}
.fold-content{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:20px 28px;gap:8px;}
.fold-line{height:2px;background:rgba(0,169,180,.25);border-radius:9999px;animation:fadeLineOut .4s ease forwards;}
.fold-line.short{width:60%;}
@keyframes paperFold{0%{transform:scale(1);opacity:1}40%{transform:scaleY(.55) scaleX(.9)}70%{transform:scaleY(.18) scaleX(.75)}100%{transform:scaleY(.08) scaleX(.6);opacity:.6}}
@keyframes foldStripeTop{0%{transform:scaleY(1);opacity:1}60%{transform:scaleY(0) translateY(-50%)}100%{transform:scaleY(0) translateY(-50%);opacity:0}}
@keyframes foldStripeBottom{0%{transform:scaleY(1);opacity:1}60%{transform:scaleY(0) translateY(50%)}100%{transform:scaleY(0) translateY(50%);opacity:0}}
@keyframes fadeLineOut{0%{opacity:.8}100%{opacity:0}}
.flying-envelope{animation:flyEnvelope .9s cubic-bezier(.2,0,.4,1) forwards;transform-origin:left center;}
@keyframes flyEnvelope{0%{transform:scale(.6) translate(-60px,20px) rotate(-8deg);opacity:0}15%{transform:scale(1.05) translate(0,0) rotate(0);opacity:1}40%{transform:scale(1) translate(20px,-10px) rotate(-3deg)}100%{transform:scale(.4) translate(300px,-200px) rotate(-15deg);opacity:0}}
.sent-card{text-align:center;color:#fff;padding:36px;display:flex;flex-direction:column;align-items:center;gap:16px;}
.sent-envelope-wrap{position:relative;display:inline-flex;animation:sentEnvelopePop .5s cubic-bezier(.16,1,.3,1) both;}
.sent-envelope{filter:drop-shadow(0 6px 20px rgba(0,105,112,.5));}
.sent-check-circle{position:absolute;bottom:-8px;right:-8px;animation:checkPop .4s cubic-bezier(.16,1,.3,1) .3s both;}
.sent-title{font-size:28px;font-weight:800;font-family:'Caveat',cursive;}
.sent-sub{font-size:14px;opacity:.8;max-width:260px;line-height:1.5;}
.sent-pop-enter-active{transition:all .5s cubic-bezier(.16,1,.3,1);}
.sent-pop-enter-from{opacity:0;transform:scale(.7);}
@keyframes sentEnvelopePop{0%{opacity:0;transform:scale(.5) rotate(-15deg)}60%{transform:scale(1.08) rotate(3deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
@keyframes checkPop{0%{opacity:0;transform:scale(0) rotate(-30deg)}60%{transform:scale(1.2) rotate(5deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
.idea-backdrop {
    position:fixed;inset:0;z-index:9999;
    background:rgba(0,40,45,.82);backdrop-filter:blur(10px);
    display:flex;align-items:center;justify-content:center;padding:20px;
}
.idea-paper {
    position:relative;width:100%;max-width:660px;
    background:#f5fffe;border-radius:6px 6px 3px 3px;
    box-shadow:0 28px 72px rgba(0,105,112,.32),0 3px 12px rgba(0,0,0,.15),
               inset 0 0 0 1px rgba(0,169,180,.22);
    overflow:visible;
}
.paper-header {
    display:flex;align-items:center;gap:12px;padding:13px 18px 11px;
    background:linear-gradient(135deg,#006970,#00a9b4);border-radius:6px 6px 0 0;
}
.paper-holes  { display:flex;flex-direction:column;gap:7px; }
.hole         { width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.3);border:1px solid rgba(255,255,255,.5); }
.paper-title-area { flex:1;display:flex;align-items:center;justify-content:space-between; }
.paper-label  { font-family:'Caveat',cursive;font-size:17px;font-weight:700;color:#fff;letter-spacing:.02em; }
.paper-close  {
    width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.15);border:none;
    cursor:pointer;color:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;
    transition:background .15s;
}
.paper-close:hover { background:rgba(255,255,255,.3); }
.margin-line {
    position:absolute;left:58px;top:0;bottom:0;width:1.5px;
    background:#00a9b4;opacity:.35;pointer-events:none;z-index:5;
}
.paper-category-row {
    display:flex;align-items:center;gap:10px;
    padding:10px 18px 9px 20px;border-bottom:1px dashed rgba(0,169,180,.25);
    position:relative;z-index:20;overflow:visible;background:rgba(0,169,180,.03);
}
.line-label { font-family:'Caveat',cursive;font-size:15px;font-weight:600;color:#006970;white-space:nowrap; }
.cat-selector-wrap { position:relative; }
.cat-pill {
    display:inline-flex;align-items:center;gap:6px;padding:5px 12px 5px 14px;
    border:1.5px solid rgba(0,169,180,.4);border-radius:20px;background:rgba(0,169,180,.08);
    cursor:pointer;font-family:'Caveat',cursive;font-size:16px;color:#006970;font-weight:600;
    box-shadow:0 1px 4px rgba(0,105,112,.1);transition:background .15s,border-color .15s;
}
.cat-pill:hover { background:rgba(0,169,180,.16);border-color:rgba(0,169,180,.6); }
.cat-pill:focus { outline:none; }
.cat-caret { font-size:8px;opacity:.6; }
.cat-menu {
    position:absolute;top:calc(100% + 6px);left:0;
    background:#f0fffe;border:1.5px solid rgba(0,169,180,.3);border-radius:12px;
    box-shadow:0 8px 24px rgba(0,105,112,.18);overflow:hidden;min-width:210px;z-index:100;
}
.cat-option {
    display:block;width:100%;text-align:left;padding:10px 16px;border:none;background:transparent;
    cursor:pointer;font-family:'Caveat',cursive;font-size:16px;color:#004d52;transition:background .12s;
}
.cat-option:hover { background:rgba(0,169,180,.12); }
.cat-option-active { background:rgba(0,169,180,.2);font-weight:700;color:#006970; }
.cat-drop-enter-active { transition:all .2s cubic-bezier(.16,1,.3,1); }
.cat-drop-leave-active { transition:all .15s ease; }
.cat-drop-enter-from   { opacity:0;transform:translateY(-8px) scale(.96); }
.cat-drop-leave-to     { opacity:0;transform:translateY(-4px); }
.paper-subject-row { display:flex;align-items:center;gap:8px;padding:9px 18px 0 20px; }
.title-input {
    flex:1;background:transparent;border:none;outline:none;
    font-family:'Caveat',cursive;font-size:24px;font-weight:700;
    color:#003d42;padding:2px 0 4px;caret-color:#006970;
}
.title-input::placeholder { color:rgba(0,169,180,.45);font-weight:400;font-style:italic; }
.subject-rule { height:1.5px;background:rgba(0,169,180,.2);margin:3px 18px 0 72px; }
.paper-body-area { position:relative;height:300px;overflow:hidden;margin-top:2px; }
.lined-paper { display:none; }
.idea-textarea {
    position:absolute;inset:0;width:100%;height:100%;
    background:#ffffff;border:none;outline:none;resize:none;
    font-family:'Caveat',cursive;font-size:22px;font-weight:400;
    color:#006970;caret-color:#006970;
    padding:11px 18px 11px 72px;line-height:29px;z-index:2;
}
.idea-textarea::placeholder { color:rgba(0,169,180,.4);font-size:18px; }
@keyframes inkAppear { from{opacity:.5;transform:scaleX(.97)} to{opacity:1;transform:scaleX(1)} }
.ink-new { animation:inkAppear .12s ease-out; }
.paper-footer {
    display:flex;align-items:center;justify-content:space-between;
    padding:10px 18px 14px 72px;
    background:rgba(0,169,180,.05);border-top:1px solid rgba(0,169,180,.15);
}
.char-count { font-size:12px;font-family:sans-serif; }
.insufficient { color:#e05050; }
.sufficient   { color:#006970;opacity:.7; }
.send-btn {
    display:flex;align-items:center;gap:6px;padding:9px 24px;border-radius:22px;
    font-family:'Caveat',cursive;font-size:18px;font-weight:700;
    border:none;cursor:pointer;transition:all .2s;
}
.send-active  { background:linear-gradient(135deg,#006970,#00a9b4);color:#fff;box-shadow:0 4px 14px rgba(0,105,112,.4); }
.send-active:hover { filter:brightness(1.1);transform:translateY(-1px); }
.send-disabled { background:rgba(0,169,180,.1);color:rgba(0,105,112,.35);cursor:not-allowed; }
.paper-in-enter-active { transition:all .38s cubic-bezier(.16,1,.3,1); }
.paper-in-leave-active { transition:all .28s ease; }
.paper-in-enter-from   { opacity:0;transform:translateY(44px) rotate(-3deg) scale(.9); }
.paper-in-leave-to     { opacity:0;transform:translateY(-24px) rotate(4deg) scale(.82); }
.folding-wrap { display:flex;align-items:center;justify-content:center; }
.folding-paper {
    width:240px;height:170px;background:#f5fffe;
    border:1.5px solid rgba(0,169,180,.35);border-radius:4px;
    position:relative;overflow:hidden;box-shadow:0 8px 32px rgba(0,105,112,.2);
    display:flex;align-items:center;justify-content:center;
    animation:paperFold .55s cubic-bezier(.4,0,.6,1) forwards;
}
.fold-stripe { position:absolute;left:0;right:0;height:50%;transform-origin:center; }
.fold-stripe-top    { top:0;background:rgba(0,169,180,.1);animation:foldStripeTop .55s ease-in forwards; }
.fold-stripe-bottom { bottom:0;background:rgba(0,169,180,.06);animation:foldStripeBottom .55s ease-in .05s forwards; }
.fold-content { position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:22px 30px;gap:8px; }
.fold-line { height:2px;background:rgba(0,169,180,.25);border-radius:9999px;animation:fadeLineOut .4s ease forwards; }
.fold-line.short { width:60%; }
@keyframes paperFold    { 0%{transform:scale(1);opacity:1} 40%{transform:scaleY(.55) scaleX(.9)} 70%{transform:scaleY(.18) scaleX(.75)} 100%{transform:scaleY(.08) scaleX(.6);opacity:.6} }
@keyframes foldStripeTop    { 0%{transform:scaleY(1);opacity:1} 60%{transform:scaleY(0) translateY(-50%)} 100%{transform:scaleY(0) translateY(-50%);opacity:0} }
@keyframes foldStripeBottom { 0%{transform:scaleY(1);opacity:1} 60%{transform:scaleY(0) translateY(50%)}  100%{transform:scaleY(0) translateY(50%);opacity:0} }
@keyframes fadeLineOut { 0%{opacity:.8} 100%{opacity:0} }
.flying-envelope { animation:flyEnvelope .9s cubic-bezier(.2,0,.4,1) forwards;transform-origin:left center; }
@keyframes flyEnvelope {
    0%  {transform:scale(.6) translate(-60px,20px) rotate(-8deg);opacity:0}
    15% {transform:scale(1.05) translate(0,0) rotate(0);opacity:1}
    40% {transform:scale(1) translate(20px,-10px) rotate(-3deg)}
    100%{transform:scale(.4) translate(300px,-200px) rotate(-15deg);opacity:0}
}
.sent-card  { text-align:center;color:#fff;padding:36px;display:flex;flex-direction:column;align-items:center;gap:16px; }
.sent-envelope-wrap { position:relative;display:inline-flex;animation:sentEnvelopePop .5s cubic-bezier(.16,1,.3,1) both; }
.sent-envelope { filter:drop-shadow(0 6px 20px rgba(0,105,112,.5)); }
.sent-check-circle { position:absolute;bottom:-8px;right:-8px;animation:checkPop .4s cubic-bezier(.16,1,.3,1) .3s both; }
.sent-title { font-size:30px;font-weight:800;font-family:'Caveat',cursive; }
.sent-sub   { font-size:14px;opacity:.8;max-width:280px;line-height:1.5; }
.sent-pop-enter-active { transition:all .5s cubic-bezier(.16,1,.3,1); }
.sent-pop-enter-from   { opacity:0;transform:scale(.7); }
@keyframes sentEnvelopePop { 0%{opacity:0;transform:scale(.5) rotate(-15deg)} 60%{transform:scale(1.08) rotate(3deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
@keyframes checkPop { 0%{opacity:0;transform:scale(0) rotate(-30deg)} 60%{transform:scale(1.2) rotate(5deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }

/* Mail animation overlay */
.mail-anim-wrap {
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
}
.mail-anim-img {
    width:180px;height:180px;
    animation:mailPop .4s cubic-bezier(.16,1,.3,1) both;
}
.mail-anim-label {
    color:rgba(255,255,255,.7);font-size:14px;font-family:'Caveat',cursive;font-weight:600;
    animation:mailPop .4s cubic-bezier(.16,1,.3,1) .15s both;
}
@keyframes mailPop {
    from { opacity:0;transform:scale(.6); }
    to   { opacity:1;transform:scale(1); }
}
</style>

.sent-svg { width:160px;height:160px;animation:sentSvgPop .5s cubic-bezier(.16,1,.3,1) both; }
@keyframes sentSvgPop { from{opacity:0;transform:scale(.5) rotate(-15deg)} 60%{transform:scale(1.08) rotate(3deg)} to{opacity:1;transform:scale(1) rotate(0)} }
