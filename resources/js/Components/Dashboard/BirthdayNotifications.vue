<template>
    <div v-if="showNotifications" class="space-y-4">
        <!-- Debug: Show if component is rendering -->
        <div v-if="currentUserBirthday" class="text-xs text-gray-500 p-2 bg-gray-100 rounded">
            Debug: Birthday data received - {{ currentUserBirthday.user?.name }}
        </div>
        
        <!-- Today's Birthdays -->
        <div v-if="todaysBirthdays.length > 0 || currentUserBirthday" class="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
            <div class="flex items-center space-x-3 mb-3">
                <div class="text-2xl">🎉</div>
                <div>
                    <h3 class="text-lg font-semibold text-pink-800">Birthday Today!</h3>
                    <p class="text-sm text-pink-600">Let's celebrate our team members</p>
                </div>
            </div>
            
            <div class="space-y-2">
                <!-- Current user's birthday (highlighted) -->
                <div v-if="currentUserBirthday && currentUserBirthday.user" class="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border-2 border-pink-300">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center">
                            <span class="text-sm font-semibold text-pink-700">
                                {{ getInitials(currentUserBirthday.user?.name || 'U') }}
                            </span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">{{ currentUserBirthday.user?.name }} <span class="text-pink-600 font-bold">(You!)</span></p>
                            <p class="text-sm text-gray-500">{{ currentUserBirthday.job_title || 'Employee' }}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg">🎂</div>
                        <p v-if="currentUserBirthday.age" class="text-xs text-gray-500">{{ currentUserBirthday.age }} years</p>
                    </div>
                </div>

                <!-- Other team members' birthdays -->
                <div v-for="employee in todaysBirthdays" :key="employee.id" class="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                            <span class="text-sm font-semibold text-pink-700">
                                {{ getInitials(employee.user.name) }}
                            </span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">{{ employee.user.name }}</p>
                            <p class="text-sm text-gray-500">{{ employee.job_title || 'Employee' }}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg">🎂</div>
                        <p v-if="employee.age" class="text-xs text-gray-500">{{ employee.age }} years</p>
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
                        <div class="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
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

const props = defineProps({
    todaysBirthdays: {
        type: Array,
        default: () => []
    },
    upcomingBirthdays: {
        type: Array,
        default: () => []
    },
    stats: {
        type: Object,
        default: null
    },
    systemTimezone: {
        type: String,
        default: 'UTC'
    },
    currentUserBirthday: {
        type: Object,
        default: null
    }
})

const showAllUpcoming = ref(false)

const showNotifications = computed(() => {
    // Always show the widget (it will display appropriate message if no birthdays)
    const hasData = props.todaysBirthdays?.length > 0 || 
                    props.upcomingBirthdays?.length > 0 || 
                    props.currentUserBirthday;
    
    console.log('🎂 BirthdayNotifications: Props received:', {
        todaysBirthdays: props.todaysBirthdays,
        upcomingBirthdays: props.upcomingBirthdays,
        currentUserBirthday: props.currentUserBirthday,
        stats: props.stats,
        hasData: hasData
    });
    return true
})

const displayedUpcomingBirthdays = computed(() => {
    if (showAllUpcoming.value) {
        return props.upcomingBirthdays
    }
    return props.upcomingBirthdays.slice(0, 3)
})

const getInitials = (name) => {
    if (!name) return 'U'
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2)
}

const formatBirthdayDate = (date) => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-indexed in JS
    
    return localDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: props.systemTimezone || 'UTC'
    })
}

const formatDaysUntil = (days) => {
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    return `In ${days} days`
}
</script>