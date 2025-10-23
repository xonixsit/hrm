<template>
    <AuthenticatedLayout>
        <PageLayout :title="isAdmin ? 'All Support Requests' : 'My Support Requests'"
            subtitle="View and manage support requests" :breadcrumbs="breadcrumbs" :actions="headerActions">

            <div class="py-12">
                <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div class="p-6 bg-white border-b border-gray-200">
                            <!-- Filters and Search -->
                            <div class="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                        <input v-model="filters.search" type="text"
                                            placeholder="Search by subject or description..."
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select v-model="filters.status"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">All Statuses</option>
                                            <option v-for="(label, value) in statuses" :key="value" :value="value">{{
                                                label }}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                        <select v-model="filters.priority"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">All Priorities</option>
                                            <option v-for="(label, value) in priorities" :key="value" :value="value">{{
                                                label }}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select v-model="filters.category"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">All Categories</option>
                                            <option v-for="(label, value) in categories" :key="value" :value="value">{{
                                                label }}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="mt-4 flex items-center justify-between">
                                    <div class="flex items-center space-x-4">
                                        <button @click="clearFilters"
                                            class="text-sm text-gray-500 hover:text-gray-700">Clear Filters</button>
                                        <span class="text-sm text-gray-500">{{ filteredRequests.length }} of {{
                                            supportRequests.data.length }} requests</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <label class="text-sm text-gray-700">Sort by:</label>
                                        <select v-model="sortBy"
                                            class="px-2 py-1 border border-gray-300 rounded text-sm">
                                            <option value="created_at">Date Created</option>
                                            <option value="priority">Priority</option>
                                            <option value="status">Status</option>
                                            <option value="category">Category</option>
                                        </select>
                                        <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
                                            class="p-1 text-gray-500 hover:text-gray-700">
                                            <svg class="w-4 h-4" :class="{ 'rotate-180': sortOrder === 'desc' }"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M5 15l7-7 7 7"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Quick Stats -->
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div class="flex items-center">
                                        <div class="p-2 bg-blue-100 rounded-lg">
                                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <div class="ml-3">
                                            <p class="text-sm font-medium text-gray-500">Open</p>
                                            <p class="text-lg font-semibold text-gray-900">{{ getStatusCount('open') }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div class="flex items-center">
                                        <div class="p-2 bg-yellow-100 rounded-lg">
                                            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <div class="ml-3">
                                            <p class="text-sm font-medium text-gray-500">In Progress</p>
                                            <p class="text-lg font-semibold text-gray-900">{{
                                                getStatusCount('in_progress') }}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div class="flex items-center">
                                        <div class="p-2 bg-red-100 rounded-lg">
                                            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z">
                                                </path>
                                            </svg>
                                        </div>
                                        <div class="ml-3">
                                            <p class="text-sm font-medium text-gray-500">Urgent</p>
                                            <p class="text-lg font-semibold text-gray-900">{{ getPriorityCount('urgent')
                                                }}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div class="flex items-center">
                                        <div class="p-2 bg-green-100 rounded-lg">
                                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <div class="ml-3">
                                            <p class="text-sm font-medium text-gray-500">Resolved</p>
                                            <p class="text-lg font-semibold text-gray-900">{{ getStatusCount('resolved')
                                                }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Empty State -->
                            <div v-if="filteredRequests.length === 0" class="text-center py-12">
                                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <h3 class="mt-2 text-sm font-medium text-gray-900">No support requests</h3>
                                <p class="mt-1 text-sm text-gray-500">Get started by creating a new support request.</p>
                                <div class="mt-6">
                                    <Link :href="route('support.create')"
                                        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                    <svg class="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    New Support Request
                                    </Link>
                                </div>
                            </div>

                            <!-- Support Requests List -->
                            <div v-else class="space-y-4">
                                <div v-for="request in paginatedRequests" :key="request.id"
                                    class="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                                    :class="getPriorityBorderClass(request.priority)">
                                    <div class="p-6">
                                        <div class="flex items-start justify-between">
                                            <div class="flex-1">
                                                <div class="flex items-center space-x-3 mb-3">
                                                    <div class="flex items-center space-x-2">
                                                        <div :class="getPriorityIndicatorClass(request.priority)"
                                                            class="w-3 h-3 rounded-full"></div>
                                                        <h3
                                                            class="text-lg font-semibold text-gray-900 truncate max-w-md">
                                                            {{ request.subject }}
                                                        </h3>
                                                    </div>
                                                    <div class="flex items-center space-x-2">
                                                        <span :class="getStatusBadgeClass(request.status)"
                                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                                                            {{ statuses[request.status] }}
                                                        </span>
                                                        <span :class="getPriorityBadgeClass(request.priority)"
                                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                                                            {{ priorities[request.priority] }}
                                                        </span>
                                                    </div>
                                                </div>



                                                <p class="text-gray-600 line-clamp-2 mb-4">
                                                    {{ request.description }}
                                                </p>

                                                <div class="flex items-center justify-between">
                                                    <div class="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span class="flex items-center">
                                                            <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor"
                                                                viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                                    stroke-width="2"
                                                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                            </svg>
                                                            {{ categories[request.category] }}
                                                        </span>
                                                        <span v-if="isAdmin" class="flex items-center">
                                                            <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor"
                                                                viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                                    stroke-width="2"
                                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            {{ request.user.name }}
                                                        </span>
                                                        <span class="flex items-center">
                                                            <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor"
                                                                viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                                    stroke-width="2"
                                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {{ formatDate(request.created_at) }}
                                                        </span>
                                                        <span class="flex items-center">
                                                            <svg class="mr-1 h-3 w-3" fill="non"  stroke="currentColor"
                                                                viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                                    stroke-width="2"
                                                                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                            </svg>
                                                            #{{ request.id }}
                                                        </span>
                                                    </div>
                                                    <Link :href="route('support.show', request.id)"
                                                        class="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">
                                                    View Details
                                                    <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2" d="M9 5l7 7-7 7"></path>
                                                    </svg>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>""
                                </div>
                            </div>

                            <!-- Custom Pagination for Filtered Results -->
                            <div v-if="totalPages > 1"
                                class="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                                <div class="flex flex-1 justify-between sm:hidden">
                                    <button @click="currentPage > 1 && currentPage--" :disabled="currentPage === 1"
                                        class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                                        Previous
                                    </button>
                                    <button @click="currentPage < totalPages && currentPage++"
                                        :disabled="currentPage === totalPages"
                                        class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                                        Next
                                    </button>
                                </div>
                                <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p class="text-sm text-gray-700">
                                            Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{
                                            Math.min(currentPage * itemsPerPage, filteredRequests.length) }} of {{
                                            filteredRequests.length }} results
                                        </p>
                                    </div>
                                    <div>
                                        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                            <button @click="currentPage > 1 && currentPage--"
                                                :disabled="currentPage === 1"
                                                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50">
                                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fill-rule="evenodd"
                                                        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                                        clip-rule="evenodd" />
                                                </svg>
                                            </button>
                                            <button v-for="page in visiblePages" :key="page" @click="currentPage = page"
                                                :class="[
                                            page === currentPage ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                                            'relative inline-flex items-center px-4 py-2 text-sm font-medium ring-1 ring-inset ring-gray-300'
                                        ]">
                                                {{ page }}
                                            </button>
                                            <button @click="currentPage < totalPages && currentPage++"
                                                :disabled="currentPage === totalPages"
                                                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50">
                                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fill-rule="evenodd"
                                                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                                        clip-rule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>

                            <!-- Original Pagination -->""
                            <div v-if="supportRequests.links && supportRequests.links.length > 3"
                                class="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                                <div class="flex flex-1 justify-between sm:hidden">
                                    <Link v-if="supportRequests.prev_page_url" :href="supportRequests.prev_page_url"
                                        class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Previous
                                    </Link>
                                    <Link v-if="supportRequests.next_page_url" :href="supportRequests.next_page_url"
                                        class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Next
                                    </Link>
                                </div>
                                <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p class="text-sm text-gray-700">
                                            Showing {{ supportRequests.from }} to {{ supportRequests.to }} of {{
                                            supportRequests.total }} results
                                        </p>
                                    </div>
                                    <div>
                                        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                            aria-label="Pagination">
                                            <template v-for="link in supportRequests.links" :key="link.label">
                                                <Link v-if="link.url" :href="link.url" :class="[
                                                link.active ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                                                'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                                            ]" v-html="link.label">
                                                </Link>
                                                <span v-else :class="[
                                                'relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-300'
                                            ]" v-html="link.label">
                                                </span>
                                            </template>
                                        </nav>
                                    </div>
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
    import { computed, ref } from 'vue'
    import { Link } from '@inertiajs/vue3'
    import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
    import PageLayout from '@/Components/Layout/PageLayout.vue'

    const props = defineProps({
        supportRequests: Object,
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

    const breadcrumbs = computed(() => [
        { label: 'Dashboard', href: route('dashboard') },
        { label: 'Support', current: true }
    ])

    const headerActions = computed(() => [
        {
            label: 'New Request',
            href: route('support.create'),
            variant: 'primary'
        }
    ])

    // Reactive filters and sorting
    const filters = ref({
        search: '',
        status: '',
        priority: '',
        category: ''
    })

    const sortBy = ref('created_at')
    const sortOrder = ref('desc')
    const currentPage = ref(1)
    const itemsPerPage = 10

    // Computed properties for filtering and sorting
    const filteredRequests = computed(() => {
        let filtered = [...props.supportRequests.data]

        // Apply filters
        if (filters.value.search) {
            const search = filters.value.search.toLowerCase()
            filtered = filtered.filter(request =>
                request.subject.toLowerCase().includes(search) ||
                request.description.toLowerCase().includes(search) ||
                (props.isAdmin && request.user.name.toLowerCase().includes(search))
            )
        }

        if (filters.value.status) {
            filtered = filtered.filter(request => request.status === filters.value.status)
        }

        if (filters.value.priority) {
            filtered = filtered.filter(request => request.priority === filters.value.priority)
        }

        if (filters.value.category) {
            filtered = filtered.filter(request => request.category === filters.value.category)
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[sortBy.value]
            let bVal = b[sortBy.value]

            if (sortBy.value === 'created_at') {
                aVal = new Date(aVal)
                bVal = new Date(bVal)
            }

            if (sortOrder.value === 'asc') {
                return aVal > bVal ? 1 : -1
            } else {
                return aVal < bVal ? 1 : -1
            }
        })

        return filtered
    })

    const totalPages = computed(() => Math.ceil(filteredRequests.value.length / itemsPerPage))

    const paginatedRequests = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage
        const end = start + itemsPerPage
        return filteredRequests.value.slice(start, end)
    })

    const visiblePages = computed(() => {
        const pages = []
        const total = totalPages.value
        const current = currentPage.value

        if (total <= 7) {
            for (let i = 1; i <= total; i++) {
                pages.push(i)
            }
        } else {
            if (current <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i)
                pages.push('...')
                pages.push(total)
            } else if (current >= total - 3) {
                pages.push(1)
                pages.push('...')
                for (let i = total - 4; i <= total; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = current - 1; i <= current + 1; i++) pages.push(i)
                pages.push('...')
                pages.push(total)
            }
        }

        return pages.filter(p => p !== '...' || pages.indexOf(p) === pages.lastIndexOf(p))
    })

    // Helper functions
    const clearFilters = () => {
        filters.value = {
            search: '',
            status: '',
            priority: '',
            category: ''
        }
        currentPage.value = 1
    }

    const getStatusCount = (status) => {
        return props.supportRequests.data.filter(request => request.status === status).length
    }

    const getPriorityCount = (priority) => {
        return props.supportRequests.data.filter(request => request.priority === priority).length
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
            urgent: 'border-l-4 border-l-red-400',
            high: 'border-l-4 border-l-orange-400',
            medium: 'border-l-4 border-l-yellow-400',
            low: 'border-l-4 border-l-green-400',
        }
        return classes[priority] || ''
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
</script>

<style scoped>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>