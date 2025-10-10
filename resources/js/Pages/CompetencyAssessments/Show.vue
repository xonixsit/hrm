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

      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 text-gray-900">

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Assessment Overview -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Assessment Overview</h3>
              </div>
              <div class="p-6">
                <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Employee</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ assessment.employee?.user?.name }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Competency</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ assessment.competency?.name }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Assessment Type</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatAssessmentType(assessment.assessment_type) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Status</dt>
                    <dd class="mt-1">
                      <span :class="getStatusClasses(assessment.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ formatStatus(assessment.status) }}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Assessor</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ assessment.assessor?.name || 'Not assigned' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Created Date</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatDate(assessment.created_at) }}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <!-- Rating -->
            <div v-if="assessment.rating" class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Rating</h3>
              </div>
              <div class="p-6">
                <div class="flex items-center space-x-4">
                  <div class="flex">
                    <StarIcon
                      v-for="i in 5"
                      :key="i"
                      :class="[
                        i <= assessment.rating ? 'text-yellow-400' : 'text-gray-300',
                        'h-6 w-6'
                      ]"
                    />
                  </div>
                  <span class="text-2xl font-bold text-gray-900">{{ assessment.rating }}/5</span>
                  <span class="text-sm text-gray-500">{{ getRatingLabel(assessment.rating) }}</span>
                </div>
              </div>
            </div>

            <!-- Comments -->
            <div v-if="assessment.comments" class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Comments</h3>
              </div>
              <div class="p-6">
                <p class="text-gray-700 whitespace-pre-wrap">{{ assessment.comments }}</p>
              </div>
            </div>

            <!-- Development Notes -->
            <div v-if="assessment.development_notes" class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Development Notes</h3>
              </div>
              <div class="p-6">
                <p class="text-gray-700 whitespace-pre-wrap">{{ assessment.development_notes }}</p>
              </div>
            </div>

            <!-- Supporting Evidence -->
            <div v-if="assessment.evidence_files && assessment.evidence_files.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Supporting Evidence</h3>
              </div>
              <div class="p-6">
                <div class="space-y-3">
                  <div 
                    v-for="(fileName, index) in assessment.evidence_files" 
                    :key="index"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div class="flex items-center">
                      <DocumentIcon class="w-5 h-5 text-gray-400 mr-3" />
                      <span class="text-sm text-gray-900">{{ fileName }}</span>
                    </div>
                    <button
                      @click="viewFile(fileName)"
                      class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <EyeIcon class="w-4 h-4 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Actions -->
            <div v-if="canApprove && assessment.status === 'submitted'" class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Actions</h3>
              </div>
              <div class="p-6 space-y-3">
                <button
                  @click="approveAssessment"
                  :disabled="processing"
                  class="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <CheckIcon class="w-4 h-4 mr-2" />
                  Approve Assessment
                </button>
                <button
                  @click="rejectAssessment"
                  :disabled="processing"
                  class="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <XMarkIcon class="w-4 h-4 mr-2" />
                  Reject Assessment
                </button>
              </div>
            </div>

            <!-- Competency Details -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Competency Details</h3>
              </div>
              <div class="p-6">
                <dl class="space-y-3">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Category</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ assessment.competency?.category }}</dd>
                  </div>
                  <div v-if="assessment.competency?.description">
                    <dt class="text-sm font-medium text-gray-500">Description</dt>
                    <dd class="mt-1 text-sm text-gray-700">{{ assessment.competency.description }}</dd>
                  </div>
                  <div v-if="assessment.competency?.weight">
                    <dt class="text-sm font-medium text-gray-500">Weight</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ assessment.competency.weight }}%</dd>
                  </div>
                </dl>
              </div>
            </div>

            <!-- Related Assessments -->
            <div v-if="relatedAssessments?.length" class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Related Assessments</h3>
              </div>
              <div class="p-6">
                <div class="space-y-3">
                  <div
                    v-for="related in relatedAssessments"
                    :key="related.id"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ formatAssessmentType(related.assessment_type) }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(related.created_at) }}
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
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
                        class="text-xs text-blue-600 hover:text-blue-900"
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
</script>