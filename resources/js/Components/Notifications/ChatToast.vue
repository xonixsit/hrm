<script setup>
import { ref, onMounted } from 'vue';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
const mounted = ref(false);
onMounted(() => { mounted.value = true; });

const toasts = ref([]);

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const resolveAvatar = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http') || avatar.startsWith('//')) return avatar;
    return avatar.startsWith('/') ? avatar : '/' + avatar;
};

const add = (toast) => {
    const id = Date.now() + Math.random();
    toasts.value.push({ ...toast, id });
    setTimeout(() => dismiss(id), 6000);
};

const dismiss = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
};

const openChat = (toast) => {
    dismiss(toast.id);
    // Navigate to messaging page with the sender's user ID so the chat auto-opens
    const url = toast.senderUserId
        ? `/team-messaging?open_user=${toast.senderUserId}`
        : '/team-messaging';
    window.location.href = url;
};

defineExpose({ add });
</script>

<template>
    <Teleport v-if="mounted" to="body">
        <!-- Position below navbar (h-20 = 80px) on the top-right, above clock-in widget -->
        <div class="fixed top-20 right-4 z-[9990] flex flex-col gap-2 items-end pointer-events-none" style="max-width: 320px;">
            <TransitionGroup name="chat-toast">
                <div
                    v-for="toast in toasts"
                    :key="toast.id"
                    class="pointer-events-auto flex items-start gap-3 w-80 rounded-2xl shadow-2xl border px-4 py-3 cursor-pointer select-none"
                    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'"
                    @click="openChat(toast)"
                >
                    <!-- Avatar -->
                    <div class="flex-shrink-0 relative mt-0.5">
                        <img
                            v-if="resolveAvatar(toast.avatar)"
                            :src="resolveAvatar(toast.avatar)"
                            :alt="toast.senderName"
                            class="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/30"
                            @error="(e) => e.target.style.display = 'none'"
                        />
                        <div
                            v-else
                            class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                            style="background: linear-gradient(135deg, #006970, #00a9b4)"
                        >{{ getInitials(toast.senderName) }}</div>
                        <!-- Online indicator -->
                        <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal-400 border-2"
                            :class="isDark ? 'border-gray-800' : 'border-white'"></span>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-2">
                            <div class="flex items-center gap-1.5 min-w-0">
                                <p class="text-sm font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-800'">
                                    {{ toast.senderName }}
                                </p>
                                <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500 text-white font-medium flex-shrink-0">New</span>
                            </div>
                            <button
                                @click.stop="dismiss(toast.id)"
                                class="flex-shrink-0 p-0.5 rounded-md transition-colors"
                                :class="isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'"
                            >
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <p class="text-xs mt-0.5 line-clamp-2" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                            {{ toast.message }}
                        </p>
                        <p class="text-[10px] mt-1.5 font-medium text-teal-500 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/>
                            </svg>
                            Click to open conversation
                        </p>
                    </div>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<style scoped>
.chat-toast-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.chat-toast-leave-active { transition: all 0.2s ease-in; }
.chat-toast-enter-from  { opacity: 0; transform: translateY(-16px) scale(0.92); }
.chat-toast-leave-to    { opacity: 0; transform: translateX(110%) scale(0.95); }
</style>
