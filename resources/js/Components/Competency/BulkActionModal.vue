<template>
    <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">
                        {{ modalTitle }}
                    </h3>
                    <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div class="mb-4">
                    <p class="text-sm text-gray-600">
                        You are about to {{ action }} {{ selectedCount }} assessment(s).
                    </p>
                </div>

                <!-- Action-specific fields -->
                <div class="space-y-4">
                    <!-- Reason field for reject, extend deadline, reassign -->
                    <div v-if="showReasonField">
                        <label for="reason" class="block text-sm font-medium text-gray-700">
                            {{ reasonLabel }}
                        </label>
                        <textarea
                            id="reason"
                            v-model="form.reason"
                            rows="3"
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            :placeholder="reasonPlaceholder"
                            :required="reasonRequired"
                        ></textarea>
                    </div>

                    <!-- New deadline field for extend deadline -->
                    <div v-if="action === 'extend_deadline'">
                        <label for="new_deadline" class="block text-sm font-medium text-gray-700">
                            New Deadline
                        </label>
                        <input
                            id="new_deadline"
                            type="datetime-local"
                            v-model="form.new_deadline"
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        >
                    </div>

                    <!-- New assessor field for reassign -->
                    <div v-if="action === 'reassign'">
                        <label for="new_assessor" class="block text-sm font-medium text-gray-700">
                            New Assessor
                        </label>
                        <select
                            id="new_assessor"
                            v-model="form.new_assessor_id"
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        >
                            <option value="">Select an assessor...</option>
                            <option v-for="user in availableAssessors" :key="user.id" :value="user.id">
                                {{ user.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <!-- Action buttons -->
                <div class="flex justify-end space-x-3 mt-6">
                    <button
                        @click="$emit('close')"
                        type="button"
                        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        @click="handleSubmit"
                        :disabled="!isFormValid || processing"
                        :class="submitButtonClasses"
                        class="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        <span v-if="processing">Processing...</span>
                        <span v-else>{{ submitButtonText }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
    props: {
        show: {
            type: Boolean,
            default: false
        },
        action: {
            type: String,
            required: true
        },
        selectedCount: {
            type: Number,
            required: true
        },
        availableAssessors: {
            type: Array,
            default: () => []
        }
    },
    emits: ['close', 'submit'],
    setup(props, { emit }) {
        const processing = ref(false)
        const form = ref({
            reason: '',
            new_deadline: '',
            new_assessor_id: ''
        })

        const modalTitle = computed(() => {
            switch (props.action) {
                case 'approve':
                    return 'Bulk Approve Assessments'
                case 'reject':
                    return 'Bulk Reject Assessments'
                case 'extend_deadline':
                    return 'Extend Assessment Deadlines'
                case 'reassign':
                    return 'Reassign Assessments'
                default:
                    return 'Bulk Action'
            }
        })

        const showReasonField = computed(() => {
            return ['reject', 'extend_deadline', 'reassign'].includes(props.action)
        })

        const reasonRequired = computed(() => {
            return props.action === 'reject'
        })

        const reasonLabel = computed(() => {
            switch (props.action) {
                case 'reject':
                    return 'Rejection Reason *'
                case 'extend_deadline':
                    return 'Extension Reason'
                case 'reassign':
                    return 'Reassignment Reason'
                default:
                    return 'Reason'
            }
        })

        const reasonPlaceholder = computed(() => {
            switch (props.action) {
                case 'reject':
                    return 'Please provide a reason for rejecting these assessments...'
                case 'extend_deadline':
                    return 'Optional reason for extending the deadline...'
                case 'reassign':
                    return 'Optional reason for reassigning these assessments...'
                default:
                    return 'Enter reason...'
            }
        })

        const submitButtonText = computed(() => {
            switch (props.action) {
                case 'approve':
                    return 'Approve All'
                case 'reject':
                    return 'Reject All'
                case 'extend_deadline':
                    return 'Extend Deadlines'
                case 'reassign':
                    return 'Reassign All'
                default:
                    return 'Submit'
            }
        })

        const submitButtonClasses = computed(() => {
            switch (props.action) {
                case 'approve':
                    return 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                case 'reject':
                    return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                case 'extend_deadline':
                    return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                case 'reassign':
                    return 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500'
                default:
                    return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
            }
        })

        const isFormValid = computed(() => {
            if (props.action === 'reject' && !form.value.reason.trim()) {
                return false
            }
            if (props.action === 'extend_deadline' && !form.value.new_deadline) {
                return false
            }
            if (props.action === 'reassign' && !form.value.new_assessor_id) {
                return false
            }
            return true
        })

        const handleSubmit = () => {
            if (!isFormValid.value || processing.value) return

            processing.value = true
            emit('submit', {
                action: props.action,
                ...form.value
            })
        }

        // Reset form when modal closes
        watch(() => props.show, (newShow) => {
            if (!newShow) {
                processing.value = false
                form.value = {
                    reason: '',
                    new_deadline: '',
                    new_assessor_id: ''
                }
            }
        })

        return {
            processing,
            form,
            modalTitle,
            showReasonField,
            reasonRequired,
            reasonLabel,
            reasonPlaceholder,
            submitButtonText,
            submitButtonClasses,
            isFormValid,
            handleSubmit
        }
    }
}
</script>