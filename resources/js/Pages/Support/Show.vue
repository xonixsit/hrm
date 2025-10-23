<template>
    <AuthenticatedLayout>
        <PageLayout
            :title="`Support Request #${supportRequest.id}`"
            :subtitle="supportRequest.subject"
            :breadcrumbs="breadcrumbs"
            :actions="headerActions"
        >

        <div class="py-12">
            <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6 bg-white">
                        <!-- Status Header with Visual Priority -->
                        <div class="border-b border-gray-200 pb-6 mb-6" :class="getPriorityBorderClass(supportRequest.priority)">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center space-x-4">
                                    <div class="flex items-center space-x-2">
                                        <div :class="getPriorityIndicatorClass(supportRequest.priority)" class="w-4 h-4 rounded-full"></div>
                                        <span :class="getStatusBadgeClass(supportRequest.status)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path v-if="supportRequest.status === 'open'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                                <path v-else-if="supportRequest.status === 'in_progress'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                                                <path v-else-if="supportRequest.status === 'resolved'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                            </svg>
                                            {{ statuses[supportRequest.status] }}
                                        </span>
                                    </div>
                                    <span :class="getPriorityBadgeClass(supportRequest.priority)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path v-if="supportRequest.priority === 'urgent'" fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                                            <path v-else fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                                        </svg>
                                        {{ priorities[supportRequest.priority] }} Priority
                                    </span>
                                </div>
                                <div class="text-sm text-gray-500">
                                    Submitted {{ formatDate(supportRequest.created_at) }}
                                </div>
                            </div>
                            
                            <!-- Progress Timeline -->
                            <div class="flex items-center space-x-4 text-xs text-gray-500">
                                <div class="flex items-center space-x-1">
                                    <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                                    <span>Created</span>
                                </div>
                                <div class="w-8 h-px bg-gray-300"></div>
                                <div class="flex items-center space-x-1" :class="{ 'text-yellow-600': supportRequest.status === 'in_progress' || supportRequest.status === 'resolved' }">
                                    <div class="w-2 h-2 rounded-full" :class="supportRequest.status === 'in_progress' || supportRequest.status === 'resolved' ? 'bg-yellow-400' : 'bg-gray-300'"></div>
                                    <span>In Progress</span>
                                </div>
                                <div class="w-8 h-px bg-gray-300"></div>
                                <div class="flex items-center space-x-1" :class="{ 'text-green-600': supportRequest.status === 'resolved' }">
                                    <div class="w-2 h-2 rounded-full" :class="supportRequest.status === 'resolved' ? 'bg-green-400' : 'bg-gray-300'"></div>
                                    <span>Resolved</span>
                                </div>
                            </div>
                        </div>

                        <!-- Request Details -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div class="md:col-span-2 space-y-6">
                                <!-- Subject -->
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Subject</h3>
                                    <p class="text-gray-700">{{ supportRequest.subject }}</p>
                                </div>

                                <!-- Description -->
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                    <div class="bg-gray-50 rounded-lg p-4">
                                        <p class="text-gray-700 whitespace-pre-wrap">{{ supportRequest.description }}</p>
                                    </div>
                                </div>

                                <!-- Attachments (if any) -->
                                <div v-if="supportRequest.attachments && supportRequest.attachments.length > 0">
                                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Attachments</h3>
                                    <div class="space-y-2">
                                        <div v-for="attachment in supportRequest.attachments" :key="attachment.name" class="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <svg class="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            <span class="text-sm text-gray-700">{{ attachment.name || 'Attachment' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Sidebar Info -->
                            <div class="space-y-6">
                                <!-- Request Info -->
                                <div class="bg-gray-50 rounded-lg p-4">
                                    <h4 class="font-semibold text-gray-900 mb-3">Request Information</h4>
                                    <dl class="space-y-2">
                                        <div>
                                            <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Request ID</dt>
                                            <dd class="text-sm text-gray-900">#{{ supportRequest.id }}</dd>
                                        </div>
                                        <div>
                                            <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</dt>
                                            <dd class="text-sm text-gray-900">{{ categories[supportRequest.category] }}</dd>
                                        </div>
                                        <div>
                                            <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</dt>
                                            <dd class="text-sm text-gray-900">{{ priorities[supportRequest.priority] }}</dd>
                                        </div>
                                        <div>
                                            <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</dt>
                                            <dd class="text-sm text-gray-900">{{ statuses[supportRequest.status] }}</dd>
                                        </div>
                                        <div v-if="isAdmin">
                                            <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted By</dt>
                                            <dd class="text-sm text-gray-900">{{ supportRequest.user.name }}</dd>
                                        </div>
                                        <div>
                                            <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted</dt>
                                            <dd class="text-sm text-gray-900">{{ formatDate(supportRequest.created_at) }}</dd>
                                        </div>
                                        <div v-if="supportRequest.resolved_at">
                                            <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Resolved</dt>
                                            <dd class="text-sm text-gray-900">{{ formatDate(supportRequest.resolved_at) }}</dd>
                                        </div>
                                    </dl>
                                </div>

                                <!-- Contact Info -->
                                <div class="bg-blue-50 rounded-lg p-4">
                                    <h4 class="font-semibold text-blue-900 mb-3">Need Immediate Help?</h4>
                                    <p class="text-sm text-blue-700 mb-3">
                                        For urgent issues, you can also contact our support team directly.
                                    </p>
                                    <div class="space-y-2 text-sm">
                                        <div class="flex items-center text-blue-700">
                                            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            support@xonobics.com
                                        </div>
                                        <div class="flex items-center text-blue-700">
                                            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Mon-Fri, 9 AM - 6 PM
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="border-t border-gray-200 pt-6">
                            <div class="flex items-center justify-between">
                                <Link :href="route('support.index')" class="text-gray-600 hover:text-gray-800">
                                    ← Back to All Requests
                                </Link>
                                <Link :href="route('support.create')" class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700">
                                    Submit New Request
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </PageLayout>
    </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'

const props = defineProps({
    supportRequest: Object,
    categories: Object,
    priorities: Object,
    statuses: Object,
    isAdmin: Boolean,
})

const breadcrumbs = computed(() => [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Support', href: route('support.index') },
    { label: `#${props.supportRequest.id}`, current: true }
])

const headerActions = computed(() => [
    {
        label: 'Back to Requests',
        href: route('support.index'),
        variant: 'secondary'
    },
    {
        label: 'New Request',
        href: route('support.create'),
        variant: 'primary'
    }
])

const getStatusBadgeClass = (status) => {
    const classes = {
        open: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPriorityBadgeClass = (priority) => {
    const classes = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800',
    }
    return classes[priority] || 'bg-gray-100 text-gray-800'
}

const getPriorityIndicatorClass = (priority) => {
    const classes = {
        low: 'bg-green-400',
        medium: 'bg-yellow-400',
        high: 'bg-orange-400',
        urgent: 'bg-red-400',
    }
    return classes[priority] || 'bg-gray-400'
}

const getPriorityBorderClass = (priority) => {
    const classes = {
        urgent: 'border-l-4 border-l-red-400 bg-red-50/30',
        high: 'border-l-4 border-l-orange-400 bg-orange-50/30',
        medium: 'border-l-4 border-l-yellow-400 bg-yellow-50/30',
        low: 'border-l-4 border-l-green-400 bg-green-50/30',
    }
    return classes[priority] || ''
}

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>