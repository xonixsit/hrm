<script setup>
import { computed, ref } from 'vue';
import { Head, Link, usePage } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

const props = defineProps({
    reports:  Array,
    statuses: Object,
});

const page = usePage();
const flash = computed(() => page.props.flash ?? {});

// track which cards are expanded
const expanded = ref({});
const toggle = (id) => expanded.value[id] = !expanded.value[id];

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

const statusIcons = {
    pending:      '🕐',
    under_review: '🔍',
    resolved:     '✅',
    dismissed:    '❌',
};

const statusDescriptions = {
    pending:      'Your report has been received and is awaiting review.',
    under_review: 'An administrator is currently investigating your report.',
    resolved:     'Your report has been reviewed and action has been taken.',
    dismissed:    'Your report has been reviewed and was not actioned.',
};
</script>

<template>
    <Head title="My Whistleblower Reports" />
    <AuthenticatedLayout>
        <div class="max-w-3xl mx-auto px-4 py-10">

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h1 class="text-xl font-bold text-slate-800 dark:text-white">My Reports</h1>
                    <p class="text-sm text-slate-500 dark:text-gray-400 mt-0.5">Your submitted whistleblower reports</p>
                </div>
                <Link :href="route('whistleblower.create')"
                    class="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style="background: linear-gradient(135deg, #006970, #00a9b4)">
                    + New Report
                </Link>
            </div>

            <!-- Flash success -->
            <div v-if="flash.success"
                class="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ flash.success }}
            </div>

            <!-- Empty state -->
            <div v-if="reports.length === 0"
                class="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 py-16 text-center">
                <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 dark:bg-gray-700 mb-4">
                    <svg class="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                </div>
                <p class="text-slate-600 dark:text-gray-300 font-medium mb-1">No reports yet</p>
                <p class="text-sm text-slate-400 dark:text-gray-500 mb-5">You haven't submitted any whistleblower reports.</p>
                <Link :href="route('whistleblower.create')"
                    class="inline-block px-5 py-2 rounded-xl text-sm font-semibold text-white"
                    style="background: linear-gradient(135deg, #006970, #00a9b4)">
                    Submit a Report
                </Link>
            </div>

            <!-- Reports list -->
            <div v-else class="space-y-4">
                <div v-for="r in reports" :key="r.id"
                    class="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-5 shadow-sm">

                    <!-- Top row -->
                    <div class="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-xs font-mono font-semibold text-slate-400">{{ r.report_number }}</span>
                                <span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                                    :class="severityColors[r.severity]">{{ r.severity }}</span>
                                <span v-if="r.is_anonymous"
                                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                                    🔒 Anonymous
                                </span>
                            </div>
                            <h3 class="text-base font-semibold text-slate-800 dark:text-white mt-1.5">{{ r.subject }}</h3>
                            <p class="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{{ r.category }} · Submitted {{ r.created_at }}</p>
                        </div>
                        <!-- Status badge -->
                        <span class="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                            :class="statusColors[r.status]">
                            {{ statusIcons[r.status] }} {{ r.status_label }}
                        </span>
                    </div>

                    <!-- Status description -->
                    <div class="rounded-xl px-3.5 py-2.5 text-sm border"
                        :class="{
                            'bg-yellow-50 border-yellow-100 text-yellow-800 dark:bg-yellow-900/10 dark:border-yellow-900 dark:text-yellow-400': r.status === 'pending',
                            'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/10 dark:border-blue-900 dark:text-blue-400': r.status === 'under_review',
                            'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/10 dark:border-green-900 dark:text-green-400': r.status === 'resolved',
                            'bg-gray-50 border-gray-100 text-gray-600 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400': r.status === 'dismissed',
                        }">
                        {{ statusDescriptions[r.status] }}
                    </div>

                    <!-- Expand / collapse description -->
                    <div class="mt-3 border-t border-slate-100 dark:border-gray-700 pt-3">
                        <button type="button"
                            @click="toggle(r.id)"
                            class="flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
                            <svg class="w-3.5 h-3.5 transition-transform duration-200"
                                :class="expanded[r.id] ? 'rotate-180' : ''"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                            </svg>
                            {{ expanded[r.id] ? 'Hide description' : 'View description' }}
                        </button>

                        <Transition
                            enter-active-class="transition duration-200 ease-out overflow-hidden"
                            enter-from-class="opacity-0 max-h-0"
                            enter-to-class="opacity-100 max-h-[600px]"
                            leave-active-class="transition duration-150 ease-in overflow-hidden"
                            leave-from-class="opacity-100 max-h-[600px]"
                            leave-to-class="opacity-0 max-h-0"
                        >
                            <div v-if="expanded[r.id]" class="mt-3">
                                <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{{ r.description }}</div>
                            </div>
                        </Transition>
                    </div>

                    <!-- Timeline pills -->
                    <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span class="flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-teal-500"/>
                            Submitted {{ r.created_at }}
                        </span>
                        <span v-if="r.reviewed_at" class="flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"/>
                            Review started {{ r.reviewed_at }}
                        </span>
                        <span v-if="r.resolved_at" class="flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500"/>
                            Resolved {{ r.resolved_at }}
                        </span>
                    </div>

                </div>
            </div>

        </div>
    </AuthenticatedLayout>
</template>
