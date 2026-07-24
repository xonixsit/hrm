<script setup>
console.log('TeamMessaging Index.vue script setup loaded');
import { ref, computed, onMounted, onUnmounted, nextTick, watch, TransitionGroup } from 'vue';
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { useTheme } from '@/composables/useTheme';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import Icon from '@/Components/Base/Icon.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';
import axios from 'axios';
import data from '@emoji-mart/data';
import { Picker } from 'emoji-mart';
import { markConversationReadGlobal } from '@/composables/useChatNotifications';

const { isDark } = useTheme();
const page = usePage();

const props = defineProps({
    conversations: Array,
    users: Array,
});

const searchQuery = ref('');
const showNewChatModal = ref(false);
const selectedUser = ref(null);
const selectedUserId = ref(null);
const activeTab = ref('all'); // 'all', 'unread', 'archived'
const sidebarCollapsed = ref(false);
const selectedConversation = ref(null);
const messagesContainer = ref(null);
const messages = ref([]);
const messageInput = ref('');
const loadingMessages = ref(false);
const showEmojiPicker = ref(false);
const isTyping = ref(false);
const onlineUsers = ref({}); // kept for legacy compat — use userStatuses instead
const userStatuses = ref({}); // { userId: 'active' | 'inactive' | 'offline' }

const getUserStatus = (userId) => userStatuses.value[userId] || 'offline';
const isUserOnline  = (userId) => getUserStatus(userId) !== 'offline'; // inactive + active both count as "online" for sorting

const statusDotClass = (userId) => {
    const s = getUserStatus(userId);
    if (s === 'active')   return 'bg-emerald-500';
    if (s === 'inactive') return 'bg-orange-400';
    return 'bg-slate-400';
};

const statusTextClass = (userId) => {
    const s = getUserStatus(userId);
    if (s === 'active')   return 'text-emerald-500';
    if (s === 'inactive') return 'text-orange-400';
    return isDark.value ? 'text-gray-500' : 'text-slate-400';
};

const statusLabel = (userId) => {
    const s = getUserStatus(userId);
    if (s === 'active')   return 'Active';
    if (s === 'inactive') return 'Inactive';
    return 'Offline';
};
const hoveredUserId = ref(null);
const hoverCardPosition = ref({ top: 0, left: 0 });
const hideHoverCardTimeout = ref(null);
const copiedEmail = ref(false);
const showEmojiPickerPopup = ref(false);
const emojiPickerRef = ref(null);
const emojiButtonRef = ref(null);
const messageInputRef = ref(null);

// ── Notifications ─────────────────────────────────────────────────────────────
const inAppToasts = ref([]); // [{ id, senderName, senderAvatar, message, conversationId }]
const originalTitle = document.title;
let titleFlashInterval = null;
let totalUnreadForTitle = 0;

const startTitleFlash = (senderName) => {
    if (titleFlashInterval) return; // already flashing
    let show = true;
    titleFlashInterval = setInterval(() => {
        document.title = show ? `💬 New message from ${senderName}` : originalTitle;
        show = !show;
    }, 1200);
};

const stopTitleFlash = () => {
    if (titleFlashInterval) {
        clearInterval(titleFlashInterval);
        titleFlashInterval = null;
    }
    document.title = originalTitle;
};

const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
};

const showBrowserNotification = (senderName, messageText, avatar) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    // Only show browser notification when tab is not focused
    if (document.visibilityState === 'visible' && document.hasFocus()) return;

    const iconUrl = avatar
        ? (avatar.startsWith('http') || avatar.startsWith('/') ? avatar : '/' + avatar)
        : '/favicon.ico';

    try {
        const notif = new Notification(`💬 ${senderName}`, {
            body: messageText.length > 80 ? messageText.slice(0, 80) + '…' : messageText,
            icon: iconUrl,
            tag: 'team-message',
            silent: false,
            requireInteraction: false,
        });
        notif.onclick = () => { window.focus(); notif.close(); };
        setTimeout(() => notif.close(), 6000);
    } catch (e) {
        console.warn('[Notification] failed:', e);
    }
};

const showInAppToast = (toast) => {
    const id = Date.now();
    inAppToasts.value.push({ ...toast, id });
    // Auto-dismiss after 5s
    setTimeout(() => {
        inAppToasts.value = inAppToasts.value.filter(t => t.id !== id);
    }, 5000);
};

const dismissToast = (id) => {
    inAppToasts.value = inAppToasts.value.filter(t => t.id !== id);
};

const handleIncomingMessage = (data) => {
    const convId = parseInt(data.conversation_id);
    const isCurrentConv = convId === parseInt(selectedConversation.value);

    const senderUser   = props.users.find(u => u.id === data.sender_id);
    const senderName   = data.sender_name || senderUser?.name || 'Someone';
    const senderAvatar = data.sender_avatar || senderUser?.profile_picture || null;
    const msgText      = data.message || '';

    // Browser notification (when tab is hidden)
    showBrowserNotification(senderName, msgText, senderAvatar);

    // Tab title flash
    if (!isCurrentConv) {
        startTitleFlash(senderName);
    }

    // In-app toast (only when a different conversation is open or none)
    if (!isCurrentConv) {
        showInAppToast({ conversationId: convId, senderName, senderAvatar, message: msgText });
    }
};

// Stop flashing when user focuses the tab
const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
        stopTitleFlash();
    }
};

const toggleEmojiPicker = () => {
    showEmojiPickerPopup.value = !showEmojiPickerPopup.value;
    if (showEmojiPickerPopup.value) {
        nextTick(() => {
            if (emojiPickerRef.value && !emojiPickerRef.value.firstChild) {
                const picker = new Picker({
                    data,
                    theme: isDark.value ? 'dark' : 'light',
                    onEmojiSelect: (emoji) => {
                        messageInput.value += emoji.native;
                        showEmojiPickerPopup.value = false;
                        nextTick(() => messageInputRef.value?.focus());
                    },
                    onClickOutside: () => {
                        showEmojiPickerPopup.value = false;
                    },
                });
                emojiPickerRef.value.appendChild(picker);
            }
        });
    }
};

const closeEmojiOnOutsideClick = (e) => {
    if (
        showEmojiPickerPopup.value &&
        emojiPickerRef.value &&
        !emojiPickerRef.value.contains(e.target) &&
        !emojiButtonRef.value?.contains(e.target)
    ) {
        showEmojiPickerPopup.value = false;
    }
};

// Position emoji picker above the emoji button
const emojiPickerPos = computed(() => {
    if (!emojiButtonRef.value) return {};
    const rect = emojiButtonRef.value.getBoundingClientRect();
    return {
        bottom: (window.innerHeight - rect.top + 8) + 'px',
        left: Math.max(8, rect.left - 10) + 'px',
    };
});

const autoResize = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px';
};

// Track locally-read conversation IDs so the unread badge clears immediately
const locallyReadConversationIds = ref([]);

const isConvRead = (convId) => {
    return Array.isArray(locallyReadConversationIds.value) && locallyReadConversationIds.value.includes(parseInt(convId));
};

// Local reactive unread counts map { conversationId: count }
// Initialised from server props, updated via socket/axios without full page reload
const localUnreadCounts = ref({});

watch(() => props.conversations, (convs) => {
    if (!convs) return;
    convs.forEach(c => {
        const id = parseInt(c.id);
        if (!isConvRead(id)) {
            localUnreadCounts.value[id] = c.unread_count ?? 0;
        }
    });
}, { immediate: true });

const getUnreadCount = (conversationId) => {
    const id = parseInt(conversationId);
    if (isConvRead(id)) return 0;
    const v = localUnreadCounts.value[id];
    return v !== undefined ? v : 0;
};

let messagePollingInterval = null;
let conversationPollingInterval = null;

const filteredUsers = computed(() => {
    let result = props.users;
    
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(user => 
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    }

    // When on unread tab, only show users with unread messages that haven't been locally read
    if (activeTab.value === 'unread') {
        result = result.filter(user => {
            const conv = props.conversations.find(c => c.other_user?.id === user.id);
            return conv && getUnreadCount(conv.id) > 0 && !isConvRead(conv.id);
        });
    }
    
    // Sort online users to the top, then alphabetically by name
    return [...result].sort((a, b) => {
        const aOnline = isUserOnline(a.id);
        const bOnline = isUserOnline(b.id);
        
        if (aOnline && !bOnline) return -1;
        if (!aOnline && bOnline) return 1;
        
        return a.name.localeCompare(b.name);
    });
});

// Total unread message count across all conversations (matches per-card badge sum)
const effectiveUnreadCount = computed(() =>
    props.conversations.reduce((sum, c) => sum + getUnreadCount(c.id), 0)
);

const filteredConversations = computed(() => {    let conversations = props.conversations;
    
    if (activeTab.value === 'unread') {
        conversations = conversations.filter(conv => getUnreadCount(conv.id) > 0);
    }
    
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        conversations = conversations.filter(conv => {
            const userName = conv.other_user?.name?.toLowerCase() || '';
            const userEmail = conv.other_user?.email?.toLowerCase() || '';
            return userName.includes(query) || userEmail.includes(query);
        });
    }
    
    // Sort online users first, then by last message timestamp (or ID if no timestamp)
    return [...conversations].sort((a, b) => {
        const aOnline = a.other_user ? isUserOnline(a.other_user.id) : false;
        const bOnline = b.other_user ? isUserOnline(b.other_user.id) : false;
        
        if (aOnline && !bOnline) return -1;
        if (!aOnline && bOnline) return 1;
        
        // Secondary sort: most recent conversation first
        const aTime = a.last_message ? new Date(a.last_message.created_at).getTime() : 0;
        const bTime = b.last_message ? new Date(b.last_message.created_at).getTime() : 0;
        
        if (aTime !== bTime) {
            return bTime - aTime;
        }
        
        return b.id - a.id;
    });
});

const startConversation = async (userId) => {
    requestNotificationPermission();
    try {
        // Clear previous conversation state
        selectedConversation.value = null;
        messages.value = [];
        selectedUserId.value = userId;
        selectedUser.value = props.users.find(u => u.id === userId);
        
        // Find existing conversation between current user and selected user
        const existingConversation = props.conversations.find(c => c.other_user?.id === userId);
        
        if (existingConversation) {
            // Load existing conversation
            selectConversation(existingConversation.id);
        } else {
            // Create new conversation
            const response = await axios.post(route('team-messaging.store'), { user_id: userId });
            if (response.data.conversation_id) {
                selectConversation(response.data.conversation_id);
            }
        }
    } catch (error) {
        console.error('Error starting conversation:', error);
    }
};

const selectConversation = async (conversationId) => {
    selectedConversation.value = conversationId;
    loadingMessages.value = true;

    // Zero unread count immediately in local map
    localUnreadCounts.value[parseInt(conversationId)] = 0;
    if (!locallyReadConversationIds.value.includes(conversationId)) {
        locallyReadConversationIds.value.push(conversationId);
    }
    stopTitleFlash();
    markConversationReadGlobal(conversationId); // sync global notification suppression
    
    try {
        const response = await axios.get(route('team-messaging.messages', conversationId));
        messages.value = response.data.messages.map(msg => ({
            ...msg,
            message: msg.message || msg.body,
            sender_id: msg.sender_id || msg.author_id,
            sender: msg.sender || msg.author
        }));
        // Server has marked as read — confirm with fresh counts
        checkForNewConversations();
    } catch (error) {
        console.error('Error loading messages:', error);
    } finally {
        loadingMessages.value = false;
    }
};

const isSending = ref(false);

const sendMessage = async () => {
    if (!messageInput.value.trim() || !selectedConversation.value || isSending.value) return;

    // Request notification permission on user gesture if not yet granted
    requestNotificationPermission();
    
    const message = messageInput.value;
    messageInput.value = '';
    isSending.value = true;
    
    const tempId = 'temp-' + Date.now();
    const tempMessage = {
        id: tempId,
        message: message,
        sender_id: page.props.auth.user.id,
        sender: {
            id: page.props.auth.user.id,
            name: page.props.auth.user.name,
            profile_picture: page.props.auth.user.profile_picture,
        },
        is_read: false,
        created_at: new Date().toISOString(),
        isTemp: true
    };
    
    messages.value.push(tempMessage);
    scrollToBottom(true);
    
    try {
        const response = await axios.post(route('team-messaging.send', selectedConversation.value), {
            message: message,
        });

        // Server returns single new message now, not full history
        if (response.data && response.data.message) {
            const serverMsg = {
                ...response.data.message,
                message: response.data.message.message,
                sender_id: response.data.message.sender_id,
            };
            // Replace the temp message with the confirmed server message
            const tempIndex = messages.value.findIndex(m => m.id === tempId);
            if (tempIndex !== -1) {
                messages.value.splice(tempIndex, 1, serverMsg);
            }
        }
        scrollToBottom(true);
    } catch (error) {
        console.error('Error sending message:', error);
        const tempIndex = messages.value.findIndex(m => m.id === tempId);
        if (tempIndex !== -1) {
            messages.value.splice(tempIndex, 1);
        }
        messageInput.value = message;
    } finally {
        isSending.value = false;
    }
};

const formatTime = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return messageDate.toLocaleDateString();
};

const getProfilePicture = (user) => {
    if (user?.profile_picture) {
        if (user.profile_picture.startsWith('http') || user.profile_picture.startsWith('/storage/')) {
            return user.profile_picture;
        }
        return `/${user.profile_picture}`;
    }
    return null;
};

const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getStatusColor = (status) => {
    if (status === 'active')   return 'bg-emerald-500';
    if (status === 'inactive') return 'bg-orange-400';
    return 'bg-slate-400';
};

const getSelectedUser = () => {
    if (selectedUser.value) {
        return selectedUser.value;
    }
    
    const conversation = props.conversations.find(c => c.id === selectedConversation.value);
    if (conversation?.other_user) {
        return conversation.other_user;
    }
    
    if (messages.value.length > 0) {
        const lastMessage = messages.value[messages.value.length - 1];
        if (lastMessage.sender_id !== page.props.auth.user.id) {
            return lastMessage.sender;
        }
    }
    
    if (selectedUserId.value) {
        return props.users.find(u => u.id === selectedUserId.value);
    }
    
    return null;
};

const handleUserHover = (event, userId) => {
    if (hideHoverCardTimeout.value) {
        clearTimeout(hideHoverCardTimeout.value)
        hideHoverCardTimeout.value = null
    }
    hoveredUserId.value = userId
    const rect = event.currentTarget.getBoundingClientRect()
    // Position card to the right of the sidebar item, clamped to viewport
    const cardWidth = 320
    const spaceRight = window.innerWidth - rect.right
    const left = spaceRight >= cardWidth + 12
        ? rect.right + 8
        : rect.left - cardWidth - 8
    const top = Math.min(rect.top, window.innerHeight - 420)
    hoverCardPosition.value = { top: Math.max(8, top), left }
}

const handleUserLeave = () => {
    hideHoverCardTimeout.value = setTimeout(() => {
        hoveredUserId.value = null;
    }, 300);
};

const handleCardEnter = () => {
    if (hideHoverCardTimeout.value) {
        clearTimeout(hideHoverCardTimeout.value);
        hideHoverCardTimeout.value = null;
    }
};

const handleCardLeave = () => {
    hoveredUserId.value = null;
};

const copyEmail = (email) => {
    navigator.clipboard.writeText(email);
    copiedEmail.value = true;
    setTimeout(() => {
        copiedEmail.value = false;
    }, 2000);
};

let currentEchoChannel = null;

onMounted(async () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            showNewChatModal.value = true;
        }
    });

    // Auto-open conversation if redirected from a notification toast
    const urlParams = new URLSearchParams(window.location.search);
    const openUserId = parseInt(urlParams.get('open_user'));
    if (openUserId) {
        // Clean the URL without reloading
        window.history.replaceState({}, '', window.location.pathname);
        // Wait for conversations to be available, then open
        const target = props.conversations.find(c => c.other_user?.id === openUserId);
        if (target) {
            startConversation(openUserId);
        } else {
            // Start a new conversation with that user
            startConversation(openUserId);
        }
    }

    checkForOnlineUsers();
    checkForNewConversations(); // fetch fresh counts immediately, don't wait 5s
    
    requestNotificationPermission();
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('click', closeEmojiOnOutsideClick);

    // Send heartbeat immediately — marks this user as "active" on chat page
    sendHeartbeat();

    // Poll for online statuses every 10 seconds
    setInterval(() => {
        checkForOnlineUsers();
    }, 10000);

    // Heartbeat every 30s to maintain "active" status while on this page
    setInterval(() => {
        sendHeartbeat();
    }, 30000);

    // Socket: listen on personal channel for new messages → update unread counts instantly
    const currentUserId = page.props.auth.user.id;
    if (window.Echo) {
        try {
            window.Echo.private(`user.${currentUserId}`)
                .listen('.NewConversationMessage', (data) => {
                    const convId = parseInt(data.conversation_id);
                    if (convId !== parseInt(selectedConversation.value)) {
                        localUnreadCounts.value[convId] = (localUnreadCounts.value[convId] || 0) + 1;
                        locallyReadConversationIds.value = locallyReadConversationIds.value.filter(id => parseInt(id) !== convId);
                    }
                    // Trigger notifications
                    handleIncomingMessage(data);
                });
        } catch (e) {
            console.warn('[Echo] User channel subscription warning:', e);
        }
    }

    // Fallback polling every 5s — catches any missed socket events
    conversationPollingInterval = setInterval(() => {
        checkForNewConversations();
    }, 5000);
});

onUnmounted(() => {
    if (currentEchoChannel && window.Echo) {
        window.Echo.leave(`conversation.${currentEchoChannel}`);
    }
    const currentUserId = page.props.auth.user.id;
    if (window.Echo) {
        window.Echo.leave(`user.${currentUserId}`);
    }
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
    if (conversationPollingInterval) {
        clearInterval(conversationPollingInterval);
    }
    document.removeEventListener('click', closeEmojiOnOutsideClick);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    stopTitleFlash();
});

const checkForOnlineUsers = async () => {
    try {
        const response = await axios.get(route('team-messaging.online-users'));
        const active   = response.data.active   || [];
        const inactive = response.data.inactive || [];

        const map = {};
        active.forEach(id   => { map[parseInt(id)] = 'active'; });
        inactive.forEach(id => { map[parseInt(id)] = 'inactive'; });
        userStatuses.value = map;
    } catch (error) {
        console.error('Error polling for online users:', error);
    }
};

const sendHeartbeat = async () => {
    try {
        await axios.post(route('team-messaging.heartbeat'));
    } catch (e) {
        // silent — heartbeat failure is non-critical
    }
};

const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

const checkForNewMessages = async () => {
    if (!selectedConversation.value || isSending.value) return;

    // Skip HTTP poll if WebSocket is connected — socket delivers in real-time
    if (window.Echo?.connector?.pusher?.connection?.state === 'connected') return;

    try {
        const response = await axios.get(route('team-messaging.messages', selectedConversation.value));
        const newMessages = response.data.messages.map(msg => ({
            ...msg,
            message: msg.message || msg.body,
            sender_id: msg.sender_id || msg.author_id,
            sender: msg.sender || msg.author
        }));

        const realLocalMsgs = messages.value.filter(m => !m.isTemp);
        const hadNewMessages = newMessages.length > realLocalMsgs.length;

        const tempMsgs = messages.value.filter(m => m.isTemp);
        messages.value = [...newMessages, ...tempMsgs];

        if (hadNewMessages) {
            scrollToBottom(true);
        }
    } catch (error) {
        console.error('Error polling for messages:', error);
    }
};

const checkForNewConversations = async () => {
    try {
        const response = await axios.get(route('team-messaging.unread-counts'));
        const counts   = response.data.unread_counts   || {};
        const previews = response.data.unread_previews || {};

        Object.keys(counts).forEach(id => {
            const numId    = parseInt(id);
            const newCount = parseInt(counts[id]) || 0;

            // oldCount: what we knew before this poll
            const oldCount = isConvRead(numId) ? 0 : (localUnreadCounts.value[numId] ?? newCount);

            // Update local map (skip if user already read it locally)
            if (!isConvRead(numId)) {
                localUnreadCounts.value[numId] = newCount;
            }

            // Only notify if count genuinely increased AND we have preview data
            // and the conversation isn't the currently open one
            if (
                newCount > oldCount &&
                previews[id] &&
                numId !== parseInt(selectedConversation.value)
            ) {
                const preview = previews[id];
                handleIncomingMessage({
                    conversation_id: numId,
                    sender_id:       preview.sender_id,
                    sender_name:     preview.sender_name,
                    sender_avatar:   preview.sender_avatar,
                    message:         preview.message,
                });
            }
        });
    } catch (e) {
        console.error('Error fetching unread counts:', e);
    }
};

const scrollToBottom = (smooth = true) => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTo({
                top: messagesContainer.value.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    });
};

const formatFullTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

watch(selectedConversation, (newVal) => {
    if (currentEchoChannel && window.Echo) {
        window.Echo.leave(`conversation.${currentEchoChannel}`);
        currentEchoChannel = null;
    }

    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
        messagePollingInterval = null;
    }

    if (newVal) {
        checkForNewMessages();

        if (window.Echo) {
            currentEchoChannel = newVal;
            try {
                window.Echo.private(`conversation.${newVal}`)
                    .listen('TeamMessageSent', (data) => {
                        // Incoming message from the other participant
                        if (data.sender_id === page.props.auth.user.id) return; // own message already shown

                        const formattedMsg = {
                            id: data.id,
                            message: data.message,
                            sender_id: data.sender_id,
                            sender: data.sender,
                            is_read: false,
                            created_at: data.created_at || new Date().toISOString(),
                        };

                        if (!messages.value.some(m => m.id === formattedMsg.id)) {
                            messages.value.push(formattedMsg);
                            scrollToBottom(true);
                        }
                    })
                    .listen('.MessageRead', (data) => {
                        // Recipient has read messages — update is_read on our sent messages
                        const readIds = new Set(data.message_ids);
                        messages.value = messages.value.map(m =>
                            readIds.has(m.id) ? { ...m, is_read: true } : m
                        );
                    });
            } catch (e) {
                console.warn('[Echo] Private channel subscription warning:', e);
            }
        }

        // Polling fallback every 3s — catches messages when WebSocket is unavailable
        messagePollingInterval = setInterval(() => {
            checkForNewMessages();
        }, 3000);
    }
    scrollToBottom(false);
});

// Watch for messages to scroll to bottom
watch(messages, () => {
    scrollToBottom(true);
});
</script>

<template>
    <Head title="Messages" />

    <AuthenticatedLayout>
        <template #fullWidth>
        <!-- MESSENGER -->
        <div
            class="flex"
            :class="isDark ? 'bg-gray-900' : 'bg-slate-50'"
            style="height: calc(100vh - 64px);"
        >
            <!-- Container: full width with side padding, matching reference -->
            <div class="w-full px-6 py-4 flex gap-4 min-h-0 h-full">

            <!-- ── LEFT SIDEBAR ────────────────────── -->
            <div
                class="w-72 xl:w-80 flex-shrink-0 flex flex-col rounded-xl overflow-hidden shadow-sm border"
                :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'"
            >
                <!-- Search -->
                <div class="px-4 pt-4 pb-3">
                    <div class="relative">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                        </svg>
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Search users..."
                            class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                            :class="isDark
                                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'"
                        />
                    </div>
                </div>

                <!-- Tabs: All / Unread -->
                <div class="flex px-4 gap-1 border-b" :class="isDark ? 'border-gray-700' : 'border-slate-100'">
                    <button
                        v-for="tab in ['all','unread']"
                        :key="tab"
                        @click="activeTab = tab"
                        class="relative pb-3 pt-1 px-3 text-sm font-medium transition-colors"
                        :class="activeTab === tab
                            ? 'text-teal-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-teal-500 after:rounded-full'
                            : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-slate-700'"
                    >
                        {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
                        <span
                            v-if="tab === 'unread' && effectiveUnreadCount > 0"
                            class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white"
                        >{{ effectiveUnreadCount }}</span>
                    </button>
                </div>

                <!-- Conversation / User list -->
                <div class="flex-1 overflow-y-auto">
                    <div v-if="filteredUsers.length === 0" class="flex flex-col items-center justify-center h-full p-6 text-center">
                        <svg class="w-10 h-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 2-3 3m0 0-3-3m3 3v-6"/>
                        </svg>
                        <p class="text-sm text-slate-400">{{ searchQuery ? 'No users found' : activeTab === 'unread' ? 'No unread messages' : 'No users available' }}</p>
                    </div>

                    <div v-else>
                        <div
                            v-for="user in filteredUsers"
                            :key="user.id"
                            @click="startConversation(user.id)"
                            @mouseenter="handleUserHover($event, user.id)"
                            @mouseleave="handleUserLeave"
                            class="flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors border-l-[3px]"
                            :class="(selectedUserId === user.id || (getSelectedUser() && getSelectedUser().id === user.id))
                                ? isDark
                                    ? 'bg-gray-700/80 border-teal-500'
                                    : 'bg-[#eef2fb] border-teal-500'
                                : isDark
                                    ? 'border-transparent hover:bg-gray-700'
                                    : 'border-transparent hover:bg-slate-50'"
                        >
                            <!-- Avatar + status dot -->
                            <div class="relative flex-shrink-0">
                                <div v-if="getProfilePicture(user)" class="w-10 h-10 rounded-full overflow-hidden">
                                    <img :src="getProfilePicture(user)" :alt="user.name" class="w-full h-full object-cover"/>
                                </div>
                                <div v-else
                                    class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                                    style="background: linear-gradient(135deg, #006970, #00a9b4)"
                                >{{ getInitials(user.name) }}</div>
                                <span
                                    class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                                    :class="[
                                        statusDotClass(user.id),
                                        isDark ? 'border-gray-900' : 'border-white'
                                    ]"
                                ></span>
                            </div>

                            <!-- Info -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-baseline justify-between gap-1">
                                    <p class="text-sm font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-800'">
                                        {{ user.name }}
                                    </p>
                                    <span class="text-[11px] flex-shrink-0" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
                                        {{ filteredConversations.find(c => c.other_user?.id === user.id)?.last_message
                                            ? formatTime(filteredConversations.find(c => c.other_user?.id === user.id).last_message.created_at)
                                            : '' }}
                                    </span>
                                </div>
                                <p class="text-xs truncate mt-0.5" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                                    {{ user.employee?.department || user.email }}
                                    <span class="mx-1">•</span>
                                    <span :class="statusTextClass(user.id)">
                                        {{ statusLabel(user.id) }}
                                    </span>
                                </p>
                            </div>

                            <!-- Unread badge -->
                            <span
                                v-if="filteredConversations.find(c => c.other_user?.id === user.id)?.id && getUnreadCount(filteredConversations.find(c => c.other_user?.id === user.id).id) > 0 && !isConvRead(filteredConversations.find(c => c.other_user?.id === user.id).id)"
                                class="flex-shrink-0 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center"
                            >{{ getUnreadCount(filteredConversations.find(c => c.other_user?.id === user.id).id) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Sidebar footer -->
                <div
                    class="flex items-center justify-between px-4 py-3 border-t"
                    :class="isDark ? 'border-gray-700' : 'border-slate-100'"
                >
                    <button class="p-2 rounded-lg transition-colors" :class="isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-slate-400 hover:bg-slate-100'">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button
                        @click="showNewChatModal = true"
                        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style="background: linear-gradient(135deg, #006970, #00a9b4)"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        New Message
                    </button>
                    <button class="p-2 rounded-lg transition-colors" :class="isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-slate-400 hover:bg-slate-100'">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <!-- ── RIGHT CHAT PANEL ───────────────────────── -->
            <div class="flex-1 flex flex-col min-h-0 rounded-xl overflow-hidden shadow-sm border"
                :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">

                <!-- Empty state -->
                <div v-if="!selectedConversation" class="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
                    <div class="w-20 h-20 rounded-2xl flex items-center justify-center mb-2" :class="isDark ? 'bg-gray-700' : 'bg-slate-100'">
                        <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                    </div>
                    <h3 class="text-base font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">Select a conversation</h3>
                    <p class="text-sm max-w-xs" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Pick someone from the list or start a new message</p>
                    <button @click="showNewChatModal = true"
                        class="mt-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style="background: linear-gradient(135deg, #006970, #00a9b4)">
                        New Message
                    </button>
                </div>

                <!-- Active conversation -->
                <div v-else class="flex flex-col h-full min-h-0">

                    <!-- Chat header -->
                    <div class="flex items-center gap-3 px-5 py-3.5 border-b flex-shrink-0"
                        :class="isDark ? 'border-gray-700' : 'border-slate-100'">
                        <div class="relative flex-shrink-0">
                            <div v-if="getProfilePicture(getSelectedUser())" class="w-10 h-10 rounded-full overflow-hidden">
                                <img :src="getProfilePicture(getSelectedUser())" :alt="getSelectedUser()?.name" class="w-full h-full object-cover"/>
                            </div>
                            <div v-else class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                                style="background: linear-gradient(135deg, #006970, #00a9b4)">
                                {{ getInitials(getSelectedUser()?.name) }}
                            </div>
                            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                                :class="[statusDotClass(getSelectedUser()?.id), isDark ? 'border-gray-800' : 'border-white']"/>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-800'">{{ getSelectedUser()?.name }}</p>
                            <p class="text-xs" :class="statusTextClass(getSelectedUser()?.id)">
                                {{ statusLabel(getSelectedUser()?.id) }}
                            </p>
                        </div>
                        <div class="flex items-center gap-1 flex-shrink-0">
                            <button class="p-2 rounded-lg transition-colors" :class="isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-slate-400 hover:bg-slate-100'">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                            </button>
                            <button class="p-2 rounded-lg transition-colors" :class="isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-slate-400 hover:bg-slate-100'">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                            </button>
                            <button class="p-2 rounded-lg transition-colors" :class="isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-slate-400 hover:bg-slate-100'">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Messages scroll area -->
                    <div ref="messagesContainer" class="flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-5" style="scroll-behavior:smooth;">

                        <!-- Loading -->
                        <div v-if="loadingMessages" class="flex justify-center pt-8">
                            <svg class="w-6 h-6 animate-spin text-teal-500" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                            </svg>
                        </div>

                        <!-- No messages -->
                        <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full gap-3 text-center">
                            <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-slate-400'">No messages yet. Say hello!</p>
                        </div>

                        <!-- Message list -->
                        <template v-else>
                            <!-- Date divider -->
                            <div class="flex items-center gap-3 my-2">
                                <div class="flex-1 h-px" :class="isDark ? 'bg-gray-700' : 'bg-slate-100'"></div>
                                <span class="text-xs font-medium px-3" :class="isDark ? 'text-gray-400' : 'text-slate-400'">Today</span>
                                <div class="flex-1 h-px" :class="isDark ? 'bg-gray-700' : 'bg-slate-100'"></div>
                            </div>

                            <div v-for="(message, index) in messages" :key="message.id"
                                class="flex gap-2 items-end"
                                :class="message.sender_id === page.props.auth.user.id ? 'flex-row-reverse' : 'flex-row'">

                                <!-- Avatar — shown on outside edge -->
                                <div class="flex-shrink-0">
                                    <div v-if="getProfilePicture(message.sender)" class="w-8 h-8 rounded-full overflow-hidden">
                                        <img :src="getProfilePicture(message.sender)" :alt="message.sender?.name" class="w-full h-full object-cover"/>
                                    </div>
                                    <div v-else class="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
                                        style="background: linear-gradient(135deg, #006970, #00a9b4)">
                                        {{ getInitials(message.sender?.name) }}
                                    </div>
                                </div>

                                <!-- Bubble + timestamp -->
                                <div class="flex flex-col max-w-[60%]"
                                    :class="message.sender_id === page.props.auth.user.id ? 'items-end' : 'items-start'">

                                    <!-- Bubble -->
                                    <div class="px-4 py-2.5 text-sm leading-relaxed break-words"
                                        :class="[
                                            message.sender_id === page.props.auth.user.id
                                                ? 'text-white rounded-2xl rounded-br-sm'
                                                : isDark
                                                    ? 'bg-gray-700 text-gray-100 rounded-2xl rounded-bl-sm'
                                                    : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm',
                                        ]"
                                        :style="message.sender_id === page.props.auth.user.id
                                            ? 'background: linear-gradient(135deg, #004f55, #006970)'
                                            : ''">
                                        {{ message.message }}
                                    </div>

                                    <!-- Timestamp + ticks -->
                                    <div class="flex items-center gap-1 mt-1"
                                        :class="message.sender_id === page.props.auth.user.id ? 'flex-row-reverse' : 'flex-row'">
                                        <span class="text-[11px] leading-none" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
                                            {{ formatFullTime(message.created_at) }}
                                        </span>

                                        <!-- Tick icons — only for own messages -->
                                        <template v-if="message.sender_id === page.props.auth.user.id">

                                            <!-- Single gray tick: sending / undelivered -->
                                            <svg v-if="message.isTemp"
                                                class="w-3.5 h-3.5 flex-shrink-0" :class="isDark ? 'text-gray-500' : 'text-slate-400'"
                                                fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                            </svg>

                                            <!-- Double blue tick: read -->
                                            <svg v-else-if="message.is_read"
                                                class="w-4 h-3.5 flex-shrink-0 text-blue-500"
                                                fill="currentColor" viewBox="0 0 16 11">
                                                <!-- first tick (offset left) -->
                                                <path d="M11.071.653L4.42 7.304 1.56 4.444.5 5.504l3.92 3.92 7.591-7.591z"/>
                                                <!-- second tick (offset right) -->
                                                <path d="M15.5.653L8.849 7.304 7.789 6.244l-1.06 1.06 2.12 2.12L16.56 1.713z"/>
                                            </svg>

                                            <!-- Double gray tick: delivered but not read -->
                                            <svg v-else
                                                class="w-4 h-3.5 flex-shrink-0" :class="isDark ? 'text-gray-500' : 'text-slate-400'"
                                                fill="currentColor" viewBox="0 0 16 11">
                                                <!-- first tick -->
                                                <path d="M11.071.653L4.42 7.304 1.56 4.444.5 5.504l3.92 3.92 7.591-7.591z"/>
                                                <!-- second tick -->
                                                <path d="M15.5.653L8.849 7.304 7.789 6.244l-1.06 1.06 2.12 2.12L16.56 1.713z"/>
                                            </svg>

                                        </template>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- Input area -->
                    <div class="px-4 py-3 border-t flex-shrink-0 relative" :class="isDark ? 'border-gray-700' : 'border-slate-100'">

                        <!-- Emoji Picker Popup -->
                        <Teleport to="body">
                            <div
                                v-if="showEmojiPickerPopup"
                                ref="emojiPickerRef"
                                class="fixed z-[300]"
                                :style="emojiPickerPos"
                            ></div>
                        </Teleport>

                        <!-- Input bar -->
                        <div
                            class="flex items-end gap-1 rounded-2xl border px-2 py-1.5 transition-all duration-150"
                            :class="isDark
                                ? 'bg-gray-700 border-gray-600 focus-within:border-teal-500'
                                : 'bg-white border-slate-200 focus-within:border-teal-400 focus-within:shadow-sm'"
                        >
                            <!-- Emoji button -->
                            <button
                                ref="emojiButtonRef"
                                type="button"
                                @click.stop="toggleEmojiPicker"
                                class="flex-shrink-0 self-end mb-1 p-1.5 rounded-lg transition-colors"
                                :class="showEmojiPickerPopup
                                    ? 'text-teal-500'
                                    : isDark ? 'text-gray-400 hover:text-teal-400' : 'text-slate-400 hover:text-teal-500'"
                                title="Emoji"
                            >
                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path stroke-linecap="round" d="M8 13s1.5 2 4 2 4-2 4-2"/>
                                    <circle cx="9" cy="9.5" r="1" fill="currentColor" stroke="none"/>
                                    <circle cx="15" cy="9.5" r="1" fill="currentColor" stroke="none"/>
                                </svg>
                            </button>

                            <!-- Textarea -->
                            <textarea
                                ref="messageInputRef"
                                v-model="messageInput"
                                @keydown.enter.exact.prevent="sendMessage"
                                @input="autoResize"
                                placeholder="Type a message..."
                                rows="1"
                                style="border: none; outline: none; box-shadow: none; background: transparent; resize: none;"
                                class="flex-1 text-sm leading-5 py-1.5 max-h-32 overflow-y-auto w-full"
                                :class="isDark ? 'text-white placeholder-gray-500' : 'text-slate-800 placeholder-slate-400'"
                            ></textarea>

                            <!-- Send button -->
                            <button
                                type="button"
                                @click="sendMessage"
                                :disabled="!messageInput.trim()"
                                class="flex-shrink-0 self-end mb-1 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
                                :class="messageInput.trim()
                                    ? 'text-white hover:opacity-90'
                                    : isDark ? 'text-gray-600 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed'"
                                :style="messageInput.trim() ? 'background: linear-gradient(135deg, #006970, #00a9b4)' : ''"
                            >
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- ── END RIGHT PANEL ─────────────────────────── -->

            </div><!-- end panels container -->
        </div><!-- end messenger -->

        <!-- ── HOVER CARD ──────────────────────────────────── -->
        <Teleport to="body">
            <div
                v-if="hoveredUserId"
                @mouseenter="handleCardEnter"
                @mouseleave="handleCardLeave"
                class="fixed z-[200] w-80 rounded-2xl shadow-2xl border overflow-hidden pointer-events-auto"
                :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'"
                :style="{ top: hoverCardPosition.top + 'px', left: hoverCardPosition.left + 'px' }"
            >
                <!-- Header gradient -->
                <div class="h-16 w-full" style="background: linear-gradient(135deg, #006970, #00a9b4)"></div>

                <div class="px-5 pb-5 -mt-8">
                    <!-- Avatar -->
                    <div class="relative inline-block mb-3">
                        <div v-if="getProfilePicture(props.users.find(u => u.id === hoveredUserId))"
                            class="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md">
                            <img :src="getProfilePicture(props.users.find(u => u.id === hoveredUserId))"
                                :alt="props.users.find(u => u.id === hoveredUserId)?.name"
                                class="w-full h-full object-cover"/>
                        </div>
                        <div v-else
                            class="w-16 h-16 rounded-full border-4 border-white shadow-md flex items-center justify-center text-lg font-semibold text-white"
                            style="background: linear-gradient(135deg, #006970, #00a9b4)">
                            {{ getInitials(props.users.find(u => u.id === hoveredUserId)?.name) }}
                        </div>
                        <span class="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
                            :class="statusDotClass(hoveredUserId)"/>
                    </div>

                    <!-- Name + email -->
                    <div class="mb-3">
                        <h3 class="text-base font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
                            {{ props.users.find(u => u.id === hoveredUserId)?.name }}
                        </h3>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <p class="text-sm truncate" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                                {{ props.users.find(u => u.id === hoveredUserId)?.email }}
                            </p>
                            <button @click.stop="copyEmail(props.users.find(u => u.id === hoveredUserId)?.email)"
                                class="flex-shrink-0 p-1 rounded transition-colors"
                                :class="copiedEmail ? 'text-emerald-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'">
                                <svg v-if="!copiedEmail" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                </svg>
                                <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Department / position -->
                    <div v-if="props.users.find(u => u.id === hoveredUserId)?.employee"
                        class="mb-4 px-3 py-2 rounded-lg text-sm"
                        :class="isDark ? 'bg-gray-700' : 'bg-slate-50'">
                        <p class="font-medium" :class="isDark ? 'text-gray-200' : 'text-slate-700'">
                            {{ props.users.find(u => u.id === hoveredUserId)?.employee?.department }}
                        </p>
                        <p v-if="props.users.find(u => u.id === hoveredUserId)?.employee?.position"
                            class="text-xs mt-0.5" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                            {{ props.users.find(u => u.id === hoveredUserId)?.employee?.position }}
                        </p>
                    </div>

                    <!-- Status badge -->
                    <div class="flex items-center gap-2 mb-4">
                        <span class="w-2 h-2 rounded-full flex-shrink-0"
                            :class="statusDotClass(hoveredUserId)"/>
                        <span class="text-xs font-medium" :class="statusTextClass(hoveredUserId)">
                            {{ statusLabel(hoveredUserId) }}
                        </span>
                    </div>

                    <!-- Action buttons -->
                    <div class="flex gap-2">
                        <button @click.stop="startConversation(hoveredUserId); hoveredUserId = null"
                            class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style="background: linear-gradient(135deg, #006970, #00a9b4)">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            Message
                        </button>
                        <a :href="`mailto:${props.users.find(u => u.id === hoveredUserId)?.email}`"
                            @click.stop
                            class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors"
                            :class="isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            Email
                        </a>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── NEW CHAT MODAL ──────────────────────────────── -->
        <Teleport to="body">
            <div v-if="showNewChatModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showNewChatModal = false"></div>
                <div class="relative rounded-2xl shadow-2xl w-full max-w-md max-h-[75vh] flex flex-col overflow-hidden"
                    :class="isDark ? 'bg-gray-800' : 'bg-white'">
                    <div class="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
                        :class="isDark ? 'border-gray-700' : 'border-slate-100'">
                        <h3 class="text-base font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">New Message</h3>
                        <button @click="showNewChatModal = false"
                            class="p-1.5 rounded-lg transition-colors"
                            :class="isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-slate-400 hover:bg-slate-100'">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <div class="px-4 py-3 border-b flex-shrink-0" :class="isDark ? 'border-gray-700' : 'border-slate-100'">
                        <div class="relative">
                            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                            </svg>
                            <input v-model="searchQuery" type="text" placeholder="Search people..."
                                class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'"
                                autofocus/>
                        </div>
                    </div>
                    <div class="overflow-y-auto flex-1">
                        <div v-for="user in filteredUsers" :key="user.id"
                            @click="startConversation(user.id); showNewChatModal = false"
                            class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                            :class="isDark ? 'hover:bg-gray-700' : 'hover:bg-slate-50'">
                            <div class="relative flex-shrink-0">
                                <div v-if="getProfilePicture(user)" class="w-10 h-10 rounded-full overflow-hidden">
                                    <img :src="getProfilePicture(user)" :alt="user.name" class="w-full h-full object-cover"/>
                                </div>
                                <div v-else class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                                    style="background: linear-gradient(135deg, #006970, #00a9b4)">
                                    {{ getInitials(user.name) }}
                                </div>
                                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                                    :class="[statusDotClass(user.id), isDark ? 'border-gray-800' : 'border-white']"/>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium truncate" :class="isDark ? 'text-white' : 'text-slate-800'">{{ user.name }}</p>
                                <p class="text-xs truncate" :class="isDark ? 'text-gray-400' : 'text-slate-400'">
                                    {{ user.employee?.department || user.email }}
                                </p>
                            </div>
                            <svg class="w-4 h-4 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </div>
                        <div v-if="filteredUsers.length === 0" class="text-center py-10 text-sm text-slate-400">
                            No users found for "{{ searchQuery }}"
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        </template><!-- end #fullWidth -->

        <!-- ── IN-APP TOAST NOTIFICATIONS ─────────────────────────── -->
        <Teleport to="body">
            <div class="fixed bottom-6 right-6 z-[500] flex flex-col gap-2 items-end pointer-events-none">
                <TransitionGroup name="toast">
                    <div
                        v-for="toast in inAppToasts"
                        :key="toast.id"
                        class="pointer-events-auto flex items-start gap-3 w-80 rounded-2xl shadow-xl border px-4 py-3 cursor-pointer"
                        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'"
                        @click="startConversation(props.users.find(u => props.conversations.find(c => c.id === toast.conversationId)?.other_user?.id === u.id)?.id || toast.conversationId); dismissToast(toast.id)"
                    >
                        <!-- Avatar -->
                        <div class="flex-shrink-0 relative">
                            <div v-if="toast.senderAvatar" class="w-10 h-10 rounded-full overflow-hidden">
                                <img :src="toast.senderAvatar.startsWith('http') || toast.senderAvatar.startsWith('/') ? toast.senderAvatar : '/' + toast.senderAvatar"
                                    class="w-full h-full object-cover" />
                            </div>
                            <div v-else
                                class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                                style="background: linear-gradient(135deg, #006970, #00a9b4)">
                                {{ getInitials(toast.senderName) }}
                            </div>
                            <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal-500 border-2"
                                :class="isDark ? 'border-gray-800' : 'border-white'"></span>
                        </div>

                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between gap-2">
                                <p class="text-sm font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-800'">
                                    {{ toast.senderName }}
                                </p>
                                <button
                                    @click.stop="dismissToast(toast.id)"
                                    class="flex-shrink-0 p-0.5 rounded transition-colors"
                                    :class="isDark ? 'text-gray-500 hover:text-gray-300' : 'text-slate-300 hover:text-slate-500'"
                                >
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                            <p class="text-xs truncate mt-0.5" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                                {{ toast.message }}
                            </p>
                            <p class="text-[10px] mt-1 font-medium text-teal-500">New message · Tap to open</p>
                        </div>
                    </div>
                </TransitionGroup>
            </div>
        </Teleport>

    </AuthenticatedLayout>
</template>

<style scoped>
.toast-enter-active {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
    transition: all 0.25s ease-in;
}
.toast-enter-from {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
}
.toast-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
}
</style>
