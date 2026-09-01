<script setup>
import { ref, computed } from 'vue';
import { Head, Link, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

const props = defineProps({
    reports:        Object,
    filters:        Object,
    statuses:       Object,
    severityLevels: Object,
    categories:     Object,
    stats:          Object,
    admins:         Array,
});

const severityColors = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    high:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    medium:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const statusColors = {
    pending:      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    under_review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    resolved:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dismissed:    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const localFilters = ref({ ...props.filters });

const applyFilters = () => {
    router.get(route('admin.whistleblower.index'), localFilters.value, { preserveState: true });
};

const clearFilters = () => {
    localFilters.value = {};
    router.get(route('admin.whistleblower.index'));
};
</script>

<template>
    <Head title="Whistleblower Reports — Admin" />
    <AuthenticatedLayout>
        <div class="max-w-7xl mx-auto px-4 py-8">

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                        Whistleblower Reports
                    </h1>
                    <p class="text-sm text-slate-500 dark:text-gray-400 mt-1">Strictly confidential — administrator access only</p>
                </div>
            </div>

            <!-- Stats row -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-4 text-center">
                    <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ stats.total }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">Total</p>
                </div>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 text-center">
                    <p class="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{{ stats.pending }}</p>
                    <p class="text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">Pending</p>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 text-center">
                    <p class="text-2xl font-bold text-blue-700 dark:text-blue-400">{{ stats.under_review }}</p>
                    <p class="text-xs text-blue-600 dark:text-blue-500 mt-0.5">Under Review</p>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4 text-center">
                    <p class="text-2xl font-bold text-green-700 dark:text-green-400">{{ stats.resolved }}</p>
                    <p class="text-xs text-green-600 dark:text-green-500 mt-0.5">Resolved</p>
                </div>
                <div class="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4 text-center">
                    <p class="text-2xl font-bold text-red-700 dark:text-red-400">{{ stats.critical }}</p>
                    <p class="text-xs text-red-600 dark:text-red-500 mt-0.5">Critical</p>
                </div>
            </div>

            <!-- Filters -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-4 mb-5 flex flex-wrap gap-3 items-end">
                <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">Status</label>
                    <select v-model="localFilters.status"
                        class="rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-1.5 text-slate-700 dark:text-gray-200 outline-none focus:border-teal-500">
                        <option value="">All</option>
                        <option v-for="(label, key) in statuses" :key="key" :value="key">{{ label }}</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">Severity</label>
                    <select v-model="localFilters.severity"
                        class="rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-1.5 text-slate-700 dark:text-gray-200 outline-none focus:border-teal-500">
                        <option value="">All</option>
                        <option v-for="(label, key) in severityLevels" :key="key" :value="key">{{ label }}</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">Category</label>
                    <select v-model="localFilters.category"
                        class="rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-1.5 text-slate-700 dark:text-gray-200 outline-none focus:border-teal-500">
                        <option value="">All</option>
                        <option v-for="(label, key) in categories" :key="key" :value="key">{{ label }}</option>
                    </select>
                </div>
                <button @click="applyFilters"
                    class="px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
                    style="background: linear-gradient(135deg, #006970, #00a9b4)">Filter</button>
                <button @click="clearFilters"
                    class="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-700 border border-slate-200 dark:border-gray-600">Clear</button>
            </div>

            <!-- Table -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div v-if="reports.data.length === 0" class="py-16 text-center text-slate-400 dark:text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p class="text-sm">No reports found</p>
                </div>
                <table v-else class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-slate-100 dark:border-gray-700">
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Report</th>
                            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Severity</th>
                            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reporter</th>
                            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                            <th class="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-gray-700">
                        <tr v-for="r in reports.data" :key="r.id"
                            class="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td class="px-5 py-3.5">
                                <p class="font-semibold text-slate-800 dark:text-white">{{ r.report_number }}</p>
                                <p class="text-xs text-slate-500 dark:text-gray-400 truncate max-w-[160px]">{{ r.subject }}</p>
                            </td>
                            <td class="px-4 py-3.5 text-slate-600 dark:text-gray-300">{{ r.category_label }}</td>
                            <td class="px-4 py-3.5">
                                <span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                                    :class="severityColors[r.severity]">{{ r.severity }}</span>
                            </td>
                            <td class="px-4 py-3.5">
                                <span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                                    :class="statusColors[r.status]">{{ r.status_label }}</span>
                            </td>
                            <td class="px-4 py-3.5 text-slate-600 dark:text-gray-300">
                                <span :class="r.is_anonymous ? 'italic text-slate-400' : ''">{{ r.reporter_display }}</span>
                            </td>
                            <td class="px-4 py-3.5 text-slate-500 dark:text-gray-400 whitespace-nowrap">{{ r.created_at }}</td>
                            <td class="px-4 py-3.5 text-right">
                                <Link :href="route('admin.whistleblower.show', r.id)"
                                    class="text-teal-600 hover:text-teal-700 text-xs font-semibold hover:underline">
                                    Review →
                                </Link>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="reports.last_page > 1" class="mt-4 flex justify-center gap-2">
                <Link v-for="link in reports.links" :key="link.label"
                    :href="link.url || '#'"
                    :class="[
                        'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                        link.active
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700',
                        !link.url ? 'opacity-40 cursor-not-allowed' : ''
                    ]"
                    v-html="link.label"
                />
            </div>

        </div>
    </AuthenticatedLayout>
</template>
