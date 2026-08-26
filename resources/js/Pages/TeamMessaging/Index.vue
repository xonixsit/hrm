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
import { markConversationReadGlobal, markConversationUnreadGlobal } from '@/composables/useChatNotifications';
import { openFloatingChat } from '@/composables/useFloatingChat';
import RichTextEditor from '@/Components/Chat/RichTextEditor.vue';
import ImageLightbox from '@/Components/Chat/ImageLightbox.vue';
import MediaGalleryModal from '@/Components/Profile/MediaGalleryModal.vue';

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
const activeTab = ref('all'); // 'all', 'unread', 'groups'
const sidebarCollapsed = ref(false);
const selectedConversation = ref(null);
const messagesContainer = ref(null);
const messages = ref([]);
const messageInput = ref('');
const richEditorRef = ref(null); // RichTextEditor component ref
const loadingMessages = ref(false);
const showEmojiPicker = ref(false);
const isTyping = ref(false);
const onlineUsers = ref({}); // kept for legacy compat â€” use userStatuses instead
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
const zoomedUser = ref(null); // { src, name, subtitle, meta, status } for lightbox
const userDetailModal = ref(null); // user object for centered detail modal

// Image lightbox state
const showImageLightbox = ref(false);
const lightboxImageSrc = ref('');
const lightboxImageAlt = ref('');

// Debug watcher for lightbox
watch(showImageLightbox, (newVal) => {
    console.log('showImageLightbox changed to:', newVal);
    console.log('lightboxImageSrc:', lightboxImageSrc.value);
});

// Media gallery state
const showMediaGallery = ref(false);
const mediaImages = ref([]);
const loadingMedia = ref(false);

// Debug watcher
watch(showMediaGallery, (newVal) => {
    console.log('showMediaGallery changed to:', newVal);
    if (newVal && selectedConversation.value) {
        loadMediaImages();
    }
});

// Load media images for the conversation
const loadMediaImages = async () => {
    if (!selectedConversation.value) return;
    console.log('Loading media for conversation:', selectedConversation.value);
    loadingMedia.value = true;
    try {
        const response = await axios.get(`/api/conversations/${selectedConversation.value}/media`);
        console.log('Media API response:', response.data);
        mediaImages.value = (response.data.images || []).map(img => ({
            id: img.filename,
            url: img.url,
            filename: img.filename,
            created_at: img.created_at
        }));
        console.log('Loaded media images:', mediaImages.value.length, mediaImages.value);
    } catch (error) {
        console.error('Failed to load media:', error);
        console.error('Error response:', error.response);
        mediaImages.value = [];
    } finally {
        loadingMedia.value = false;
    }
};

// Group media by date with friendly labels
const mediaByDate = computed(() => {
    const groups = {};
    
    // Get configured timezone offset (server sends timestamps in configured timezone)
    // We need to get "today" in the server's timezone, not browser's timezone
    // Since server timestamps are already in the correct timezone, we can work with date strings
    
    // Get current date/time - this will be in browser timezone
    const browserNow = new Date();
    
    // Get timezone from page props (shared from server)
    const appTimezone = page.props.app_timezone || 'UTC';
    
    // For simplicity, since server already sends dates in correct timezone,
    // we'll use the date portion from a recently created message or current server time
    // The most reliable way is to extract today's date from the image timestamps themselves
    
    // Get today's date string by looking at the most recent image timestamp
    // or by parsing current date in browser and assuming server is roughly synchronized
    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split('T')[0]; // YYYY-MM-DD in UTC
    
    // Better approach: use the date from the server timestamp directly
    // Server sends: "2026-08-21 16:10:59" - the date part "2026-08-21" is in configured timezone
    
    // Calculate yesterday based on today
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Sort images by date (newest first)
    const sorted = [...mediaImages.value].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
    );
    
    // Get the most recent image date as reference for "today"
    // Since images are sorted newest first, first image should be from today
    const mostRecentImageDate = sorted.length > 0 ? sorted[0].created_at.split(' ')[0] : todayStr;
    
    sorted.forEach(img => {
        // Extract just the date part from the timestamp (YYYY-MM-DD) 
        // This date is already in the admin's configured timezone
        const imageDateStr = img.created_at.split(' ')[0]; // "2026-08-21 16:10:59" -> "2026-08-21"
        const messageDate = new Date(img.created_at);
        
        // Calculate yesterday of the most recent image date
        const mostRecentDate = new Date(mostRecentImageDate);
        const yesterdayOfRecent = new Date(mostRecentDate);
        yesterdayOfRecent.setDate(yesterdayOfRecent.getDate() - 1);
        const yesterdayOfRecentStr = yesterdayOfRecent.toISOString().split('T')[0];
        
        let label;
        if (imageDateStr === mostRecentImageDate) {
            label = 'Today';
        } else if (imageDateStr === yesterdayOfRecentStr) {
            label = 'Yesterday';
        } else {
            const imgDate = new Date(imageDateStr);
            const weekAgo = new Date(mostRecentDate);
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            if (imgDate > weekAgo) {
                label = messageDate.toLocaleDateString('en-US', { weekday: 'long' });
            } else {
                label = messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
        }
        
        if (!groups[label]) groups[label] = [];
        groups[label].push(img);
    });
    
    return groups;
});

// Build a zoomedUser payload from any user-like object
const openUserLightbox = (user, src) => {
    zoomedUser.value = {
        src: src || getProfilePicture(user),
        name: user?.name || user?.sender?.name,
        subtitle: user?.employee?.position || user?.job_title || null,
        meta: user?.employee?.department || user?.department || null,
        email: user?.email || null,
        statusId: user?.id || null,
    };
};

// Image lightbox functions
const openImageLightbox = (imageSrc, imageAlt = 'Image') => {
    console.log('openImageLightbox called:', { imageSrc, imageAlt, currentState: showImageLightbox.value });
    lightboxImageSrc.value = imageSrc;
    lightboxImageAlt.value = imageAlt;
    showImageLightbox.value = true;
    console.log('After setting state:', { 
        lightboxImageSrc: lightboxImageSrc.value, 
        showImageLightbox: showImageLightbox.value 
    });
};

const closeImageLightbox = () => {
    showImageLightbox.value = false;
    lightboxImageSrc.value = '';
    lightboxImageAlt.value = '';
};

// Handle viewing image from media gallery
const handleViewImageFromGallery = (image) => {
    openImageLightbox(image.url, image.name);
};

// Handle image clicks in messages
const handleMessageClick = (event) => {
    if (event.target.tagName === 'IMG' && event.target.classList.contains('rt-image')) {
        event.preventDefault();
        event.stopPropagation();
        openImageLightbox(event.target.src, event.target.alt);
    }
};

const hoverCardPosition = ref({ top: 0, left: 0 });
const hideHoverCardTimeout = ref(null);
const copiedEmail = ref(false);
const showEmojiPickerPopup = ref(false);
const emojiPickerRef = ref(null);
const emojiButtonRef = ref(null);
const messageInputRef = ref(null);

// â”€â”€ Group chat state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const showNewGroupModal   = ref(false);
const newGroupName        = ref('');
const newGroupUserIds     = ref([]);   // selected user IDs
const groupUserSearch     = ref('');
const creatingGroup       = ref(false);

const showGroupPanel      = ref(false); // right-side member/settings panel
const groupMembers        = ref([]);    // [{ id, name, email }]
const groupCreatorId      = ref(null);
const loadingGroupMembers = ref(false);
const editingGroupName    = ref(false);
const groupNameEdit       = ref('');
const savingGroupName     = ref(false);
const addMemberSearch     = ref('');
const addingMember        = ref(false);

const currentConvIsGroup = computed(() => {
    const c = (props.conversations || []).find(c => c.id === selectedConversation.value);
    return c?.is_group || c?.type === 'group';
});

const currentGroupConv = computed(() =>
    (props.conversations || []).find(c => c.id === selectedConversation.value && (c.is_group || c.type === 'group'))
);

const currentUserIsCreator = computed(() =>
    currentGroupConv.value && groupCreatorId.value === page.props.auth.user.id
);

const currentUserIsAdmin = computed(() => {
    const roles = page.props.auth?.user?.roles || [];
    return Array.isArray(roles)
        ? roles.includes('Admin')
        : Object.values(roles).includes('Admin');
});

// Users not yet in the group (for "add member" list)
const availableToAdd = computed(() => {
    const memberIds = new Set(groupMembers.value.map(m => m.id));
    return (props.users || []).filter(u =>
        !memberIds.has(u.id) &&
        (addMemberSearch.value === '' ||
            u.name.toLowerCase().includes(addMemberSearch.value.toLowerCase()))
    );
});

// Filtered user list inside "New Group" modal
const groupModalUsers = computed(() => {
    if (!groupUserSearch.value) return props.users || [];
    const q = groupUserSearch.value.toLowerCase();
    return (props.users || []).filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
});

const toggleGroupUser = (userId) => {
    const idx = newGroupUserIds.value.indexOf(userId);
    if (idx === -1) newGroupUserIds.value.push(userId);
    else newGroupUserIds.value.splice(idx, 1);
};

const createGroup = async () => {
    if (!newGroupName.value.trim() || newGroupUserIds.value.length === 0) return;
    creatingGroup.value = true;
    try {
        const res = await axios.post(route('team-messaging.groups.create'), {
            name:     newGroupName.value.trim(),
            user_ids: newGroupUserIds.value,
        });
        showNewGroupModal.value = false;
        newGroupName.value   = '';
        newGroupUserIds.value = [];
        groupUserSearch.value = '';
        // Open the new conversation â€” force a page refresh to get it in the sidebar
        router.reload({ only: ['conversations'] });
        selectConversation(res.data.conversation_id);
    } catch (e) {
        console.error('[Group] create failed:', e);
    } finally {
        creatingGroup.value = false;
    }
};

const loadGroupMembers = async (conversationId) => {
    loadingGroupMembers.value = true;
    groupMembers.value  = [];
    groupCreatorId.value = null;
    try {
        const res = await axios.get(route('team-messaging.groups.members', conversationId));
        groupMembers.value   = res.data.members || [];
        groupCreatorId.value = res.data.creator_id;
    } catch (e) {
        console.error('[Group] load members failed:', e);
    } finally {
        loadingGroupMembers.value = false;
    }
};

const saveGroupName = async () => {
    if (!groupNameEdit.value.trim() || !currentGroupConv.value) return;
    savingGroupName.value = true;
    try {
        await axios.patch(route('team-messaging.groups.update', currentGroupConv.value.id), {
            name: groupNameEdit.value.trim(),
        });
        editingGroupName.value = false;
        router.reload({ only: ['conversations'] });
    } catch (e) {
        console.error('[Group] rename failed:', e);
    } finally {
        savingGroupName.value = false;
    }
};

const addMember = async (userId) => {
    if (!currentGroupConv.value) return;
    addingMember.value = true;
    try {
        await axios.post(route('team-messaging.groups.add-member', currentGroupConv.value.id), {
            user_id: userId,
        });
        await loadGroupMembers(currentGroupConv.value.id);
        addMemberSearch.value = '';
    } catch (e) {
        console.error('[Group] add member failed:', e);
    } finally {
        addingMember.value = false;
    }
};

const removeMember = async (userId) => {
    if (!currentGroupConv.value) return;
    try {
        await axios.delete(route('team-messaging.groups.remove-member', currentGroupConv.value.id), {
            data: { user_id: userId },
        });
        // If removing self, close the conversation
        if (userId === page.props.auth.user.id) {
            selectedConversation.value = null;
            showGroupPanel.value = false;
            router.reload({ only: ['conversations'] });
        } else {
            await loadGroupMembers(currentGroupConv.value.id);
        }
    } catch (e) {
        console.error('[Group] remove member failed:', e);
    }
};

const deleteGroup = async () => {
    if (!currentGroupConv.value || !currentUserIsCreator.value) return;
    if (!confirm(`Delete group "${currentGroupConv.value.name}"? This cannot be undone.`)) return;
    try {
        await axios.delete(route('team-messaging.groups.delete', currentGroupConv.value.id));
        selectedConversation.value = null;
        showGroupPanel.value = false;
        router.reload({ only: ['conversations'] });
    } catch (e) {
        console.error('[Group] delete failed:', e);
    }
};

// â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const inAppToasts = ref([]); // [{ id, senderName, senderAvatar, message, conversationId }]
const originalTitle = document.title;
let titleFlashInterval = null;
let totalUnreadForTitle = 0;

const startTitleFlash = (senderName) => {
    if (titleFlashInterval) return; // already flashing
    let show = true;
    titleFlashInterval = setInterval(() => {
        document.title = show ? `ðŸ’¬ New message from ${senderName}` : originalTitle;
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
        const notif = new Notification(`ðŸ’¬ ${senderName}`, {
            body: messageText.length > 80 ? messageText.slice(0, 80) + 'â€¦' : messageText,
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
                        if (richEditorRef.value) {
                            richEditorRef.value.insertAtCursor(emoji.native);
                        } else {
                            messageInput.value += emoji.native;
                        }
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
    // Groups tab â€” show no DM users
    if (activeTab.value === 'groups') return [];

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
    
    // Sort: 1) users with recent conversations first (by last message time desc)
    //       2) then users with no conversation â€” alphabetically
    return [...result].sort((a, b) => {
        const aConv = dmConvByUserId.value[a.id];
        const bConv = dmConvByUserId.value[b.id];

        const aTime = aConv?.last_message?.created_at
            ? new Date(aConv.last_message.created_at).getTime()
            : 0;
        const bTime = bConv?.last_message?.created_at
            ? new Date(bConv.last_message.created_at).getTime()
            : 0;

        // Both have conversations â€” sort by most recent first
        if (aTime && bTime) return bTime - aTime;

        // One has conversation, one doesn't â€” conversation goes first
        if (aTime && !bTime) return -1;
        if (!aTime && bTime) return 1;

        // Neither has a conversation â€” alphabetical
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

const currentConv = computed(() =>
    (props.conversations || []).find(c => c.id === selectedConversation.value) ?? null
);

// Map userId â†’ DM conversation for O(1) lookup in the template (avoids repeated .find())
const dmConvByUserId = computed(() => {
    const map = {};
    for (const c of (props.conversations || [])) {
        if (c.other_user?.id) map[c.other_user.id] = c;
    }
    return map;
});

// Helper: get DM conversation ID for a user (returns null if no conversation yet)
const dmConvId = (userId) => dmConvByUserId.value[userId]?.id ?? null;

// Group conversations (type = 'group')
const groupConversations = computed(() =>
    (props.conversations || []).filter(c => c.type === 'group' || c.is_group)
);

const selectConversation = async (conversationId) => {
    selectedConversation.value = conversationId;
    selectedUserId.value = null; // clear DM selection so group header shows
    loadingMessages.value = true;
    showGroupPanel.value = false; // close group panel when switching conversations

    // Zero unread count immediately in local map
    localUnreadCounts.value[parseInt(conversationId)] = 0;
    if (!locallyReadConversationIds.value.includes(conversationId)) {
        locallyReadConversationIds.value.push(conversationId);
    }
    stopTitleFlash();
    markConversationReadGlobal(conversationId); // sync global notification suppression

    // Load group members in parallel for group conversations
    const conv = (props.conversations || []).find(c => c.id === conversationId);
    if (conv?.is_group || conv?.type === 'group') {
        loadGroupMembers(conversationId);
    }
    
    try {
        const response = await axios.get(route('team-messaging.messages', conversationId));
        messages.value = response.data.messages.map(msg => ({
            ...msg,
            message: msg.message || msg.body,
            sender_id: msg.sender_id || msg.author_id,
            sender: msg.sender || msg.author
        }));
        // Server has marked as read â€” confirm with fresh counts
        checkForNewConversations();
    } catch (error) {
        console.error('Error loading messages:', error);
    } finally {
        loadingMessages.value = false;
    }
};

const isSending = ref(false);

const sendMessage = async () => {
    if (!selectedConversation.value || isSending.value) return;

    // Check if RichTextEditor has pending files that need to be uploaded first
    if (richEditorRef.value?.pendingFiles?.length > 0) {
        await richEditorRef.value.uploadAllFiles();
    }

    // Get HTML content from rich editor
    const htmlContent = richEditorRef.value?.getHTML() ?? messageInput.value;
    const textContent = richEditorRef.value?.getTextContent() ?? messageInput.value.trim();
    
    // Check if there's text or images
    const hasImages = htmlContent.includes('<img');
    if (!textContent && !hasImages) return;

    // Request notification permission on user gesture if not yet granted
    requestNotificationPermission();

    const message = htmlContent;
    // Clear input
    richEditorRef.value?.clear();
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
    scrollToBottom(true, true); // force â€” user just sent, always scroll down
    
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
        scrollToBottom(true, true); // force after confirmed send
    } catch (error) {
        console.error('Error sending message:', error);
        const tempIndex = messages.value.findIndex(m => m.id === tempId);
        if (tempIndex !== -1) {
            messages.value.splice(tempIndex, 1);
        }
        // Restore message into editor on failure
        if (richEditorRef.value) {
            richEditorRef.value.focus();
        } else {
            messageInput.value = message;
        }
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

    // Auto-open conversation if redirected from a notification toast or birthday wish
    const urlParams = new URLSearchParams(window.location.search);
    const openUserId = parseInt(urlParams.get('open_user')) || parseInt(urlParams.get('user_id'));
    const isBirthdayWish = urlParams.get('birthday_wish') === 'true';
    
    if (openUserId) {
        // Clean the URL without reloading
        window.history.replaceState({}, '', window.location.pathname);
        // Wait for conversations to be available, then open
        const target = props.conversations.find(c => c.other_user?.id === openUserId);
        if (target) {
            await startConversation(openUserId);
            
            // If it's a birthday wish, pre-fill the message
            if (isBirthdayWish) {
                await nextTick();
                const userName = target.other_user?.name?.split(' ')[0] || '';
                const birthdayMessage = `🎉 Happy Birthday ${userName}! Wishing you a wonderful day filled with joy and celebration! 🎂`;
                
                // Set the message in the rich editor
                if (richEditorRef.value) {
                    richEditorRef.value.setHTML(birthdayMessage);
                } else {
                    messageInput.value = birthdayMessage;
                }
            }
        } else {
            // Start a new conversation with that user
            await startConversation(openUserId);
            
            // If it's a birthday wish, pre-fill the message after conversation is created
            if (isBirthdayWish) {
                await nextTick();
                const user = props.users.find(u => u.id === openUserId);
                const userName = user?.name?.split(' ')[0] || '';
                const birthdayMessage = `🎉 Happy Birthday ${userName}! Wishing you a wonderful day filled with joy and celebration! 🎂`;
                
                // Set the message in the rich editor
                if (richEditorRef.value) {
                    richEditorRef.value.setHTML(birthdayMessage);
                } else {
                    messageInput.value = birthdayMessage;
                }
            }
        }
    }

    checkForOnlineUsers();
    checkForNewConversations(); // fetch fresh counts immediately, don't wait 5s
    
    requestNotificationPermission();
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('click', closeEmojiOnOutsideClick);
    document.addEventListener('click', closeMessageMenus);

    // Send heartbeat immediately â€” marks this user as "active" on chat page
    sendHeartbeat();

    // Poll for online statuses every 10 seconds
    setInterval(() => {
        checkForOnlineUsers();
    }, 10000);

    // Heartbeat every 30s to maintain "active" status while on this page
    setInterval(() => {
        sendHeartbeat();
    }, 30000);

    // Socket: listen on personal channel for new messages â†’ update unread counts instantly
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

    // Fallback polling every 5s â€” catches any missed socket events
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
    document.removeEventListener('click', closeMessageMenus);
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
        // silent â€” heartbeat failure is non-critical
    }
};

// â”€â”€ Per-message context menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const activeMessageMenu = ref(null); // message.id of open menu

function toggleMessageMenu(id) {
    activeMessageMenu.value = activeMessageMenu.value === id ? null : id;
}

function closeMessageMenus() {
    activeMessageMenu.value = null;
}

// Mark conversation as unread from the message level
function markUnreadFromMessage() {
    if (selectedConversation.value) {
        markAsUnread(selectedConversation.value);
    }
    activeMessageMenu.value = null;
}

// Mark conversation as read from the message level
async function markReadFromMessage() {
    if (!selectedConversation.value) return;
    activeMessageMenu.value = null;
    const id = parseInt(selectedConversation.value);
    // Update local state immediately
    localUnreadCounts.value[id] = 0;
    if (!locallyReadConversationIds.value.includes(id)) {
        locallyReadConversationIds.value.push(id);
    }
    markConversationReadGlobal(selectedConversation.value);
    // Fire the server endpoint to persist read events
    try {
        await axios.get(route('team-messaging.messages', selectedConversation.value));
    } catch (e) { /* silent */ }
}
const markingUnread = ref(null); // conversationId being processed

const markAsUnread = async (conversationId) => {
    if (!conversationId) return;
    markingUnread.value = conversationId;
    try {
        await axios.post(route('team-messaging.mark-unread', conversationId));
        const id = parseInt(conversationId);
        // Update local state
        localUnreadCounts.value[id] = 1;
        locallyReadConversationIds.value = locallyReadConversationIds.value.filter(i => parseInt(i) !== id);
        // Tell the global notification system to hold this at â‰¥1
        markConversationUnreadGlobal(conversationId);
        // Deselect if currently open so badge is visible
        if (selectedConversation.value === conversationId) {
            selectedConversation.value = null;
            messages.value = [];
        }
    } catch (e) {
        console.error('[markAsUnread] failed:', e);
    } finally {
        markingUnread.value = null;
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

    // Skip HTTP poll if WebSocket is connected â€” socket delivers in real-time
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

            // Don't zero out a conversation the user explicitly marked unread
            const effectiveCount = (localUnreadCounts.value[numId] === 1 && newCount === 0)
                ? 1
                : newCount;

            // Update local map (skip if user already read it locally)
            if (!isConvRead(numId)) {
                localUnreadCounts.value[numId] = effectiveCount;
            }

            // Only notify if count genuinely increased AND we have preview data
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

// â”€â”€ Scroll-to-bottom button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const showScrollBtn = ref(false);

function onMessagesScroll() {
    showScrollBtn.value = !isNearBottom();
}

const scrollToBottom = (smooth = true, force = false) => {
    nextTick(() => {
        if (messagesContainer.value) {
            // Only auto-scroll if user is already near the bottom (within 120px)
            // or if force=true (user just sent a message)
            if (force || isNearBottom()) {
                messagesContainer.value.scrollTo({
                    top: messagesContainer.value.scrollHeight,
                    behavior: smooth ? 'smooth' : 'auto'
                });
            }
        }
    });
};

const isNearBottom = () => {
    if (!messagesContainer.value) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
    return scrollHeight - scrollTop - clientHeight < 120;
};

const formatFullTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Date separator helpers
const formatDateSeparator = (date) => {
    if (!date) return '';
    const d     = new Date(date);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    const isToday     = d.toDateString() === today.toDateString();
    const isYesterday = d.toDateString() === yesterday.toDateString();
    if (isToday)     return 'Today';
    if (isYesterday) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
};

const getMessageDateKey = (date) => {
    if (!date) return '';
    return new Date(date).toDateString();
};

const shouldShowDateSeparator = (messages, index) => {
    if (index === 0) return true;
    const prev = getMessageDateKey(messages[index - 1]?.created_at);
    const curr = getMessageDateKey(messages[index]?.created_at);
    return prev !== curr;
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
                        // Recipient has read messages â€” update is_read on our sent messages
                        const readIds = new Set(data.message_ids);
                        messages.value = messages.value.map(m =>
                            readIds.has(m.id) ? { ...m, is_read: true } : m
                        );
                    });
            } catch (e) {
                console.warn('[Echo] Private channel subscription warning:', e);
            }
        }

        // Polling fallback every 3s â€” catches messages when WebSocket is unavailable
        messagePollingInterval = setInterval(() => {
            checkForNewMessages();
        }, 3000);
    }
    scrollToBottom(false, true); // force on conversation switch â€” always jump to bottom
});

// Watch for messages to scroll to bottom â€” only when near bottom
watch(messages, () => {
    scrollToBottom(true); // respects isNearBottom() internally
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

            <!-- â”€â”€ LEFT SIDEBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
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

                <!-- Tabs: All / Unread / Groups -->
                <div class="flex px-4 gap-1 border-b" :class="isDark ? 'border-gray-700' : 'border-slate-100'">
                    <!-- All tab -->
                    <button
                        @click="activeTab = 'all'"
                        class="relative pb-3 pt-1 px-3 text-sm font-medium transition-colors"
                        :class="activeTab === 'all'
                            ? 'text-teal-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-teal-500 after:rounded-full'
                            : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-slate-700'"
                    >All</button>

                    <!-- Unread tab -->
                    <button
                        @click="activeTab = 'unread'"
                        class="relative pb-3 pt-1 px-3 text-sm font-medium transition-colors"
                        :class="activeTab === 'unread'
                            ? 'text-teal-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-teal-500 after:rounded-full'
                            : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-slate-700'"
                    >
                        Unread
                        <span
                            v-if="effectiveUnreadCount > 0"
                            class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white"
                        >{{ effectiveUnreadCount }}</span>
                    </button>

                    <!-- Groups tab -->
                    <button
                        @click="activeTab = 'groups'"
                        class="relative pb-3 pt-1 px-3 text-sm font-medium transition-colors"
                        :class="activeTab === 'groups'
                            ? 'text-teal-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-teal-500 after:rounded-full'
                            : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-slate-700'"
                    >
                        Groups
                        <span v-if="groupConversations.length > 0"
                            class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold"
                            :class="isDark ? 'bg-gray-600 text-gray-300' : 'bg-slate-100 text-slate-600'"
                        >{{ groupConversations.length }}</span>
                    </button>
                </div>

                <!-- Conversation / User list -->
                <div class="flex-1 overflow-y-auto pr-1 chat-scroll">

                    <!-- â”€â”€ Groups tab: show only group conversations â”€â”€ -->
                    <template v-if="activeTab === 'groups'">
                        <div v-if="groupConversations.length === 0"
                            class="flex flex-col items-center justify-center h-full p-6 text-center">
                            <svg class="w-10 h-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-slate-400'">No groups yet</p>
                        </div>
                        <div v-else class="space-y-1 pt-2">
                            <div v-for="conv in groupConversations" :key="'gtab-'+conv.id"
                                @click="selectConversation(conv.id)"
                                class="group flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors border-l-[3px] rounded-lg mx-1"
                                :class="selectedConversation === conv.id
                                    ? isDark ? 'bg-teal-900/40 border-teal-500' : 'bg-teal-50 border-teal-500'
                                    : isDark ? 'border-transparent hover:bg-gray-700' : 'border-transparent hover:bg-slate-50'">
                                <!-- Avatar -->
                                <div class="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 relative"
                                    :style="conv.is_default
                                        ? 'background:linear-gradient(135deg,#b45309,#d97706)'
                                        : 'background:linear-gradient(135deg,#006970,#00a9b4)'">
                                    <svg v-if="conv.is_default" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                    </svg>
                                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    <!-- Star badge for default group -->
                                    <span v-if="conv.is_default"
                                        class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 flex items-center justify-center"
                                        :class="isDark ? 'border-gray-800' : 'border-white'">
                                        <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                        </svg>
                                    </span>
                                </div>
                                <!-- Info -->
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-1.5">
                                        <p class="text-sm font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-800'">
                                            {{ conv.name }}
                                        </p>
                                        <span v-if="conv.is_default"
                                            class="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                                            :class="isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-700'">
                                            Company
                                        </span>
                                    </div>
                                    <p class="text-xs truncate mt-0.5" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                                        {{ conv.participant_count }} members
                                        <template v-if="conv.last_message"> Â· {{ conv.last_message.message }}</template>
                                    </p>
                                </div>
                                <!-- Unread badge + mark unread -->
                                <div class="flex items-center gap-1 shrink-0">
                                    <span v-if="getUnreadCount(conv.id) > 0 && !isConvRead(conv.id)"
                                        class="w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center">
                                        {{ getUnreadCount(conv.id) }}
                                    </span>
                                    <button v-else
                                        @click.stop="markAsUnread(conv.id)"
                                        :disabled="markingUnread === conv.id"
                                        class="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md"
                                        :class="isDark ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700' : 'text-slate-400 hover:text-blue-500 hover:bg-slate-100'"
                                        title="Mark as unread">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- â”€â”€ All / Unread tab: original DM + group list â”€â”€ -->
                    <template v-else>
                    <div v-if="filteredUsers.length === 0" class="flex flex-col items-center justify-center h-full p-6 text-center">
                        <svg class="w-10 h-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 2-3 3m0 0-3-3m3 3v-6"/>
                        </svg>
                        <p class="text-sm text-slate-400">{{ searchQuery ? 'No users found' : activeTab === 'unread' ? 'No unread messages' : 'No users available' }}</p>
                    </div>

                    <div v-else class="space-y-2">

                        <!-- Direct messages -->
                        <div
                            v-for="user in filteredUsers"
                            :key="user.id"
                            @click="startConversation(user.id)"
                            @mouseenter="handleUserHover($event, user.id)"
                            @mouseleave="handleUserLeave"
                            class="group flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors border-l-[3px]"
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
                                <div v-if="getProfilePicture(user)"
                                    class="w-10 h-10 rounded-full overflow-hidden cursor-zoom-in group/avatar"
                                    @click.stop="openUserLightbox(user)">
                                    <img :src="getProfilePicture(user)" :alt="user.name"
                                        class="w-full h-full object-cover object-top transition-transform duration-200 group-hover/avatar:scale-110"/>
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

                            <!-- Unread badge + action buttons -->
                            <div class="flex items-center gap-1 flex-shrink-0">
                                <!-- Unread badge -->
                                <span
                                    v-if="dmConvId(user.id) && getUnreadCount(dmConvId(user.id)) > 0 && !isConvRead(dmConvId(user.id))"
                                    class="w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center"
                                >{{ getUnreadCount(dmConvId(user.id)) }}</span>

                                <!-- Mark as unread â€” always visible on hover when conversation exists -->
                                <button
                                    v-if="dmConvId(user.id)"
                                    @click.stop="markAsUnread(dmConvId(user.id))"
                                    :disabled="markingUnread === dmConvId(user.id)"
                                    class="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md"
                                    :class="isDark ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-600' : 'text-slate-400 hover:text-blue-500 hover:bg-slate-200'"
                                    title="Mark as unread"
                                >
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                </button>

                                <!-- Pop-out button (visible on hover) -->
                                <button
                                    @click.stop="openFloatingChat(user, filteredConversations.find(c => c.other_user?.id === user.id)?.id ?? null)"
                                    class="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md"
                                    :class="isDark ? 'text-gray-400 hover:text-teal-400 hover:bg-gray-600' : 'text-slate-400 hover:text-teal-500 hover:bg-slate-200'"
                                    title="Open mini chat"
                                >
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    </template><!-- end All/Unread template -->
                </div>

                <!-- Sidebar footer -->
                <div
                    class="flex items-center justify-between px-4 py-3 border-t"
                    :class="isDark ? 'border-gray-700' : 'border-slate-100'"
                >
                    <button class="p-2 rounded-lg transition-colors" :class="isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-slate-400 hover:bg-slate-100'"
                        title="Settings">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <div class="flex items-center gap-2">
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
                    </div>
                    <button class="p-2 rounded-lg transition-colors" :class="isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-slate-400 hover:bg-slate-100'"
                        title="Help">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <!-- â”€â”€ RIGHT CHAT PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
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
                        <!-- Group header -->
                        <template v-if="currentConvIsGroup && currentGroupConv">
                            <div class="relative flex-shrink-0">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white"
                                    :style="currentGroupConv.is_default
                                        ? 'background:linear-gradient(135deg,#b45309,#d97706)'
                                        : 'background:linear-gradient(135deg,#006970,#00a9b4)'">
                                    <svg v-if="currentGroupConv.is_default" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                    </svg>
                                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <p class="text-sm font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-800'">
                                        {{ currentGroupConv.name }}
                                    </p>
                                    <span v-if="currentGroupConv.is_default"
                                        class="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                        :class="isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-700'">
                                        Company
                                    </span>
                                </div>
                                <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                                    {{ currentGroupConv.participant_count }} members
                                </p>
                            </div>
                            <!-- Group settings button -->
                            <button
                                @click="showGroupPanel = !showGroupPanel"
                                class="flex-shrink-0 p-2 rounded-lg transition-colors"
                                :class="showGroupPanel
                                    ? (isDark ? 'bg-teal-900/40 text-teal-400' : 'bg-teal-50 text-teal-600')
                                    : (isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-slate-400 hover:bg-slate-100')"
                                title="Group info & members"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </button>
                            <!-- Mark as unread (group) -->
                            <button
                                @click="markAsUnread(selectedConversation)"
                                :disabled="markingUnread === selectedConversation"
                                class="flex-shrink-0 p-2 rounded-lg transition-colors"
                                :class="isDark ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700' : 'text-slate-400 hover:text-blue-500 hover:bg-slate-100'"
                                title="Mark as unread"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                            </button>
                        </template>

                        <!-- DM header -->
                        <template v-else>
                            <div class="relative flex-shrink-0">
                                <div v-if="getProfilePicture(getSelectedUser())"
                                    class="w-10 h-10 rounded-full overflow-hidden cursor-zoom-in group/hdr"
                                    @click.stop="openUserLightbox(getSelectedUser())">
                                    <img :src="getProfilePicture(getSelectedUser())" :alt="getSelectedUser()?.name"
                                        class="w-full h-full object-cover object-top transition-transform duration-200 group-hover/hdr:scale-110"/>
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
                            <!-- Media Gallery Button -->
                            <button
                                @click="() => { console.log('Media button clicked, selectedConversation:', selectedConversation); showMediaGallery = true; }"
                                class="flex-shrink-0 p-2.5 rounded-lg transition-all duration-200 relative group"
                                :class="showMediaGallery
                                    ? (isDark 
                                        ? 'bg-teal-500/20 text-teal-400 ring-2 ring-teal-500' 
                                        : 'bg-teal-50 text-teal-600 ring-2 ring-teal-500')
                                    : (isDark 
                                        ? 'bg-gray-700/50 text-gray-300 hover:bg-teal-500/20 hover:text-teal-400 border border-gray-600' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600 border border-gray-300')"
                                title="View shared media"
                            >
                                <!-- Gallery/Image Icon -->
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <!-- Badge showing media count -->
                                <span v-if="mediaImages.length > 0" 
                                    class="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full shadow-sm"
                                    :class="isDark ? 'bg-teal-500 text-white' : 'bg-teal-600 text-white'">
                                    {{ mediaImages.length }}
                                </span>
                            </button>
                        </template>
                    </div>

                <!-- Main body: messages + optional group panel side by side -->
                <div class="flex flex-1 min-h-0 overflow-hidden">

                    <!-- Messages scroll area -->
                    <div ref="messagesContainer"
                        @scroll="onMessagesScroll"
                        class="flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-5 relative chat-scroll"
                        style="scroll-behavior:smooth;">

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
                            <div v-for="(message, index) in messages" :key="message.id">
                                <!-- Dynamic date separator -->
                                <div v-if="shouldShowDateSeparator(messages, index)"
                                    class="flex items-center gap-3 my-3">
                                    <div class="flex-1 h-px" :class="isDark ? 'bg-gray-700' : 'bg-slate-100'"></div>
                                    <span class="text-xs font-medium px-3 py-0.5 rounded-full"
                                        :class="isDark ? 'bg-gray-700 text-gray-400' : 'bg-slate-100 text-slate-500'">
                                        {{ formatDateSeparator(message.created_at) }}
                                    </span>
                                    <div class="flex-1 h-px" :class="isDark ? 'bg-gray-700' : 'bg-slate-100'"></div>
                                </div>

                            <div class="flex gap-2 items-end group/msg relative"
                                :class="message.sender_id === page.props.auth.user.id ? 'flex-row-reverse' : 'flex-row'">

                                <!-- Avatar â€” shown on outside edge -->
                                <div class="flex-shrink-0">
                                    <div v-if="getProfilePicture(message.sender)"
                                        class="w-8 h-8 rounded-full overflow-hidden cursor-pointer relative group/mavatar"
                                        @click="openUserLightbox(message.sender)">
                                        <img :src="getProfilePicture(message.sender)" :alt="message.sender?.name" class="w-full h-full object-cover object-top"/>
                                        <div class="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover/mavatar:opacity-100 transition-opacity duration-150">
                                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zm0 0l0 .01"/>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 8v6M8 11h6"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div v-else class="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
                                        style="background: linear-gradient(135deg, #006970, #00a9b4)">
                                        {{ getInitials(message.sender?.name) }}
                                    </div>
                                </div>

                                <!-- Bubble + timestamp -->
                                <div class="flex flex-col max-w-[60%] relative"
                                    :class="message.sender_id === page.props.auth.user.id ? 'items-end' : 'items-start'">

                                    <!-- Sender name â€” only in group chats, only for others' messages -->
                                    <p
                                        v-if="currentConvIsGroup && message.sender_id !== page.props.auth.user.id"
                                        class="text-[11px] font-medium mb-0.5 px-1"
                                        :class="isDark ? 'text-gray-400' : 'text-slate-500'"
                                    >{{ message.sender?.name }}</p>

                                    <!-- â”€â”€ Hover action toolbar (Google Chat style) â”€â”€ -->
                                    <div
                                        class="absolute -top-8 opacity-0 group-hover/msg:opacity-100 transition-opacity z-10 flex items-center gap-0.5 px-1.5 py-1 rounded-xl shadow-lg border"
                                        :class="[
                                            message.sender_id === page.props.auth.user.id ? 'right-0' : 'left-0',
                                            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
                                        ]"
                                        @click.stop
                                    >
                                        <!-- 3-dot button -->
                                        <div class="relative">
                                            <button
                                                @click.stop="toggleMessageMenu(message.id)"
                                                class="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                                                :class="isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'"
                                                title="More options"
                                            >
                                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="5"  r="1.5"/>
                                                    <circle cx="12" cy="12" r="1.5"/>
                                                    <circle cx="12" cy="19" r="1.5"/>
                                                </svg>
                                            </button>

                                            <!-- Dropdown â€” anchored to the toolbar -->
                                            <div
                                                v-if="activeMessageMenu === message.id"
                                                class="absolute top-full mt-1 min-w-[170px] rounded-xl shadow-xl border z-20 overflow-hidden"
                                                :class="[
                                                    message.sender_id === page.props.auth.user.id ? 'right-0' : 'left-0',
                                                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
                                                ]"
                                                @click.stop
                                            >
                                                <!-- Mark as read â€” only when conversation has unread -->
                                                <button
                                                    v-if="selectedConversation && getUnreadCount(selectedConversation) > 0"
                                                    @click.stop="markReadFromMessage"
                                                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                                                    :class="isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-slate-700 hover:bg-slate-50'"
                                                >
                                                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                    </svg>
                                                    Mark as read
                                                </button>
                                                <!-- Mark as unread â€” only when conversation is fully read -->
                                                <button
                                                    v-else
                                                    @click.stop="markUnreadFromMessage"
                                                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                                                    :class="isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-slate-700 hover:bg-slate-50'"
                                                >
                                                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                                    </svg>
                                                    Mark as unread
                                                </button>
                                            </div>
                                        </div>
                                    </div>

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
                                        <div class="msg-body prose-chat break-words text-sm leading-relaxed"
                                            :class="message.sender_id !== page.props.auth.user.id ? 'msg-body-incoming' : ''"
                                            v-html="message.message"
                                            @click="handleMessageClick"></div>
                                    </div>

                                    <!-- Timestamp + ticks -->
                                    <div class="flex items-center gap-1 mt-1"
                                        :class="message.sender_id === page.props.auth.user.id ? 'flex-row-reverse' : 'flex-row'">
                                        <span class="text-[11px] leading-none" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
                                            {{ formatFullTime(message.created_at) }}
                                        </span>

                                        <!-- Tick icons â€” only for own messages -->
                                        <template v-if="message.sender_id === page.props.auth.user.id">
                                            <svg v-if="message.isTemp"
                                                class="w-3.5 h-3.5 flex-shrink-0" :class="isDark ? 'text-gray-500' : 'text-slate-400'"
                                                fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                            </svg>
                                            <svg v-else-if="message.is_read"
                                                class="w-4 h-3.5 flex-shrink-0 text-blue-500"
                                                fill="currentColor" viewBox="0 0 16 11">
                                                <path d="M11.071.653L4.42 7.304 1.56 4.444.5 5.504l3.92 3.92 7.591-7.591z"/>
                                                <path d="M15.5.653L8.849 7.304 7.789 6.244l-1.06 1.06 2.12 2.12L16.56 1.713z"/>
                                            </svg>
                                            <svg v-else
                                                class="w-4 h-3.5 flex-shrink-0" :class="isDark ? 'text-gray-500' : 'text-slate-400'"
                                                fill="currentColor" viewBox="0 0 16 11">
                                                <path d="M11.071.653L4.42 7.304 1.56 4.444.5 5.504l3.92 3.92 7.591-7.591z"/>
                                                <path d="M15.5.653L8.849 7.304 7.789 6.244l-1.06 1.06 2.12 2.12L16.56 1.713z"/>
                                            </svg>
                                        </template>
                                    </div>
                                </div>
                            </div>
                            </div> <!-- close v-for wrapper -->
                        </template>

                        <!-- Scroll to bottom button -->
                        <Transition name="scroll-btn">
                            <button
                                v-if="showScrollBtn"
                                @click="scrollToBottom(true, true)"
                                class="sticky bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg transition-all hover:opacity-90 z-10"
                                style="background:linear-gradient(135deg,#006970,#00a9b4);"
                            >
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                                </svg>
                                Latest
                            </button>
                        </Transition>
                    </div>

                    <!-- â”€â”€ Group info panel (slides in when showGroupPanel is true) â”€â”€ -->
                    <Transition name="slide-panel">
                        <div
                            v-if="showGroupPanel && currentConvIsGroup"
                            class="w-72 flex-shrink-0 flex flex-col border-l overflow-y-auto group-panel-scroll"
                            :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'"
                        >
                            <!-- Panel header -->
                            <div class="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
                                :class="isDark ? 'border-gray-700' : 'border-slate-100'">
                                <h3 class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">Group Info</h3>
                                <button @click="showGroupPanel = false"
                                    class="p-1 rounded transition-colors"
                                    :class="isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>

                            <!-- Group name -->
                            <div class="px-4 py-4 border-b" :class="isDark ? 'border-gray-700' : 'border-slate-100'">
                                <p class="text-xs font-semibold uppercase tracking-wider mb-2"
                                    :class="isDark ? 'text-gray-400' : 'text-slate-400'">Group name</p>
                                <div v-if="!editingGroupName" class="flex items-center gap-2">
                                    <span class="text-sm flex-1 truncate" :class="isDark ? 'text-white' : 'text-slate-800'">
                                        {{ currentGroupConv?.name }}
                                    </span>
                                    <!-- Only allow rename for admins on non-default groups -->
                                    <button
                                        v-if="!currentGroupConv?.is_default && currentUserIsAdmin"
                                        @click="groupNameEdit = currentGroupConv?.name; editingGroupName = true"
                                        class="p-1 rounded transition-colors flex-shrink-0"
                                        :class="isDark ? 'text-gray-400 hover:text-teal-400' : 'text-slate-400 hover:text-teal-600'"
                                        title="Rename group"
                                    >
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                        </svg>
                                    </button>
                                    <span v-else
                                        class="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                                        :class="isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-700'">
                                        Default
                                    </span>
                                </div>
                                <div v-else class="flex items-center gap-2">
                                    <input
                                        v-model="groupNameEdit"
                                        @keydown.enter.prevent="saveGroupName"
                                        @keydown.esc="editingGroupName = false"
                                        class="flex-1 text-sm rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-slate-300 text-slate-800'"
                                        :disabled="savingGroupName"
                                    />
                                    <button
                                        @click="saveGroupName"
                                        :disabled="savingGroupName"
                                        class="px-2 py-1 rounded text-xs font-semibold text-white transition-opacity hover:opacity-90 flex-shrink-0"
                                        style="background: linear-gradient(135deg, #006970, #00a9b4)"
                                    >Save</button>
                                    <button @click="editingGroupName = false"
                                        class="p-1 rounded transition-colors flex-shrink-0"
                                        :class="isDark ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <!-- Members list -->
                            <div class="flex-1 px-4 py-3">
                                <p class="text-xs font-semibold uppercase tracking-wider mb-3"
                                    :class="isDark ? 'text-gray-400' : 'text-slate-400'">
                                    Members ({{ groupMembers.length }})
                                </p>

                                <div v-if="loadingGroupMembers" class="flex justify-center py-4">
                                    <svg class="w-5 h-5 animate-spin text-teal-500" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                    </svg>
                                </div>

                                <div v-else class="space-y-1">
                                    <div
                                        v-for="member in groupMembers"
                                        :key="member.id"
                                        class="flex items-center gap-2.5 px-2 py-2 rounded-lg"
                                        :class="isDark ? 'hover:bg-gray-700' : 'hover:bg-slate-50'"
                                    >
                                        <!-- Avatar with photo or initials fallback -->
                                        <div class="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden relative group/gmavatar">
                                            <img
                                                v-if="getProfilePicture(member)"
                                                :src="getProfilePicture(member)"
                                                :alt="member.name"
                                                class="w-full h-full object-cover object-top cursor-pointer"
                                                @click="openUserLightbox(member)"
                                            />
                                            <div v-else
                                                class="w-full h-full flex items-center justify-center text-xs font-semibold text-white"
                                                style="background: linear-gradient(135deg, #006970, #00a9b4)">
                                                {{ getInitials(member.name) }}
                                            </div>
                                            <div v-if="getProfilePicture(member)"
                                                class="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover/gmavatar:opacity-100 transition-opacity duration-150 cursor-pointer pointer-events-none">
                                                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zm0 0l0 .01"/>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 8v6M8 11h6"/>
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm font-medium truncate" :class="isDark ? 'text-white' : 'text-slate-800'">
                                                {{ member.name }}
                                                <span v-if="member.id === groupCreatorId"
                                                    class="ml-1 text-[10px] px-1 rounded bg-teal-100 text-teal-700 font-semibold">creator</span>
                                                <span v-if="member.id === page.props.auth.user.id"
                                                    class="ml-1 text-[10px] px-1 rounded"
                                                    :class="isDark ? 'bg-gray-600 text-gray-300' : 'bg-slate-100 text-slate-500'">you</span>
                                            </p>
                                        </div>
                                        <!-- Remove button: creator removes anyone, members remove themselves -->
                                        <button
                                            v-if="currentUserIsCreator || member.id === page.props.auth.user.id"
                                            @click="removeMember(member.id)"
                                            class="flex-shrink-0 p-1 rounded transition-colors"
                                            :class="isDark ? 'text-gray-500 hover:text-red-400 hover:bg-gray-700' : 'text-slate-300 hover:text-red-500 hover:bg-slate-100'"
                                            :title="member.id === page.props.auth.user.id ? 'Leave group' : 'Remove member'"
                                        >
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <!-- Add member (admin only) -->
                                <div v-if="currentUserIsAdmin" class="mt-4">
                                    <p class="text-xs font-semibold uppercase tracking-wider mb-2"
                                        :class="isDark ? 'text-gray-400' : 'text-slate-400'">Add member</p>
                                    <div class="relative mb-2">
                                        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                                        </svg>
                                        <input
                                            v-model="addMemberSearch"
                                            type="text"
                                            placeholder="Search users..."
                                            class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500"
                                            :class="isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'"
                                        />
                                    </div>
                                    <div class="space-y-0.5 max-h-40 overflow-y-auto">
                                        <div
                                            v-for="u in availableToAdd.slice(0, 10)"
                                            :key="u.id"
                                            class="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
                                            :class="isDark ? 'hover:bg-gray-700' : 'hover:bg-slate-50'"
                                            @click="addMember(u.id)"
                                        >
                                            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                                                style="background: linear-gradient(135deg, #006970, #00a9b4)">
                                                {{ getInitials(u.name) }}
                                            </div>
                                            <span class="text-xs truncate flex-1" :class="isDark ? 'text-gray-300' : 'text-slate-700'">{{ u.name }}</span>
                                            <svg class="w-3.5 h-3.5 flex-shrink-0 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                            </svg>
                                        </div>
                                        <p v-if="availableToAdd.length === 0" class="text-xs px-2 py-2"
                                            :class="isDark ? 'text-gray-500' : 'text-slate-400'">
                                            {{ addMemberSearch ? 'No users found' : 'All users are already members' }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Delete group (admin only, not for default group) -->
                            <div v-if="currentUserIsAdmin && !currentGroupConv?.is_default" class="px-4 pb-4">
                                <button
                                    @click="deleteGroup"
                                    class="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                                    :class="isDark ? 'border-red-800 hover:bg-red-900/20 text-red-400' : ''"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                    Delete Group
                                </button>
                            </div>
                        </div>
                    </Transition>

                    <!-- Media Gallery Panel (slides in from right like group panel) -->
                    <Transition name="slide-panel">
                        <div
                            v-if="showMediaGallery && selectedConversation"
                            class="w-80 flex-shrink-0 flex flex-col border-l overflow-hidden"
                            :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'"
                        >
                            <!-- Panel header -->
                            <div class="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
                                :class="isDark ? 'border-gray-700' : 'border-slate-100'">
                                <h3 class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">Shared Media</h3>
                                <button @click="showMediaGallery = false"
                                    class="p-1 rounded transition-colors"
                                    :class="isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                            <!-- Loading state -->
                            <div v-if="loadingMedia" class="flex-1 flex items-center justify-center">
                                <div class="text-center">
                                    <svg class="w-8 h-8 animate-spin mx-auto mb-2" :class="isDark ? 'text-teal-400' : 'text-teal-600'" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                    </svg>
                                    <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Loading media...</p>
                                </div>
                            </div>
                            <!-- Media grid -->
                            <div v-else-if="mediaImages.length > 0" class="flex-1 overflow-y-auto group-panel-scroll">
                                <div v-for="(images, dateLabel) in mediaByDate" :key="dateLabel" class="mb-4">
                                    <!-- Date header -->
                                    <div class="px-3 py-2 sticky top-0 z-10"
                                        :class="isDark ? 'bg-gray-800/95 backdrop-blur' : 'bg-white/95 backdrop-blur'">
                                        <h4 class="text-xs font-semibold uppercase tracking-wide"
                                            :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                                            {{ dateLabel }}
                                        </h4>
                                        <div class="text-xs mt-0.5" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
                                            {{ images.length }} {{ images.length === 1 ? 'item' : 'items' }}
                                        </div>
                                    </div>
                                    
                                    <!-- Images grid -->
                                    <div class="px-3 grid grid-cols-2 gap-2">
                                        <div
                                            v-for="image in images"
                                            :key="image.id"
                                            @click.stop="() => { console.log('Image clicked:', image.url); openImageLightbox(image.url, image.filename); }"
                                            class="relative rounded-lg overflow-hidden cursor-pointer group transition-all duration-200"
                                            :class="isDark ? 'hover:ring-2 ring-teal-500' : 'hover:ring-2 ring-teal-400'"
                                        >
                                            <!-- Aspect ratio container -->
                                            <div class="aspect-square bg-gray-100 dark:bg-gray-700">
                                                <img
                                                    :src="image.url"
                                                    :alt="image.filename"
                                                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            </div>
                                            
                                            <!-- Hover overlay with zoom icon -->
                                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                                                    <span class="text-xs text-white font-medium truncate">
                                                        {{ new Date(image.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }}
                                                    </span>
                                                    <svg class="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Empty state -->
                            <div v-else class="flex-1 flex items-center justify-center p-6">
                                <div class="text-center">
                                    <svg class="w-16 h-16 mx-auto mb-3" :class="isDark ? 'text-gray-600' : 'text-gray-300'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                    <p class="text-sm font-medium mb-1" :class="isDark ? 'text-gray-300' : 'text-slate-600'">No media yet</p>
                                    <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">Images sent in this conversation will appear here</p>
                                </div>
                            </div>
                        </div>
                    </Transition>

                </div><!-- end messages + panel flex row -->

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

                        <!-- Rich text input card -->
                        <div
                            class="rounded-2xl border overflow-hidden transition-all duration-150"
                            :class="isDark
                                ? 'bg-gray-700 border-gray-600 focus-within:border-teal-500'
                                : 'bg-white border-slate-200 focus-within:border-teal-400 focus-within:shadow-sm'"
                        >
                            <!-- RichTextEditor (toolbar + contenteditable) -->
                            <RichTextEditor
                                ref="richEditorRef"
                                v-model="messageInput"
                                placeholder="Type a message…"
                                :isDark="isDark"
                                :conversationId="selectedConversation"
                                @send="sendMessage"
                            />

                            <!-- Bottom action bar: emoji + send -->
                            <div class="flex items-center justify-end gap-1 px-2 py-1.5 border-t"
                                :class="isDark ? 'border-gray-600' : 'border-slate-100'">
                                <!-- Emoji -->
                                <button
                                    ref="emojiButtonRef"
                                    type="button"
                                    @click.stop="toggleEmojiPicker"
                                    class="p-1.5 rounded-lg transition-colors"
                                    :class="showEmojiPickerPopup
                                        ? 'text-teal-500'
                                        : isDark ? 'text-gray-400 hover:text-teal-400' : 'text-slate-400 hover:text-teal-500'"
                                    title="Emoji (opens picker)"
                                >
                                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                        <circle cx="12" cy="12" r="10"/>
                                        <path stroke-linecap="round" d="M8 13s1.5 2 4 2 4-2 4-2"/>
                                        <circle cx="9" cy="9.5" r="1" fill="currentColor" stroke="none"/>
                                        <circle cx="15" cy="9.5" r="1" fill="currentColor" stroke="none"/>
                                    </svg>
                                </button>

                                <!-- Send button -->
                                <button
                                    type="button"
                                    @click="sendMessage"
                                    class="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 text-white hover:opacity-90"
                                    style="background: linear-gradient(135deg, #006970, #00a9b4)"
                                    title="Send (Enter)"
                                >
                                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div><!-- end main body flex row -->
            </div>
            <!-- â”€â”€ END RIGHT PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->

            </div><!-- end panels container -->
        </div><!-- end messenger -->

        <!-- â”€â”€ HOVER CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
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
                    <!-- Avatar â€” click to zoom full size -->
                    <div class="relative inline-block mb-3">
                        <div v-if="getProfilePicture(props.users.find(u => u.id === hoveredUserId))"
                            class="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md cursor-zoom-in group/av"
                            @click.stop="openUserLightbox(props.users.find(u => u.id === hoveredUserId))">
                            <img :src="getProfilePicture(props.users.find(u => u.id === hoveredUserId))"
                                :alt="props.users.find(u => u.id === hoveredUserId)?.name"
                                class="w-full h-full object-cover object-top transition-transform duration-200 group-hover/av:scale-110"/>
                            <!-- Zoom hint overlay -->
                            <div class="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover/av:opacity-100 transition-opacity flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                                </svg>
                            </div>
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

        <!-- â”€â”€ NEW CHAT MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->

        <!-- â”€â”€ AVATAR LIGHTBOX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <Teleport to="body">
            <Transition name="avatar-zoom">
                <div v-if="zoomedUser"
                    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    @click.self="zoomedUser = null"
                >
                    <div class="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 flex flex-col items-center"
                        :class="isDark ? 'bg-gray-800' : 'bg-white'"
                        @click.stop
                    >
                        <!-- Close -->
                        <button
                            @click="zoomedUser = null"
                            class="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                        <!-- Photo -->
                        <img
                            :src="zoomedUser.src"
                            class="w-full h-auto max-h-[55vh] object-contain rounded-xl shadow-xl mb-4"
                            alt="Profile photo"
                        />
                        <!-- User details -->
                        <div class="text-center w-full">
                            <div class="font-semibold text-base" :class="isDark ? 'text-white' : 'text-gray-900'">
                                {{ zoomedUser.name }}
                            </div>
                            <div v-if="zoomedUser.subtitle" class="text-sm mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                {{ zoomedUser.subtitle }}
                            </div>
                            <div v-if="zoomedUser.meta" class="text-xs mt-0.5" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                                {{ zoomedUser.meta }}
                            </div>
                            <!-- Online status -->
                            <div v-if="zoomedUser.statusId" class="flex items-center justify-center gap-1.5 mt-2">
                                <span class="w-2 h-2 rounded-full flex-shrink-0" :class="statusDotClass(zoomedUser.statusId)"></span>
                                <span class="text-xs font-medium" :class="statusTextClass(zoomedUser.statusId)">
                                    {{ statusLabel(zoomedUser.statusId) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
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
                                    <img :src="getProfilePicture(user)" :alt="user.name" class="w-full h-full object-cover object-top"/>
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

        <!-- â”€â”€ IN-APP TOAST NOTIFICATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
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
                                    class="w-full h-full object-cover object-top" />
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
                            <p class="text-[10px] mt-1 font-medium text-teal-500">New message Â· Tap to open</p>
                        </div>
                    </div>
                </TransitionGroup>
            </div>
        </Teleport>
    </AuthenticatedLayout>

    <!-- Image Lightbox (outside layout for proper z-index) -->
    <ImageLightbox
        :is-open="showImageLightbox"
        :image-src="lightboxImageSrc"
        :image-alt="lightboxImageAlt"
        @close="closeImageLightbox"
    />
</template>
>

<style scoped>
.toast-enter-active {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
    transition: all 0.2s ease-out;
}

.toast-enter-from {
    transform: translateY(-100px);
    opacity: 0;
}

.toast-leave-to {
    transform: translateY(-50px);
    opacity: 0;
}

.slide-panel-enter-active,
.slide-panel-leave-active {
    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.slide-panel-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.slide-panel-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

.chat-scroll::-webkit-scrollbar {
    width: 6px;
}

.chat-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.chat-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.chat-scroll::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.group-panel-scroll::-webkit-scrollbar {
    width: 4px;
}

.group-panel-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.group-panel-scroll::-webkit-scrollbar-thumb {
    background: #6b7280;
    border-radius: 2px;
}

.group-panel-scroll::-webkit-scrollbar-thumb:hover {
    background: #4b5563;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
