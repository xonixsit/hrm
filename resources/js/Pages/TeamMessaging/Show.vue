<script setup>
console.log('TeamMessaging Show.vue script setup loaded');
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue';
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { useTheme } from '@/composables/useTheme';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import Icon from '@/Components/Base/Icon.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';
import axios from 'axios';
import data from '@emoji-mart/data';
import { Picker } from 'emoji-mart';
import RichTextEditor from '@/Components/Chat/RichTextEditor.vue';
import ImageLightbox from '@/Components/Chat/ImageLightbox.vue';
import MediaGalleryModal from '@/Components/Profile/MediaGalleryModal.vue';
import DOMPurify from 'dompurify';

const sanitize = (html) => DOMPurify.sanitize(html, { 
    USE_PROFILES: { html: true },
    ADD_TAGS: ['svg', 'path', 'circle'],
    ADD_ATTR: ['xmlns', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'style']
});

const { isDark } = useTheme();
const page = usePage();

const props = defineProps({
    conversation: Object,
    messages: Array,
});

// Debug: Log conversation prop
console.log('TeamMessaging Show.vue - conversation prop:', props.conversation);

// Transform messages to match expected format
const transformedMessages = computed(() => {
    return props.messages.map(msg => ({
        ...msg,
        message: msg.message || msg.body, // Handle both field names
        sender_id: msg.sender_id || msg.author_id, // Handle both field names
        sender: msg.sender || msg.author // Handle both relationship names
    }));
});

const messageInput = ref('');
const richEditorRef = ref(null); // RichTextEditor component ref
const messagesContainer = ref(null);
const chatContainer = ref(null);
const chatHeight = ref('600px');

// Measure available height after mount so the chat box fills exactly the space
const updateChatHeight = () => {
    if (chatContainer.value) {
        const rect = chatContainer.value.getBoundingClientRect();
        const available = window.innerHeight - rect.top - 16; // 16px bottom gap
        chatHeight.value = Math.max(available, 400) + 'px';
    }
};
const localMessages = ref([...transformedMessages.value]);
const showEmojiPicker = ref(false);

// Image lightbox state
const showImageLightbox = ref(false);
const lightboxImageSrc = ref('');
const lightboxImageAlt = ref('');

// Media gallery state
const showMediaGallery = ref(false);
const showAttachments = ref(false);
const showActions = ref(null);
const isTyping = ref(false);
const lastMessageCount = ref(props.messages.length);
let echo = null;
let channel = null;
let typingTimeout = null;
let pollingInterval = null;

onMounted(async () => {
    console.log('Component mounted, setting up chat');
    updateChatHeight();
    window.addEventListener('resize', updateChatHeight);
    scrollToBottom(false); // instant on first load
    await setupRealtimeConnection();

    console.log('Starting initial message load');
    try {
        await checkForNewMessages();
        console.log('Initial message load completed');
    } catch (error) {
        console.error('Initial message load failed:', error);
    }

    // Polling for new messages every 2 seconds
    console.log('Setting up polling interval');
    pollingInterval = setInterval(() => {
        console.log('Polling interval triggered');
        checkForNewMessages();
    }, 2000);
    console.log('Polling interval set up successfully');
});

onUnmounted(() => {
    window.removeEventListener('resize', updateChatHeight);
    if (channel) {
        channel.stopListening('.TeamMessageSent');
        channel.stopListening('.typing');
    }
    if (echo) {
        echo.leave(`private-conversation.${props.conversation.id}`);
    }
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
});

const setupRealtimeConnection = async () => {
    console.log('Real-time WebSocket disabled - using HTTP polling for chat');
    // No WebSocket setup needed - using HTTP polling instead
};

const isSending = ref(false);

const checkForNewMessages = async () => {
    if (isSending.value) return;
    
    try {
        console.log('Polling for messages...');
        const response = await axios.get(route('team-messaging.messages', props.conversation.id));
        console.log('Polling response:', response.data);
        const newMessages = response.data.messages.map(msg => ({
            ...msg,
            message: msg.message || msg.body,
            sender_id: msg.sender_id || msg.author_id,
            sender: msg.sender || msg.author
        }));

        console.log('Current message count:', lastMessageCount.value, 'New message count:', newMessages.length);

        const realLocalMsgs = localMessages.value.filter(m => !m.isTemp);
        if (newMessages.length > realLocalMsgs.length) {
            console.log('Found new messages via polling:', newMessages.length - realLocalMsgs.length);
            const tempMsgs = localMessages.value.filter(m => m.isTemp);
            localMessages.value = [...newMessages, ...tempMsgs];
            lastMessageCount.value = localMessages.value.length;
            nextTick(() => scrollToBottom());
        }
    } catch (error) {
        console.error('Error polling for messages:', error);
    }
};

const scrollToBottom = (smooth = true) => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTo({
            top: messagesContainer.value.scrollHeight,
            behavior: smooth ? 'smooth' : 'instant'
        });
    }
};

const sendMessage = async () => {
    const htmlContent = richEditorRef.value?.getHTML() ?? messageInput.value;
    const textContent = richEditorRef.value?.getTextContent() ?? messageInput.value.trim();
    
    // Check if there's text or images
    const hasImages = htmlContent.includes('<img');
    if ((!textContent && !hasImages) || isSending.value) return;

    const message = htmlContent;
    richEditorRef.value?.clear();
    messageInput.value = '';
    isSending.value = true;

    // Optimistic UI update - add message immediately
    const tempId = 'temp-' + Date.now();
    const tempMessage = {
        id: tempId,
        conversation_id: props.conversation.id,
        sender_id: page.props.auth.user.id,
        message: message,
        is_read: false,
        created_at: new Date().toISOString(),
        sender: {
            id: page.props.auth.user.id,
            name: page.props.auth.user.name,
            profile_picture: page.props.auth.user.profile_picture,
        },
        isTemp: true
    };

    localMessages.value.push(tempMessage);
    lastMessageCount.value = localMessages.value.length;
    nextTick(() => scrollToBottom());

    try {
        const response = await axios.post(route('team-messaging.send', props.conversation.id), {
            message: message,
        });

        if (response.data && response.data.messages) {
            const serverMsgs = response.data.messages.map(msg => ({
                ...msg,
                message: msg.message || msg.body,
                sender_id: msg.sender_id || msg.author_id,
                sender: msg.sender || msg.author
            }));
            
            // Seamlessly update messages without dropping sent message
            localMessages.value = serverMsgs;
            lastMessageCount.value = localMessages.value.length;
        }
        nextTick(() => scrollToBottom());
    } catch (error) {
        console.error('Error sending message:', error);
        const tempIndex = localMessages.value.findIndex(m => m.id === tempId);
        if (tempIndex !== -1) {
            localMessages.value.splice(tempIndex, 1);
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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString();
};

const formatFullTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getProfilePicture = (user) => {
    if (user?.profile_picture) {
        return `/storage/profile-pictures/${user.profile_picture}`;
    }
    return null;
};

const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

const groupMessages = computed(() => {
    const groups = [];
    let currentGroup = null;
    
    localMessages.value.forEach((message, index) => {
        const prevMessage = localMessages.value[index - 1];
        const isSameSender = prevMessage && prevMessage.sender_id === message.sender_id;
        const isRecent = prevMessage && 
            new Date(message.created_at) - new Date(prevMessage.created_at) < 300000; // 5 minutes
        
        if (isSameSender && isRecent) {
            currentGroup.messages.push(message);
        } else {
            currentGroup = {
                sender: message.sender,
                isOwn: message.sender_id === page.props.auth.user.id,
                messages: [message]
            };
            groups.push(currentGroup);
        }
    });
    
    return groups;
});

const toggleMessageActions = (messageId) => {
    showActions.value = showActions.value === messageId ? null : messageId;
};

// ── Emoji picker (emoji-mart) ─────────────────────────────────────────────────
const emojiPickerRef   = ref(null);
const emojiButtonRef   = ref(null);

const toggleEmojiPicker = () => {
    showEmojiPicker.value = !showEmojiPicker.value;
    if (showEmojiPicker.value) {
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
                        showEmojiPicker.value = false;
                    },
                    onClickOutside: () => {
                        showEmojiPicker.value = false;
                    },
                });
                emojiPickerRef.value.appendChild(picker);
            }
        });
    }
};

// Watch for typing to broadcast typing indicator
watch(messageInput, (newValue) => {
    if (newValue.length > 0) {
        broadcastTyping();
    }
});

const broadcastTyping = () => {
    if (channel) {
        channel.whisper('typing', {
            user_id: page.props.auth.user.id
        });
    }
};

// ── Avatar lightbox ───────────────────────────────────────────────────────────
const zoomedUser = ref(null); // { src, name, subtitle, meta }

const openUserLightbox = (user) => {
    const src = getProfilePicture(user);
    if (!src) return;
    zoomedUser.value = {
        src,
        name: user?.name,
        subtitle: user?.job_title || user?.position || null,
        meta: user?.department || user?.employee?.department || null,
    };
};

// Image lightbox functions
const openImageLightbox = (imageSrc, imageAlt = 'Image') => {
    lightboxImageSrc.value = imageSrc;
    lightboxImageAlt.value = imageAlt;
    showImageLightbox.value = true;
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

</script>

<template>
    <Head :title="`${conversation.other_user.name}`" />

    <AuthenticatedLayout>
        <!-- Avatar Lightbox -->
        <Teleport to="body">
            <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
            >
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
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <div
            ref="chatContainer"
            :class="[
                'rounded-xl border flex flex-col overflow-hidden',
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            ]"
            :style="{ height: chatHeight }"
        >
            <!-- Chat Header (other user info inside the chat box) -->
            <div :class="[
                'flex items-center gap-3 px-5 py-4 border-b flex-shrink-0',
                isDark ? 'border-gray-700' : 'border-gray-200'
            ]">
                <Link :href="route('team-messaging.index')" class="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Icon name="ArrowLeft" class="w-5 h-5" />
                </Link>
                <div class="relative flex-shrink-0">
                    <div v-if="getProfilePicture(conversation.other_user)"
                        class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-teal-500/30 cursor-pointer relative group/hdravatar"
                        @click="openUserLightbox(conversation.other_user)">
                        <img :src="getProfilePicture(conversation.other_user)" :alt="conversation.other_user.name" class="w-full h-full object-cover object-top" />
                        <div class="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover/hdravatar:opacity-100 transition-opacity duration-150">
                            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 8v6M8 11h6"/>
                            </svg>
                        </div>
                    </div>
                    <div v-else :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
                        'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                    ]">{{ getInitials(conversation.other_user.name) }}</div>
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2" :class="isDark ? 'border-gray-800' : 'border-white'"></div>
                </div>
                <div class="flex-1 min-w-0">
                    <h2 class="text-base font-semibold truncate">{{ conversation.other_user.name }}</h2>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        {{ isTyping ? 'Typing...' : 'Active now' }}
                    </p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <!-- Media Gallery Button -->
                    <button
                        @click="showMediaGallery = true"
                        class="p-2 rounded-lg transition-colors"
                        :class="isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'"
                        title="View shared media"
                    >
                        <Icon name="Image" class="w-5 h-5" />
                    </button>
                    
                    <!-- Phone Button -->
                    <button
                        class="p-2 rounded-lg transition-colors"
                        :class="isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'"
                        title="Voice call"
                    >
                        <Icon name="Phone" class="w-5 h-5" />
                    </button>
                    
                    <!-- Video Button -->
                    <button
                        class="p-2 rounded-lg transition-colors"
                        :class="isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'"
                        title="Video call"
                    >
                        <Icon name="Video" class="w-5 h-5" />
                    </button>
                    
                    <!-- More Options Button -->
                    <button
                        class="p-2 rounded-lg transition-colors"
                        :class="isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'"
                        title="More options"
                    >
                        <Icon name="MoreVertical" class="w-5 h-5" />
                    </button>
                </div>
            </div>

            <!-- Messages — scrollable area between header and input -->
            <div
                ref="messagesContainer"
                class="flex-1 overflow-y-auto min-h-0 p-6 space-y-4"
                style="scroll-behavior: smooth;"
            >
                <div v-if="localMessages.length === 0" class="flex flex-col items-center justify-center h-full">
                    <div :class="[
                        'w-24 h-24 rounded-full flex items-center justify-center mb-8',
                        isDark ? 'bg-gray-700/50' : 'bg-gray-100'
                    ]">
                        <Icon name="MessageSquare" class="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 :class="[
                        'text-xl font-semibold mb-3',
                        isDark ? 'text-white' : 'text-gray-900'
                    ]">
                        Start the conversation
                    </h3>
                    <p :class="[
                        'text-base text-center max-w-md mb-6',
                        isDark ? 'text-gray-400' : 'text-gray-500'
                    ]">
                        Send a message to {{ conversation.other_user.name }} to get started
                    </p>
                    <BaseButton 
                        @click="messageInput.focus()" 
                        variant="secondary"
                        class="font-medium"
                    >
                        Send your first message
                    </BaseButton>
                </div>

                <div v-else class="space-y-3">
                    <div
                        v-for="(group, groupIndex) in groupMessages"
                        :key="`group-${groupIndex}`"
                        :class="[
                            'flex gap-4 items-start',
                            group.isOwn ? 'flex-row-reverse' : 'flex-row'
                        ]"
                    >
                        <!-- Avatar -->
                        <div class="flex-shrink-0">
                            <div v-if="getProfilePicture(group.sender)"
                                class="w-11 h-11 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-teal-500/30 transition-all shadow-sm cursor-pointer relative group/msgavatar"
                                @click="openUserLightbox(group.sender)">
                                <img :src="getProfilePicture(group.sender)" :alt="group.sender.name" class="w-full h-full object-cover object-top" />
                                <div class="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover/msgavatar:opacity-100 transition-opacity duration-150">
                                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 8v6M8 11h6"/>
                                    </svg>
                                </div>
                            </div>
                            <div v-else :class="[
                                'w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-transparent hover:ring-teal-500/30 transition-all shadow-sm',
                                isDark ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white' : 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                            ]">
                                {{ getInitials(group.sender.name) }}
                            </div>
                        </div>

                        <!-- Messages Group -->
                        <div :class="[
                            'flex flex-col gap-1.5 max-w-[75%]',
                            group.isOwn ? 'items-end' : 'items-start'
                        ]">
                            <div
                                v-for="(message, msgIndex) in group.messages"
                                :key="message.id"
                                :class="[
                                    'relative group px-5 py-3 rounded-2xl shadow-sm',
                                    group.isOwn
                                        ? isDark 
                                            ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white' 
                                            : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                                        : isDark 
                                            ? 'bg-gray-700 text-gray-100' 
                                            : 'bg-white border border-gray-200 text-gray-900',
                                    msgIndex === group.messages.length - 1 ? 'rounded-b-2xl' : 'rounded-b-lg',
                                    msgIndex === 0 ? 'rounded-t-2xl' : 'rounded-t-lg'
                                ]"
                            >
                                <div class="msg-body break-words text-sm leading-relaxed"
                                    :class="!group.isOwn ? 'msg-body-incoming' : ''"
                                    v-html="sanitize(message.message)"
                                    @click="handleMessageClick"></div>
                                
                                <!-- Message Actions -->
                                <div :class="[
                                    'absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity',
                                    group.isOwn ? '-translate-y-full -translate-x-2' : '-translate-y-full translate-x-2'
                                ]">
                                    <div :class="[
                                        'flex gap-1 p-1.5 rounded-lg shadow-lg',
                                        isDark ? 'bg-gray-800' : 'bg-white'
                                    ]">
                                        <button 
                                            @click="toggleMessageActions(message.id)"
                                            class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <Icon name="MoreHorizontal" class="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <!-- Timestamp -->
                                <div :class="[
                                    'text-xs mt-2 flex items-center gap-2',
                                    group.isOwn ? 'text-teal-100' : 'text-gray-500'
                                ]">
                                    <span>{{ formatFullTime(message.created_at) }}</span>
                                    <span v-if="group.isOwn" class="flex items-center gap-1">
                                        <Icon name="Check" class="w-3.5 h-3.5" />
                                        <Icon name="Check" class="w-3.5 h-3.5 -ml-2" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Message Input -->
            <div class="p-4 border-t flex-shrink-0" :class="isDark ? 'border-gray-700' : 'border-gray-200'">

                <!-- Emoji picker teleport -->
                <Teleport to="body">
                    <div
                        v-if="showEmojiPicker"
                        ref="emojiPickerRef"
                        class="fixed z-[300]"
                        style="bottom:80px;left:50%;transform:translateX(-50%);"
                    ></div>
                </Teleport>

                <!-- Rich text input card -->
                <div
                    class="rounded-2xl border overflow-hidden transition-all duration-150"
                    :class="isDark
                        ? 'bg-gray-700 border-gray-600 focus-within:border-teal-500'
                        : 'bg-white border-gray-300 focus-within:border-teal-400 focus-within:shadow-sm'"
                >
                    <RichTextEditor
                        ref="richEditorRef"
                        v-model="messageInput"
                        placeholder="Type a message…"
                        :isDark="isDark"
                        :conversationId="conversation?.id"
                        @send="sendMessage"
                    />

                    <!-- Bottom action row: emoji + send -->
                    <div class="flex items-center justify-end gap-1 px-2 py-1.5 border-t"
                        :class="isDark ? 'border-gray-600' : 'border-gray-200'">
                        <button
                            @click="toggleEmojiPicker"
                            ref="emojiButtonRef"
                            class="p-1.5 rounded-lg transition-colors"
                            :class="showEmojiPicker
                                ? 'text-teal-500'
                                : isDark ? 'text-gray-400 hover:text-teal-400' : 'text-gray-500 hover:text-teal-600'"
                            title="Emoji"
                        >
                            <Icon name="Smile" class="w-5 h-5" />
                        </button>
                        <button
                            @click="sendMessage"
                            class="h-8 w-8 flex items-center justify-center rounded-xl transition-all text-white hover:opacity-90"
                            style="background: linear-gradient(135deg, #006970, #00a9b4)"
                            title="Send (Enter)"
                        >
                            <Icon name="Send" class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Image Lightbox -->
        <ImageLightbox
            :is-open="showImageLightbox"
            :image-src="lightboxImageSrc"
            :image-alt="lightboxImageAlt"
            @close="closeImageLightbox"
        />

        <!-- Media Gallery Modal -->
        <MediaGalleryModal
            :open="showMediaGallery"
            mode="chat"
            :conversationId="conversation.id"
            @close="showMediaGallery = false"
            @viewImage="handleViewImageFromGallery"
        />
    </AuthenticatedLayout>
</template>

<style scoped>
/* ── Rich-text message rendering ── */
.msg-body :deep(b),
.msg-body :deep(strong) { 
    font-weight: 700; 
}

.msg-body :deep(i),
.msg-body :deep(em) { 
    font-style: italic; 
}

.msg-body :deep(u) { 
    text-decoration: underline; 
}

.msg-body :deep(s),
.msg-body :deep(strike) { 
    text-decoration: line-through; 
}

.msg-body :deep(blockquote) {
    border-left: 3px solid rgba(255,255,255,0.5);
    padding-left: 12px;
    margin: 8px 0;
    font-style: italic;
    opacity: 0.9;
}

.msg-body :deep(ul) {
    list-style-type: disc;
    list-style-position: inside;
    padding-left: 0;
    margin: 6px 0;
}

.msg-body :deep(ul li) {
    margin: 2px 0;
    display: list-item;
}

.msg-body :deep(ol) {
    list-style-type: decimal;
    list-style-position: inside;
    padding-left: 0;
    margin: 6px 0;
}

.msg-body :deep(ol li) {
    margin: 2px 0;
    display: list-item;
}

.msg-body :deep(a),
.msg-body :deep(a.rt-link) {
    color: inherit;
    text-decoration: underline;
    opacity: 0.9;
}

.msg-body :deep(code),
.msg-body :deep(code.rt-code) {
    font-family: ui-monospace, 'Courier New', monospace;
    background: rgba(0,0,0,0.2);
    border-radius: 3px;
    padding: 2px 5px;
    font-size: 0.9em;
}

.msg-body :deep(.colored-text) {
    /* Preserve color from inline style */
}

.msg-body :deep(span[style*="color"]) {
    /* Preserve inline color styles */
}

.msg-body :deep(img.rt-image) {
    max-width: 100%;
    max-height: 300px;
    height: auto;
    border-radius: 8px;
    margin: 8px 0;
    display: block;
    cursor: pointer;
    transition: transform 0.2s;
}

.msg-body :deep(img.rt-image):hover {
    transform: scale(1.02);
}

/* Incoming messages: readable styles on light bg */
.msg-body-incoming :deep(blockquote) {
    border-left-color: #14b8a6;
    opacity: 1;
}

.msg-body-incoming :deep(code),
.msg-body-incoming :deep(code.rt-code) {
    background: rgba(0,0,0,0.08);
}

.msg-body-incoming :deep(a),
.msg-body-incoming :deep(a.rt-link) {
    color: #0ea5e9;
    text-decoration: underline;
}

/* Avatar zoom transition */
.avatar-zoom-enter-active { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
.avatar-zoom-leave-active { transition: all 0.15s ease-in; }
.avatar-zoom-enter-from, .avatar-zoom-leave-to { opacity: 0; }
</style>
