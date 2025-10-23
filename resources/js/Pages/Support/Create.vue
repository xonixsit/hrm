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
                                    <span class="text-gray-700">New Request</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                        Submit Support Request
                    </h2>
                </div>
                <Link :href="route('support.index')" class="text-blue-600 hover:text-blue-800">
                    View My Requests
                </Link>
            </div>
        </template>

        <div class="py-12">
            <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6 bg-white border-b border-gray-200">
                        <!-- Header Section -->
                        <div class="mb-8">
                            <div class="flex items-center mb-4">
                                <div class="bg-blue-100 p-3 rounded-full mr-4">
                                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900">Need Help?</h3>
                                    <p class="text-gray-600">We're here to assist you with any questions or issues you may have.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Success Message -->
                        <div v-if="$page.props.flash?.success" class="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm font-medium text-green-800">
                                        {{ $page.props.flash?.success }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Support Form -->
                        <form @submit.prevent="submitForm" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Category -->
                                <div>
                                    <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        id="category"
                                        v-model="form.category"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        :class="{ 'border-red-500': form.errors.category }"
                                    >
                                        <option value="">Select a category</option>
                                        <option v-for="(label, value) in categories" :key="value" :value="value">
                                            {{ label }}
                                        </option>
                                    </select>
                                    <p v-if="form.errors.category" class="mt-1 text-sm text-red-600">
                                        {{ form.errors.category }}
                                    </p>
                                </div>

                                <!-- Priority -->
                                <div>
                                    <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
                                        Priority *
                                    </label>
                                    <select
                                        id="priority"
                                        v-model="form.priority"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        :class="{ 'border-red-500': form.errors.priority }"
                                    >
                                        <option value="">Select priority</option>
                                        <option v-for="(label, value) in priorities" :key="value" :value="value">
                                            {{ label }}
                                        </option>
                                    </select>
                                    <p v-if="form.errors.priority" class="mt-1 text-sm text-red-600">
                                        {{ form.errors.priority }}
                                    </p>
                                </div>
                            </div>

                            <!-- Subject -->
                            <div>
                                <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
                                    Subject *
                                </label>
                                <input
                                    id="subject"
                                    type="text"
                                    v-model="form.subject"
                                    placeholder="Brief description of your issue"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    :class="{ 'border-red-500': form.errors.subject }"
                                />
                                <p v-if="form.errors.subject" class="mt-1 text-sm text-red-600">
                                    {{ form.errors.subject }}
                                </p>
                            </div>

                            <!-- Description -->
                            <div>
                                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    v-model="form.description"
                                    rows="6"
                                    placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    :class="{ 'border-red-500': form.errors.description }"
                                ></textarea>
                                <p v-if="form.errors.description" class="mt-1 text-sm text-red-600">
                                    {{ form.errors.description }}
                                </p>
                                <p class="mt-1 text-sm text-gray-500">
                                    {{ form.description.length }}/5000 characters
                                </p>
                            </div>

                            <!-- Category Help Text -->
                            <div v-if="form.category" class="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <h4 class="text-sm font-medium text-blue-800 mb-2">
                                    {{ categories[form.category] }} - What to include:
                                </h4>
                                <ul class="text-sm text-blue-700 space-y-1">
                                    <li v-for="tip in getCategoryTips(form.category)" :key="tip">
                                        • {{ tip }}
                                    </li>
                                </ul>
                            </div>

                            <!-- Submit Button -->
                            <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                                <Link :href="route('dashboard')" class="text-gray-600 hover:text-gray-800">
                                    ← Back to Dashboard
                                </Link>
                                <button
                                    type="submit"
                                    :disabled="form.processing"
                                    class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg v-if="form.processing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {{ form.processing ? 'Submitting...' : 'Submit Request' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useForm, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'

const props = defineProps({
    categories: Object,
    priorities: Object,
})

const form = useForm({
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
})

const submitForm = () => {
    form.post(route('support.store'), {
        onSuccess: () => {
            form.reset()
        }
    })
}

const getCategoryTips = (category) => {
    const tips = {
        technical: [
            'Browser and version you\'re using',
            'Steps to reproduce the issue',
            'Error messages you\'re seeing',
            'Screenshots if applicable'
        ],
        account: [
            'Your username or employee ID',
            'When the issue started',
            'What you were trying to do',
            'Any error messages'
        ],
        attendance: [
            'Date and time of the issue',
            'What action you were trying to perform',
            'Any error messages',
            'Your current attendance status'
        ],
        leave: [
            'Leave type and dates',
            'Current status of your request',
            'Manager or approver involved',
            'Any error messages'
        ],
        assessment: [
            'Assessment name or ID',
            'What step you\'re stuck on',
            'Any error messages',
            'Deadline information'
        ],
        reports: [
            'Which report you\'re trying to access',
            'Date range or filters applied',
            'Expected vs actual results',
            'Your role and permissions'
        ],
        permissions: [
            'What you\'re trying to access',
            'Your current role',
            'Expected permissions',
            'Manager or admin contact'
        ],
        general: [
            'Clear description of your question',
            'What you\'ve already tried',
            'Any relevant context',
            'Urgency level'
        ],
        other: [
            'Detailed description of your issue',
            'Any relevant context',
            'What you\'ve already tried',
            'How this affects your work'
        ]
    }
    return tips[category] || []
}
</script>