<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTheme } from '@/composables/useTheme';
import Icon from '@/Components/Base/Icon.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';

const { isDark } = useTheme();

const props = defineProps({
    show: Boolean,
    message: String,
    undoText: {
        type: String,
        default: 'Undo'
    },
    duration: {
        type: Number,
        default: 5000 // 5 seconds
    }
});

const emit = defineEmits(['undo', 'close']);

const timeLeft = ref(props.duration);
let timer = null;

onMounted(() => {
    if (props.show) {
        startTimer();
    }
});

onUnmounted(() => {
    if (timer) {
        clearInterval(timer);
    }
});

const startTimer = () => {
    timeLeft.value = props.duration;
    timer = setInterval(() => {
        timeLeft.value -= 100;
        if (timeLeft.value <= 0) {
            clearInterval(timer);
            emit('close');
        }
    }, 100);
};

const handleUndo = () => {
    if (timer) {
        clearInterval(timer);
    }
    emit('undo');
};

const handleClose = () => {
    if (timer) {
        clearInterval(timer);
    }
    emit('close');
};

const progressPercent = computed(() => {
    return (timeLeft.value / props.duration) * 100;
});
</script>

<template>
    <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform translate-y-4 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-4 opacity-0"
    >
        <div v-if="show" :class="[
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl',
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        ]">
            <div class="flex items-center gap-3">
                <Icon name="CheckCircle" class="w-5 h-5 text-green-500" />
                <span :class="[
                    'text-sm font-medium',
                    isDark ? 'text-white' : 'text-gray-900'
                ]">
                    {{ message }}
                </span>
            </div>
            
            <div class="flex items-center gap-3">
                <BaseButton 
                    variant="ghost" 
                    size="sm"
                    @click="handleUndo"
                    class="font-medium"
                >
                    {{ undoText }}
                </BaseButton>
                
                <button 
                    @click="handleClose"
                    :class="[
                        'p-1 rounded-lg transition-colors',
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    ]"
                >
                    <Icon name="X" class="w-4 h-4" />
                </button>
            </div>

            <!-- Progress bar -->
            <div :class="[
                'absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-b-xl transition-all duration-100 ease-linear',
                isDark ? 'bg-gradient-to-r from-teal-500 to-cyan-500' : 'bg-gradient-to-r from-teal-500 to-cyan-500'
            ]" :style="{ width: progressPercent + '%' }"></div>
        </div>
    </Transition>
</template>
