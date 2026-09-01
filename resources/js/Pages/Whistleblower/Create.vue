<script setup>
import { ref, computed } from 'vue';
import { Head, Link, useForm, usePage } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

const props = defineProps({
    categories:     Object,
    severityLevels: Object,
});

const page = usePage();
const currentUser = page.props.auth.user;

const form = useForm({
    category:           '',
    subject:            '',
    description:        '',
    severity:           'medium',
    is_anonymous:       false,
    accused_name:       '',
    accused_department: '',
    attachments:        [],
});

const fileInput = ref(null);
const selectedFiles = ref([]);

const severityMeta = {
    low:      { bg: 'bg-green-50 dark:bg-green-900/20',   border: 'border-green-400',  text: 'text-green-700 dark:text-green-300',  dot: 'bg-green-500', desc: 'Minor concern, no immediate harm' },
    medium:   { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-400', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500', desc: 'Significant concern needing attention' },
    high:     { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-400', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500', desc: 'Serious violation, prompt action needed' },
    critical: { bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-400',    text: 'text-red-700 dark:text-red-300',       dot: 'bg-red-500',    desc: 'Urgent — immediate danger or gross misconduct' },
};

const agreed = ref(false);

const canSubmit = computed(() =>
    form.category && form.subject.trim().length >= 5 && form.description.trim().length >= 20 && agreed.value
);

const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    selectedFiles.value = [...selectedFiles.value, ...files].slice(0, 5);
    form.attachments = selectedFiles.value;
    // reset input so same file can be re-added after remove
    e.target.value = '';
};

const removeFile = (i) => {
    selectedFiles.value.splice(i, 1);
    form.attachments = selectedFiles.value;
};

const submit = () => {
    form.post(route('whistleblower.store'), { forceFormData: true });
};

const formatBytes = (b) => {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
};
</script>

<template>
    <Head title="Submit a Report" />
    <AuthenticatedLayout>
        <div class="max-w-2xl mx-auto px-4 py-10">

            <!-- Header -->
            <div class="mb-8 text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 mb-4">
                    <svg class="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Submit a Whistleblower Report</h1>
                <p class="mt-2 text-sm text-slate-500 dark:text-gray-400 max-w-md mx-auto">
                    Your safety and wellbeing come first. This is a safe, judgement-free space to raise genuine concerns.
                    Every report is treated with care, handled in strict confidence, and reviewed without bias —
                    so you can speak up with confidence, free from fear of retaliation.
                </p>
            </div>

            <!-- Who is submitting -->
            <div class="mb-5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-700 dark:text-teal-300 font-semibold text-sm flex-shrink-0">
                        {{ currentUser.name?.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-700 dark:text-white">{{ currentUser.name }}</p>
                        <p class="text-xs text-slate-400">Submitting as yourself</p>
                    </div>
                </div>
                <!-- Anonymous toggle -->
                <div class="flex items-center gap-2.5 flex-shrink-0">
                    <span class="text-xs font-medium text-slate-600 dark:text-gray-300">Keep my details anonymous</span>
                    <button type="button"
                        @click="form.is_anonymous = !form.is_anonymous"
                        class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
                        :class="form.is_anonymous ? 'bg-teal-600' : 'bg-slate-300 dark:bg-gray-600'"
                        :aria-checked="form.is_anonymous"
                        role="switch"
                    >
                        <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                            :class="form.is_anonymous ? 'translate-x-4' : 'translate-x-0.5'"/>
                    </button>
                </div>
            </div>
            <p v-if="form.is_anonymous" class="mb-5 text-xs text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg px-3 py-2">
                🔒 Your identity is stored securely for audit purposes but will be shown as <strong>Anonymous</strong> to administrators.
            </p>
            <p v-else class="mb-5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                👤 Your name will be visible to administrators who review this report.
            </p>

            <!-- Form card -->
            <form @submit.prevent="submit"
                class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden divide-y divide-slate-100 dark:divide-gray-700">

                <!-- Category -->
                <div class="px-6 py-5">
                    <label class="block text-sm font-semibold text-slate-700 dark:text-white mb-3">
                        Category <span class="text-red-500">*</span>
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                        <button v-for="(label, key) in categories" :key="key"
                            type="button"
                            @click="form.category = key"
                            class="px-3 py-2.5 text-sm rounded-xl border text-left transition-all"
                            :class="form.category === key
                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-semibold'
                                : 'border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:border-slate-300 dark:hover:border-gray-500'"
                        >{{ label }}</button>
                    </div>
                    <p v-if="form.errors.category" class="mt-1.5 text-xs text-red-500">{{ form.errors.category }}</p>
                </div>

                <!-- Severity -->
                <div class="px-6 py-5">
                    <label class="block text-sm font-semibold text-slate-700 dark:text-white mb-3">
                        Severity Level <span class="text-red-500">*</span>
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                        <button v-for="(label, key) in severityLevels" :key="key"
                            type="button"
                            @click="form.severity = key"
                            class="px-3 py-3 rounded-xl border-2 text-left transition-all"
                            :class="form.severity === key
                                ? `${severityMeta[key].bg} ${severityMeta[key].border}`
                                : 'border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500'"
                        >
                            <div class="flex items-center gap-2 mb-0.5">
                                <span class="w-2 h-2 rounded-full flex-shrink-0" :class="severityMeta[key].dot"/>
                                <span class="text-sm font-semibold"
                                    :class="form.severity === key ? severityMeta[key].text : 'text-slate-700 dark:text-gray-200'">
                                    {{ label }}
                                </span>
                            </div>
                            <p class="text-xs text-slate-500 dark:text-gray-400 pl-4">{{ severityMeta[key].desc }}</p>
                        </button>
                    </div>
                </div>

                <!-- Subject -->
                <div class="px-6 py-5">
                    <label class="block text-sm font-semibold text-slate-700 dark:text-white mb-1.5">
                        Subject <span class="text-red-500">*</span>
                    </label>
                    <input
                        v-model="form.subject"
                        type="text"
                        maxlength="255"
                        placeholder="Brief title describing the issue"
                        class="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors
                               border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700
                               text-slate-800 dark:text-white placeholder-slate-400
                               focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                    <p v-if="form.errors.subject" class="mt-1 text-xs text-red-500">{{ form.errors.subject }}</p>
                </div>

                <!-- Description -->
                <div class="px-6 py-5">
                    <label class="block text-sm font-semibold text-slate-700 dark:text-white mb-1.5">
                        Detailed Description <span class="text-red-500">*</span>
                    </label>
                    <textarea
                        v-model="form.description"
                        rows="6"
                        maxlength="5000"
                        placeholder="Describe the incident in detail — what happened, when, where, and any other relevant context…"
                        class="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors resize-none
                               border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700
                               text-slate-800 dark:text-white placeholder-slate-400
                               focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                    <div class="flex justify-between mt-1">
                        <p v-if="form.errors.description" class="text-xs text-red-500">{{ form.errors.description }}</p>
                        <p class="text-xs text-slate-400 ml-auto">{{ form.description.length }}/5000</p>
                    </div>
                </div>

                <!-- Person involved -->
                <div class="px-6 py-5">
                    <p class="text-sm font-semibold text-slate-700 dark:text-white mb-3">
                        Person(s) Involved
                        <span class="font-normal text-slate-400 text-xs ml-1">optional</span>
                    </p>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs text-slate-500 dark:text-gray-400 mb-1">Name</label>
                            <input v-model="form.accused_name" type="text" placeholder="Full name"
                                class="w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors
                                       border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700
                                       text-slate-800 dark:text-white placeholder-slate-400
                                       focus:border-teal-500" />
                        </div>
                        <div>
                            <label class="block text-xs text-slate-500 dark:text-gray-400 mb-1">Department</label>
                            <input v-model="form.accused_department" type="text" placeholder="Department"
                                class="w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors
                                       border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700
                                       text-slate-800 dark:text-white placeholder-slate-400
                                       focus:border-teal-500" />
                        </div>
                    </div>
                </div>

                <!-- Attachments -->
                <div class="px-6 py-5">
                    <p class="text-sm font-semibold text-slate-700 dark:text-white mb-1">
                        Supporting Evidence
                        <span class="font-normal text-slate-400 text-xs ml-1">optional — up to 5 files</span>
                    </p>
                    <p class="text-xs text-slate-400 mb-3">PDF, DOC, DOCX, JPG, PNG, TXT · max 10 MB each</p>

                    <div v-if="selectedFiles.length" class="space-y-2 mb-3">
                        <div v-for="(f, i) in selectedFiles" :key="i"
                            class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600">
                            <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                            </svg>
                            <span class="text-xs text-slate-700 dark:text-gray-200 flex-1 truncate">{{ f.name }}</span>
                            <span class="text-xs text-slate-400 flex-shrink-0">{{ formatBytes(f.size) }}</span>
                            <button type="button" @click="removeFile(i)" class="text-slate-400 hover:text-red-500 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <button v-if="selectedFiles.length < 5" type="button" @click="fileInput.click()"
                        class="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-600
                               text-sm text-slate-500 dark:text-gray-400
                               hover:border-teal-400 hover:text-teal-600 dark:hover:border-teal-600 dark:hover:text-teal-400
                               transition-colors">
                        + Attach a file
                    </button>
                    <input ref="fileInput" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" class="hidden" @change="handleFiles" />
                </div>

                <!-- Declaration -->
                <div class="px-6 py-4 border-t border-slate-100 dark:border-gray-700">
                    <label class="flex items-start gap-3 cursor-pointer select-none group">
                        <div class="relative flex-shrink-0 mt-0.5">
                            <input type="checkbox" v-model="agreed" class="sr-only peer" />
                            <div class="w-5 h-5 rounded-md border-2 transition-colors
                                        border-slate-300 dark:border-gray-500
                                        peer-checked:border-teal-600 peer-checked:bg-teal-600
                                        group-hover:border-teal-400 dark:group-hover:border-teal-500">
                                <svg v-if="agreed" class="w-3.5 h-3.5 text-white absolute top-0.5 left-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                        </div>
                        <span class="text-sm text-slate-600 dark:text-gray-300 leading-snug">
                            I confirm that the information provided in this report is <strong class="text-slate-800 dark:text-white">genuine and accurate</strong> to the best of my knowledge.
                            I understand that submitting <strong class="text-slate-800 dark:text-white">false or malicious reports</strong> may result in disciplinary action.
                        </span>
                    </label>
                </div>

                <!-- Submit bar -->
                <div class="px-6 py-4 bg-slate-50 dark:bg-gray-800/60 flex items-center justify-between gap-4">
                    <p class="text-xs text-slate-500 dark:text-gray-400">
                        🔒 Visible only to authorised administrators
                    </p>
                    <div class="flex items-center gap-3">
                        <Link :href="route('whistleblower.my-reports')"
                            class="text-sm text-slate-500 hover:text-teal-600 transition-colors">
                            My Reports
                        </Link>
                        <button
                            type="submit"
                            :disabled="!canSubmit || form.processing"
                            class="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            style="background: linear-gradient(135deg, #006970, #00a9b4)"
                        >
                            <span v-if="form.processing">Submitting…</span>
                            <span v-else>Submit Report</span>
                        </button>
                    </div>
                </div>

            </form>
        </div>
    </AuthenticatedLayout>
</template>
