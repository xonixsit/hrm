<template>
    <div v-if="showNotifications" class="space-y-4">
        <!-- Today's Birthdays -->
        <div v-if="todaysBirthdays.length > 0" class="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
            <div class="flex items-center space-x-3 mb-3">
                <div class="text-2xl">🎉</div>
                <div>
                    <h3 class="text-lg font-semibold text-pink-800">Birthday Today!</h3>
                    <p class="text-sm text-pink-600">Let's celebrate our team members</p>
                </div>
            </div>
            
            <div class="space-y-2">
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
        <div v-if="upcomingBirthdays.length > 0" class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="text-2xl">🎂</div>
                    <div>
                        <h3 class="text-lg font-semibold text-blue-800">Upcoming Birthdays</h3>
                        <p class="text-sm text-blue-600">Don't forget to wish them well!</p>
                    </div>
                </div>
                <button 
                    @click="showAllUpcoming = !showAllUpcoming"
                    class="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span class="text-sm font-semibold text-blue-700">
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

        <!-- Birthday Statistics -->
        <div v-if="stats" class="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-center space-x-3 mb-3">
                <div class="text-2xl">📊</div>
                <div>
                    <h3 class="text-lg font-semibold text-yellow-800">Birthday Stats</h3>
                    <p class="text-sm text-yellow-600">This month's celebrations</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-pink-600">{{ stats.today }}</div>
                    <div class="text-xs text-gray-500">Today</div>
                </div>
                <div class="bg-white rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-blue-600">{{ stats.this_week }}</div>
                    <div class="text-xs text-gray-500">This Week</div>
                </div>
                <div class="bg-white rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-purple-600">{{ stats.this_month }}</div>
                    <div class="text-xs text-gray-500">This Month</div>
                </div>
                <div v-if="stats.next_birthday" class="bg-white rounded-lg p-3 text-center">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ stats.next_birthday.employee.user.name }}</div>
                    <div class="text-xs text-gray-500">Next Up</div>
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
    }
})

const showAllUpcoming = ref(false)

const showNotifications = computed(() => {
    return props.todaysBirthdays.length > 0 || 
           props.upcomingBirthdays.length > 0 || 
           (props.stats && (props.stats.today > 0 || props.stats.this_week > 0))
})

const displayedUpcomingBirthdays = computed(() => {
    if (showAllUpcoming.value) {
        return props.upcomingBirthdays
    }
    return props.upcomingBirthdays.slice(0, 3)
})

const getInitials = (name) => {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2)
}

const formatBirthdayDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    })
}

const formatDaysUntil = (days) => {
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    return `In ${days} days`
}
</script>