/**
 * useChatNotifications — global composable, mounted in AuthenticatedLayout.
 * Works from ANY page. Polls every 8s and fires:
 *  - In-app slide-in toast (ChatToast component, always)
 *  - Tab title flash (always)
 *  - Desktop/SW notification (when tab not focused)
 */
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

// ── Singleton state ────────────────────────────────────────────────────────────
let pollInterval      = null;
let swReg             = null;
let initialized       = false;
let lastCounts        = {};       // { convId(string): number }
let chatToast         = null;     // ChatToast component ref
const suppressed      = new Set();// conv IDs marked read — suppress until new msg

export const unreadTotal     = ref(0);
export const notifPermission = ref(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
);

// ── Set the ChatToast component ref ───────────────────────────────────────────
export function setChatToastRef(instance) {
    chatToast = instance;
    console.log('[Notif] ChatToast registered:', !!instance);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getRoute(name) {
    try {
        if (typeof route === 'function') return route(name);
        if (typeof window.route === 'function') return window.route(name);
    } catch (_) {}
    return null;
}

async function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    try {
        swReg = await navigator.serviceWorker.register('/sw-notifications.js', { scope: '/' });
        console.log('[Notif] SW registered');
    } catch (e) {
        console.warn('[Notif] SW registration failed:', e.message);
    }
}

async function ensurePermission() {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
        const r = await Notification.requestPermission();
        notifPermission.value = r;
        console.log('[Notif] Permission granted:', r);
    } else {
        notifPermission.value = Notification.permission;
        console.log('[Notif] Permission already:', Notification.permission);
    }
}

// ── Title flash ───────────────────────────────────────────────────────────────
let flashTimer    = null;
let cleanTitle    = '';

function startFlash(name) {
    if (flashTimer) return;
    if (!cleanTitle) cleanTitle = document.title;
    let on = true;
    flashTimer = setInterval(() => {
        document.title = on ? `💬 ${name} — ${cleanTitle}` : cleanTitle;
        on = !on;
    }, 1200);
}

function stopFlash() {
    if (!flashTimer) return;
    clearInterval(flashTimer);
    flashTimer = null;
    if (cleanTitle) document.title = cleanTitle;
}

if (typeof window !== 'undefined') {
    window.addEventListener('focus', stopFlash);
}

// ── Notification dispatcher ───────────────────────────────────────────────────
function notify(senderName, message, avatar, convId, senderId) {
    const title  = `💬 ${senderName}`;
    const body   = message.length > 80 ? message.slice(0, 80) + '…' : message;
    const tag    = `chat-conv-${convId}`;
    const iconUrl = avatar
        ? (avatar.startsWith('http') || avatar.startsWith('/') ? avatar : '/' + avatar)
        : '/favicon.ico';

    // 1. In-app toast — always show regardless of focus/tab
    if (chatToast?.add) {
        chatToast.add({
            senderName,
            senderUserId: senderId || null,
            message: body,
            avatar: iconUrl,
            conversationId: convId,
        });
    } else {
        console.warn('[Notif] ChatToast not mounted yet');
    }

    // 2. Tab title flash
    startFlash(senderName);

    // 3. Desktop notification — only when tab is not focused
    const focused = document.visibilityState === 'visible' && document.hasFocus();
    if (focused) return;

    if (swReg?.active) {
        swReg.active.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload: { title, body, icon: iconUrl, tag, data: { url: '/team-messaging' } },
        });
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
            const n = new Notification(title, { body, icon: iconUrl, tag });
            n.onclick = () => { window.focus(); window.location.href = '/team-messaging'; };
            setTimeout(() => n.close(), 6000);
        } catch (e) {
            console.warn('[Notif] Notification API failed:', e.message);
        }
    }
}

// ── Poll ──────────────────────────────────────────────────────────────────────
async function poll() {
    const url = getRoute('team-messaging.unread-counts');
    if (!url) return;

    let counts, previews;
    try {
        const res = await axios.get(url);
        counts   = res.data?.unread_counts   || {};
        previews = res.data?.unread_previews || {};
    } catch (e) {
        console.warn('[Notif] Poll error:', e.message);
        return;
    }

    const isOnChat = window.location.pathname.startsWith('/team-messaging');
    let total = 0;

    Object.keys(counts).forEach(id => {
        const newN = parseInt(counts[id]) || 0;
        const oldN = lastCounts[id] ?? newN; // first call = baseline, no notify
        total += newN;

        // If conversation was marked read, suppress until a genuinely new message
        if (suppressed.has(id)) {
            if (newN > 0 && newN > (lastCounts[id] ?? 0)) {
                suppressed.delete(id); // new msg after read → fall through to notify
            } else {
                lastCounts[id] = newN;
                return;
            }
        }

        if (newN > oldN && previews[id] && !isOnChat) {
            console.log(`[Notif] ↑ conv ${id}: ${oldN}→${newN}`);
            const p = previews[id];
            notify(
                p.sender_name   || 'Someone',
                p.message       || 'New message',
                p.sender_avatar || null,
                id,
                p.sender_id     || null
            );
        }

        lastCounts[id] = newN;
    });

    unreadTotal.value = total;
}

// ── Composable ────────────────────────────────────────────────────────────────
export function useChatNotifications() {
    onMounted(async () => {
        if (initialized) return;
        initialized = true;
        cleanTitle  = document.title;

        console.log('[Notif] Init...');
        await registerSW();
        await ensurePermission();

        // Baseline — set lastCounts without triggering notifications
        const url = getRoute('team-messaging.unread-counts');
        if (url) {
            try {
                const res = await axios.get(url);
                const c = res.data?.unread_counts || {};
                Object.keys(c).forEach(id => { lastCounts[id] = parseInt(c[id]) || 0; });
                unreadTotal.value = Object.values(lastCounts).reduce((s, n) => s + n, 0);
                console.log('[Notif] Baseline:', lastCounts);
            } catch (e) {
                console.warn('[Notif] Baseline failed:', e.message);
            }
        }

        pollInterval = setInterval(poll, 8000);
        console.log('[Notif] Polling every 8s');
    });

    // Don't clear on unmount — Inertia remounts layout on navigation
    // polling must survive page changes
    onUnmounted(() => {});

    return { unreadTotal, notifPermission };
}

// ── Mark conversation read ────────────────────────────────────────────────────
export function markConversationReadGlobal(conversationId) {
    const id = String(conversationId);
    suppressed.add(id);
    lastCounts[id] = 0;
    unreadTotal.value = Object.values(lastCounts).reduce((s, n) => s + parseInt(n), 0);
    stopFlash();
    console.log('[Notif] Read & suppressed conv:', id);
}
