<script setup>
import { ref, computed } from 'vue';
import { useForm } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

const props = defineProps({
    referral: { type: Object, required: true },
    statuses: { type: Array,  default: () => [] },
});

const breadcrumbs = computed(() => [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Employee Referrals', href: route('referrals.index') },
    { label: props.referral.candidate_name, current: true },
]);

const statusForm = useForm({
    status:      props.referral.status,
    admin_notes: props.referral.admin_notes ?? '',
});

const updateStatus = () => {
    statusForm.patch(route('referrals.update-status', props.referral.id));
};

const statusClass = (s) => ({
    submitted:    'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    shortlisted:  'bg-purple-100 text-purple-700',
    interviewed:  'bg-indigo-100 text-indigo-700',
    hired:        'bg-green-100 text-green-700',
    rejected:     'bg-red-100 text-red-700',
}[s] ?? 'bg-neutral-100 text-neutral-700');

const statusLabel = (s) => ({
    submitted:    'Submitted',
    under_review: 'Under Review',
    shortlisted:  'Shortlisted',
    interviewed:  'Interviewed',
    hired:        'Hired',
    rejected:     'Rejected',
}[s] ?? s);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const initials = (n) => n?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '?';
</script>

<template>
    <AuthenticatedLayout>
        <PageLayout
            :title="referral.candidate_name"
            subtitle="Referral Details"
            :breadcrumbs="breadcrumbs"
        >
            <!-- Flash -->
            <div v-if="$page.props.flash?.success"
                 class="mb-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ $page.props.flash.success }}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <!-- Left: Details -->
                <div class="lg:col-span-2 space-y-5">

                    <!-- Candidate card -->
                    <div class="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                        <div class="flex items-center gap-4 mb-5">
                            <div class="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-xl font-bold text-teal-700">
                                {{ initials(referral.candidate_name) }}
                            </div>
                            <div>
                                <h2 class="text-lg font-bold text-neutral-900">{{ referral.candidate_name }}</h2>
                                <p class="text-sm text-neutral-500">{{ referral.candidate_email }}</p>
                            </div>
                            <span :class="['ml-auto inline-flex px-3 py-1 rounded-full text-xs font-semibold', statusClass(referral.status)]">
                                {{ statusLabel(referral.status) }}
                            </span>
                        </div>

                        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div v-if="referral.candidate_phone">
                                <dt class="text-xs text-neutral-400 mb-0.5">Phone</dt>
                                <dd class="font-medium text-neutral-800">{{ referral.candidate_phone }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-neutral-400 mb-0.5">Position</dt>
                                <dd class="font-medium text-neutral-800">{{ referral.position }}</dd>
                            </div>
                            <div v-if="referral.department">
                                <dt class="text-xs text-neutral-400 mb-0.5">Department</dt>
                                <dd class="font-medium text-neutral-800">{{ referral.department }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-neutral-400 mb-0.5">Referred By</dt>
                                <dd class="font-medium text-neutral-800">{{ referral.referrer?.name ?? '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-neutral-400 mb-0.5">Submitted On</dt>
                                <dd class="font-medium text-neutral-800">{{ fmtDate(referral.created_at) }}</dd>
                            </div>
                            <div v-if="referral.reviewed_at">
                                <dt class="text-xs text-neutral-400 mb-0.5">Last Reviewed</dt>
                                <dd class="font-medium text-neutral-800">{{ fmtDate(referral.reviewed_at) }}</dd>
                            </div>
                        </dl>
                    </div>

                    <!-- Relationship & Notes -->
                    <div class="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
                        <div>
                            <p class="text-xs font-semibold text-neutral-400 uppercase mb-1">Relationship</p>
                            <p class="text-sm text-neutral-800">{{ referral.relationship }}</p>
                        </div>
                        <div v-if="referral.note">
                            <p class="text-xs font-semibold text-neutral-400 uppercase mb-1">Recommendation Note</p>
                            <p class="text-sm text-neutral-800 leading-relaxed">{{ referral.note }}</p>
                        </div>
                        <div v-if="referral.resume_path">
                            <p class="text-xs font-semibold text-neutral-400 uppercase mb-1">Resume</p>
                            <a :href="`/storage/${referral.resume_path}`" target="_blank"
                               class="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                Download Resume
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Right: Status update (Admin/HR only) -->
                <div class="space-y-5">
                    <div class="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                        <h3 class="font-semibold text-neutral-900 mb-4">Update Status</h3>
                        <form @submit.prevent="updateStatus" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                                <select v-model="statusForm.status"
                                        class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                                    <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-neutral-700 mb-1">Admin Notes</label>
                                <textarea v-model="statusForm.admin_notes" rows="4"
                                          placeholder="Internal notes about this candidate…"
                                          class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"></textarea>
                            </div>
                            <button type="submit" :disabled="statusForm.processing"
                                    class="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                                {{ statusForm.processing ? 'Saving…' : 'Save Changes' }}
                            </button>
                        </form>
                    </div>

                    <!-- Status timeline -->
                    <div class="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                        <h3 class="font-semibold text-neutral-900 mb-4">Status Pipeline</h3>
                        <ol class="space-y-3">
                            <li v-for="s in statuses" :key="s.value"
                                class="flex items-center gap-3">
                                <div :class="[
                                    'w-3 h-3 rounded-full flex-shrink-0',
                                    referral.status === s.value ? 'bg-teal-500 ring-4 ring-teal-100' : 'bg-neutral-200'
                                ]"></div>
                                <span :class="['text-sm', referral.status === s.value ? 'font-semibold text-teal-700' : 'text-neutral-500']">
                                    {{ s.label }}
                                </span>
                            </li>
                        </ol>
                    </div>
                </div>

            </div>
        </PageLayout>
    </AuthenticatedLayout>
</template>
