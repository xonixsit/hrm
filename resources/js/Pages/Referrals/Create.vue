<script setup>
import { computed } from 'vue';
import { useForm } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

const breadcrumbs = computed(() => [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Employee Referrals', href: route('referrals.index') },
    { label: 'Refer Someone', current: true },
]);

const form = useForm({
    candidate_name:  '',
    candidate_email: '',
    candidate_phone: '',
    position:        '',
    department:      '',
    relationship:    '',
    note:            '',
    resume:          null,
});

const submit = () => {
    form.post(route('referrals.store'), {
        forceFormData: true,
    });
};

const handleResume = (e) => {
    form.resume = e.target.files[0] ?? null;
};
</script>

<template>
    <AuthenticatedLayout>
        <PageLayout
            title="Refer Someone"
            subtitle="Submit a referral for a position at Xonobics"
            :breadcrumbs="breadcrumbs"
        >
            <div class="max-w-2xl">
                <div class="bg-white rounded-xl border border-neutral-200 shadow-sm">

                    <!-- Header banner -->
                    <div class="bg-gradient-to-r from-teal-500 to-teal-600 rounded-t-xl px-6 py-5 text-white">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                            </div>
                            <div>
                                <p class="font-semibold">Employee Referral</p>
                                <p class="text-teal-100 text-xs mt-0.5">Your referral will be reviewed by HR</p>
                            </div>
                        </div>
                    </div>

                    <form @submit.prevent="submit" class="p-6 space-y-6">

                        <!-- Candidate info -->
                        <div>
                            <h3 class="text-sm font-semibold text-neutral-700 mb-4 pb-2 border-b border-neutral-100">
                                Candidate Information
                            </h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <!-- Name -->
                                <div>
                                    <label class="block text-sm font-medium text-neutral-700 mb-1">
                                        Full Name <span class="text-red-500">*</span>
                                    </label>
                                    <input v-model="form.candidate_name" type="text"
                                           placeholder="John Smith"
                                           class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                           :class="{ 'border-red-400': form.errors.candidate_name }" />
                                    <p v-if="form.errors.candidate_name" class="text-xs text-red-600 mt-1">{{ form.errors.candidate_name }}</p>
                                </div>

                                <!-- Email -->
                                <div>
                                    <label class="block text-sm font-medium text-neutral-700 mb-1">
                                        Email <span class="text-red-500">*</span>
                                    </label>
                                    <input v-model="form.candidate_email" type="email"
                                           placeholder="john@example.com"
                                           class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                           :class="{ 'border-red-400': form.errors.candidate_email }" />
                                    <p v-if="form.errors.candidate_email" class="text-xs text-red-600 mt-1">{{ form.errors.candidate_email }}</p>
                                </div>

                                <!-- Phone -->
                                <div>
                                    <label class="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                                    <input v-model="form.candidate_phone" type="tel"
                                           placeholder="+91 98765 43210"
                                           class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                                </div>

                                <!-- Resume -->
                                <div>
                                    <label class="block text-sm font-medium text-neutral-700 mb-1">Resume / CV</label>
                                    <input type="file" accept=".pdf,.doc,.docx"
                                           @change="handleResume"
                                           class="w-full text-sm text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 file:text-xs file:font-medium hover:file:bg-teal-100" />
                                    <p class="text-xs text-neutral-400 mt-1">PDF, DOC or DOCX · Max 5 MB</p>
                                    <p v-if="form.errors.resume" class="text-xs text-red-600 mt-1">{{ form.errors.resume }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Role info -->
                        <div>
                            <h3 class="text-sm font-semibold text-neutral-700 mb-4 pb-2 border-b border-neutral-100">
                                Role Details
                            </h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <!-- Position -->
                                <div>
                                    <label class="block text-sm font-medium text-neutral-700 mb-1">
                                        Position Applied For <span class="text-red-500">*</span>
                                    </label>
                                    <input v-model="form.position" type="text"
                                           placeholder="e.g. Tax Analyst"
                                           class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                           :class="{ 'border-red-400': form.errors.position }" />
                                    <p v-if="form.errors.position" class="text-xs text-red-600 mt-1">{{ form.errors.position }}</p>
                                </div>

                                <!-- Department -->
                                <div>
                                    <label class="block text-sm font-medium text-neutral-700 mb-1">Department</label>
                                    <input v-model="form.department" type="text"
                                           placeholder="e.g. Finance"
                                           class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        <!-- Relationship + Notes -->
                        <div>
                            <h3 class="text-sm font-semibold text-neutral-700 mb-4 pb-2 border-b border-neutral-100">
                                Your Recommendation
                            </h3>
                            <div class="space-y-4">
                                <!-- Relationship -->
                                <div>
                                    <label class="block text-sm font-medium text-neutral-700 mb-1">
                                        How do you know this person? <span class="text-red-500">*</span>
                                    </label>
                                    <input v-model="form.relationship" type="text"
                                           placeholder="e.g. Former colleague at XYZ, college friend…"
                                           class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                           :class="{ 'border-red-400': form.errors.relationship }" />
                                    <p v-if="form.errors.relationship" class="text-xs text-red-600 mt-1">{{ form.errors.relationship }}</p>
                                </div>

                                <!-- Note -->
                                <div>
                                    <label class="block text-sm font-medium text-neutral-700 mb-1">
                                        Why are you recommending them?
                                    </label>
                                    <textarea v-model="form.note" rows="4"
                                              placeholder="Describe the candidate's skills, experience, and why they'd be a great fit…"
                                              class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"></textarea>
                                    <p v-if="form.errors.note" class="text-xs text-red-600 mt-1">{{ form.errors.note }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Submit -->
                        <div class="flex items-center justify-between pt-4 border-t border-neutral-100">
                            <a :href="route('referrals.index')"
                               class="text-sm text-neutral-500 hover:text-neutral-700">← Back to referrals</a>

                            <button type="submit" :disabled="form.processing"
                                    class="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                                <svg v-if="form.processing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115 0M20 15a9 9 0 01-15 0"/>
                                </svg>
                                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                </svg>
                                {{ form.processing ? 'Submitting…' : 'Submit Referral' }}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </PageLayout>
    </AuthenticatedLayout>
</template>
