<script setup>
import { ref } from 'vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

const props = defineProps({
    report:         Object,
    statuses:       Object,
    severityLevels: Object,
    categories:     Object,
    admins:         Array,
});

const severityColors = {
    critical: 'bg-red-100 text-red-700',
    high:     'bg-orange-100 text-orange-700',
    medium:   'bg-yellow-100 text-yellow-800',
    low:      'bg-green-100 text-green-700',
};

const statusColors = {
    pending:      'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-700',
    resolved:     'bg-green-100 text-green-700',
    dismissed:    'bg-gray-100 text-gray-600',
};

const form = useForm({
    status:      props.report.status,
    admin_notes: props.report.admin_notes ?? '',
    severity:    props.report.severity,
});

const saving = ref(false);

const save = () => {
    form.patch(route('admin.whistleblower.update', props.report.id), {
        preserveScroll: true,
    });
};

const formatBytes = (b) => {
    if (!b) return '';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
};
</script>

<template>
    <Head :title="`Report ${report.report_number} — Whistleblower`" />
    <AuthenticatedLayout>
        <div class="max-w-5xl mx-auto px-4 py-8">

            <!-- Back -->
            <Link :href="route('admin.whistleblower.index')"
                class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 mb-6 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                All Reports
            </Link>

            <!-- Title row -->
            <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <div class="flex items-center gap-3 mb-1">
                        <h1 class="text-xl font-bold text-slate-800 dark:text-white">{{ report.report_number }}</h1>
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                            :class="severityColors[report.severity]">{{ report.severity }}</span>
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            :class="statusColors[report.status]">{{ report.status_label }}</span>
                    </div>
                    <p class="text-slate-500 dark:text-gray-400 text-sm">{{ report.category_label }} · {{ report.created_at }}</p>
                </div>
                <div class="text-xs text-slate-400 dark:text-gray-500 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg px-3 py-2">
                    🔒 Strictly confidential
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

                <!-- Left: report details -->
                <div class="lg:col-span-2 space-y-5">

                    <!-- Subject + Description -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6">
                        <h2 class="text-base font-semibold text-slate-800 dark:text-white mb-1">{{ report.subject }}</h2>
                        <p class="text-sm text-slate-500 dark:text-gray-400 mb-4">Reported by: <span class="font-medium" :class="report.is_anonymous ? 'italic' : ''">{{ report.reporter_display }}</span></p>
                        <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm text-slate-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{{ report.description }}</div>
                    </div>

                    <!-- Person Involved -->
                    <div v-if="report.accused_name" class="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6">
                        <h3 class="text-sm font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wide mb-3">Person(s) Involved</h3>
                        <div class="flex gap-6">
                            <div>
                                <p class="text-xs text-slate-400 mb-0.5">Name</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-white">{{ report.accused_name }}</p>
                            </div>
                            <div v-if="report.accused_department">
                                <p class="text-xs text-slate-400 mb-0.5">Department</p>
                                <p class="text-sm font-medium text-slate-800 dark:text-white">{{ report.accused_department }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Attachments -->
                    <div v-if="report.attachments?.length" class="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6">
                        <h3 class="text-sm font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wide mb-3">Evidence Attachments</h3>
                        <div class="space-y-2">
                            <div v-for="att in report.attachments" :key="att.index"
                                class="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/50">
                                <svg class="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                                </svg>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm text-slate-700 dark:text-gray-200 truncate">{{ att.original_name }}</p>
                                    <p class="text-xs text-slate-400">{{ att.mime }} · {{ formatBytes(att.size) }}</p>
                                </div>
                                <a :href="att.download_url"
                                    class="flex-shrink-0 px-3 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition-colors">
                                    Download
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: admin actions -->
                <div class="space-y-5">

                    <!-- Update form -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-5">
                        <h3 class="text-sm font-semibold text-slate-700 dark:text-white mb-4">Admin Actions</h3>

                        <div class="space-y-4">

                            <div>
                                <label class="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1">Status</label>
                                <select v-model="form.status"
                                    class="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 text-slate-700 dark:text-gray-200 outline-none focus:border-teal-500">
                                    <option v-for="(label, key) in statuses" :key="key" :value="key">{{ label }}</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1">Severity</label>
                                <select v-model="form.severity"
                                    class="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 text-slate-700 dark:text-gray-200 outline-none focus:border-teal-500">
                                    <option v-for="(label, key) in severityLevels" :key="key" :value="key">{{ label }}</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1">Admin Notes <span class="font-normal">(internal only)</span></label>
                                <textarea v-model="form.admin_notes" rows="5"
                                    placeholder="Add investigation notes, actions taken, follow-up steps…"
                                    class="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 text-slate-700 dark:text-gray-200 outline-none focus:border-teal-500 resize-none placeholder-slate-400"/>
                            </div>

                            <button @click="save" :disabled="form.processing"
                                class="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                                style="background: linear-gradient(135deg, #006970, #00a9b4)">
                                <span v-if="form.processing">Saving…</span>
                                <span v-else>Save Changes</span>
                            </button>

                            <p v-if="form.recentlySuccessful" class="text-xs text-green-600 text-center">✓ Saved successfully</p>
                        </div>
                    </div>

                    <!-- Timeline -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-5">
                        <h3 class="text-sm font-semibold text-slate-700 dark:text-white mb-3">Timeline</h3>
                        <div class="space-y-3 text-xs text-slate-500 dark:text-gray-400">
                            <div class="flex gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></span>
                                <div><span class="text-slate-700 dark:text-gray-200 font-medium">Submitted</span><br>{{ report.created_at }}</div>
                            </div>
                            <div v-if="report.reviewed_at" class="flex gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                                <div><span class="text-slate-700 dark:text-gray-200 font-medium">Under Review</span><br>{{ report.reviewed_at }}</div>
                            </div>
                            <div v-if="report.resolved_at" class="flex gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></span>
                                <div><span class="text-slate-700 dark:text-gray-200 font-medium">Resolved</span><br>{{ report.resolved_at }}</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
