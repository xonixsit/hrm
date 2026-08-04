<script setup>
import { ref, watch, computed } from 'vue';
import { Head, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();

const props = defineProps({
    messages: Object,   // paginated
    users:    Array,
    filters:  Object,
    stats:    Object,
});

const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Message Monitor', href: route('admin.message-monitor.index') },
];

// ── Filter state ──────────────────────────────────────────────────────────────
const fromDate  = ref(props.filters.from_date);
const toDate    = ref(props.filters.to_date);
const fromUser  = ref(props.filters.from_user || '');
const toUser    = ref(props.filters.to_user   || '');
const keyword   = ref(props.filters.keyword   || '');

function applyFilters() {
    router.get(route('admin.message-monitor.index'), {
        from_date:  fromDate.value,
        to_date:    toDate.value,
        from_user:  fromUser.value  || undefined,
        to_user:    toUser.value    || undefined,
        keyword:    keyword.value   || undefined,
    }, { preserveScroll: true, preserveState: true });
}

const exportUrl = computed(() => {
    const params = new URLSearchParams();
    params.set('from_date', fromDate.value);
    params.set('to_date',   toDate.value);
    if (fromUser.value) params.set('from_user', fromUser.value);
    if (toUser.value)   params.set('to_user',   toUser.value);
    if (keyword.value)  params.set('keyword',   keyword.value);
    return route('admin.message-monitor.export') + '?' + params.toString();
});

function resetFilters() {
    const today = new Date().toISOString().split('T')[0];
    fromDate.value = today;
    toDate.value   = today;
    fromUser.value = '';
    toUser.value   = '';
    keyword.value  = '';
    applyFilters();
}

// Quick date presets
function setPreset(preset) {
    const now   = new Date();
    const today = now.toISOString().split('T')[0];
    if (preset === 'today') {
        fromDate.value = today; toDate.value = today;
    } else if (preset === 'yesterday') {
        const y = new Date(now); y.setDate(y.getDate() - 1);
        const ys = y.toISOString().split('T')[0];
        fromDate.value = ys; toDate.value = ys;
    } else if (preset === 'week') {
        const w = new Date(now); w.setDate(w.getDate() - 6);
        fromDate.value = w.toISOString().split('T')[0]; toDate.value = today;
    } else if (preset === 'month') {
        fromDate.value = today.slice(0, 8) + '01'; toDate.value = today;
    }
    applyFilters();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDT(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
}
function truncate(str, n = 80) {
    return str && str.length > n ? str.slice(0, n) + '…' : (str || '—');
}
function userName(id) {
    return props.users.find(u => u.id === id)?.name || 'Unknown';
}
</script>

<template>
    <Head title="Message Monitor — Admin" />
    <AuthenticatedLayout>
        <PageLayout
            title="Message Monitor"
            subtitle="Admin view of all staff messages — filtered by date, sender or recipient"
            :breadcrumbs="breadcrumbs"
            maxWidth="full">

            <template #actions>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    🔒 Admin Only — Read Only
                </span>
            </template>

            <div class="space-y-5">

                <!-- ── Stats row ─────────────────────────────────────────── -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div v-for="s in [
                        { label:'Total Messages',  value: stats.total_messages, icon:'💬' },
                        { label:'Active Users',    value: stats.active_users,   icon:'👥' },
                        { label:'Date From',       value: filters.from_date,    icon:'📅' },
                        { label:'Date To',         value: filters.to_date,      icon:'📅' },
                    ]" :key="s.label"
                        class="rounded-xl border px-4 py-3 flex items-center gap-3"
                        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
                        <span class="text-xl">{{ s.icon }}</span>
                        <div>
                            <p class="text-[10px] font-bold uppercase tracking-wider" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ s.label }}</p>
                            <p class="text-sm font-extrabold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ s.value }}</p>
                        </div>
                    </div>
                </div>

                <!-- ── Filters ───────────────────────────────────────────── -->
                <div class="rounded-2xl border p-5 space-y-4"
                    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">

                    <!-- Quick presets -->
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xs font-bold" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Quick:</span>
                        <button v-for="p in [{k:'today',l:'Today'},{k:'yesterday',l:'Yesterday'},{k:'week',l:'Last 7 Days'},{k:'month',l:'This Month'}]"
                            :key="p.k" @click="setPreset(p.k)"
                            class="px-3 py-1 rounded-lg text-xs font-bold border transition-all"
                            :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700'">
                            {{ p.l }}
                        </button>
                    </div>

                    <!-- Filter inputs -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <!-- From date -->
                        <div>
                            <label class="text-[11px] font-bold block mb-1" :class="isDark ? 'text-gray-400' : 'text-slate-600'">From Date</label>
                            <input v-model="fromDate" type="date"
                                class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'" />
                        </div>
                        <!-- To date -->
                        <div>
                            <label class="text-[11px] font-bold block mb-1" :class="isDark ? 'text-gray-400' : 'text-slate-600'">To Date</label>
                            <input v-model="toDate" type="date"
                                class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'" />
                        </div>
                        <!-- From user -->
                        <div>
                            <label class="text-[11px] font-bold block mb-1" :class="isDark ? 'text-gray-400' : 'text-slate-600'">Sender</label>
                            <select v-model="fromUser"
                                class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                                <option value="">All Senders</option>
                                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
                            </select>
                        </div>
                        <!-- To user -->
                        <div>
                            <label class="text-[11px] font-bold block mb-1" :class="isDark ? 'text-gray-400' : 'text-slate-600'">Recipient</label>
                            <select v-model="toUser"
                                class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                                <option value="">All Recipients</option>
                                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
                            </select>
                        </div>
                        <!-- Keyword -->
                        <div>
                            <label class="text-[11px] font-bold block mb-1" :class="isDark ? 'text-gray-400' : 'text-slate-600'">Keyword</label>
                            <input v-model="keyword" type="text" placeholder="Search message..."
                                class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'"
                                @keyup.enter="applyFilters" />
                        </div>
                    </div>

                    <!-- Action buttons -->
                    <div class="flex items-center gap-2">
                        <button @click="applyFilters"
                            class="px-5 py-2 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-all"
                            style="background:linear-gradient(135deg,#006970,#00a9b4)">
                            🔍 Apply Filters
                        </button>
                        <button @click="resetFilters"
                            class="px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                            :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                            ↺ Reset
                        </button>
                        <!-- Export CSV -->
                        <a :href="exportUrl"
                            class="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                            :class="isDark ? 'bg-emerald-900/40 border-emerald-700 text-emerald-300 hover:bg-emerald-900/60' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'">
                            ⬇ Export CSV
                        </a>
                        <span class="text-xs" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                            {{ messages.total }} message{{ messages.total !== 1 ? 's' : '' }} found
                        </span>
                    </div>
                </div>

                <!-- ── Table ─────────────────────────────────────────────── -->
                <div class="rounded-2xl border overflow-hidden"
                    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">

                    <!-- Table head -->
                    <div class="grid grid-cols-12 gap-0 border-b text-[11px] font-extrabold uppercase tracking-wider"
                        :class="isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'">
                        <div class="col-span-2 px-4 py-3">From</div>
                        <div class="col-span-2 px-4 py-3">To</div>
                        <div class="col-span-6 px-4 py-3">Message</div>
                        <div class="col-span-2 px-4 py-3">Date & Time</div>
                    </div>

                    <!-- Empty state -->
                    <div v-if="messages.data.length === 0"
                        class="flex flex-col items-center justify-center py-16 text-center">
                        <p class="text-3xl mb-3">💬</p>
                        <p class="font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-800'">No messages found</p>
                        <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Try adjusting your date range or filters</p>
                    </div>

                    <!-- Rows -->
                    <div v-else class="divide-y" :class="isDark ? 'divide-gray-700' : 'divide-slate-100'">
                        <div v-for="(msg, i) in messages.data" :key="msg.id"
                            class="grid grid-cols-12 gap-0 text-xs transition-colors"
                            :class="[
                                i % 2 === 0
                                    ? isDark ? 'bg-gray-800' : 'bg-white'
                                    : isDark ? 'bg-gray-750' : 'bg-slate-50/50',
                                isDark ? 'hover:bg-gray-700' : 'hover:bg-teal-50/40'
                            ]">

                            <!-- From -->
                            <div class="col-span-2 px-4 py-3.5 flex items-center gap-2">
                                <span class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shrink-0"
                                    style="background:linear-gradient(135deg,#006970,#00a9b4)">
                                    {{ msg.sender_name?.slice(0,2).toUpperCase() }}
                                </span>
                                <div class="min-w-0">
                                    <p class="font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-900'">{{ msg.sender_name }}</p>
                                    <p class="text-[10px] truncate" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ msg.sender_email }}</p>
                                </div>
                            </div>

                            <!-- To -->
                            <div class="col-span-2 px-4 py-3.5 flex items-center gap-2">
                                <span class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shrink-0 bg-indigo-500">
                                    {{ msg.recipient_name?.slice(0,2).toUpperCase() }}
                                </span>
                                <div class="min-w-0">
                                    <p class="font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-900'">{{ msg.recipient_name }}</p>
                                    <p class="text-[10px] truncate" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ msg.recipient_email }}</p>
                                </div>
                            </div>

                            <!-- Message -->
                            <div class="col-span-6 px-4 py-3.5 flex items-center">
                                <p class="leading-relaxed" :class="isDark ? 'text-gray-200' : 'text-slate-800'">{{ truncate(msg.message) }}</p>
                            </div>

                            <!-- Date -->
                            <div class="col-span-2 px-4 py-3.5 flex items-center">
                                <p :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ formatDT(msg.created_at) }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Pagination -->
                    <div v-if="messages.last_page > 1"
                        class="flex items-center justify-between px-5 py-3 border-t text-xs"
                        :class="isDark ? 'border-gray-700 bg-gray-800' : 'border-slate-200 bg-slate-50'">
                        <span :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                            Showing {{ messages.from }}–{{ messages.to }} of {{ messages.total }}
                        </span>
                        <div class="flex items-center gap-1">
                            <a v-if="messages.prev_page_url"
                                :href="messages.prev_page_url"
                                class="px-3 py-1.5 rounded-lg border font-bold transition-all"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'">
                                ← Prev
                            </a>
                            <span class="px-3 py-1.5 font-mono font-bold" :class="isDark ? 'text-white' : 'text-slate-800'">
                                {{ messages.current_page }} / {{ messages.last_page }}
                            </span>
                            <a v-if="messages.next_page_url"
                                :href="messages.next_page_url"
                                class="px-3 py-1.5 rounded-lg border font-bold transition-all"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'">
                                Next →
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </PageLayout>
    </AuthenticatedLayout>
</template>
