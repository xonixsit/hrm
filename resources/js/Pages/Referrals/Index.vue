<script setup>
import { ref, computed } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import { debounce } from 'lodash';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

const props = defineProps({
    referrals:   { type: Object, required: true },
    queryParams: { type: Object, default: () => ({}) },
    canManage:   { type: Boolean, default: false },
    statuses:    { type: Array,  default: () => [] },
});

const filters = ref({
    search: props.queryParams.search ?? '',
    status: props.queryParams.status ?? '',
});

const deleting = ref(null);

const breadcrumbs = computed(() => [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Employee Referrals', current: true },
]);

const headerActions = computed(() => [
    { id: 'new', label: 'Refer Someone', icon: 'PlusIcon', variant: 'primary', href: route('referrals.create') },
]);

// ── Filters ───────────────────────────────────────────────────────────────────
const applyFilters = () => {
    const params = {};
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.status) params.status = filters.value.status;
    router.get(route('referrals.index'), params, { preserveState: true, preserveScroll: true });
};
const debouncedSearch = debounce(applyFilters, 300);
const resetFilters = () => {
    filters.value = { search: '', status: '' };
    router.get(route('referrals.index'), {}, { preserveState: false });
};

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Delete ────────────────────────────────────────────────────────────────────
const doDelete = () => {
    if (!deleting.value) return;
    router.delete(route('referrals.destroy', deleting.value), {
        onSuccess: () => { deleting.value = null; },
    });
};
</script>

<template>
    <AuthenticatedLayout>
        <PageLayout
            title="Employee Referrals"
            subtitle="Refer talented people you know for open positions"
            :breadcrumbs="breadcrumbs"
            :actions="headerActions"
        >
            <!-- Flash -->
            <div v-if="$page.props.flash?.success"
                 class="mb-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ $page.props.flash.success }}
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-xl border border-neutral-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
                <div class="flex-1 min-w-48">
                    <label class="block text-xs font-medium text-neutral-500 mb-1">Search</label>
                    <input v-model="filters.search" @input="debouncedSearch" type="text"
                           placeholder="Name, email, position…"
                           class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div class="min-w-44">
                    <label class="block text-xs font-medium text-neutral-500 mb-1">Status</label>
                    <select v-model="filters.status" @change="applyFilters"
                            class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                        <option value="">All Statuses</option>
                        <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
                    </select>
                </div>
                <button v-if="filters.search || filters.status" @click="resetFilters"
                        class="text-sm text-neutral-500 hover:text-neutral-700 underline">Clear filters</button>
            </div>

            <!-- Table -->
            <div class="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <table class="min-w-full divide-y divide-neutral-200 text-sm">
                    <thead class="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                        <tr>
                            <th class="px-4 py-3 text-left">Candidate</th>
                            <th class="px-4 py-3 text-left">Position</th>
                            <th v-if="canManage" class="px-4 py-3 text-left">Referred By</th>
                            <th class="px-4 py-3 text-left">Status</th>
                            <th class="px-4 py-3 text-left">Date</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-100">
                        <!-- Empty -->
                        <tr v-if="referrals.data.length === 0">
                            <td :colspan="canManage ? 6 : 5" class="px-4 py-14 text-center">
                                <div class="flex flex-col items-center gap-3 text-neutral-400">
                                    <svg class="w-10 h-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    <p class="text-sm">No referrals found.</p>
                                    <Link :href="route('referrals.create')"
                                          class="text-sm text-teal-600 hover:text-teal-700 font-medium">
                                        Submit your first referral →
                                    </Link>
                                </div>
                            </td>
                        </tr>

                        <!-- Rows -->
                        <tr v-for="ref in referrals.data" :key="ref.id"
                            class="hover:bg-neutral-50 transition-colors">
                            <!-- Candidate -->
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 flex-shrink-0">
                                        {{ initials(ref.candidate_name) }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-neutral-900">{{ ref.candidate_name }}</p>
                                        <p class="text-xs text-neutral-400">{{ ref.candidate_email }}</p>
                                    </div>
                                </div>
                            </td>
                            <!-- Position -->
                            <td class="px-4 py-3">
                                <p class="text-neutral-800">{{ ref.position }}</p>
                                <p v-if="ref.department" class="text-xs text-neutral-400">{{ ref.department }}</p>
                            </td>
                            <!-- Referred By (admin only) -->
                            <td v-if="canManage" class="px-4 py-3 text-neutral-700">
                                {{ ref.referrer?.name ?? '—' }}
                            </td>
                            <!-- Status -->
                            <td class="px-4 py-3">
                                <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', statusClass(ref.status)]">
                                    {{ statusLabel(ref.status) }}
                                </span>
                            </td>
                            <!-- Date -->
                            <td class="px-4 py-3 text-neutral-500 text-xs">{{ fmtDate(ref.created_at) }}</td>
                            <!-- Actions -->
                            <td class="px-4 py-3 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <Link v-if="canManage"
                                          :href="route('referrals.show', ref.id)"
                                          class="text-xs text-teal-600 hover:text-teal-700 font-medium">
                                        Review
                                    </Link>
                                    <button v-if="ref.status === 'submitted' || canManage"
                                            @click="deleting = ref.id"
                                            class="text-xs text-red-500 hover:text-red-700">
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Pagination -->
                <div v-if="referrals.last_page > 1"
                     class="border-t border-neutral-200 px-4 py-3 flex items-center justify-between text-sm">
                    <span class="text-neutral-500">
                        Showing {{ referrals.from }}–{{ referrals.to }} of {{ referrals.total }}
                    </span>
                    <div class="flex gap-1">
                        <Link v-for="link in referrals.links" :key="link.label"
                              :href="link.url ?? '#'"
                              :class="['px-3 py-1 rounded border text-xs', link.active ? 'bg-teal-600 text-white border-teal-600' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50', !link.url ? 'opacity-40 pointer-events-none' : '']"
                              v-html="link.label" />
                    </div>
                </div>
            </div>

            <!-- Delete confirmation modal -->
            <div v-if="deleting" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                    <h3 class="font-semibold text-neutral-900 mb-2">Delete Referral?</h3>
                    <p class="text-sm text-neutral-500 mb-6">This action cannot be undone.</p>
                    <div class="flex justify-end gap-3">
                        <button @click="deleting = null"
                                class="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
                            Cancel
                        </button>
                        <button @click="doDelete"
                                class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                            Delete
                        </button>
                    </div>
                </div>
            </div>

        </PageLayout>
    </AuthenticatedLayout>
</template>
