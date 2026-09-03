<template>
  <AuthenticatedLayout>
    <div class="min-h-screen bg-gray-50">

      <!-- Page Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav class="flex mb-3">
            <ol class="flex items-center space-x-2 text-sm">
              <li><Link :href="route('dashboard')" class="text-gray-500 hover:text-gray-700">Dashboard</Link></li>
              <li class="flex items-center">
                <ChevronRightIcon class="w-4 h-4 text-gray-400 mx-2" />
                <span class="text-gray-900 font-medium">Reports</span>
              </li>
            </ol>
          </nav>
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Reports</h1>
              <p class="mt-1 text-sm text-gray-500">Download or schedule automated delivery of reports.</p>
            </div>
            <button v-if="isAdmin" @click="showScheduleModal = true"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style="background:linear-gradient(135deg,#006970,#00a9b4)">
              <PlusIcon class="w-4 h-4" />
              Schedule Report
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <!-- Download cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div v-for="r in reportCards" :key="r.type"
            class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b flex items-center gap-3"
              :class="`bg-gradient-to-r ${r.bg} ${r.borderColor}`">
              <div :class="`p-2 ${r.iconBg} rounded-lg`">
                <component :is="r.icon" :class="`w-5 h-5 ${r.iconColor}`" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-gray-900">{{ r.title }}</h3>
                <p class="text-xs text-gray-500">{{ r.desc }}</p>
              </div>
            </div>
            <div class="p-5">
              <a :href="r.excel"
                class="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-transparent hover:bg-green-50 hover:border-green-200 transition-all group">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <TableCellsIcon class="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-900">Excel</p>
                    <p class="text-[10px] text-gray-400">Download</p>
                  </div>
                </div>
                <ArrowDownTrayIcon class="w-3.5 h-3.5 text-gray-400 group-hover:text-green-500" />
              </a>
            </div>
          </div>
        </div>

        <!-- Work Reports -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg"><DocumentTextIcon class="w-5 h-5 text-blue-600" /></div>
            <div>
              <p class="text-sm font-semibold text-gray-900">Work Reports</p>
              <p class="text-xs text-gray-500">Daily work submissions and productivity tracking</p>
            </div>
          </div>
          <Link :href="route('work-reports.index')"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style="background:linear-gradient(135deg,#006970,#00a9b4)">
            View <ChevronRightIcon class="w-4 h-4" />
          </Link>
        </div>

        <!-- Scheduled Reports (admin only) -->
        <div v-if="isAdmin" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="p-2 bg-teal-100 rounded-lg"><ClockIcon class="w-5 h-5 text-teal-600" /></div>
              <div>
                <h3 class="text-base font-semibold text-gray-900">Scheduled Reports</h3>
                <p class="text-xs text-gray-500">Auto-deliver reports by email on a schedule</p>
              </div>
            </div>
            <button @click="showScheduleModal = true"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors">
              <PlusIcon class="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div v-if="loadingSchedules" class="py-10 text-center text-sm text-gray-400">Loading…</div>

          <div v-else-if="schedules.length === 0" class="py-12 text-center">
            <ClockIcon class="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p class="text-sm font-medium text-gray-600">No scheduled reports yet</p>
            <p class="text-xs text-gray-400 mt-1">Reports will be emailed automatically on your chosen schedule.</p>
          </div>

          <div v-else class="divide-y divide-gray-50">
            <div v-for="s in schedules" :key="s.id"
              class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <span class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                :class="s.is_active ? 'bg-green-500' : 'bg-gray-300'" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ s.label || s.report_type_label }}</p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ s.report_type_label }} · {{ s.frequency_label }}
                  <template v-if="s.frequency === 'weekly'"> ({{ s.day_of_week_label }})</template>
                  <template v-if="s.frequency === 'monthly'"> ({{ s.day_of_month }}th)</template>
                  at {{ s.send_time }}
                </p>
                <p class="text-xs text-gray-400">To: {{ s.recipients.join(', ') }}</p>
              </div>
              <div class="hidden sm:block text-right text-xs text-gray-400 flex-shrink-0">
                <p v-if="s.last_sent_at">Last sent {{ s.last_sent_at }}</p>
                <p v-else class="italic">Never sent</p>
                <p v-if="s.is_active && s.next_run_at" class="text-teal-600">Next {{ s.next_run_at }}</p>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <button @click="sendNow(s)" :disabled="sendingId === s.id" title="Send now"
                  class="p-1.5 rounded-lg border border-gray-200 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors disabled:opacity-40">
                  <PaperAirplaneIcon class="w-3.5 h-3.5" />
                </button>
                <button @click="toggleActive(s)" :title="s.is_active ? 'Pause' : 'Resume'"
                  class="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <PauseIcon v-if="s.is_active" class="w-3.5 h-3.5 text-orange-500" />
                  <PlayIcon v-else class="w-3.5 h-3.5 text-green-600" />
                </button>
                <button @click="deleteSchedule(s)" title="Delete"
                  class="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
                  <TrashIcon class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Create Schedule Modal ──────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition duration-150"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showScheduleModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showScheduleModal = false">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">

            <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <h3 class="text-base font-semibold text-gray-900">Schedule a Report</h3>
              <button @click="showScheduleModal = false"
                class="w-7 h-7 rounded-full flex items-center justify-center border border-gray-200 text-gray-400 hover:bg-gray-100">
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>

            <div class="px-6 py-5 space-y-4 overflow-y-auto" style="max-height:65vh">

              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Name <span class="text-gray-400">(optional)</span></label>
                <input v-model="form.label" type="text" placeholder="e.g. Monthly HR Report"
                  class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500" />
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Report Type <span class="text-red-500">*</span></label>
                <select v-model="form.report_type"
                  class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500">
                  <option value="">Select type</option>
                  <option v-for="(label, key) in reportTypes" :key="key" :value="key">{{ label }}</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5">Format</label>
                <div class="py-2 px-3 rounded-xl border border-green-400 bg-green-50 text-green-700 text-sm font-medium">
                  📊 Excel (xlsx)
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5">Frequency <span class="text-red-500">*</span></label>
                <div class="grid grid-cols-3 gap-2">
                  <button v-for="(label, key) in frequencies" :key="key" type="button"
                    @click="form.frequency = key"
                    class="py-2 rounded-xl border text-sm font-medium transition-all"
                    :class="form.frequency === key ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600'">
                    {{ label }}
                  </button>
                </div>
              </div>

              <div v-if="form.frequency === 'weekly'">
                <label class="block text-xs font-medium text-gray-600 mb-1">Day of Week <span class="text-red-500">*</span></label>
                <select v-model="form.day_of_week"
                  class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500">
                  <option v-for="(label, idx) in daysOfWeek" :key="idx" :value="idx">{{ label }}</option>
                </select>
              </div>

              <div v-if="form.frequency === 'monthly'">
                <label class="block text-xs font-medium text-gray-600 mb-1">Day of Month <span class="text-red-500">*</span></label>
                <select v-model="form.day_of_month"
                  class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500">
                  <option v-for="d in 28" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Send Time <span class="text-red-500">*</span></label>
                <input v-model="form.send_time" type="time"
                  class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500" />
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Recipients <span class="text-red-500">*</span></label>
                <div class="space-y-2">
                  <div v-for="(_, i) in form.recipients" :key="i" class="flex gap-2">
                    <input v-model="form.recipients[i]" type="email" placeholder="email@company.com"
                      class="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500" />
                    <button v-if="form.recipients.length > 1" type="button" @click="form.recipients.splice(i, 1)"
                      class="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                  </div>
                  <button type="button" @click="form.recipients.push('')"
                    class="text-xs text-teal-600 hover:text-teal-700 font-medium">
                    + Add recipient
                  </button>
                </div>
                <p v-if="formError" class="mt-1.5 text-xs text-red-500">{{ formError }}</p>
              </div>

            </div>

            <div class="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button @click="showScheduleModal = false"
                class="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-100">Cancel</button>
              <button @click="createSchedule" :disabled="savingSchedule"
                class="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style="background:linear-gradient(135deg,#006970,#00a9b4)">
                {{ savingSchedule ? 'Saving…' : 'Create Schedule' }}
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import {
  ClockIcon, ChevronRightIcon, DocumentTextIcon, DocumentIcon,
  PlusIcon, PauseIcon, PlayIcon, TrashIcon, XMarkIcon,
  PaperAirplaneIcon, ArrowDownTrayIcon, TableCellsIcon,
} from '@heroicons/vue/24/outline';
import { ClipboardDocumentCheckIcon, CalendarDaysIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/vue/24/outline';

const page    = usePage();
const roles   = computed(() => { const r = page.props.auth?.user?.roles ?? []; return Array.isArray(r) ? r : Object.values(r); });
const isAdmin = computed(() => roles.value.includes('Admin'));

// ── Report cards config ───────────────────────────────────────────────────────
const reportCards = computed(() => [
  {
    type: 'attendance', title: 'Attendance Reports', desc: 'Clock-in/out records and history',
    icon: ClipboardDocumentCheckIcon, bg: 'from-teal-50 to-cyan-50', borderColor: 'border-teal-100',
    iconBg: 'bg-teal-100', iconColor: 'text-teal-600',
    excel: route('reports.attendance.excel'),
  },
  {
    type: 'leaves', title: 'Leave Reports', desc: 'Applications, approvals and balances',
    icon: CalendarDaysIcon, bg: 'from-orange-50 to-amber-50', borderColor: 'border-orange-100',
    iconBg: 'bg-orange-100', iconColor: 'text-orange-600',
    excel: route('reports.leaves.excel'),
  },
  {
    type: 'timesheets', title: 'Timesheet Reports', desc: 'Work hours logged and approvals',
    icon: ClockIcon, bg: 'from-purple-50 to-indigo-50', borderColor: 'border-purple-100',
    iconBg: 'bg-purple-100', iconColor: 'text-purple-600',
    excel: route('reports.timesheets.excel'),
  },
  {
    type: 'feedbacks', title: 'Feedback Reports', desc: 'Employee ratings and satisfaction',
    icon: ChatBubbleLeftEllipsisIcon, bg: 'from-pink-50 to-rose-50', borderColor: 'border-pink-100',
    iconBg: 'bg-pink-100', iconColor: 'text-pink-600',
    excel: route('reports.feedbacks.excel'),
  },
]);

// ── Schedules ─────────────────────────────────────────────────────────────────
const schedules        = ref([]);
const loadingSchedules = ref(false);
const sendingId        = ref(null);

const loadSchedules = async () => {
  if (!isAdmin.value) return;
  loadingSchedules.value = true;
  try {
    const res = await axios.get(route('reports.schedules.index'));
    schedules.value = res.data.schedules;
  } catch (e) { console.error(e); }
  finally { loadingSchedules.value = false; }
};

const toggleActive = async (s) => {
  try {
    const res = await axios.patch(route('reports.schedules.toggle', s.id));
    s.is_active = res.data.is_active;
  } catch { alert('Failed to update.'); }
};

const deleteSchedule = async (s) => {
  if (!confirm(`Delete "${s.label || s.report_type_label}"?`)) return;
  try {
    await axios.delete(route('reports.schedules.destroy', s.id));
    schedules.value = schedules.value.filter(x => x.id !== s.id);
  } catch { alert('Failed to delete.'); }
};

const sendNow = async (s) => {
  sendingId.value = s.id;
  try {
    const res = await axios.post(route('reports.schedules.send-now', s.id));
    if (res.data.success) {
      alert(`Sent to: ${s.recipients.join(', ')}`);
      await loadSchedules();
    } else alert(res.data.message || 'Failed.');
  } catch (e) {
    const d = e.response?.data;
    console.log(e.response);
    alert((d?.message || 'Failed to send.') + (d?.file ? '\n' + d.file : ''));
  }
  finally { sendingId.value = null; }
};

// ── Create form ───────────────────────────────────────────────────────────────
const reportTypes  = { attendance: 'Attendance Report', leaves: 'Leave Report', timesheets: 'Timesheet Report', feedbacks: 'Feedback Report' };
const frequencies  = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };
const daysOfWeek   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const showScheduleModal = ref(false);
const savingSchedule    = ref(false);
const formError         = ref('');

const emptyForm = () => ({ label: '', report_type: '', report_format: 'excel', frequency: 'weekly', day_of_week: 1, day_of_month: 1, send_time: '08:00', recipients: [''] });
const form = ref(emptyForm());

watch(showScheduleModal, v => { if (!v) { form.value = emptyForm(); formError.value = ''; } });

const createSchedule = async () => {
  formError.value = '';
  const validEmails = form.value.recipients.filter(e => e.trim());
  if (!form.value.report_type) { formError.value = 'Select a report type.'; return; }
  if (!validEmails.length)     { formError.value = 'Add at least one recipient.'; return; }

  savingSchedule.value = true;
  try {
    const res = await axios.post(route('reports.schedules.store'), { ...form.value, recipients: validEmails });
    if (res.data.success) { schedules.value.unshift(res.data.schedule); showScheduleModal.value = false; }
  } catch (e) {
    const errors = e.response?.data?.errors;
    formError.value = errors ? Object.values(errors).flat().join(' ') : (e.response?.data?.message || 'Failed.');
  } finally { savingSchedule.value = false; }
};

onMounted(loadSchedules);
</script>
