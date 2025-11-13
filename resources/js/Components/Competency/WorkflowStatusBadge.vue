<template>
    <span :class="badgeClasses">
        {{ statusText }}
    </span>
</template>

<script>
import { computed } from 'vue'

export default {
    props: {
        status: {
            type: String,
            required: true
        },
        workflowStatus: {
            type: Object,
            default: () => ({})
        }
    },
    setup(props) {
        const statusText = computed(() => {
            const { status, workflowStatus } = props
            
            if (workflowStatus.is_overdue) {
                return 'Overdue'
            }
            
            if (workflowStatus.has_extended_deadline) {
                return 'Extended'
            }
            
            switch (status) {
                case 'draft':
                    return 'Draft'
                case 'submitted':
                    return 'Pending Approval'
                case 'approved':
                    return 'Approved'
                case 'rejected':
                    return 'Rejected'
                default:
                    return status
            }
        })

        const badgeClasses = computed(() => {
            const { status, workflowStatus } = props
            const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
            
            if (workflowStatus.is_overdue) {
                return `${baseClasses} bg-red-100 text-red-800`
            }
            
            if (workflowStatus.has_extended_deadline) {
                return `${baseClasses} bg-yellow-100 text-yellow-800`
            }
            
            switch (status) {
                case 'draft':
                    return `${baseClasses} bg-gray-100 text-gray-800`
                case 'submitted':
                    return `${baseClasses} bg-teal-100 text-teal-800`
                case 'approved':
                    return `${baseClasses} bg-green-100 text-green-800`
                case 'rejected':
                    return `${baseClasses} bg-red-100 text-red-800`
                default:
                    return `${baseClasses} bg-gray-100 text-gray-800`
            }
        })

        return {
            statusText,
            badgeClasses
        }
    }
}
</script>