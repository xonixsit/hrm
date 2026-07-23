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

const { isDark } = useTheme();
const page = usePage();

const props = defineProps({
    conversation: Object,
    messages: Array,
});

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
    if (!messageInput.value.trim() || isSending.value) return;

    const message = messageInput.value;
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

const emojis = ['😀', '😂', '😍', '👍', '👎', '❤️', '🎉', '🔥', '💯', '🙏'];

const addEmoji = (emoji) => {
    messageInput.value += emoji;
    showEmojiPicker.value = false;
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
</script>

<template>
    <Head :title="`${conversation.other_user.name}`" />

    <AuthenticatedLayout>
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
                    <div v-if="getProfilePicture(conversation.other_user)" class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-teal-500/30">
                        <img :src="getProfilePicture(conversation.other_user)" :alt="conversation.other_user.name" class="w-full h-full object-cover" />
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
                <div class="flex items-center gap-1 flex-shrink-0">
                    <BaseButton variant="ghost" size="sm"><Icon name="Phone" class="w-5 h-5" /></BaseButton>
                    <BaseButton variant="ghost" size="sm"><Icon name="Video" class="w-5 h-5" /></BaseButton>
                    <BaseButton variant="ghost" size="sm"><Icon name="MoreVertical" class="w-5 h-5" /></BaseButton>
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
                            <div v-if="getProfilePicture(group.sender)" class="w-11 h-11 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-teal-500/30 transition-all shadow-sm">
                                <img :src="getProfilePicture(group.sender)" :alt="group.sender.name" class="w-full h-full object-cover" />
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
                                <p class="break-words leading-relaxed text-sm">{{ message.message }}</p>
                                
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
            <div class="p-6 border-t" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
                <div class="flex items-end gap-3">
                    <div class="flex gap-2">
                        <button 
                            @click="showAttachments = !showAttachments"
                            :class="[
                                'h-11 w-11 flex items-center justify-center rounded-lg transition-colors',
                                isDark 
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            ]"
                        >
                            <Icon name="Paperclip" class="w-5 h-5" />
                        </button>
                        <button 
                            @click="showEmojiPicker = !showEmojiPicker"
                            :class="[
                                'h-11 w-11 flex items-center justify-center rounded-lg transition-colors',
                                isDark 
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            ]"
                        >
                            <Icon name="Smile" class="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div class="flex-1 relative">
                        <textarea
                            v-model="messageInput"
                            placeholder="Type a message..."
                            @keypress="handleKeyPress"
                            :class="[
                                'w-full min-h-[44px] p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all',
                                isDark 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            ]"
                            rows="1"
                        ></textarea>
                        
                        <!-- Emoji Picker -->
                        <div v-if="showEmojiPicker" :class="[
                            'absolute bottom-full left-0 mb-2 p-3 rounded-xl shadow-xl grid grid-cols-5 gap-2 z-10',
                            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                        ]">
                            <button
                                v-for="emoji in emojis"
                                :key="emoji"
                                @click="addEmoji(emoji)"
                                class="text-2xl hover:scale-125 transition-transform p-1"
                            >
                                {{ emoji }}
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        @click="sendMessage" 
                        :disabled="!messageInput.trim()"
                        :class="[
                            'h-11 w-11 flex items-center justify-center rounded-lg transition-all',
                            messageInput.trim()
                                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:opacity-90'
                                : isDark 
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        ]"
                    >
                        <Icon name="Send" class="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
