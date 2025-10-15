<script setup>
import { computed } from 'vue';
import { Head } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import FormLayout from '@/Components/Forms/FormLayout.vue';
import FormSection from '@/Components/Forms/FormSection.vue';
import UpdatePasswordForm from './Partials/UpdatePasswordForm.vue';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm.vue';
import UpdateEmployeeProfileForm from './Partials/UpdateEmployeeProfileForm.vue';
import { 
  CalendarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
    mustVerifyEmail: {
        type: Boolean,
    },
    status: {
        type: String,
    },
    employee: {
        type: Object,
        default: null,
    },
    user: {
        type: Object,
        required: true,
    },
});

const hasEmployeeProfile = computed(() => !!props.employee);

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

const formatDate = (date) => {
  if (!date) return 'Not provided';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calculateYearsOfService = () => {
  if (!props.employee?.join_date) return 'N/A';
  const joinDate = new Date(props.employee.join_date);
  const today = new Date();
  const years = today.getFullYear() - joinDate.getFullYear();
  const months = today.getMonth() - joinDate.getMonth();
  
  if (years === 0) {
    return months <= 0 ? 'Less than a month' : `${months} month${months > 1 ? 's' : ''}`;
  }
  
  return `${years} year${years > 1 ? 's' : ''}`;
};

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My Profile', current: true }
]);
</script>

<template>
    <Head title="My Profile" />

    <AuthenticatedLayout>
        <PageLayout 
            title="My Profile" 
            subtitle="Manage your personal information and account settings"
            :breadcrumbs="breadcrumbs"
        >
            <!-- Profile Overview -->
            <div v-if="hasEmployeeProfile" class="bg-neutral-50 rounded-lg p-4 mb-6">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span class="text-lg font-semibold text-primary-700">
                            {{ getInitials(user.name) }}
                        </span>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-neutral-900">{{ user.name }}</h3>
                        <p class="text-sm text-neutral-600">{{ employee.job_title || 'Employee' }}</p>
                        <div class="flex items-center space-x-2 mt-1">
                            <span class="text-xs text-neutral-500">Employee ID:</span>
                            <span class="text-xs font-mono bg-neutral-200 px-2 py-0.5 rounded">{{ employee.employee_code || 'N/A' }}</span>
                            <span class="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">{{ employee.department?.name || 'No Department' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Employee Profile Form -->
            <FormLayout 
                v-if="hasEmployeeProfile"
                title="Personal Information" 
                description="Update your personal details and contact information"
                variant="card"
            >
                <UpdateEmployeeProfileForm :employee="employee" :user="user" />
            </FormLayout>

            <!-- Account Settings -->
            <FormLayout 
                title="Account Settings" 
                description="Manage your account credentials and basic information"
                variant="card"
                class="mt-6"
            >
                <FormSection title="Email Settings" description="Update your email address and verification status">
                    <UpdateProfileInformationForm
                        :must-verify-email="mustVerifyEmail"
                        :status="status"
                    />
                </FormSection>
            </FormLayout>

            <!-- Password Security -->
            <FormLayout 
                title="Password Security" 
                description="Update your password to keep your account secure"
                variant="card"
                class="mt-6"
            >
                <FormSection title="Change Password" description="Choose a strong password to protect your account">
                    <UpdatePasswordForm />
                </FormSection>
            </FormLayout>

            <!-- Employment Summary -->
            <div v-if="hasEmployeeProfile" class="mt-6">
                <FormLayout 
                    title="Employment Summary" 
                    description="Your current employment information"
                    variant="card"
                >
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div class="bg-neutral-50 rounded-lg p-4">
                            <div class="flex items-center space-x-3">
                                <CalendarIcon class="h-8 w-8 text-primary-600" />
                                <div>
                                    <p class="text-sm font-medium text-neutral-600">Time with Company</p>
                                    <p class="text-lg font-semibold text-neutral-900">{{ calculateYearsOfService() }}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-neutral-50 rounded-lg p-4">
                            <div class="flex items-center space-x-3">
                                <BuildingOfficeIcon class="h-8 w-8 text-success-600" />
                                <div>
                                    <p class="text-sm font-medium text-neutral-600">Department</p>
                                    <p class="text-sm font-semibold text-neutral-900">{{ employee.department?.name || 'N/A' }}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-neutral-50 rounded-lg p-4">
                            <div class="flex items-center space-x-3">
                                <PhoneIcon class="h-8 w-8 text-info-600" />
                                <div>
                                    <p class="text-sm font-medium text-neutral-600">Contact</p>
                                    <p class="text-sm font-semibold text-neutral-900">{{ employee.phone || 'Not provided' }}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-neutral-50 rounded-lg p-4">
                            <div class="flex items-center space-x-3">
                                <EnvelopeIcon class="h-8 w-8 text-warning-600" />
                                <div>
                                    <p class="text-sm font-medium text-neutral-600">Email</p>
                                    <p class="text-sm font-semibold text-neutral-900 truncate">{{ user.email }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <dt class="text-sm font-medium text-neutral-500">Job Title</dt>
                            <dd class="text-sm font-medium text-neutral-900 mt-1">{{ employee.job_title || 'Not specified' }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-neutral-500">Manager</dt>
                            <dd class="text-sm font-medium text-neutral-900 mt-1">{{ employee.manager?.name || 'Not assigned' }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-neutral-500">Join Date</dt>
                            <dd class="text-sm font-medium text-neutral-900 mt-1">{{ formatDate(employee.join_date) }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-neutral-500">Employment Type</dt>
                            <dd class="text-sm font-medium text-neutral-900 mt-1">{{ employee.employment_type || 'Full Time' }}</dd>
                        </div>
                    </div>
                </FormLayout>
            </div>

            <!-- No Employee Profile Message -->
            <div v-if="!hasEmployeeProfile" class="bg-warning-50 border border-warning-200 rounded-lg p-6">
                <div class="flex items-start space-x-3">
                    <svg class="w-6 h-6 text-warning-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 class="text-lg font-medium text-warning-800">Employee Profile Not Found</h3>
                        <p class="text-sm text-warning-700 mt-1">
                            Your employee profile hasn't been set up yet. Please contact HR to complete your employee profile setup.
                        </p>
                    </div>
                </div>
            </div>
        </PageLayout>
    </AuthenticatedLayout>
</template>