<template>
  <AuthenticatedLayout>
    <PageLayout
      :title="cycle.name"
      subtitle="Assessment cycle details and progress"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Success Message -->
      <div v-if="$page.props.flash?.success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
        <p class="text-sm text-green-800">{{ $page.props.flash.success }}</p>
      </div>

      <!-- Error Message -->
      <div v-if="$page.props.flash?.error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-800">{{ $page.props.flash.error }}</p>
      </div>
              <Link
                v-if="cycle.status === 'planned'"
                :href="route('assessment-cycles.edit', cycle.id)"
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilIcon class="w-4 h-4 mr-2" />
                Edit Cycle
              </Link>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Cycle Overview -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Cycle Overview</h3>
              </div>
              <div class="p-6">
                <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Status</dt>
                    <dd class="mt-1">
                      <span :class="getStatusClasses(cycle.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ formatStatus(cycle.status) }}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Progress</dt>
                    <dd class="mt-1">
                      <div class="flex items-center">
                        <div class="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            class="bg-blue-600 h-2 rounded-full"
                            :style="{ width: `${cycle.completion_percentage || 0}%` }"
                          ></div>
                        </div>
                        <span class="text-sm font-medium text-gray-900">{{ cycle.completion_percentage || 0 }}%</span>
                      </div>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Start Date</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatDate(cycle.start_date) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">End Date</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatDate(cycle.end_date) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Participants</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ cycle.participant_count || 0 }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Total Assessments</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ cycle.assessment_count || 0 }}</dd>
                  </div>
                </dl>
                
                <div v-if="cycle.description" class="mt-6">
                  <dt class="text-sm font-medium text-gray-500">Description</dt>
                  <dd class="mt-1 text-sm text-gray-700">{{ cycle.description }}</dd>
                </div>
              </div>
            </div>

            <!-- Assessments -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Assessments</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Competency
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="assessment in assessments.data" :key="assessment.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">
                          {{ assessment.employee?.user?.name || 'Unknown' }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ assessment.competency?.name }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {{ formatAssessmentType(assessment.assessment_type) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="getAssessmentStatusClasses(assessment.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {{ formatAssessmentStatus(assessment.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div v-if="assessment.rating" class="flex items-center">
                          <div class="flex">
                            <StarIcon
                              v-for="i in 5"
                              :key="i"
                              :class="[
                                i <= assessment.rating ? 'text-yellow-400' : 'text-gray-300',
                                'h-4 w-4'
                              ]"
                            />
                          </div>
                          <span class="ml-2 text-sm text-gray-600">{{ assessment.rating }}/5</span>
                        </div>
                        <span v-else class="text-sm text-gray-400">Not rated</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex items-center justify-end space-x-2">
                          <Link
                            v-if="assessment.status === 'draft'"
                            :href="route('competency-assessments.evaluate', assessment.id)"
                            class="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <PencilIcon class="w-3 h-3 mr-1" />
                            Assess
                          </Link>
                          <Link
                            v-else
                            :href="route('competency-assessments.show', assessment.id)"
                            class="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Pagination -->
              <div v-if="assessments.links" class="px-6 py-3 border-t border-gray-200">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-700">
                    Showing {{ assessments.from }} to {{ assessments.to }} of {{ assessments.total }} results
                  </div>
                  <div class="flex space-x-1">
                    <Link
                      v-for="link in assessments.links"
                      :key="link.label"
                      :href="link.url"
                      :class="[
                        'px-3 py-2 text-sm font-medium rounded-md',
                        link.active
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      ]"
                      v-html="link.label"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Actions -->
            <div v-if="cycle.status === 'planned'" class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Actions</h3>
              </div>
              <div class="p-6 space-y-3">
                <!-- Start Date Info -->
                <div v-if="isStartDateInFuture" class="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div class="flex">
                    <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                    <div class="text-sm text-yellow-800">
                      <p class="font-medium">Scheduled Start</p>
                      <p>This cycle is scheduled to start on {{ formatDate(cycle.start_date) }}.</p>
                      <p class="mt-1 text-xs">As an admin, you can start it early if needed.</p>
                    </div>
                  </div>
                </div>
                
                <button
                  @click="startCycle"
                  :disabled="processing"
                  class="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <PlayIcon class="w-4 h-4 mr-2" />
                  {{ isStartDateInFuture ? 'Start Early' : 'Start Cycle' }}
                </button>
              </div>
            </div>

            <div v-if="cycle.status === 'active'" class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Actions</h3>
              </div>
              <div class="p-6 space-y-3">
                <button
                  @click="completeCycle"
                  :disabled="processing"
                  class="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <CheckIcon class="w-4 h-4 mr-2" />
                  Complete Cycle
                </button>
              </div>
            </div>

            <!-- Cycle Details -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Assessment Types</h3>
              </div>
              <div class="p-6">
                <div class="space-y-2">
                  <span
                    v-for="type in cycle.assessment_types"
                    :key="type"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
                  >
                    {{ formatAssessmentType(type) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
  PlayIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  cycle: Object,
  assessments: Object
});

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Assessment Dashboard', href: route('assessment-dashboard') },
  { label: 'Assessment Cycles', href: route('assessment-cycle-manager') },
  { label: props.cycle.name, href: null }
]);

const headerActions = computed(() => {
  const actions = [
    {
      label: 'Back to Cycles',
      href: route('assessment-cycle-manager'),
      icon: ArrowLeftIcon,
      variant: 'secondary'
    }
  ];

  // Add edit action if cycle can be edited
  if (props.cycle.status === 'planned' || props.cycle.status === 'draft') {
    actions.push({
      label: 'Edit Cycle',
      href: route('assessment-cycles.edit', props.cycle.id),
      icon: PencilIcon,
      variant: 'secondary'
    });
  }

  // Add start action if cycle can be started
  if (props.cycle.status === 'planned' && !isStartDateInFuture.value) {
    actions.push({
      label: 'Start Cycle',
      onClick: startCycle,
      icon: PlayIcon,
      variant: 'primary',
      disabled: processing.value
    });
  }

  return actions;
});

const processing = ref(false);

const isStartDateInFuture = computed(() => {
  return new Date(props.cycle.start_date) > new Date();
});

const startCycle = () => {
  console.log('Start cycle clicked for:', props.cycle.name);
  if (confirm(`Are you sure you want to start the "${props.cycle.name}" assessment cycle?`)) {
    console.log('Starting cycle...');
    processing.value = true;
    router.post(route('assessment-cycles.start', props.cycle.id), {}, {
      onSuccess: (page) => {
        console.log('Start cycle success:', page);
      },
      onError: (errors) => {
        console.error('Start cycle error:', errors);
      },
      onFinish: () => {
        console.log('Start cycle finished');
        processing.value = false;
      }
    });
  }
};

const completeCycle = () => {
  console.log('Complete cycle clicked for:', props.cycle.name);
  if (confirm(`Are you sure you want to complete the "${props.cycle.name}" assessment cycle?`)) {
    console.log('Completing cycle...');
    processing.value = true;
    router.post(route('assessment-cycles.complete', props.cycle.id), {}, {
      onSuccess: (page) => {
        console.log('Complete cycle success:', page);
      },
      onError: (errors) => {
        console.error('Complete cycle error:', errors);
      },
      onFinish: () => {
        console.log('Complete cycle finished');
        processing.value = false;
      }
    });
  }
};

const formatStatus = (status) => {
  const statuses = {
    'planned': 'Planned',
    'active': 'Active',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  return statuses[status] || status;
};

const getStatusClasses = (status) => {
  const classes = {
    'planned': 'bg-gray-100 text-gray-800',
    'active': 'bg-green-100 text-green-800',
    'completed': 'bg-blue-100 text-blue-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
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

const formatAssessmentStatus = (status) => {
  const statuses = {
    'draft': 'Draft',
    'submitted': 'Submitted',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };
  return statuses[status] || status;
};

const getAssessmentStatusClasses = (status) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>