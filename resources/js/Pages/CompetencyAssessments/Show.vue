<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Assessment Details"
      :subtitle="`${assessment.employee?.user?.name} - ${assessment.competency?.name}`"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Success Message -->
      <div v-if="$page.props.flash?.success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-sm text-green-800">{{ $page.props.flash.success }}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="$page.props.flash?.error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p class="text-sm text-red-800">{{ $page.props.flash.error }}</p>
        </div>
      </div>

      <!-- Modern Layout with Better Visual Hierarchy -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Hero Section with Assessment Overview -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
            <div class="px-8 py-6">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-4">
                    <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-lg font-semibold text-blue-600">
                        {{ getInitials(assessment.employee?.user?.name) }}
                      </span>
                    </div>
                    <div>
                      <h1 class="text-2xl font-bold text-gray-900">{{ assessment.employee?.user?.name }}</h1>
                      <p class="text-lg text-gray-600">{{ assessment.competency?.name }}</p>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white/60 rounded-lg p-3">
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</dt>
                      <dd class="mt-1 text-sm font-semibold text-gray-900">{{ formatAssessmentType(assessment.assessment_type) }}</dd>
                    </div>
                    <div class="bg-white/60 rounded-lg p-3">
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</dt>
                      <dd class="mt-1">
                        <span :class="getStatusClasses(assessment.status)" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium">
                          {{ formatStatus(assessment.status) }}
                        </span>
                      </dd>
                    </div>
                    <div class="bg-white/60 rounded-lg p-3">
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Assessor</dt>
                      <dd class="mt-1 text-sm font-semibold text-gray-900">{{ assessment.assessor?.name || 'Not assigned' }}</dd>
                    </div>
                    <div class="bg-white/60 rounded-lg p-3">
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</dt>
                      <dd class="mt-1 text-sm font-semibold text-gray-900">{{ formatDate(assessment.created_at) }}</dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rating Section -->
          <div v-if="assessment.rating" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-yellow-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <StarIcon class="w-5 h-5 text-yellow-500 mr-2" />
                Performance Rating
              </h3>
            </div>
            <div class="p-6">
              <div class="text-center">
                <div class="flex justify-center mb-4">
                  <StarIcon
                    v-for="i in 5"
                    :key="i"
                    :class="[
                      i <= assessment.rating ? 'text-yellow-400' : 'text-gray-300',
                      'h-8 w-8'
                    ]"
                  />
                </div>
                <div class="space-y-2">
                  <div class="text-4xl font-bold text-gray-900">{{ assessment.rating }}<span class="text-2xl text-gray-500">/5</span></div>
                  <div class="text-lg font-medium text-gray-600">{{ getRatingLabel(assessment.rating) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div v-if="assessment.comments" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.456-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                Assessment Comments
              </h3>
            </div>
            <div class="p-6">
              <div class="prose prose-sm max-w-none">
                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ assessment.comments }}</p>
              </div>
            </div>
          </div>

          <!-- Development Notes Section -->
          <div v-if="assessment.development_notes" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-purple-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Development Notes
              </h3>
            </div>
            <div class="p-6">
              <div class="prose prose-sm max-w-none">
                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ assessment.development_notes }}</p>
              </div>
            </div>
          </div>
          </div>

        <!-- Enhanced Sidebar -->
        <div class="space-y-6">
          <!-- Supporting Evidence Files -->
          <div v-if="assessment.evidence_files && assessment.evidence_files.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <DocumentIcon class="w-5 h-5 text-blue-600 mr-2" />
                Supporting Evidence
                <span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ assessment.evidence_files.length }}
                </span>
              </h3>
            </div>
            <div class="p-4">
              <div class="space-y-2">
                <div 
                  v-for="(fileName, index) in assessment.evidence_files" 
                  :key="index"
                  class="group flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-200"
                >
                  <div class="flex items-center min-w-0 flex-1">
                    <div class="flex-shrink-0">
                      <DocumentIcon class="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <div class="ml-3 min-w-0 flex-1">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ getFileName(fileName) }}</p>
                      <p class="text-xs text-gray-500">{{ getFileExtension(fileName) }}</p>
                    </div>
                  </div>
                  <button
                    @click="viewFile(fileName)"
                    class="ml-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <EyeIcon class="w-4 h-4 mr-1" />
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="canApprove && assessment.status === 'submitted'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Review Actions
              </h3>
            </div>
            <div class="p-6 space-y-3">
              <button
                @click="approveAssessment"
                :disabled="processing"
                class="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                <CheckIcon class="w-4 h-4 mr-2" />
                Approve Assessment
              </button>
              <button
                @click="rejectAssessment"
                :disabled="processing"
                class="w-full inline-flex items-center justify-center px-4 py-3 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                <XMarkIcon class="w-4 h-4 mr-2" />
                Reject Assessment
              </button>
            </div>
          </div>

          <!-- Competency Details -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Competency Info
              </h3>
            </div>
            <div class="p-6">
              <dl class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-3">
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</dt>
                  <dd class="mt-1 text-sm font-semibold text-gray-900">{{ assessment.competency?.category }}</dd>
                </div>
                <div v-if="assessment.competency?.description" class="bg-gray-50 rounded-lg p-3">
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</dt>
                  <dd class="mt-1 text-sm text-gray-700 leading-relaxed">{{ assessment.competency.description }}</dd>
                </div>
                <div v-if="assessment.competency?.weight" class="bg-gray-50 rounded-lg p-3">
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Weight</dt>
                  <dd class="mt-1 text-sm font-semibold text-gray-900">{{ assessment.competency.weight }}%</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Related Assessments -->
          <div v-if="relatedAssessments?.length" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Related Assessments
                <span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{ relatedAssessments.length }}
                </span>
              </h3>
            </div>
            <div class="p-4">
              <div class="space-y-2">
                <div
                  v-for="related in relatedAssessments"
                  :key="related.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900">
                      {{ formatAssessmentType(related.assessment_type) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ formatDate(related.created_at) }}
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                    <div v-if="related.rating" class="flex">
                      <StarIcon
                        v-for="i in 5"
                        :key="i"
                        :class="[
                          i <= related.rating ? 'text-yellow-400' : 'text-gray-300',
                          'h-3 w-3'
                        ]"
                      />
                    </div>
                    <Link
                      :href="route('competency-assessments.show', related.id)"
                      class="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- File Viewer Modal -->
      <FileViewerModal
        :show="showFileViewer"
        :fileName="selectedFileName"
        :fileUrl="selectedFileUrl"
        @close="closeFileViewer"
      />
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import {
  ArrowLeftIcon,
  PencilIcon,
  StarIcon,
  CheckIcon,
  XMarkIcon,
  DocumentIcon,
  EyeIcon
} from '@heroicons/vue/24/outline';
import FileViewerModal from '@/Components/Modals/FileViewerModal.vue';

const props = defineProps({
  assessment: Object,
  canEdit: Boolean,
  canApprove: Boolean,
  relatedAssessments: Array
});

const processing = ref(false);

// File viewer state
const showFileViewer = ref(false);
const selectedFileName = ref('');
const selectedFileUrl = ref('');

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Assessments', href: route('competency-assessments.index') },
  { label: 'Assessment Details', href: null }
]);

const headerActions = computed(() => {
  const actions = [];
  
  // Show Edit button if user can edit (controller handles the permission logic)
  if (props.canEdit) {
    actions.push({
      label: 'Edit Assessment',
      href: route('competency-assessments.edit', props.assessment.id),
      icon: PencilIcon,
      variant: 'primary'
    });
  }
  
  actions.push({
    label: 'Back to Assessments',
    href: route('competency-assessments.index'),
    icon: ArrowLeftIcon,
    variant: 'secondary'
  });
  
  return actions;
});

const approveAssessment = () => {
  if (confirm('Are you sure you want to approve this assessment?')) {
    processing.value = true;
    router.post(route('competency-assessments.approve', props.assessment.id), {}, {
      onFinish: () => {
        processing.value = false;
      }
    });
  }
};

const rejectAssessment = () => {
  const reason = prompt('Please provide a reason for rejection:');
  if (reason) {
    processing.value = true;
    router.post(route('competency-assessments.reject', props.assessment.id), {
      rejection_reason: reason
    }, {
      onFinish: () => {
        processing.value = false;
      }
    });
  }
};

const formatAssessmentType = (type) => {
  const types = {
    'self': 'Self Assessment',
    'manager': 'Manager Assessment',
    'peer': 'Peer Assessment',
    '360': '360° Feedback'
  };
  return types[type] || type;
};

// File viewer methods
const viewFile = (fileName) => {
  selectedFileName.value = fileName;
  selectedFileUrl.value = `/assessment-files/${props.assessment.id}/${fileName}`;
  showFileViewer.value = true;
};

const closeFileViewer = () => {
  showFileViewer.value = false;
  selectedFileName.value = '';
  selectedFileUrl.value = '';
};

const formatStatus = (status) => {
  const statuses = {
    'draft': 'Draft',
    'submitted': 'Submitted',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };
  return statuses[status] || status;
};

const getStatusClasses = (status) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getRatingLabel = (rating) => {
  const labels = {
    1: 'Needs Improvement',
    2: 'Below Expectations',
    3: 'Meets Expectations',
    4: 'Exceeds Expectations',
    5: 'Outstanding'
  };
  return labels[rating] || '';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper methods for the new layout
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getFileName = (filePath) => {
  if (!filePath) return '';
  const parts = filePath.split('/');
  return parts[parts.length - 1];
};

const getFileExtension = (filePath) => {
  if (!filePath) return '';
  const fileName = getFileName(filePath);
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
};
</script>