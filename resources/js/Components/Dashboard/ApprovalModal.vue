<template>
  <!-- Approval Modal - Exact copy from PendingApprovals -->
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50" @click="closeModalOnBackdrop">
    <div class="flex items-center justify-center min-h-screen px-4 py-6">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" @click.stop>
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ action === 'approve' ? 'Approve' : 'Reject' }} {{ approval?.leave_type ? 'Leave Request' : 'Timesheet' }}
        </h3>
        
        <div class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm">
              <div class="font-medium text-gray-900">{{ approval?.employee?.user?.name || approval?.requester || 'Unknown User' }}</div>
              
              <!-- For Leave Applications -->
              <div v-if="approval?.leave_type" class="text-gray-600">
                <div>{{ approval.leave_type.name }}</div>
                <div>{{ formatDate(approval.from_date) }} - {{ formatDate(approval.to_date) }}</div>
                <div v-if="approval.reason">{{ approval.reason }}</div>
              </div>
              
              <!-- For Timesheets -->
              <div v-else class="text-gray-600">
                <div>{{ formatDate(approval?.date || approval?.created_at) }}{{ approval?.hours ? ` - ${approval.hours}h` : (approval?.stats?.total_hours ? ` - ${approval.stats.total_hours}` : '') }}</div>
                <div>{{ approval?.project?.name || approval?.title || 'No project' }}</div>
              </div>
            </div>
          </div>

          <!-- Work Report Context (only for timesheets) -->
          <div v-if="approval?.work_report && !approval?.leave_type" class="bg-teal-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-teal-900 mb-2">Work Report Context</h4>
            <div class="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span class="text-teal-700">Calls:</span> {{ approval.work_report.successful_calls }}/{{ approval.work_report.calls }}
              </div>
              <div>
                <span class="text-teal-700">Emails:</span> {{ approval.work_report.emails }}
              </div>
              <div>
                <span class="text-teal-700">WhatsApp:</span> {{ approval.work_report.whatsapp }}
              </div>
            </div>
          </div>

          <!-- Discrepancy Warning (only for timesheets) -->
          <div v-if="approval?.has_discrepancy && !approval?.leave_type" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div>
                <h4 class="text-sm font-medium text-yellow-800">Time Discrepancy Detected</h4>
                <p class="text-sm text-yellow-700 mt-1">{{ approval.has_discrepancy.message }}</p>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Comments {{ action === 'reject' ? '(Required)' : '(Optional)' }}
            </label>
            <textarea
              v-model="comments"
              rows="3"
              :required="action === 'reject'"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :placeholder="action === 'approve' ? 'Add approval comments...' : 'Please provide reason for rejection...'"
            ></textarea>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="action === 'reject' && !comments.trim()"
            :class="[
              'px-4 py-2 text-sm font-medium text-white rounded-lg',
              action === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700',
              (action === 'reject' && !comments.trim()) ? 'opacity-50 cursor-not-allowed' : ''
            ]"
          >
            {{ action === 'approve' ? 'Approve' : 'Reject' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  approval: {
    type: Object,
    default: null
  },
  action: {
    type: String,
    default: 'approve'
  }
});

const emit = defineEmits(['close', 'submit']);

const comments = ref('');

// Reset comments when modal opens/closes
watch(() => props.show, (newValue) => {
  if (newValue) {
    comments.value = '';
  }
});

const closeModalOnBackdrop = (event) => {
  if (event.target === event.currentTarget) {
    emit('close');
  }
};

const handleSubmit = () => {
  if (props.action === 'reject' && !comments.value.trim()) {
    return;
  }

  emit('submit', {
    approval: props.approval,
    action: props.action,
    comments: comments.value.trim()
  });
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

<style scoped>
/* Modal animations */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active, .modal-content-leave-active {
  transition: transform 0.3s ease;
}

.modal-content-enter-from, .modal-content-leave-to {
  transform: scale(0.9);
}
</style>