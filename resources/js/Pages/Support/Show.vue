<template>
    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center justify-between">
                <div>
                    <nav class="flex mb-2" aria-label="Breadcrumb">
                        <ol class="inline-flex items-center space-x-1 md:space-x-3">
                            <li class="inline-flex items-center">
                                <Link :href="route('dashboard')" class="text-gray-500 hover:text-gray-700">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                                    </svg>
                                    <Link :href="route('support.index')" class="text-gray-500 hover:text-gray-700">
                                        Support
                                    </Link>
                                </div>
                            </li>
                            <li aria-current="page">
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                                    </svg>
                                    <span class="text-gray-700">#{{ supportRequest.id }}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                        Support Request #{{ supportRequest.id }}
                    </h2>
                    <p class="text-sm text-gray-600 mt-1">{{ supportRequest.subject }}</p>
                </div>
                <Link :href="route('support.index')" class="text-blue-600 hover:text-blue-800">
                    ← Back to Requests
                </Link>
            </div>
        </template>

        <div class="py-12">
            <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6 bg-white">
                        <!-- Status Header -->
                        <div class="border-b border-gray-200 pb-6 mb-6">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-4">
                                    <span :class="getStatusBadgeClass(supportRequest.status)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                                        {{ statuses[supportRequest.status] }}
                                    </span>
                                    <span :class="getPriorityBadgeClass(supportRequest.priority)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                                        {{ priorities[supportRequest.priority] }} Priority
                                    </span>
                                </div>
                                <div class="text-sm text-gray-500">
                                    Submitted {{ formatDate(supportRequest.created_at) }}
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
    </AuthenticatedLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'

const props = defineProps({
    supportRequest: Object,
    categories: Object,
    priorities: Object,
    statuses: Object,
    isAdmin: Boolean,
})

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