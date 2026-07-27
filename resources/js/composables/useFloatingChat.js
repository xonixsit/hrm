/**
 * useFloatingChat — singleton state for floating mini-chat windows.
 * Module-level so it survives Inertia SPA navigation completely.
 */
import { reactive, ref } from 'vue';

const MAX_WINDOWS = 3;

// Array of window descriptors — survives navigation
export const floatingWindows = ref([]);

// Per-window message/input/loading state — also module-level so messages persist
export const windowStates = reactive({}); // { [userId]: { messages, input, loading, sending } }

function initState(userId) {
    if (!windowStates[userId]) {
        windowStates[userId] = {
            messages:    [],
            input:       '',
            loading:     false,
            sending:     false,
            echoChannel: null,
            pollTimer:   null,
        };
    }
    return windowStates[userId];
}

export function getWindowState(userId) {
    return initState(userId);
}

export function openFloatingChat(user, conversationId = null) {
    console.log('[FloatChat] openFloatingChat called for user:', user.id, user.name);
    initState(user.id);
    const existing = floatingWindows.value.find(w => w.userId === user.id);
    if (existing) {
        existing.minimized     = false;
        existing.conversationId = conversationId ?? existing.conversationId;
        existing.unread        = 0;
        console.log('[FloatChat] restored existing window');
        return;
    }
    if (floatingWindows.value.length >= MAX_WINDOWS) {
        const oldest = floatingWindows.value[0];
        if (oldest) _cleanup(oldest.userId);
        floatingWindows.value.shift();
    }
    floatingWindows.value.push({
        userId:         user.id,
        userName:       user.name,
        userAvatar:     user.profile_picture ?? user.avatar ?? null,
        conversationId: conversationId,
        minimized:      false,
        unread:         0,
    });
    console.log('[FloatChat] window added, total:', floatingWindows.value.length);
}

export function closeFloatingChat(userId) {
    _cleanup(userId);
    floatingWindows.value = floatingWindows.value.filter(w => w.userId !== userId);
    delete windowStates[userId];
}

export function minimizeFloatingChat(userId) {
    const w = floatingWindows.value.find(w => w.userId === userId);
    if (w) w.minimized = true;
}

export function restoreFloatingChat(userId) {
    const w = floatingWindows.value.find(w => w.userId === userId);
    if (w) { w.minimized = false; w.unread = 0; }
}

export function markFloatingUnread(userId) {
    const w = floatingWindows.value.find(w => w.userId === userId);
    if (w && w.minimized) w.unread++;
}

// Internal: clear timers/echo without removing from array
function _cleanup(userId) {
    const s = windowStates[userId];
    if (!s) return;
    if (s.pollTimer)    { clearInterval(s.pollTimer); s.pollTimer = null; }
    if (s.echoChannel && window.Echo) {
        const w = floatingWindows.value.find(w => w.userId === userId);
        if (w?.conversationId) {
            try { window.Echo.leave(`conversation.${w.conversationId}`); } catch (_) {}
        }
        s.echoChannel = null;
    }
}

export { _cleanup };
