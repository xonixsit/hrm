<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
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
    conversations: Array,
    users: Array,
});

const searchQuery = ref('');
const showNewChatModal = ref(false);
const selectedUser = ref(null);
const activeTab = ref('all'); // 'all', 'unread', 'archived'
const sidebarCollapsed = ref(false);
const selectedConversation = ref(null);
const messages = ref([]);
const messageInput = ref('');
const loadingMessages = ref(false);
const showEmojiPicker = ref(false);
const isTyping = ref(false);
const onlineUsers = ref(new Set());

const filteredUsers = computed(() => {
    if (!searchQuery.value) return props.users;
    const query = searchQuery.value.toLowerCase();
    return props.users.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
});

const filteredConversations = computed(() => {
    let conversations = props.conversations;
    
    if (activeTab.value === 'unread') {
        conversations = conversations.filter(conv => conv.unread_count > 0);
    }
    
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        conversations = conversations.filter(conv => {
            const userName = conv.other_user?.name?.toLowerCase() || '';
            const userEmail = conv.other_user?.email?.toLowerCase() || '';
            return userName.includes(query) || userEmail.includes(query);
        });
    }
    
    return conversations;
});

const startConversation = (userId) => {
    router.post(route('team-messaging.store'), { user_id: userId }, {
        onSuccess: (page) => {
            showNewChatModal.value = false;
            // Select the newly created conversation
            if (page.props.conversation) {
                selectConversation(page.props.conversation.id);
            }
        }
    });
};

const selectConversation = async (conversationId) => {
    selectedConversation.value = conversationId;
    loadingMessages.value = true;
    
    try {
        const response = await axios.get(route('team-messaging.messages', conversationId));
        messages.value = response.data.messages.map(msg => ({
            ...msg,
            message: msg.message || msg.body,
            sender_id: msg.sender_id || msg.author_id,
            sender: msg.sender || msg.author
        }));
    } catch (error) {
        console.error('Error loading messages:', error);
    } finally {
        loadingMessages.value = false;
    }
};

const sendMessage = async () => {
    if (!messageInput.value.trim() || !selectedConversation.value) return;
    
    const message = messageInput.value;
    messageInput.value = '';
    
    // Optimistic UI update
    const tempMessage = {
        id: 'temp-' + Date.now(),
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
    
    try {
        await router.post(route('team-messaging.send', selectedConversation.value), {
            message: message,
        }, {
            preserveScroll: true,
            onSuccess: (responsePage) => {
                // Reload messages from server
                if (responsePage.props.messages) {
                    messages.value = responsePage.props.messages.map(msg => ({
                        ...msg,
                        message: msg.message || msg.body,
                        sender_id: msg.sender_id || msg.author_id,
                        sender: msg.sender || msg.author
                    }));
                }
            },
            onError: () => {
                // Remove temp message if send failed
                const tempIndex = messages.value.findIndex(m => m.id === tempMessage.id);
                if (tempIndex !== -1) {
                    messages.value.splice(tempIndex, 1);
                }
                messageInput.value = message;
            }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        // Remove temp message
        const tempIndex = messages.value.findIndex(m => m.id === tempMessage.id);
        if (tempIndex !== -1) {
            messages.value.splice(tempIndex, 1);
        }
        messageInput.value = message;
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
        return `/storage/profile-pictures/${user.profile_picture}`;
    }
    return null;
};

const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const isUserOnline = (userId) => {
    return onlineUsers.value.has(userId);
};

onMounted(() => {
    // Set up keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            showNewChatModal.value = true;
        }
    });

    // Subscribe to presence channel for real-time user status
    if (window.Echo) {
        window.Echo.join('presence.users')
            .here((users) => {
                console.log('Online users:', users);
                users.forEach(user => {
                    onlineUsers.value.add(user.id);
                });
            })
            .joining((user) => {
                console.log('User joined:', user.name);
                onlineUsers.value.add(user.id);
            })
            .leaving((user) => {
                console.log('User left:', user.name);
                onlineUsers.value.delete(user.id);
            })
            .error((error) => {
                console.error('Presence channel error:', error);
            });
    } else {
        console.warn('Echo not initialized. Real-time presence tracking disabled.');
    }
});

// Clean up presence channel on unmount
onUnmounted(() => {
    if (window.Echo) {
        window.Echo.leave('presence.users');
    }
});

const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

const scrollToBottom = () => {
    nextTick(() => {
        const container = document.querySelector('.messages-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    });
};

const formatFullTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Watch for conversation selection to scroll to bottom
watch(selectedConversation, () => {
    scrollToBottom();
});

// Watch for messages to scroll to bottom
watch(messages, () => {
    scrollToBottom();
});
</script>

<template>
    <Head title="Messages" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold">Messages</h1>
                <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                ]">
                    {{ conversations.length }} conversations
                </span>
            </div>
        </template>

        <div class="flex gap-6 h-[calc(100vh-200px)]">
            <!-- Sidebar -->
            <div :class="[
                'w-80 flex-shrink-0 flex flex-col rounded-xl border transition-all duration-300',
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            ]">
                <!-- Search -->
                <div class="p-4 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
                    <div class="relative w-full">
                        <Icon name="Search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Search users..."
                            :class="[
                                'w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500',
                                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            ]"
                        />
                    </div>
                </div>

                <!-- Tabs -->
                <div class="flex border-b" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
                    <button
                        v-for="tab in ['all', 'unread']"
                        :key="tab"
                        @click="activeTab = tab"
                        :class="[
                            'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                            activeTab === tab
                                ? isDark 
                                    ? 'bg-gray-700 text-white border-b-2 border-teal-500' 
                                    : 'bg-gray-50 text-gray-900 border-b-2 border-teal-500'
                                : isDark 
                                    ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        ]"
                    >
                        {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
                        <span v-if="tab === 'unread'" class="ml-2 px-2 py-0.5 rounded-full text-xs" 
                            :class="isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'">
                            {{ conversations.filter(c => c.unread_count > 0).length }}
                        </span>
                    </button>
                </div>

                <!-- Conversations List -->
                <div class="flex-1 overflow-y-auto">
                    <div v-if="filteredConversations.length === 0" class="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div :class="[
                            'w-16 h-16 rounded-full flex items-center justify-center mb-4',
                            isDark ? 'bg-gray-700' : 'bg-gray-100'
                        ]">
                            <Icon name="MessageCircle" class="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 :class="[
                            'font-semibold mb-1',
                            isDark ? 'text-white' : 'text-gray-900'
                        ]">
                            No conversations found
                        </h3>
                        <p :class="[
                            'text-sm',
                            isDark ? 'text-gray-400' : 'text-gray-500'
                        ]">
                            Start a new conversation to get started
                        </p>
                    </div>

                    <div v-else class="divide-y" :class="isDark ? 'divide-gray-700' : 'divide-gray-100'">
                        <button
                            v-for="conversation in filteredConversations"
                            :key="conversation.id"
                            @click="selectConversation(conversation.id)"
                            :class="[
                                'flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors group w-full text-left',
                                isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50',
                                selectedConversation === conversation.id
                                    ? isDark ? 'bg-gray-700' : 'bg-gray-50'
                                    : ''
                            ]"
                        >
                            <!-- Avatar -->
                            <div class="relative flex-shrink-0">
                                <div v-if="getProfilePicture(conversation.other_user)" class="w-12 h-12 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-teal-500/30 transition-all">
                                    <img :src="getProfilePicture(conversation.other_user)" :alt="conversation.other_user.name" class="w-full h-full object-cover" />
                                </div>
                                <div v-else :class="[
                                    'w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-transparent group-hover:ring-teal-500/30 transition-all',
                                    isDark ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white' : 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                                ]">
                                    {{ getInitials(conversation.other_user.name) }}
                                </div>
                                <div :class="[
                                    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2',
                                    isUserOnline(conversation.other_user.id) ? 'bg-green-500' : 'bg-gray-400',
                                    isDark ? 'border-gray-800' : 'border-white'
                                ]"></div>
                            </div>

                            <!-- Conversation Info -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between mb-1">
                                    <h3 :class="[
                                        'font-semibold truncate text-sm',
                                        conversation.unread_count > 0 ? 'text-gray-900' : '',
                                        isDark ? (conversation.unread_count > 0 ? 'text-white' : 'text-gray-200') : ''
                                    ]">
                                        {{ conversation.other_user.name }}
                                    </h3>
                                    <div class="flex items-center gap-2">
                                        <span :class="[
                                            'text-xs',
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        ]">
                                            {{ formatTime(conversation.last_message_at) }}
                                        </span>
                                        <div v-if="conversation.unread_count > 0" :class="[
                                            'w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white',
                                            'bg-gradient-to-r from-teal-500 to-cyan-500'
                                        ]">
                                            {{ conversation.unread_count }}
                                        </div>
                                    </div>
                                </div>
                                <p :class="[
                                    'text-sm truncate',
                                    conversation.unread_count > 0 ? 'font-medium text-gray-900' : '',
                                    isDark 
                                        ? (conversation.unread_count > 0 ? 'text-gray-200' : 'text-gray-400') 
                                        : (conversation.unread_count > 0 ? 'text-gray-700' : 'text-gray-500')
                                ]">
                                    {{ conversation.last_message ? conversation.last_message.message : 'No messages yet' }}
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Main Content Area -->
            <div :class="[
                'flex-1 rounded-xl border flex flex-col',
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            ]">
                <div v-if="!selectedConversation" class="flex-1 flex items-center justify-center">
                    <div class="text-center">
                        <div :class="[
                            'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6',
                            isDark ? 'bg-gray-700' : 'bg-gray-100'
                        ]">
                            <Icon name="MessageSquare" class="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 :class="[
                            'text-xl font-semibold mb-2',
                            isDark ? 'text-white' : 'text-gray-900'
                        ]">
                            Select a conversation
                        </h2>
                        <p :class="[
                            'text-sm',
                            isDark ? 'text-gray-400' : 'text-gray-500'
                        ]">
                            Choose a conversation from the left or start a new one
                        </p>
                        <BaseButton 
                            @click="showNewChatModal = true" 
                            variant="secondary"
                            class="mt-6"
                        >
                            Start New Conversation
                        </BaseButton>
                    </div>
                </div>

                <div v-else class="flex-1 flex flex-col">
                    <!-- Chat Header -->
                    <div class="p-4 border-b" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <div v-if="getProfilePicture(filteredConversations.find(c => c.id === selectedConversation)?.other_user)" class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-teal-500/30">
                                    <img :src="getProfilePicture(filteredConversations.find(c => c.id === selectedConversation)?.other_user)" :alt="filteredConversations.find(c => c.id === selectedConversation)?.other_user.name" class="w-full h-full object-cover" />
                                </div>
                                <div v-else :class="[
                                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-teal-500/30',
                                    isDark ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white' : 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                                ]">
                                    {{ getInitials(filteredConversations.find(c => c.id === selectedConversation)?.other_user?.name) }}
                                </div>
                                <div :class="[
                                    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2',
                                    isUserOnline(filteredConversations.find(c => c.id === selectedConversation)?.other_user?.id) ? 'bg-green-500' : 'bg-gray-400',
                                    isDark ? 'border-gray-800' : 'border-white'
                                ]"></div>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-semibold">{{ filteredConversations.find(c => c.id === selectedConversation)?.other_user?.name }}</h3>
                                <p :class="['text-sm', isUserOnline(filteredConversations.find(c => c.id === selectedConversation)?.other_user?.id) ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-gray-400' : 'text-gray-500')]">
                                    {{ isUserOnline(filteredConversations.find(c => c.id === selectedConversation)?.other_user?.id) ? 'Online' : 'Offline' }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Messages Container -->
                    <div class="flex-1 overflow-y-auto p-4 messages-container">
                        <div v-if="loadingMessages" class="flex items-center justify-center h-full">
                            <Icon name="Loader2" class="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                        <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full">
                            <div :class="[
                                'w-16 h-16 rounded-full flex items-center justify-center mb-4',
                                isDark ? 'bg-gray-700' : 'bg-gray-100'
                            ]">
                                <Icon name="MessageSquare" class="w-8 h-8 text-gray-400" />
                            </div>
                            <p :class="['text-sm', isDark ? 'text-gray-400' : 'text-gray-500']">No messages yet</p>
                        </div>
                        <div v-else class="space-y-3">
                            <div
                                v-for="(message, index) in messages"
                                :key="message.id"
                                :class="[
                                    'flex gap-3 items-start',
                                    message.sender_id === page.props.auth.user.id ? 'flex-row-reverse' : 'flex-row'
                                ]"
                            >
                                <div class="flex-shrink-0">
                                    <div v-if="getProfilePicture(message.sender)" class="w-8 h-8 rounded-full overflow-hidden">
                                        <img :src="getProfilePicture(message.sender)" :alt="message.sender.name" class="w-full h-full object-cover" />
                                    </div>
                                    <div v-else :class="[
                                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                                        isDark ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white' : 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                                    ]">
                                        {{ getInitials(message.sender?.name) }}
                                    </div>
                                </div>
                                <div :class="[
                                    'max-w-[70%] px-4 py-2 rounded-2xl',
                                    message.sender_id === page.props.auth.user.id
                                        ? isDark ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white' : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                                        : isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                                ]">
                                    <p class="text-sm break-words">{{ message.message }}</p>
                                    <div :class="['text-xs mt-1', message.sender_id === page.props.auth.user.id ? 'text-teal-100' : 'text-gray-500']">
                                        {{ formatFullTime(message.created_at) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Message Input -->
                    <div class="p-4 border-t" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
                        <div class="flex items-end gap-2">
                            <textarea
                                v-model="messageInput"
                                placeholder="Type a message..."
                                @keypress="handleKeyPress"
                                :class="[
                                    'flex-1 h-12 p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-teal-500',
                                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                ]"
                                rows="1"
                                style="overflow-y: hidden;"
                            ></textarea>
                            <button 
                                @click="sendMessage" 
                                :disabled="!messageInput.trim()"
                                :class="[
                                    'h-12 w-12 flex items-center justify-center rounded-lg transition-all',
                                    messageInput.trim()
                                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:opacity-90'
                                        : isDark ? 'bg-gray-700 text-gray-300 cursor-not-allowed' : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                                ]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- New Chat Modal -->
        <div v-if="showNewChatModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showNewChatModal = false"></div>
            <div :class="[
                'relative rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden',
                isDark ? 'bg-gray-800' : 'bg-white'
            ]">
                <div class="p-6 border-b flex items-center justify-between" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
                    <div>
                        <h3 class="text-lg font-semibold">New Message</h3>
                        <p :class="[
                            'text-sm mt-1',
                            isDark ? 'text-gray-400' : 'text-gray-500'
                        ]">
                            Start a conversation with anyone
                        </p>
                    </div>
                    <button @click="showNewChatModal = false" :class="[
                        'p-2 rounded-lg transition-colors',
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    ]">
                        <Icon name="X" class="w-5 h-5" />
                    </button>
                </div>
                
                <div class="p-6">
                    <div class="relative mb-4">
                        <Icon name="Search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <BaseInput
                            v-model="searchQuery"
                            placeholder="Search people..."
                            class="pl-10"
                            autofocus
                        />
                    </div>
                    
                    <div class="max-h-96 overflow-y-auto">
                        <div class="space-y-2">
                            <div
                                v-for="user in filteredUsers"
                                :key="user.id"
                                @click="startConversation(user.id)"
                                :class="[
                                    'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02]',
                                    isDark 
                                        ? 'hover:bg-gray-700' 
                                        : 'hover:bg-gray-100'
                                ]"
                            >
                                <div class="relative flex-shrink-0">
                                    <div v-if="getProfilePicture(user)" class="w-12 h-12 rounded-full overflow-hidden">
                                        <img :src="getProfilePicture(user)" :alt="user.name" class="w-full h-full object-cover" />
                                    </div>
                                    <div v-else :class="[
                                        'w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold',
                                        isDark ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white' : 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                                    ]">
                                        {{ getInitials(user.name) }}
                                    </div>
                                    <div :class="[
                                        'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2',
                                        getStatusColor(getUserStatus(user.id)),
                                        isDark ? 'border-gray-800' : 'border-white'
                                    ]"></div>
                                </div>
                                
                                <div class="flex-1 min-w-0">
                                    <p :class="[
                                        'font-medium truncate',
                                        isDark ? 'text-white' : 'text-gray-900'
                                    ]">
                                        {{ user.name }}
                                    </p>
                                    <p :class="[
                                        'text-sm truncate',
                                        isDark ? 'text-gray-400' : 'text-gray-500'
                                    ]">
                                        {{ user.email }}
                                    </p>
                                    <p v-if="user.employee" :class="[
                                        'text-xs truncate mt-1',
                                        isDark ? 'text-gray-500' : 'text-gray-400'
                                    ]">
                                        {{ user.employee.department }} • {{ user.employee.position }}
                                    </p>
                                </div>

                                <Icon name="ChevronRight" class="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        
                        <div v-if="filteredUsers.length === 0" class="text-center py-12">
                            <Icon name="Search" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p :class="[
                                'text-sm',
                                isDark ? 'text-gray-400' : 'text-gray-500'
                            ]">
                                No users found matching "{{ searchQuery }}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
