<template>
    <div v-if="showNotifications" class="space-y-4">
        <!-- Today's Birthdays -->
        <div v-if="todaysBirthdays && todaysBirthdays.length > 0" class="bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 border-2 border-pink-200 rounded-xl p-5 shadow-sm">
            <div class="flex items-center space-x-3 mb-4">
                <div class="text-3xl">🎉</div>
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-pink-800">Birthday Today!</h3>
                    <p class="text-sm text-pink-600">Let's celebrate our team members</p>
                </div>
            </div>
            
            <div class="space-y-3">
                <!-- All birthdays today -->
                <div v-for="employee in todaysBirthdays" :key="employee.id" 
                    :class="isCurrentUser(employee) ? 'border-2 border-pink-300 bg-gradient-to-r from-pink-100 to-purple-100' : 'bg-white'"
                    class="rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200">
                    
                    <!-- Avatar and Name Row -->
                    <div class="flex items-center space-x-3 mb-3">
                        <!-- Avatar with Profile Picture -->
                        <div v-if="employee.user?.profile_pic" class="w-12 h-12 rounded-full overflow-hidden border-3 border-pink-300 flex-shrink-0 shadow-md">
                            <img 
                                :src="`/${employee.user.profile_pic}`" 
                                :alt="employee.user?.name"
                                class="w-full h-full object-cover"
                            />
                        </div>
                        <div v-else 
                            :class="isCurrentUser(employee) ? 'bg-gradient-to-br from-pink-400 to-purple-500' : 'bg-gradient-to-br from-pink-300 to-purple-400'" 
                            class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            <span class="text-base font-bold text-white">
                                {{ getInitials(employee.user?.name || 'U') }}
                            </span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <p class="font-bold text-gray-900 text-base truncate">
                                    {{ employee.user?.name }}
                                </p>
                                <span v-if="isCurrentUser(employee)" 
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-pink-600 text-white">
                                    You!
                                </span>
                            </div>
                            <p class="text-sm text-gray-600">{{ employee.job_title || 'Employee' }}</p>
                        </div>
                        <div class="flex-shrink-0">
                            <span class="text-2xl">🎂</span>
                        </div>
                    </div>
                    
                    <!-- Action Button Row -->
                    <div v-if="!isCurrentUser(employee) && !wishedUsers[getUserId(employee)]" class="flex justify-center">
                        <!-- Wish Happy Birthday Button -->
                        <button
                            @click.prevent="sendBirthdayWish(employee)"
                            :disabled="sendingUsers[getUserId(employee)]"
                            class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                            <span v-if="sendingUsers[getUserId(employee)]">Sending…</span>
                            <span v-else>🎉 Wish Happy Birthday</span>
                        </button>
                    </div>
                    
                    <!-- Wished Status Message (shown after wishing) -->
                    <div v-else-if="!isCurrentUser(employee) && wishedUsers[getUserId(employee)]" class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-100 text-green-700 border-2 border-green-200">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-sm font-semibold">Birthday wish sent! 🎉</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Upcoming Birthdays -->
        <div v-if="upcomingBirthdays.length > 0" class="bg-gradient-to-br from-teal-50 via-indigo-50 to-teal-50 border-2 border-teal-200 rounded-xl p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="text-3xl">🎂</div>
                    <div>
                        <h3 class="text-xl font-bold text-teal-800">Upcoming Birthdays</h3>
                        <p class="text-sm text-teal-600">Don't forget to wish them well!</p>
                    </div>
                </div>
                <button 
                    @click="showAllUpcoming = !showAllUpcoming"
                    class="px-3 py-1.5 text-sm font-medium text-teal-700 hover:text-teal-900 bg-white hover:bg-teal-50 border-2 border-teal-200 hover:border-teal-300 rounded-lg transition-all"
                >
                    {{ showAllUpcoming ? 'Show Less' : 'Show All' }}
                </button>
            </div>
            
            <div class="space-y-2">
                <div 
                    v-for="(birthday, index) in displayedUpcomingBirthdays" 
                    :key="birthday.employee.id" 
                    class="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                >
                    <div class="flex items-center space-x-3 flex-1 min-w-0">
                        <!-- Avatar with Profile Picture -->
                        <div v-if="birthday.employee.user?.profile_pic" class="w-10 h-10 rounded-full overflow-hidden border-2 border-teal-200 flex-shrink-0">
                            <img 
                                :src="`/${birthday.employee.user.profile_pic}`" 
                                :alt="birthday.employee.user.name"
                                class="w-full h-full object-cover"
                            />
                        </div>
                        <div v-else class="w-10 h-10 bg-gradient-to-br from-teal-300 to-indigo-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span class="text-sm font-bold text-white">
                                {{ getInitials(birthday.employee.user.name) }}
                            </span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold text-gray-900 truncate">{{ birthday.employee.user.name }}</p>
                            <p class="text-sm text-gray-600">{{ birthday.employee.job_title || 'Employee' }}</p>
                        </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                        <p class="text-sm font-bold text-teal-700">{{ formatBirthdayDate(birthday.birthday_date) }}</p>
                        <p class="text-xs font-medium text-gray-500">{{ formatDaysUntil(birthday.days_until) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- No Birthdays Today Message -->
        <div v-if="todaysBirthdays.length === 0 && !currentUserBirthday && upcomingBirthdays.length === 0" class="bg-gradient-to-br from-teal-50 via-indigo-50 to-teal-50 border-2 border-teal-200 rounded-xl p-5 shadow-sm">
            <div class="flex items-center space-x-3">
                <div class="text-3xl">🎂</div>
                <div>
                    <h3 class="text-xl font-bold text-teal-800">No Birthdays This Month</h3>
                    <p class="text-sm text-teal-600">No team birthdays to celebrate right now, but stay tuned!</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import axios from 'axios'
import { router } from '@inertiajs/vue3'

const props = defineProps({
    todaysBirthdays:    { type: Array,  default: () => [] },
    upcomingBirthdays:  { type: Array,  default: () => [] },
    stats:              { type: Object, default: null },
    systemTimezone:     { type: String, default: 'UTC' },
    currentUserBirthday:{ type: Object, default: null },
})

const showAllUpcoming = ref(false)

// Track which users have already been wished (keyed by employee.user_id)
const wishedUsers  = ref({})   // { userId: true }
const sendingUsers = ref({})   // { userId: true }

// Helper function to get user ID safely
const getUserId = (employee) => {
    // Try multiple paths to get user ID
    // Priority: user_id field, user.id, then fallback to getting it from user email
    const userId = employee.user_id ?? employee.user?.id ?? null
    
    if (!userId) {
        console.error('[getUserId] Could not find user ID. Employee object:', JSON.stringify(employee, null, 2))
    } else {
        console.log('[getUserId] Found userId:', userId, 'from employee:', employee.user?.name)
    }
    
    return userId
}

async function sendBirthdayWish(employee) {
    const userId = getUserId(employee)
    if (!userId || wishedUsers.value[userId]) {
        console.log('[Birthday Wish] Skipping - no userId or already wished', { userId, employee })
        return
    }
    
    console.log('[Birthday Wish] Starting for user:', userId, employee.user?.name)
    sendingUsers.value[userId] = true
    
    try {
        // 1. Get or create conversation
        console.log('[Birthday Wish] Creating/getting conversation...')
        const convRes = await axios.post(route('team-messaging.store'), { user_id: userId })
        const convId  = convRes.data.conversation_id
        if (!convId) throw new Error('No conversation id returned')
        console.log('[Birthday Wish] Conversation ID:', convId)

        // 2. Send birthday message
        console.log('[Birthday Wish] Sending message...')
        await axios.post(route('team-messaging.send', { conversation: convId }), {
            message: `🎉 Happy Birthday ${employee.user?.name?.split(' ')[0] || ''}! Wishing you a wonderful day! 🎂`,
        })
        
        wishedUsers.value[userId] = true
        console.log('[Birthday Wish] Success!')
    } catch (e) {
        console.error('[Birthday Wish] Failed:', e)
        alert('Failed to send birthday wish. Please try again.')
    } finally {
        sendingUsers.value[userId] = false
    }
}

const showNotifications = computed(() => true)

const displayedUpcomingBirthdays = computed(() =>
    showAllUpcoming.value ? props.upcomingBirthdays : props.upcomingBirthdays.slice(0, 3)
)

const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(w => w.charAt(0).toUpperCase()).join('').substring(0, 2)
}

const isCurrentUser = (employee) => {
    if (props.currentUserBirthday && employee.id === props.currentUserBirthday.id) return true
    return false
}

const formatBirthdayDate = (date) => {
    const [year, month, day] = date.split('-').map(Number)
    const localDate = new Date(year, month - 1, day)
    return localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatDaysUntil = (days) => {
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    return `In ${days} days`
}
</script>