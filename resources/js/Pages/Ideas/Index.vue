<script setup>
import { ref, computed } from 'vue';
import { Head, router, usePage } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import { useTheme } from '@/composables/useTheme';
import { useAuth } from '@/composables/useAuth';
import IdeaBoxModal from '@/Components/IdeaBox/IdeaBoxModal.vue';

const { isDark } = useTheme();
const { hasAnyRole, user } = useAuth();
const page = usePage();

const props = defineProps({
    ideas:      Object,
    stats:      Object,
    categories: Object,
    statuses:   Object,
    filters:    Object,
    isManager:  Boolean,
});

const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Share Your Ideas', href: route('ideas.index') },
];

// ── Filters ───────────────────────────────────────────────────────────────────
const search   = ref(props.filters.search   || '');
const category = ref(props.filters.category || '');
const status   = ref(props.filters.status   || '');

function applyFilters() {
    router.get(route('ideas.index'), {
        search:   search.value   || undefined,
        category: category.value || undefined,
        status:   status.value   || undefined,
    }, { preserveScroll: true, preserveState: true });
}

function clearFilters() {
    search.value = ''; category.value = ''; status.value = '';
    applyFilters();
}

// ── Submit form ───────────────────────────────────────────────────────────────
const showForm    = ref(false);
const submitting  = ref(false);

// ── Vote ──────────────────────────────────────────────────────────────────────
function vote(idea) {
    router.post(route('ideas.vote', idea.id), {}, { preserveScroll: true });
}

// ── Edit own idea ─────────────────────────────────────────────────────────────
const editingOwnIdea = ref(null);
const editForm       = ref({ title: '', description: '', category: 'lead_conversion' });

function openEditIdea(idea) {
    editingOwnIdea.value = idea;
    editForm.value = { title: idea.title, description: idea.description, category: idea.category };
}
function saveEdit() {
    router.patch(route('ideas.update', editingOwnIdea.value.id), editForm.value, {
        preserveScroll: true,
        onSuccess: () => { editingOwnIdea.value = null; },
    });
}

// ── Status update (admin) ─────────────────────────────────────────────────────
const editingIdea  = ref(null);
const statusForm   = ref({ status: '', admin_notes: '' });

function openStatusEditor(idea) {
    editingIdea.value = idea;
    statusForm.value  = { status: idea.status, admin_notes: idea.admin_notes || '' };
}
function saveStatus() {
    router.patch(route('ideas.status', editingIdea.value.id), statusForm.value, {
        preserveScroll: true,
        onSuccess: () => { editingIdea.value = null; },
    });
}

// ── Delete ────────────────────────────────────────────────────────────────────
function deleteIdea(idea) {
    if (!confirm('Remove this idea?')) return;
    router.delete(route('ideas.destroy', idea.id), { preserveScroll: true });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusColors = {
    pending:      'bg-gray-100 text-gray-700 border-gray-200',
    under_review: 'bg-blue-100 text-blue-700 border-blue-200',
    approved:     'bg-green-100 text-green-700 border-green-200',
    implemented:  'bg-teal-100 text-teal-700 border-teal-200',
    declined:     'bg-red-100 text-red-700 border-red-200',
};
function timeAgo(dt) {
    const diff = Math.floor((Date.now() - new Date(dt)) / 1000);
    if (diff < 60)   return 'just now';
    if (diff < 3600) return Math.floor(diff/60) + 'm ago';
    if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
    return Math.floor(diff/86400) + 'd ago';
}
function initials(name) {
    return (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
}
</script>

<template>
    <Head title="Share Your Ideas" />
    <AuthenticatedLayout>
        <PageLayout
            title="💡 Share Your Ideas"
            subtitle="Help us improve tax sales, lead conversion & client success — every idea counts!"
            :breadcrumbs="breadcrumbs">

            <template #actions>
                <button @click="showForm = !showForm"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-90 transition-all"
                    style="background:linear-gradient(135deg,#006970,#00a9b4)">
                    {{ showForm ? '✕ Cancel' : '+ Share an Idea' }}
                </button>
            </template>

            <div class="space-y-6">

                <!-- Flash -->
                <div v-if="$page.props.flash?.success"
                    class="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                    ✅ {{ $page.props.flash.success }}
                </div>

                <!-- ── Stats row ─────────────────────────────────────────── -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div v-for="s in [
                        { label: isManager ? 'Total Ideas' : 'My Ideas', value: stats.total,       icon: '💡', color: 'teal'   },
                        { label: 'Pending',                               value: stats.pending,     icon: '⏳', color: 'amber'  },
                        { label: 'Approved',                              value: stats.approved,    icon: '✅', color: 'green'  },
                        { label: 'Implemented',                           value: stats.implemented, icon: '🚀', color: 'indigo' },
                    ]" :key="s.label"
                        class="rounded-2xl border px-4 py-3.5 flex items-center gap-3"
                        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
                        <span class="text-2xl">{{ s.icon }}</span>
                        <div>
                            <p class="text-[10px] font-bold uppercase tracking-wider" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ s.label }}</p>
                            <p class="text-xl font-extrabold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ s.value }}</p>
                        </div>
                    </div>
                </div>

                <!-- ── Submit form ───────────────────────────────────────── -->
                <Transition name="slide-down">
                    <div v-if="showForm"
                        class="rounded-2xl border shadow-sm p-6 space-y-4"
                        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xl">💡</span>
                            <h2 class="text-base font-extrabold" :class="isDark ? 'text-white' : 'text-slate-900'">
                                Share Your Idea to Improve Our Sales & Tax Services
                            </h2>
                        </div>
                        <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                            Have a strategy to convert more leads? A better way to explain tax benefits? A smoother payment process? Tell us!
                        </p>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <!-- Title -->
                            <div class="md:col-span-2">
                                <label class="text-[11px] font-bold block mb-1" :class="isDark ? 'text-gray-300' : 'text-slate-700'">Idea Title *</label>
                                <input v-model="form.title" type="text" maxlength="200"
                                    placeholder="e.g. Follow-up script for interested leads..."
                                    class="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-teal-500"
                                    :class="isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'" />
                                <p v-if="errors.title" class="text-xs text-red-500 mt-1">{{ errors.title }}</p>
                            </div>
                            <!-- Category -->
                            <div>
                                <label class="text-[11px] font-bold block mb-1" :class="isDark ? 'text-gray-300' : 'text-slate-700'">Category *</label>
                                <select v-model="form.category"
                                    class="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-teal-500"
                                    :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                                    <option v-for="(label, key) in categories" :key="key" :value="key">{{ label }}</option>
                                </select>
                            </div>
                        </div>

                        <!-- Description -->
                        <div>
                            <label class="text-[11px] font-bold block mb-1" :class="isDark ? 'text-gray-300' : 'text-slate-700'">
                                Describe Your Idea * <span class="text-slate-400 font-normal">(min 20 characters)</span>
                            </label>
                            <textarea v-model="form.description" rows="4" maxlength="2000"
                                placeholder="Describe the idea in detail — what's the problem, what's your solution, and how it would help improve conversions or client experience..."
                                class="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-teal-500 resize-none"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
                            </textarea>
                            <div class="flex justify-between text-[10px] mt-0.5" :class="isDark ? 'text-gray-500' : 'text-slate-400'">
                                <span v-if="errors.description" class="text-red-500">{{ errors.description }}</span>
                                <span class="ml-auto">{{ form.description.length }}/2000</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <button @click="submitIdea" :disabled="submitting"
                                class="px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-60"
                                style="background:linear-gradient(135deg,#006970,#00a9b4)">
                                {{ submitting ? 'Submitting…' : '🚀 Submit Idea' }}
                            </button>
                            <button @click="showForm = false"
                                class="px-4 py-2.5 rounded-xl text-sm font-bold border transition-all"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                                Cancel
                            </button>
                        </div>
                    </div>
                </Transition>                <!-- ── Filters ────────────────────────────────────────────── -->
                <div class="flex flex-wrap items-center gap-3">
                    <div class="relative flex-1 min-w-[180px]">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input v-model="search" type="text" placeholder="Search ideas…" @keyup.enter="applyFilters"
                            class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                            :class="isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'" />
                    </div>
                    <select v-model="category" @change="applyFilters"
                        class="px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                        :class="isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-900'">
                        <option value="">All Categories</option>
                        <option v-for="(label, key) in categories" :key="key" :value="key">{{ label }}</option>
                    </select>
                    <select v-model="status" @change="applyFilters"
                        class="px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                        :class="isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-900'">
                        <option value="">All Status</option>
                        <option v-for="(s, key) in statuses" :key="key" :value="key">{{ s.label }}</option>
                    </select>
                    <button v-if="search || category || status" @click="clearFilters"
                        class="text-xs font-bold text-teal-600 hover:text-teal-800 px-2 py-2">
                        ✕ Clear
                    </button>
                    <span class="text-xs ml-auto" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                        {{ ideas.total }} idea{{ ideas.total !== 1 ? 's' : '' }}
                    </span>
                </div>

                <!-- ── Ideas Grid ─────────────────────────────────────────── -->
                <div v-if="ideas.data.length === 0" class="text-center py-16 rounded-2xl border"
                    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
                    <p class="text-4xl mb-3">💡</p>
                    <p class="font-bold" :class="isDark ? 'text-white' : 'text-slate-800'">No ideas yet</p>
                    <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Be the first to share an idea!</p>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div v-for="idea in ideas.data" :key="idea.id"
                        class="rounded-2xl border shadow-sm flex flex-col transition-all hover:shadow-md"
                        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">

                        <!-- Card header -->
                        <div class="p-5 flex-1 space-y-3">
                            <!-- Category + status -->
                            <div class="flex items-center justify-between gap-2 flex-wrap">
                                <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border"
                                    :class="isDark ? 'bg-teal-900/30 border-teal-700 text-teal-300' : 'bg-teal-50 border-teal-200 text-teal-700'">
                                    {{ categories[idea.category] || idea.category }}
                                </span>
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                                    :class="statusColors[idea.status]">
                                    {{ statuses[idea.status]?.label || idea.status }}
                                </span>
                            </div>

                            <!-- Title -->
                            <h3 class="font-extrabold text-sm leading-snug" :class="isDark ? 'text-white' : 'text-slate-900'">
                                {{ idea.title }}
                            </h3>

                            <!-- Description -->
                            <p class="text-xs leading-relaxed line-clamp-3" :class="isDark ? 'text-gray-400' : 'text-slate-600'">
                                {{ idea.description }}
                            </p>

                            <!-- Admin notes -->
                            <div v-if="idea.admin_notes" class="px-3 py-2 rounded-xl text-xs border-l-4 border-teal-500"
                                :class="isDark ? 'bg-teal-900/20 text-teal-300' : 'bg-teal-50 text-teal-800'">
                                <span class="font-bold">Admin note:</span> {{ idea.admin_notes }}
                            </div>
                        </div>

                        <!-- Card footer -->
                        <div class="px-5 py-3 border-t flex items-center justify-between gap-2"
                            :class="isDark ? 'border-gray-700' : 'border-slate-100'">
                            <!-- Author + time -->
                            <div class="flex items-center gap-2 min-w-0">
                                <span class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shrink-0"
                                    style="background:linear-gradient(135deg,#006970,#00a9b4)">
                                    {{ initials(idea.user?.name) }}
                                </span>
                                <div class="min-w-0">
                                    <p class="text-[11px] font-semibold truncate" :class="isDark ? 'text-gray-300' : 'text-slate-700'">{{ idea.user?.name }}</p>
                                    <p class="text-[10px]" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ timeAgo(idea.created_at) }}</p>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="flex items-center gap-1.5">
                                <!-- Vote button -->
                                <button v-if="idea.user_id !== user?.id" @click="vote(idea)"
                                    class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all"
                                    :class="idea.has_voted
                                        ? 'bg-teal-600 text-white border-teal-600'
                                        : isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:border-teal-600' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600'">
                                    {{ idea.has_voted ? '👍' : '👍' }} {{ idea.vote_count || idea.votes }}
                                </button>
                                <span v-else class="flex items-center gap-1 px-2.5 py-1 text-xs font-bold"
                                    :class="isDark ? 'text-gray-500' : 'text-slate-400'">
                                    👍 {{ idea.vote_count || idea.votes }}
                                </span>

                                <!-- Edit own idea (pending/under_review only) -->
                                <button v-if="idea.user_id === user?.id && ['pending','under_review'].includes(idea.status)"
                                    @click="openEditIdea(idea)"
                                    class="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all"
                                    :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'">
                                    Edit
                                </button>

                                <!-- Admin status editor -->
                                <button v-if="isManager" @click="openStatusEditor(idea)"
                                    class="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all"
                                    :class="isDark ? 'bg-gray-700 border-gray-600 text-teal-300 hover:bg-gray-600' : 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'">
                                    Review
                                </button>

                                <!-- Delete — own idea only, not admin -->
                                <button v-if="idea.user_id === user?.id" @click="deleteIdea(idea)"
                                    class="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all"
                                    :class="isDark ? 'bg-gray-700 border-gray-600 text-red-400 hover:bg-red-900/30' : 'bg-white border-red-200 text-red-500 hover:bg-red-50'">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="ideas.last_page > 1" class="flex items-center justify-between text-xs">
                    <span :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                        Page {{ ideas.current_page }} of {{ ideas.last_page }} · {{ ideas.total }} total
                    </span>
                    <div class="flex gap-1">
                        <a v-if="ideas.prev_page_url" :href="ideas.prev_page_url"
                            class="px-3 py-1.5 rounded-lg border font-bold transition-all"
                            :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'">
                            ← Prev
                        </a>
                        <a v-if="ideas.next_page_url" :href="ideas.next_page_url"
                            class="px-3 py-1.5 rounded-xl text-white font-bold hover:opacity-90"
                            style="background:linear-gradient(135deg,#006970,#00a9b4)">
                            Next →
                        </a>
                    </div>
                </div>
            </div>
        </PageLayout>
    </AuthenticatedLayout>

    <!-- ── Idea Box Modal ─────────────────────────────────────────────────── -->
    <Teleport to="body">
        <IdeaBoxModal
            v-if="showForm"
            :categories="categories"
            @close="showForm = false" />
    </Teleport>

    <!-- ── Status Editor Modal ────────────────────────────────────────────── -->
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="editingIdea" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                <div class="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
                    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
                    <!-- Header -->
                    <div class="px-5 py-4 border-b text-white" style="background:linear-gradient(135deg,#006970,#00a9b4)">
                        <h3 class="font-extrabold text-sm">Review Idea</h3>
                        <p class="text-xs text-white/70 truncate mt-0.5">{{ editingIdea.title }}</p>
                    </div>
                    <div class="p-5 space-y-4">
                        <!-- Full idea content (read-only) -->
                        <div class="rounded-xl border p-3.5 space-y-2"
                            :class="isDark ? 'bg-gray-750 border-gray-600' : 'bg-slate-50 border-slate-200'">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border"
                                    :class="isDark ? 'bg-teal-900/30 border-teal-700 text-teal-300' : 'bg-teal-50 border-teal-200 text-teal-700'">
                                    {{ categories[editingIdea.category] || editingIdea.category }}
                                </span>
                                <span class="text-[10px]" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                                    by {{ editingIdea.user?.name }}
                                </span>
                            </div>
                            <h4 class="font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">
                                {{ editingIdea.title }}
                            </h4>
                            <p class="text-xs leading-relaxed" :class="isDark ? 'text-gray-300' : 'text-slate-600'">
                                {{ editingIdea.description }}
                            </p>
                        </div>
                        <div>
                            <label class="text-[11px] font-bold block mb-1" :class="isDark ? 'text-gray-300' : 'text-slate-700'">Status</label>
                            <select v-model="statusForm.status"
                                class="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                                <option v-for="(s, key) in statuses" :key="key" :value="key">{{ s.label }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[11px] font-bold block mb-1" :class="isDark ? 'text-gray-300' : 'text-slate-700'">Admin Note (optional)</label>
                            <textarea v-model="statusForm.admin_notes" rows="3" maxlength="1000"
                                placeholder="Feedback or explanation for the employee…"
                                class="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-teal-500 resize-none"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
                            </textarea>
                        </div>
                        <div class="flex gap-2">
                            <button @click="saveStatus"
                                class="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90"
                                style="background:linear-gradient(135deg,#006970,#00a9b4)">
                                Save
                            </button>
                            <button @click="editingIdea = null"
                                class="px-4 py-2.5 rounded-xl text-sm font-bold border transition-all"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-slate-300 text-slate-600'">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- ── Edit Own Idea Modal ───────────────────────────────────────────── -->
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="editingOwnIdea" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                <div class="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
                    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
                    <div class="px-5 py-4 border-b text-white" style="background:linear-gradient(135deg,#006970,#00a9b4)">
                        <h3 class="font-extrabold text-sm">Edit Your Idea</h3>
                        <p class="text-xs text-white/70 mt-0.5">Only editable while Pending or Under Review</p>
                    </div>
                    <div class="p-5 space-y-4">
                        <div>
                            <label class="text-[11px] font-bold block mb-1" :class="isDark ? 'text-gray-300' : 'text-slate-700'">Title *</label>
                            <input v-model="editForm.title" maxlength="200" type="text"
                                class="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'"
                                @paste.prevent @copy.prevent />
                        </div>
                        <div>
                            <label class="text-[11px] font-bold block mb-1" :class="isDark ? 'text-gray-300' : 'text-slate-700'">Category *</label>
                            <select v-model="editForm.category"
                                class="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                                <option v-for="(label, key) in categories" :key="key" :value="key">{{ label }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[11px] font-bold block mb-1" :class="isDark ? 'text-gray-300' : 'text-slate-700'">Description *</label>
                            <textarea v-model="editForm.description" rows="5" maxlength="2000"
                                class="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-teal-500 resize-none"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'"
                                @paste.prevent @copy.prevent>
                            </textarea>
                        </div>
                        <div class="flex gap-2">
                            <button @click="saveEdit"
                                class="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90"
                                style="background:linear-gradient(135deg,#006970,#00a9b4)">
                                Save Changes
                            </button>
                            <button @click="editingOwnIdea = null"
                                class="px-4 py-2.5 rounded-xl text-sm font-bold border transition-all"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-slate-300 text-slate-600'">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.slide-down-enter-active { transition: all 0.3s cubic-bezier(.16,1,.3,1); }
.slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from   { opacity:0; transform:translateY(-12px); }
.slide-down-leave-to     { opacity:0; transform:translateY(-8px); }
.fade-enter-active { transition: opacity 0.25s; }
.fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
