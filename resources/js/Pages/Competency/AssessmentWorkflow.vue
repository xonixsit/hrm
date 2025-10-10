<template>
    <AppLayout title="Assessment Workflow Management">
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                Assessment Workflow Management
            </h2>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <!-- Workflow Statistics -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Pending Approvals</p>
                                    <p class="text-2xl font-semibold text-gray-900">{{ statistics.pending_approvals || 0 }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Overdue Assessments</p>
                                    <p class="text-2xl font-semibold text-gray-900">{{ statistics.overdue_assessments || 0 }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Extended Deadlines</p>
                                    <p class="text-2xl font-semibold text-gray-900">{{ statistics.extended_deadlines || 0 }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Avg. Approval Time</p>
                                    <p class="text-2xl font-semibold text-gray-900">{{ Math.round(statistics.approval_turnaround_time || 0) }}h</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pending Approvals Table -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-medium text-gray-900">Pending Approvals</h3>
                            <div class="flex space-x-2">
                                <button
                                    @click="bulkApprove"
                                    :disabled="selectedAssessments.length === 0"
                                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    Bulk Approve
                                </button>
                                <button
                                    @click="bulkReject"
                                    :disabled="selectedAssessments.length === 0"
                                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                    Bulk Reject
                                </button>
                            </div>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                @change="toggleSelectAll"
                                                :checked="allSelected"
                                                class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            >
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Employee
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Competency
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assessor
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Submitted
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="assessment in pendingApprovals" :key="assessment.id">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                :value="assessment.id"
                                                v-model="selectedAssessments"
                                                class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            >
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm font-medium text-gray-900">{{ assessment.employee_name }}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">{{ assessment.competency_name }}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">{{ assessment.assessor_name }}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <RatingDisplay :rating="assessment.rating" :max="5" />
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {{ formatDate(assessment.submitted_at) }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div class="flex space-x-2">
                                                <button
                                                    @click="approveAssessment(assessment.id)"
                                                    class="text-green-600 hover:text-green-900"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    @click="rejectAssessment(assessment.id)"
                                                    class="text-red-600 hover:text-red-900"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    @click="viewWorkflowHistory(assessment.id)"
                                                    class="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    History
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Workflow History Modal -->
                <div v-if="showHistoryModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div class="mt-3">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-medium text-gray-900">Assessment Workflow History</h3>
                                <button @click="showHistoryModal = false" class="text-gray-400 hover:text-gray-600">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <div class="space-y-4">
                                <!-- Status Changes -->
                                <div v-if="workflowHistory.status_logs && workflowHistory.status_logs.length > 0">
                                    <h4 class="font-medium text-gray-900 mb-2">Status Changes</h4>
                                    <div class="space-y-2">
                                        <div v-for="log in workflowHistory.status_logs" :key="log.id" class="flex items-center space-x-3 text-sm">
                                            <span class="text-gray-500">{{ formatDate(log.created_at) }}</span>
                                            <span class="font-medium">{{ log.changed_by_name }}</span>
                                            <span>changed status from</span>
                                            <span class="px-2 py-1 text-xs rounded-full bg-gray-100">{{ log.old_status }}</span>
                                            <span>to</span>
                                            <span class="px-2 py-1 text-xs rounded-full bg-blue-100">{{ log.new_status }}</span>
                                            <span v-if="log.reason" class="text-gray-500">- {{ log.reason }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Deadline Extensions -->
                                <div v-if="workflowHistory.deadline_extensions && workflowHistory.deadline_extensions.length > 0">
                                    <h4 class="font-medium text-gray-900 mb-2">Deadline Extensions</h4>
                                    <div class="space-y-2">
                                        <div v-for="extension in workflowHistory.deadline_extensions" :key="extension.id" class="flex items-center space-x-3 text-sm">
                                            <span class="text-gray-500">{{ formatDate(extension.created_at) }}</span>
                                            <span class="font-medium">{{ extension.extended_by_name }}</span>
                                            <span>extended deadline to</span>
                                            <span class="font-medium">{{ formatDate(extension.new_deadline) }}</span>
                                            <span v-if="extension.reason" class="text-gray-500">- {{ extension.reason }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Reassignments -->
                                <div v-if="workflowHistory.reassignments && workflowHistory.reassignments.length > 0">
                                    <h4 class="font-medium text-gray-900 mb-2">Reassignments</h4>
                                    <div class="space-y-2">
                                        <div v-for="reassignment in workflowHistory.reassignments" :key="reassignment.id" class="flex items-center space-x-3 text-sm">
                                            <span class="text-gray-500">{{ formatDate(reassignment.created_at) }}</span>
                                            <span class="font-medium">{{ reassignment.reassigned_by_name }}</span>
                                            <span>reassigned from</span>
                                            <span class="font-medium">{{ reassignment.old_assessor_name }}</span>
                                            <span>to</span>
                                            <span class="font-medium">{{ reassignment.new_assessor_name }}</span>
                                            <span v-if="reassignment.reason" class="text-gray-500">- {{ reassignment.reason }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/Layouts/AppLayout.vue'
import RatingDisplay from '@/Components/Competency/RatingDisplay.vue'
import WorkflowStatusBadge from '@/Components/Competency/WorkflowStatusBadge.vue'
import BulkActionModal from '@/Components/Competency/BulkActionModal.vue'
import { router } from '@inertiajs/vue3'

export default {
    components: {
        AppLayout,
        RatingDisplay,
        WorkflowStatusBadge,
        BulkActionModal
    },
    setup() {
        const statistics = ref({})
        const pendingApprovals = ref([])
        const selectedAssessments = ref([])
        const showHistoryModal = ref(false)
        const workflowHistory = ref({})
        const loading = ref(false)

        const allSelected = computed(() => {
            return pendingApprovals.value.length > 0 && 
                   selectedAssessments.value.length === pendingApprovals.value.length
        })

        const loadDashboardData = async () => {
            try {
                loading.value = true
                const response = await fetch('/assessment-workflow/dashboard')
                const data = await response.json()
                
                statistics.value = data.statistics
                pendingApprovals.value = data.pending_approvals
            } catch (error) {
                console.error('Failed to load dashboard data:', error)
            } finally {
                loading.value = false
            }
        }

        const toggleSelectAll = () => {
            if (allSelected.value) {
                selectedAssessments.value = []
            } else {
                selectedAssessments.value = pendingApprovals.value.map(a => a.id)
            }
        }

        const approveAssessment = async (assessmentId) => {
            try {
                const response = await fetch(`/competency-assessments/${assessmentId}/transition-status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({
                        status: 'approved'
                    })
                })

                if (response.ok) {
                    await loadDashboardData()
                } else {
                    console.error('Failed to approve assessment')
                }
            } catch (error) {
                console.error('Error approving assessment:', error)
            }
        }

        const rejectAssessment = async (assessmentId) => {
            const reason = prompt('Please provide a reason for rejection:')
            if (!reason) return

            try {
                const response = await fetch(`/competency-assessments/${assessmentId}/transition-status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({
                        status: 'rejected',
                        reason: reason
                    })
                })

                if (response.ok) {
                    await loadDashboardData()
                } else {
                    console.error('Failed to reject assessment')
                }
            } catch (error) {
                console.error('Error rejecting assessment:', error)
            }
        }

        const bulkApprove = async () => {
            if (selectedAssessments.value.length === 0) return

            try {
                const response = await fetch('/assessment-workflow/bulk-process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({
                        assessment_ids: selectedAssessments.value,
                        action: 'approve'
                    })
                })

                if (response.ok) {
                    selectedAssessments.value = []
                    await loadDashboardData()
                } else {
                    console.error('Failed to bulk approve assessments')
                }
            } catch (error) {
                console.error('Error bulk approving assessments:', error)
            }
        }

        const bulkReject = async () => {
            if (selectedAssessments.value.length === 0) return

            const reason = prompt('Please provide a reason for bulk rejection:')
            if (!reason) return

            try {
                const response = await fetch('/assessment-workflow/bulk-process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({
                        assessment_ids: selectedAssessments.value,
                        action: 'reject',
                        reason: reason
                    })
                })

                if (response.ok) {
                    selectedAssessments.value = []
                    await loadDashboardData()
                } else {
                    console.error('Failed to bulk reject assessments')
                }
            } catch (error) {
                console.error('Error bulk rejecting assessments:', error)
            }
        }

        const viewWorkflowHistory = async (assessmentId) => {
            try {
                const response = await fetch(`/competency-assessments/${assessmentId}/workflow-history`)
                const data = await response.json()
                
                workflowHistory.value = data
                showHistoryModal.value = true
            } catch (error) {
                console.error('Failed to load workflow history:', error)
            }
        }

        const formatDate = (dateString) => {
            if (!dateString) return ''
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        onMounted(() => {
            loadDashboardData()
        })

        return {
            statistics,
            pendingApprovals,
            selectedAssessments,
            showHistoryModal,
            workflowHistory,
            loading,
            allSelected,
            toggleSelectAll,
            approveAssessment,
            rejectAssessment,
            bulkApprove,
            bulkReject,
            viewWorkflowHistory,
            formatDate
        }
    }
}
</script>