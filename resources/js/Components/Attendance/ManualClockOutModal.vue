<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      @click="handleBackdropClick"
    >
      <div
        class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300"
        @click.stop
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-white">Manual Clock Out</h3>
            </div>
            <button
              @click="close"
              class="text-white hover:text-gray-200 transition-colors"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Employee Info -->
          <div class="mb-6">
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-blue-700">
                    {{ getEmployeeInitials(attendance.employee?.user?.name) }}
                  </span>
                </div>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ attendance.employee?.user?.name || 'N/A' }}
                </p>
                <p class="text-xs text-gray-500">
                  Clocked in: {{ formatTime(attendance.clock_in) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Clock Out Time -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Clock Out Time
            </label>
            <input
              v-model="clockOutTime"
              type="datetime-local"
              :min="getMinDateTime()"
              :max="getCurrentDateTime()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
            <p class="mt-1 text-xs text-gray-500">
              Must be after clock-in time and not in the future
            </p>
          </div>

          <!-- Reason -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Reason for Manual Clock Out
            </label>
            <textarea
              v-model="reason"
              rows="3"
              placeholder="Please provide a reason for the manual clock out (e.g., forgot to clock out, system issue, etc.)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
              required
            ></textarea>
          </div>

          <!-- Warning -->
          <div class="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div class="flex items-start space-x-2">
              <svg class="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="text-sm font-medium text-amber-800">Important Notice</p>
                <p class="text-xs text-amber-700 mt-1">
                  This action will manually clock out the employee and cannot be undone. The reason will be logged for audit purposes.
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3">
            <button
              @click="close"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleClockOut"
              :disabled="!isFormValid || processing"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="processing" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>Clock Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  attendance: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'success'])

const clockOutTime = ref('')
const reason = ref('')
const processing = ref(false)

const isFormValid = computed(() => {
  return clockOutTime.value && reason.value.trim().length > 0
})

const getEmployeeInitials = (name) => {
  if (!name) return '--'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatTime = (timeString) => {
  if (!timeString) return '-'
  
  try {
    const time = new Date(timeString)
    if (isNaN(time.getTime())) return '-'
    
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    return '-'
  }
}

const getMinDateTime = () => {
  if (!props.attendance.clock_in) return ''
  
  try {
    const clockIn = new Date(props.attendance.clock_in)
    // Add 1 minute to ensure clock out is after clock in
    clockIn.setMinutes(clockIn.getMinutes() + 1)
    return clockIn.toISOString().slice(0, 16)
  } catch (error) {
    return ''
  }
}

const getCurrentDateTime = () => {
  return new Date().toISOString().slice(0, 16)
}

const handleBackdropClick = () => {
  close()
}

const close = () => {
  emit('close')
}

const handleClockOut = async () => {
  if (!isFormValid.value) return
  
  processing.value = true
  
  try {
    const response = await axios.post(route('attendances.manual-clock-out'), {
      attendance_id: props.attendance.id,
      clock_out_time: clockOutTime.value,
      reason: reason.value.trim()
    })
    
    if (response.data.success) {
      emit('success', response.data)
      close()
    } else {
      alert(response.data.message || 'Failed to clock out')
    }
  } catch (error) {
    console.error('Clock out error:', error)
    alert(error.response?.data?.message || 'An error occurred while clocking out')
  } finally {
    processing.value = false
  }
}

onMounted(() => {
  // Set default clock out time to current time
  clockOutTime.value = getCurrentDateTime()
})
</script>
</template>