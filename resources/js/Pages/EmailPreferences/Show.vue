<template>
    <AuthenticatedLayout title="Email Preferences">
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                📧 Email Preferences
            </h2>
        </template>

        <div class="py-12">
            <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                    <form @submit.prevent="updatePreferences" class="p-6">
                        <!-- Leave Notifications -->
                        <div class="mb-8">
                            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                🏖️ Leave Request Notifications
                            </h3>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Leave Request Submitted</label>
                                        <p class="text-xs text-gray-500">Get notified when employees submit leave requests</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.leave_request_submitted"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Leave Request Approved</label>
                                        <p class="text-xs text-gray-500">Get notified when your leave requests are approved</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.leave_request_approved"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Leave Request Rejected</label>
                                        <p class="text-xs text-gray-500">Get notified when your leave requests are rejected</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.leave_request_rejected"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Assessment Notifications -->
                        <div class="mb-8">
                            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                📋 Assessment Notifications
                            </h3>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Assessment Assigned</label>
                                        <p class="text-xs text-gray-500">Get notified when assessments are assigned to you</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.assessment_assigned"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Assessment Submitted</label>
                                        <p class="text-xs text-gray-500">Get notified when assessments are submitted</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.assessment_submitted"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Assessment Approved</label>
                                        <p class="text-xs text-gray-500">Get notified when assessments are approved</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.assessment_approved"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Assessment Rejected</label>
                                        <p class="text-xs text-gray-500">Get notified when assessments need revision</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.assessment_rejected"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Digest Preferences -->
                        <div class="mb-8">
                            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                📊 Digest Emails
                            </h3>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Daily Digest</label>
                                        <p class="text-xs text-gray-500">Receive a daily summary of activities</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.daily_digest"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                                
                                <div v-if="form.daily_digest" class="ml-4 p-4 bg-blue-50 rounded-lg">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Daily Digest Time</label>
                                    <input 
                                        type="time" 
                                        v-model="form.digest_time"
                                        class="mt-1 block w-32 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Weekly Digest</label>
                                        <p class="text-xs text-gray-500">Receive a weekly summary of activities</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.weekly_digest"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                                
                                <div v-if="form.weekly_digest" class="ml-4 p-4 bg-blue-50 rounded-lg">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Weekly Digest Day</label>
                                    <select 
                                        v-model="form.digest_day"
                                        class="mt-1 block w-40 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="monday">Monday</option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">Wednesday</option>
                                        <option value="thursday">Thursday</option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">Saturday</option>
                                        <option value="sunday">Sunday</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Reminder Preferences -->
                        <div class="mb-8">
                            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                ⏰ Reminder Settings
                            </h3>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Pending Action Reminders</label>
                                        <p class="text-xs text-gray-500">Get reminded about items requiring your attention</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.pending_reminders"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                                
                                <div v-if="form.pending_reminders" class="ml-4 p-4 bg-yellow-50 rounded-lg">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Reminder Frequency (hours)</label>
                                    <input 
                                        type="number" 
                                        v-model="form.reminder_frequency_hours"
                                        min="1" 
                                        max="168"
                                        class="mt-1 block w-24 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                    <p class="text-xs text-gray-500 mt-1">How often to send reminders (1-168 hours)</p>
                                </div>
                            </div>
                        </div>

                        <!-- Birthday Notifications -->
                        <div class="mb-8">
                            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                🎂 Birthday Notifications
                            </h3>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Birthday Wishes</label>
                                        <p class="text-xs text-gray-500">Receive birthday wishes on your special day</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.birthday_notifications"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Birthday Reminders</label>
                                        <p class="text-xs text-gray-500">Get notified about colleagues' upcoming birthdays</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.birthday_reminders"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                                
                                <div v-if="form.birthday_reminders" class="ml-4 p-4 bg-pink-50 rounded-lg">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Reminder Days Ahead</label>
                                    <select 
                                        v-model="form.birthday_reminder_days"
                                        class="mt-1 block w-32 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="1">1 day</option>
                                        <option value="2">2 days</option>
                                        <option value="3">3 days</option>
                                        <option value="5">5 days</option>
                                        <option value="7">1 week</option>
                                    </select>
                                    <p class="text-xs text-gray-500 mt-1">How many days ahead to be reminded</p>
                                </div>
                            </div>
                        </div>

                        <!-- General Preferences -->
                        <div class="mb-8">
                            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                ⚙️ General Settings
                            </h3>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">System Notifications</label>
                                        <p class="text-xs text-gray-500">Important system updates and announcements</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.system_notifications"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Marketing Emails</label>
                                        <p class="text-xs text-gray-500">Product updates and feature announcements</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        v-model="form.marketing_emails"
                                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Save Button -->
                        <div class="flex justify-end">
                            <button 
                                type="submit" 
                                :disabled="form.processing"
                                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                <span v-if="form.processing">Saving...</span>
                                <span v-else>💾 Save Preferences</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useForm } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'

const props = defineProps({
    preferences: Object
})

const form = useForm({
    leave_request_submitted: props.preferences.leave_request_submitted,
    leave_request_approved: props.preferences.leave_request_approved,
    leave_request_rejected: props.preferences.leave_request_rejected,
    assessment_assigned: props.preferences.assessment_assigned,
    assessment_submitted: props.preferences.assessment_submitted,
    assessment_approved: props.preferences.assessment_approved,
    assessment_rejected: props.preferences.assessment_rejected,
    daily_digest: props.preferences.daily_digest,
    weekly_digest: props.preferences.weekly_digest,
    digest_time: props.preferences.digest_time,
    digest_day: props.preferences.digest_day,
    pending_reminders: props.preferences.pending_reminders,
    reminder_frequency_hours: props.preferences.reminder_frequency_hours,
    system_notifications: props.preferences.system_notifications,
    marketing_emails: props.preferences.marketing_emails,
    birthday_notifications: props.preferences.birthday_notifications,
    birthday_reminders: props.preferences.birthday_reminders,
    birthday_reminder_days: props.preferences.birthday_reminder_days,
})

const updatePreferences = () => {
    form.put(route('email-preferences.update'))
}
</script>