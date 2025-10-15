<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import DeleteUserForm from './Partials/DeleteUserForm.vue';
import UpdatePasswordForm from './Partials/UpdatePasswordForm.vue';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm.vue';
import UpdateEmployeeProfileForm from './Partials/UpdateEmployeeProfileForm.vue';
import { Head } from '@inertiajs/vue3';
import { computed } from 'vue';
import { 
  UserIcon, 
  BriefcaseIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon
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
</script>

<template>
    <Head title="My Profile" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center space-x-4">
                <div class="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span class="text-lg font-bold text-white">
                        {{ getInitials(user.name) }}
                    </span>
                </div>
                <div>
                    <h2 class="text-2xl font-bold leading-tight text-gray-900">
                        My Profile
                    </h2>
                    <p class="text-sm text-gray-600">
                        Manage your personal information and account settings
                    </p>
                </div>
            </div>
        </template>

        <div class="py-8">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <!-- Profile Overview Card -->
                <div v-if="hasEmployeeProfile" class="mb-8 bg-white overflow-hidden shadow-sm rounded-lg">
                    <div class="relative">
                        <!-- Cover Background -->
                        <div class="h-32 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600"></div>
                        
                        <!-- Profile Info Overlay -->
                        <div class="relative px-6 pb-6">
                            <div class="flex items-end space-x-6 -mt-16">
                                <!-- Avatar -->
                                <div class="flex-shrink-0">
                                    <div class="h-24 w-24 rounded-full bg-white p-1 shadow-lg">
                                        <div class="h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                            <span class="text-2xl font-bold text-white">
                                                {{ getInitials(user.name) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Profile Details -->
                                <div class="flex-1 min-w-0 pb-2">
                                    <h1 class="text-2xl font-bold text-gray-900">{{ user.name }}</h1>
                                    <p class="text-lg text-gray-600">{{ employee.job_title || 'Employee' }}</p>
                                    <div class="flex items-center mt-2 space-x-4">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {{ employee.employee_code || 'No Code' }}
                                        </span>
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {{ employee.department?.name || 'No Department' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div v-if="hasEmployeeProfile" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <CalendarIcon class="h-8 w-8 text-blue-600" />
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600">Time with Company</p>
                                <p class="text-lg font-semibold text-gray-900">{{ calculateYearsOfService() }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <BuildingOfficeIcon class="h-8 w-8 text-green-600" />
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600">Department</p>
                                <p class="text-sm font-semibold text-gray-900">{{ employee.department?.name || 'N/A' }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <PhoneIcon class="h-8 w-8 text-purple-600" />
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600">Contact</p>
                                <p class="text-sm font-semibold text-gray-900">{{ employee.phone || 'Not provided' }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <EnvelopeIcon class="h-8 w-8 text-orange-600" />
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600">Email</p>
                                <p class="text-sm font-semibold text-gray-900 truncate">{{ user.email }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Profile Sections -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Main Profile Information -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Employee Profile Form -->
                        <div v-if="hasEmployeeProfile" class="bg-white shadow-sm rounded-lg">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <div class="flex items-center">
                                    <UserIcon class="h-5 w-5 text-gray-400 mr-2" />
                                    <h3 class="text-lg font-medium text-gray-900">Personal Information</h3>
                                </div>
                                <p class="text-sm text-gray-600 mt-1">Update your personal details and contact information</p>
                            </div>
                            <div class="p-6">
                                <UpdateEmployeeProfileForm :employee="employee" :user="user" />
                            </div>
                        </div>

                        <!-- Account Settings -->
                        <div class="bg-white shadow-sm rounded-lg">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <div class="flex items-center">
                                    <ShieldCheckIcon class="h-5 w-5 text-gray-400 mr-2" />
                                    <h3 class="text-lg font-medium text-gray-900">Account Settings</h3>
                                </div>
                                <p class="text-sm text-gray-600 mt-1">Manage your account credentials and basic information</p>
                            </div>
                            <div class="p-6">
                                <UpdateProfileInformationForm
                                    :must-verify-email="mustVerifyEmail"
                                    :status="status"
                                />
                            </div>
                        </div>

                        <!-- Password Update -->
                        <div class="bg-white shadow-sm rounded-lg">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <div class="flex items-center">
                                    <svg class="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <h3 class="text-lg font-medium text-gray-900">Password Security</h3>
                                </div>
                                <p class="text-sm text-gray-600 mt-1">Update your password to keep your account secure</p>
                            </div>
                            <div class="p-6">
                                <UpdatePasswordForm />
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar Information -->
                    <div class="space-y-6">
                        <!-- Employment Summary -->
                        <div v-if="hasEmployeeProfile" class="bg-white shadow-sm rounded-lg">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <div class="flex items-center">
                                    <BriefcaseIcon class="h-5 w-5 text-gray-400 mr-2" />
                                    <h3 class="text-lg font-medium text-gray-900">Employment Summary</h3>
                                </div>
                            </div>
                            <div class="px-6 py-4">
                                <div class="space-y-4">
                                    <div>
                                        <dt class="text-sm font-medium text-gray-500">Job Title</dt>
                                        <dd class="text-sm font-medium text-gray-900 mt-1">{{ employee.job_title || 'Not specified' }}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-sm font-medium text-gray-500">Department</dt>
                                        <dd class="text-sm font-medium text-gray-900 mt-1">{{ employee.department?.name || 'Not assigned' }}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-sm font-medium text-gray-500">Manager</dt>
                                        <dd class="text-sm font-medium text-gray-900 mt-1">{{ employee.manager?.name || 'Not assigned' }}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-sm font-medium text-gray-500">Join Date</dt>
                                        <dd class="text-sm font-medium text-gray-900 mt-1">{{ formatDate(employee.join_date) }}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-sm font-medium text-gray-500">Employment Type</dt>
                                        <dd class="text-sm font-medium text-gray-900 mt-1">{{ employee.employment_type || 'Full Time' }}</dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="bg-white shadow-sm rounded-lg">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
                            </div>
                            <div class="px-6 py-4">
                                <div class="space-y-3">
                                    <a href="/attendances" class="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <svg class="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span class="text-sm font-medium text-gray-900">Time Tracking</span>
                                    </a>
                                    <a href="/leaves" class="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <svg class="h-5 w-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span class="text-sm font-medium text-gray-900">Leave Requests</span>
                                    </a>
                                    <a href="/work-reports" class="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <svg class="h-5 w-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span class="text-sm font-medium text-gray-900">Work Reports</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Account Danger Zone -->
                        <div class="bg-white shadow-sm rounded-lg border border-red-200">
                            <div class="px-6 py-4 border-b border-red-200 bg-red-50">
                                <div class="flex items-center">
                                    <svg class="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <h3 class="text-lg font-medium text-red-900">Danger Zone</h3>
                                </div>
                                <p class="text-sm text-red-700 mt-1">Irreversible and destructive actions</p>
                            </div>
                            <div class="p-6">
                                <DeleteUserForm />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- No Employee Profile Message -->
                <div v-if="!hasEmployeeProfile" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div class="flex items-center">
                        <svg class="h-6 w-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 class="text-lg font-medium text-yellow-800">Employee Profile Not Found</h3>
                            <p class="text-sm text-yellow-700 mt-1">
                                Your employee profile hasn't been set up yet. Please contact HR to complete your employee profile setup.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
