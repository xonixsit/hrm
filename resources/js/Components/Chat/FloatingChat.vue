<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { usePage } from '@inertiajs/vue3';
import { useTheme } from '@/composables/useTheme';
import { markConversationReadGlobal } from '@/composables/useChatNotifications';
import {
    floatingWindows,
    getWindowState,
    closeFloatingChat,
    minimizeFloatingChat,
    restoreFloatingChat,
} from '@/composables/useFloatingChat';
import axios from 'axios';
import RichTextEditor from '@/Components/Chat/RichTextEditor.vue';
import DOMPurify from 'dompurify';

const sanitize = (html) => DOMPurify.sanitize(html, { 
    USE_PROFILES: { html: true },
    ADD_TAGS: ['svg', 'path', 'circle'],
    ADD_ATTR: ['xmlns', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'style']
});

const { isDark } = useTheme();
const page       = usePage();

// Module-level so it survives remount across Inertia navigation
// Only init each window once regardless of how many times the component mounts
const _initialised = typeof window !== 'undefined'
    ? (window.__floatChatInitSet || (window.__floatChatInitSet = new Set()))
    : new Set();

const currentUserId = computed(() => page.props.auth?.user?.id);

// ── Helpers ───────────────────────────────────────────────────────────────────
const getProfilePicture = (pic) => {
    if (!pic) return null;
    if (pic.startsWith('http') || pic.startsWith('/storage/') || pic.startsWith('/images/')) return pic;
    return '/' + pic.replace(/^\//, '');
};

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const normaliseMsg = (m) => ({
    id:         m.id,
    message:    m.message || m.body || '',
    sender_id:  m.sender_id || m.user_id,
    sender:     m.sender || null,
    is_read:    m.is_read ?? false,
    created_at: m.created_at,
    isTemp:     m.isTemp ?? false,
});

// ── Message containers (template refs keyed by userId) ────────────────────────
const msgRefs = ref({});
const editorRefs = ref({});
const scrollBottom = (userId) => {
    const el = msgRefs.value[userId];
    if (el) el.scrollTop = el.scrollHeight;
};

// ── Load messages ─────────────────────────────────────────────────────────────
const loadMessages = async (win) => {
    if (!win.conversationId) return;
    const s = getWindowState(win.userId);
    if (s.loading) return;
    s.loading = true;
    try {
        const res  = await axios.get(route('team-messaging.messages', win.conversationId));
        s.messages = res.data.messages.map(normaliseMsg);
        markConversationReadGlobal(win.conversationId);
        await nextTick(); scrollBottom(win.userId);
    } catch (e) {
        console.warn('[FloatChat] load failed:', e.message);
    } finally {
        s.loading = false;
    }
};

const ensureConversation = async (win) => {
    if (win.conversationId) {
        const s = getWindowState(win.userId);
        if (s.messages.length === 0) await loadMessages(win);
        return;
    }
    try {
        const res = await axios.post(route('team-messaging.store'), { user_id: win.userId });
        win.conversationId = res.data.conversation_id;
        await loadMessages(win);
    } catch (e) {
        console.warn('[FloatChat] ensure failed:', e.message);
    }
};

// ── Send ──────────────────────────────────────────────────────────────────────
const sendMessage = async (win) => {
    const s = getWindowState(win.userId);
    const editor = editorRefs.value[win.userId];
    
    if (!editor || s.sending || !win.conversationId) return;
    
    // Get HTML content from editor
    const htmlContent = editor.getHTML();
    const textContent = editor.getTextContent();
    
    // Check if there's any content or files
    if (!textContent && editor.pendingFiles.length === 0) return;
    
    s.sending = true;
    
    // Upload files first if any
    if (editor.pendingFiles.length > 0) {
        await editor.uploadAllFiles();
    }
    
    // Get final HTML after file uploads
    const finalHtml = editor.getHTML();
    
    // Clear editor
    editor.clear();
    
    const tempId = 'temp-' + Date.now();
    s.messages.push({
        id: tempId, 
        message: finalHtml,
        sender_id: currentUserId.value,
        sender: { id: currentUserId.value, name: page.props.auth.user.name },
        is_read: false, 
        created_at: new Date().toISOString(), 
        isTemp: true,
    });
    await nextTick(); scrollBottom(win.userId);
    
    try {
        const res = await axios.post(route('team-messaging.send', win.conversationId), { message: finalHtml });
        if (res.data?.message) {
            const idx = s.messages.findIndex(m => m.id === tempId);
            if (idx !== -1) s.messages.splice(idx, 1, normaliseMsg(res.data.message));
        }
    } catch (e) {
        s.messages = s.messages.filter(m => m.id !== tempId);
        // Restore message on error
        editor.setHTML(finalHtml);
    } finally {
        s.sending = false;
        await nextTick(); scrollBottom(win.userId);
    }
};

const onEnter = (e, win) => {
    if (!e.shiftKey) { e.preventDefault(); sendMessage(win); }
};// ── Socket ────────────────────────────────────────────────────────────────────
const subscribeEcho = (win) => {
    if (!window.Echo || !win.conversationId) return;
    const s = getWindowState(win.userId);
    if (s.echoChannel) return;
    try {
        s.echoChannel = window.Echo.private(`conversation.${win.conversationId}`)
            .listen('TeamMessageSent', (data) => {
                if (data.sender_id === currentUserId.value) return;
                if (!s.messages.some(m => m.id === data.id)) {
                    s.messages.push(normaliseMsg(data));
                    if (!win.minimized) nextTick(() => scrollBottom(win.userId));
                    else win.unread++;
                }
                markConversationReadGlobal(win.conversationId);
            })
            .listen('.MessageRead', (data) => {
                const ids = new Set(data.message_ids);
                s.messages = s.messages.map(m => ids.has(m.id) ? { ...m, is_read: true } : m);
            });
    } catch (e) {
        console.warn('[FloatChat] echo failed:', e.message);
    }
};

const startPoll = (win) => {
    const s = getWindowState(win.userId);
    if (s.pollTimer) return;
    s.pollTimer = setInterval(async () => {
        if (win.minimized || !win.conversationId) return;
        if (window.Echo?.connector?.pusher?.connection?.state === 'connected') return;
        try {
            const res   = await axios.get(route('team-messaging.messages', win.conversationId));
            const fresh = res.data.messages.map(normaliseMsg);
            const real  = s.messages.filter(m => !m.isTemp).length;
            if (fresh.length > real) {
                s.messages = [...fresh, ...s.messages.filter(m => m.isTemp)];
                await nextTick(); scrollBottom(win.userId);
            }
        } catch (_) {}
    }, 4000);
};

// ── On mount: reinitialise any existing windows (after Inertia navigation) ───
onMounted(async () => {
    console.log('[FloatChat] mounted, active windows:', floatingWindows.value.length);
    for (const win of floatingWindows.value) {
        const key = String(win.userId);
        if (!win.minimized) {
            const s = getWindowState(win.userId);
            // Reload messages if we have a conversationId but lost msgRefs on remount
            if (win.conversationId && s.messages.length === 0) {
                await loadMessages(win);
            }
            subscribeEcho(win);
            startPoll(win);
            await nextTick(); scrollBottom(win.userId);
        }
    }
});

// ── Watch for NEW windows being opened ────────────────────────────────────────
watch(floatingWindows, async (wins) => {
    console.log('[FloatChat] watch triggered, windows:', wins.length);
    for (const win of wins) {
        const key = String(win.userId);
        if (!_initialised.has(key)) {
            _initialised.add(key);
            await ensureConversation(win);
            subscribeEcho(win);
            startPoll(win);
        }
        // Re-expand: refresh messages if needed
        if (!win.minimized) {
            const s = getWindowState(win.userId);
            if (s.messages.length === 0 && win.conversationId) await loadMessages(win);
            subscribeEcho(win);
            startPoll(win);
            if (win.conversationId) markConversationReadGlobal(win.conversationId);
            await nextTick(); scrollBottom(win.userId);
        }
    }
    // Remove init flag for closed windows
    const winKeys = wins.map(w => String(w.userId));
    [..._initialised].forEach(k => { if (!winKeys.includes(k)) _initialised.delete(k); });
}, { deep: true });
</script>

<template>
    <Teleport to="body">
        <!-- Stack of floating windows, bottom-right, above the attendance widget -->
        <div
            class="fixed z-[8500] flex flex-row-reverse items-end gap-2 pointer-events-none"
            style="bottom: 80px; right: 16px;"
        >
            <div
                v-for="win in floatingWindows"
                :key="win.userId"
                class="pointer-events-auto flex flex-col rounded-2xl overflow-hidden shadow-2xl"
                :class="isDark ? 'border border-gray-700' : 'border border-slate-200'"
                style="width: 300px;"
            >
                <!-- ── Header — always visible ── -->
                <div
                    class="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer select-none flex-shrink-0"
                    style="background: linear-gradient(135deg, #006970, #00a9b4)"
                    @click="win.minimized ? restoreFloatingChat(win.userId) : minimizeFloatingChat(win.userId)"
                >
                    <!-- Avatar -->
                    <div class="relative flex-shrink-0">
                        <img
                            v-if="getProfilePicture(win.userAvatar)"
                            :src="getProfilePicture(win.userAvatar)"
                            class="w-7 h-7 rounded-full object-cover ring-2 ring-white/30"
                        />
                        <div
                            v-else
                            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style="background:rgba(255,255,255,0.2)"
                        >{{ getInitials(win.userName) }}</div>
                    </div>

                    <!-- Name -->
                    <span class="flex-1 text-sm font-semibold text-white truncate">{{ win.userName }}</span>

                    <!-- Unread badge when minimised -->
                    <span
                        v-if="win.minimized && win.unread > 0"
                        class="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                    >{{ win.unread }}</span>

                    <!-- Minimise / restore chevron -->
                    <button
                        class="flex-shrink-0 p-0.5 rounded text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                        @click.stop="win.minimized ? restoreFloatingChat(win.userId) : minimizeFloatingChat(win.userId)"
                        :title="win.minimized ? 'Expand' : 'Minimise'"
                    >
                        <svg class="w-3.5 h-3.5 transition-transform" :class="win.minimized ? 'rotate-0' : 'rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
                        </svg>
                    </button>

                    <!-- Close -->
                    <button
                        class="flex-shrink-0 p-0.5 rounded text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                        @click.stop="closeFloatingChat(win.userId)"
                        title="Close"
                    >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- ── Body — hidden when minimised (like Google Chat) ── -->
                <Transition name="chat-body">
                    <div v-if="!win.minimized" class="flex flex-col" style="height: 360px;">

                        <!-- Messages -->
                        <div
                            :ref="el => { if (el) msgRefs[win.userId] = el }"
                            class="flex-1 overflow-y-auto px-3 py-2 space-y-1.5"
                            :class="isDark ? 'bg-gray-800' : 'bg-slate-50'"
                        >
                            <!-- Loading spinner -->
                            <div v-if="getWindowState(win.userId).loading" class="flex justify-center pt-10">
                                <svg class="w-5 h-5 animate-spin text-teal-500" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                </svg>
                            </div>

                            <!-- Empty state -->
                            <div
                                v-else-if="getWindowState(win.userId).messages.length === 0"
                                class="flex flex-col items-center justify-center h-full gap-2"
                            >
                                <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                </svg>
                                <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-slate-400'">Say hello! 👋</p>
                            </div>

                            <!-- Message bubbles -->
                            <template v-else>
                                <div
                                    v-for="msg in getWindowState(win.userId).messages"
                                    :key="msg.id"
                                    class="flex"
                                    :class="msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'"
                                >
                                    <div
                                        class="max-w-[80%] px-3 py-1.5 rounded-2xl text-sm break-words"
                                        :class="msg.sender_id === currentUserId
                                            ? 'text-white rounded-br-sm'
                                            : isDark
                                                ? 'bg-gray-700 text-gray-100 rounded-bl-sm'
                                                : 'bg-white text-slate-800 rounded-bl-sm shadow-sm'"
                                        :style="msg.sender_id === currentUserId
                                            ? 'background:linear-gradient(135deg,#004f55,#006970)' : ''"
                                    >
                                        <div v-html="sanitize(msg.message)"></div>
                                        <div
                                            class="flex items-center gap-0.5 mt-0.5"
                                            :class="msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'"
                                        >
                                            <span class="text-[9px] opacity-50">{{ formatTime(msg.created_at) }}</span>
                                            <template v-if="msg.sender_id === currentUserId">
                                                <!-- sending -->
                                                <svg v-if="msg.isTemp" class="w-3 h-2.5 opacity-40" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                                <!-- read (blue) -->
                                                <svg v-else-if="msg.is_read" class="w-3.5 h-2.5 text-blue-300" fill="currentColor" viewBox="0 0 16 11">
                                                    <path d="M11.071.653L4.42 7.304 1.56 4.444.5 5.504l3.92 3.92 7.591-7.591z"/>
                                                    <path d="M15.5.653L8.849 7.304 7.789 6.244l-1.06 1.06 2.12 2.12L16.56 1.713z"/>
                                                </svg>
                                                <!-- delivered (gray) -->
                                                <svg v-else class="w-3.5 h-2.5 opacity-50" fill="currentColor" viewBox="0 0 16 11">
                                                    <path d="M11.071.653L4.42 7.304 1.56 4.444.5 5.504l3.92 3.92 7.591-7.591z"/>
                                                    <path d="M15.5.653L8.849 7.304 7.789 6.244l-1.06 1.06 2.12 2.12L16.56 1.713z"/>
                                                </svg>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>

                        <!-- Input bar -->
                        <div
                            class="flex-shrink-0 border-t"
                            :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'"
                        >
                            <RichTextEditor
                                :ref="el => { if (el) editorRefs[win.userId] = el }"
                                :conversationId="win.conversationId"
                                :isDark="isDark"
                                placeholder="Type a message..."
                                @keydown.enter.exact="(e) => onEnter(e, win)"
                            />
                            <div class="flex justify-end px-2 pb-2">
                                <button
                                    @click="sendMessage(win)"
                                    :disabled="getWindowState(win.userId).sending"
                                    class="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                                    :class="getWindowState(win.userId).sending
                                        ? 'text-slate-300 cursor-not-allowed'
                                        : 'text-white'"
                                    :style="!getWindowState(win.userId).sending
                                        ? 'background:linear-gradient(135deg,#006970,#00a9b4)' : ''"
                                >
                                    <svg v-if="!getWindowState(win.userId).sending" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                    </svg>
                                    <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
/* Smooth expand/collapse like Google Chat */
.chat-body-enter-active { transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1); }
.chat-body-leave-active { transition: all 0.18s cubic-bezier(0.4, 0, 1, 1); }
.chat-body-enter-from,
.chat-body-leave-to    { opacity: 0; transform: scaleY(0.85); transform-origin: bottom; }

/* File attachment styles for messages - ensure they fit in the floating chat */
:deep(.rt-file-attachment) {
  max-width: 100% !important;
  display: inline-flex !important;
  overflow: hidden !important;
}

:deep(.rt-file-attachment .truncate) {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

:deep(.rt-file-attachment .min-w-0) {
  min-width: 0 !important;
  flex: 1 !important;
}

/* Ensure SVG icons are visible */
:deep(.rt-file-attachment svg) {
  flex-shrink: 0 !important;
  display: block !important;
}

:deep(.rt-file-attachment a) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.rt-file-attachment a svg) {
  width: 1rem !important;
  height: 1rem !important;
}
</style>
