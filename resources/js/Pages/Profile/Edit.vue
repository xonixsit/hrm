<script setup>
import { computed, ref, watch } from 'vue';
import { Head } from '@inertiajs/vue3';
import confetti from 'canvas-confetti';
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

const employeeData = ref(props.employee);
const uploadProgress = ref(0);
const uploadMessage = ref('');
const avatarKey = ref(0);

// Watch for changes to force re-render
watch(() => employeeData.value?.profile_pic, (newVal) => {
  avatarKey.value++;
}, { deep: true });

const hasEmployeeProfile = computed(() => !!employeeData.value);

const handlePictureUpdated = (data) => {
  if (employeeData.value) {
    employeeData.value.profile_pic = data.path;
  }
};

const handleProfilePicChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    uploadMessage.value = 'Please select a valid image file.';
    setTimeout(() => { uploadMessage.value = ''; }, 3000);
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    uploadMessage.value = 'File size must be less than 5MB.';
    setTimeout(() => { uploadMessage.value = ''; }, 3000);
    return;
  }

  uploadProgress.value = 0;
  uploadMessage.value = 'Uploading...';

  const formData = new FormData();
  formData.append('profile_pic', file);

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {
      uploadProgress.value = Math.round((event.loaded / event.total) * 100);
    }
  });

  xhr.addEventListener('load', () => {
    try {
      const response = JSON.parse(xhr.responseText);
      if (xhr.status === 200 && response.success) {
        uploadMessage.value = 'Profile picture updated!';
        uploadProgress.value = 0;
        
        // Immediately update the avatar with the new image
        if (employeeData.value) {
          employeeData.value.profile_pic = response.profile_pic.replace('/storage/', '');
        }

        // Trigger confetti animation
        triggerConfetti();

        setTimeout(() => {
          uploadMessage.value = '';
          // Reload page to update user menu
          window.location.reload();
        }, 2000);
      } else {
        uploadMessage.value = response.error || response.message || 'Upload failed.';
        uploadProgress.value = 0;
        setTimeout(() => { uploadMessage.value = ''; }, 3000);
      }
    } catch (e) {
      console.error('Parse error:', e, 'Response:', xhr.responseText);
      uploadMessage.value = 'Server error: ' + xhr.responseText.substring(0, 100);
      uploadProgress.value = 0;
      setTimeout(() => { uploadMessage.value = ''; }, 3000);
    }
  });

  xhr.addEventListener('error', () => {
    uploadMessage.value = 'Network error.';
    uploadProgress.value = 0;
  });

  xhr.open('POST', route('profile.upload-picture'));
  xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken || '');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.send(formData);
};

const triggerConfetti = () => {
  const duration = 2000;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      particleCount,
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    });
  }, 250);
};

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
  if (!employeeData.value?.join_date) return 'N/A';
  const joinDate = new Date(employeeData.value.join_date);
  const today = new Date();
  const years = today.getFullYear() - joinDate.getFullYear();
  const months = today.getMonth() - joinDate.getMonth();
  
  if (years === 0) {
    return months <= 0 ? 'Less than a month' : `${months} month${months > 1 ? 's' : ''}`;
  }
  
  return `${years} year${years > 1 ? 's' : ''}`;
};

const formatEmploymentType = (type) => {
  if (!type) return 'Full Time';
  
  const typeMap = {
    'full_time': 'Full Time',
    'part_time': 'Part Time',
    'contract': 'Contract',
    'intern': 'Intern',
    'consultant': 'Consultant'
  };
  
  return typeMap[type] || type;
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
            <!-- Employment Summary Header with Integrated Profile Picture Upload -->
            <div v-if="hasEmployeeProfile" class="bg-white border border-neutral-200 rounded-lg shadow-sm mb-6">
                <!-- Header Section -->
                <div class="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-neutral-200 rounded-t-lg">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <!-- Profile Picture with Upload Overlay -->
                            <div :key="avatarKey" class="relative group">
                                <div v-if="employeeData?.profile_pic" class="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-200 flex-shrink-0">
                                    <img 
                                        :src="`/storage/${employeeData.profile_pic}`" 
                                        :alt="user.name"
                                        class="w-full h-full object-cover"
                                    />
                                </div>
                                <div v-else class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span class="text-2xl font-semibold text-primary-700">
                                        {{ getInitials(user.name) }}
                                    </span>
                                </div>
                                <!-- Upload Overlay -->
                                <button 
                                    @click="$refs.profilePicInput.click()"
                                    class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                                >
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                                <!-- Hidden File Input -->
                                <input 
                                    ref="profilePicInput"
                                    type="file"
                                    accept="image/*"
                                    class="hidden"
                                    @change="handleProfilePicChange"
                                />
                            </div>
                            <div>
                                <h3 class="text-xl font-semibold text-neutral-900">{{ user.name }}</h3>
                                <p class="text-sm text-neutral-600">{{ employeeData.job_title || 'Employee' }}</p>
                                <div class="flex items-center space-x-2 mt-1">
                                    <span class="text-xs text-neutral-500">Employee ID:</span>
                                    <span class="text-xs font-mono bg-neutral-200 px-2 py-0.5 rounded">{{ employeeData.employee_code || 'N/A' }}</span>
                                    <span class="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">{{ employeeData.department?.name || 'No Department' }}</span>
                                </div>
                                <!-- Upload Progress and Message -->
                                <div v-if="uploadProgress > 0 || uploadMessage" class="mt-3 space-y-2">
                                    <div v-if="uploadMessage" class="text-xs font-medium text-primary-600">{{ uploadMessage }}</div>
                                    <div v-if="uploadProgress > 0" class="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            class="bg-gradient-to-r from-primary-500 to-primary-600 h-full transition-all duration-300"
                                            :style="{ width: uploadProgress + '%' }"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center space-x-3">
                            <a 
                                :href="route('email-preferences.show')" 
                                class="inline-flex items-center px-4 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                            >
                                <EnvelopeIcon class="w-4 h-4 mr-2" />
                                Email Preferences
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Employment Summary Content -->
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                                    <p class="text-sm font-semibold text-neutral-900">{{ employeeData.department?.name || 'N/A' }}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-neutral-50 rounded-lg p-4">
                            <div class="flex items-center space-x-3">
                                <PhoneIcon class="h-8 w-8 text-info-600" />
                                <div>
                                    <p class="text-sm font-medium text-neutral-600">Contact</p>
                                    <p class="text-sm font-semibold text-neutral-900">{{ employeeData.phone || 'Not provided' }}</p>
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

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <dt class="text-sm font-medium text-neutral-500">Job Title</dt>
                            <dd class="text-sm font-medium text-neutral-900 mt-1">{{ employeeData.job_title || 'Not specified' }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-neutral-500">Manager</dt>
                            <dd class="text-sm font-medium text-neutral-900 mt-1">{{ employeeData.manager?.name || 'Not assigned' }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-neutral-500">Join Date</dt>
                            <dd class="text-sm font-medium text-neutral-900 mt-1">{{ formatDate(employeeData.join_date) }}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-neutral-500">Employment Type</dt>
                            <dd class="text-sm font-medium text-neutral-900 mt-1">{{ formatEmploymentType(employeeData.employment_type) }}</dd>
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
                <UpdateEmployeeProfileForm :employee="employeeData" :user="user" />
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