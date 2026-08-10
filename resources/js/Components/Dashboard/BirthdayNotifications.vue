<template>
    <div v-if="showNotifications" class="space-y-4">
        <!-- Debug: Show if component is rendering -->
        <!-- <div class="text-xs text-gray-500 p-2 bg-gray-100 rounded mb-2">
            Debug: todaysBirthdays={{ todaysBirthdays?.length || 0 }}, currentUser={{ currentUserBirthday?.user?.name || 'none' }}, upcoming={{ upcomingBirthdays?.length || 0 }}
        </div> -->
        
        <!-- Today's Birthdays -->
        <div v-if="todaysBirthdays && todaysBirthdays.length > 0" class="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
            <div class="flex items-center space-x-3 mb-3">
                <div class="text-2xl">🎉</div>
                <div>
                    <h3 class="text-lg font-semibold text-pink-800">Birthday Today!</h3>
                    <p class="text-sm text-pink-600">Let's celebrate our team members</p>
                </div>
            </div>
            
            <div class="space-y-2">
                <!-- All birthdays today -->
                <div v-for="employee in todaysBirthdays" :key="employee.id" 
                    :class="isCurrentUser(employee) ? 'border-2 border-pink-300 bg-pink-50' : ''"
                    class="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                    <div class="flex items-center space-x-3">
                        <!-- Avatar with Profile Picture -->
                        <div v-if="employee.user?.profile_pic" class="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-200 flex-shrink-0">
                            <img 
                                :src="`/${employee.user.profile_pic}`" 
                                :alt="employee.user?.name"
                                class="w-full h-full object-cover"
                            />
                        </div>
                        <div v-else :class="isCurrentUser(employee) ? 'bg-pink-200' : 'bg-pink-100'" class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-sm font-semibold" :class="isCurrentUser(employee) ? 'text-pink-700' : 'text-pink-700'">
                                {{ getInitials(employee.user?.name || 'U') }}
                            </span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">
                                {{ employee.user?.name }}
                                <span v-if="isCurrentUser(employee)" class="text-pink-600 font-bold">(You!)</span>
                            </p>
                            <p class="text-sm text-gray-500">{{ employee.job_title || 'Employee' }}</p>
                        </div>
                    </div>
                    <div class="text-right flex flex-col items-end gap-1.5">
                        <div class="text-lg">🎂</div>
                        <p v-if="employee.age" class="text-xs text-gray-500">{{ employee.age }} years</p>
                        <!-- Wish button — hidden for self -->
                        <button
                            v-if="!isCurrentUser(employee)"
                            @click="sendBirthdayWish(employee)"
                            :disabled="sendingUsers[employee.user_id ?? employee.user?.id] || wishedUsers[employee.user_id ?? employee.user?.id]"
                            class="mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all"
                            :class="wishedUsers[employee.user_id ?? employee.user?.id]
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-60'">
                            <span v-if="sendingUsers[employee.user_id ?? employee.user?.id]">Sending…</span>
                            <span v-else-if="wishedUsers[employee.user_id ?? employee.user?.id]">✓ Wished!</span>
                            <span v-else>🎉 Wish Happy Birthday</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Upcoming Birthdays -->
        <div v-if="upcomingBirthdays.length > 0" class="bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="text-2xl">🎂</div>
                    <div>
                        <h3 class="text-lg font-semibold text-teal-800">Upcoming Birthdays</h3>
                        <p class="text-sm text-teal-600">Don't forget to wish them well!</p>
                    </div>
                </div>
                <button 
                    @click="showAllUpcoming = !showAllUpcoming"
                    class="text-sm text-teal-600 hover:text-teal-800 font-medium"
                >
                    {{ showAllUpcoming ? 'Show Less' : 'Show All' }}
                </button>
            </div>
            
            <div class="space-y-2">
                <div 
                    v-for="(birthday, index) in displayedUpcomingBirthdays" 
                    :key="birthday.employee.id" 
                    class="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
                >
                    <div class="flex items-center space-x-3">
                        <!-- Avatar with Profile Picture -->
                        <div v-if="birthday.employee.user?.profile_pic" class="w-10 h-10 rounded-full overflow-hidden border-2 border-teal-200 flex-shrink-0">
                            <img 
                                :src="`/${birthday.employee.user.profile_pic}`" 
                                :alt="birthday.employee.user.name"
                                class="w-full h-full object-cover"
                            />
                        </div>
                        <div v-else class="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-sm font-semibold text-teal-700">
                                {{ getInitials(birthday.employee.user.name) }}
                            </span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">{{ birthday.employee.user.name }}</p>
                            <p class="text-sm text-gray-500">{{ birthday.employee.job_title || 'Employee' }}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-gray-900">{{ formatBirthdayDate(birthday.birthday_date) }}</p>
                        <p class="text-xs text-gray-500">{{ formatDaysUntil(birthday.days_until) }}</p>
                    </div>
                </div>
            </div>
        </div>



        <!-- No Birthdays Today Message -->
        <div v-if="todaysBirthdays.length === 0 && !currentUserBirthday && upcomingBirthdays.length === 0" class="bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200 rounded-lg p-4">
            <div class="flex items-center space-x-3">
                <div class="text-2xl">🎂</div>
                <div>
                    <h3 class="text-lg font-semibold text-teal-800">No Birthdays This Month</h3>
                    <p class="text-sm text-teal-600">No team birthdays to celebrate right now, but stay tuned!</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import axios from 'axios'

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

async function sendBirthdayWish(employee) {
    const userId = employee.user_id ?? employee.user?.id
    if (!userId || wishedUsers.value[userId]) return
    sendingUsers.value[userId] = true
    try {
        // 1. Get or create conversation
        const convRes = await axios.post(route('team-messaging.store'), { user_id: userId })
        const convId  = convRes.data.conversation_id
        if (!convId) throw new Error('No conversation id returned')

        // 2. Send birthday message
        await axios.post(route('team-messaging.send', { conversation: convId }), {
            message: `🎉 Happy Birthday ${employee.user?.name?.split(' ')[0] || ''}! Wishing you a wonderful day! 🎂`,
        })
        wishedUsers.value[userId] = true
    } catch (e) {
        console.error('[Birthday Wish] Failed:', e)
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