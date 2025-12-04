<template>
<form @submit.prevent="updateProfile" class="space-y-8">
<!-- Personal Information Section -->
<FormSection title="Personal Information" description="Basic personal details">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Full Name -->
    <FormField label="Full Name" required :error="form.errors.name" help="Your full name as it appears on official documents">
      <BaseInput v-model="form.name" type="text" placeholder="John Doe" :error="!!form.errors.name" required />
    </FormField>

    <!-- Date of Birth -->
    <FormField label="Date of Birth" :error="form.errors.date_of_birth" help="Your date of birth">
      <BaseInput v-model="form.date_of_birth" type="date" :error="!!form.errors.date_of_birth" />
    </FormField>

    <!-- Gender -->
    <FormField label="Gender" :error="form.errors.gender" help="Select your gender">
      <BaseSelect v-model="form.gender" :options="genderOptions" :error="!!form.errors.gender" placeholder="Select gender" />
    </FormField>

    <!-- Phone -->
    <FormField label="Phone Number" :error="form.errors.phone" help="Your primary contact number">
      <BaseInput v-model="form.phone" type="tel" placeholder="+1 (555) 123-4567" :error="!!form.errors.phone" />
    </FormField>

    <!-- Personal Email -->
    <FormField label="Personal Email" :error="form.errors.personal_email" help="Personal email address (different from work email)">
      <BaseInput v-model="form.personal_email" type="email" placeholder="john.doe@personal.com" :error="!!form.errors.personal_email" />
    </FormField>

    <!-- Nationality -->
    <FormField label="Nationality" :error="form.errors.nationality" help="Your nationality">
      <BaseInput v-model="form.nationality" type="text" placeholder="American" :error="!!form.errors.nationality" />
    </FormField>

    <!-- Work Location -->
    <FormField label="Work Location" :error="form.errors.work_location" help="Your primary work location">
      <BaseInput v-model="form.work_location" type="text" placeholder="Main Office, Remote, etc." :error="!!form.errors.work_location" />
    </FormField>
  </div>
</FormSection>

<!-- Address Information Section -->
<FormSection title="Address Information" description="Current and permanent address details">
  <div class="grid grid-cols-1 gap-6">
    <!-- Current Address -->
    <FormField label="Current Address" :error="form.errors.current_address" help="Your current residential address">
      <BaseTextarea v-model="form.current_address" placeholder="123 Main Street, City, State, ZIP" :error="!!form.errors.current_address" rows="3" />
    </FormField>

    <!-- Permanent Address -->
    <FormField label="Permanent Address" :error="form.errors.permanent_address" help="Permanent residential address (if different from current)">
      <div class="space-y-2">
        <div class="flex items-center">
          <input
            id="same_as_current"
            v-model="sameAsCurrent"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            @change="copyCurrent"
          />
          <label for="same_as_current" class="ml-2 text-sm text-neutral-600">
            Same as current address
          </label>
        </div>
        <BaseTextarea v-model="form.permanent_address" placeholder="456 Home Street, City, State, ZIP" :error="!!form.errors.permanent_address" rows="3" />
      </div>
    </FormField>
  </div>
</FormSection>

<!-- Emergency Contact Section -->
<FormSection title="Emergency Contact" description="Contact person in case of emergency">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Emergency Contact Name -->
    <FormField label="Emergency Contact Name" :error="form.errors.emergency_contact_name" help="Full name of emergency contact person">
      <BaseInput v-model="form.emergency_contact_name" type="text" placeholder="Jane Doe" :error="!!form.errors.emergency_contact_name" />
    </FormField>

    <!-- Emergency Contact Relationship -->
    <FormField label="Relationship" :error="form.errors.emergency_contact_relationship" help="Relationship to you">
      <BaseSelect v-model="form.emergency_contact_relationship" :options="relationshipOptions" :error="!!form.errors.emergency_contact_relationship" placeholder="Select relationship" />
    </FormField>

    <!-- Emergency Contact Phone -->
    <FormField label="Emergency Contact Phone" :error="form.errors.emergency_contact_phone" help="Phone number of emergency contact">
      <BaseInput v-model="form.emergency_contact_phone" type="tel" placeholder="+1 (555) 987-6543" :error="!!form.errors.emergency_contact_phone" />
    </FormField>

    <!-- Emergency Contact Email -->
    <FormField label="Emergency Contact Email" :error="form.errors.emergency_contact_email" help="Email address of emergency contact">
      <BaseInput v-model="form.emergency_contact_email" type="email" placeholder="jane.doe@email.com" :error="!!form.errors.emergency_contact_email" />
    </FormField>
  </div>
</FormSection>

<!-- Professional Information Section -->
<FormSection title="Professional Information" description="Skills, education, and other professional details">
  <div class="grid grid-cols-1 gap-6">
    <!-- Skills -->
    <FormField label="Skills" :error="form.errors.skills" help="List your skills separated by commas (e.g., JavaScript, Project Management, Communication)">
      <BaseTextarea v-model="form.skills" placeholder="JavaScript, Project Management, Communication" :error="!!form.errors.skills" rows="3" />
    </FormField>

    <!-- Education -->
    <FormField label="Education" :error="form.errors.education" help="Your educational background">
      <BaseTextarea v-model="form.education" placeholder="Bachelor's Degree in Computer Science, University Name" :error="!!form.errors.education" rows="3" />
    </FormField>
  </div>
</FormSection>

<!-- Form Actions -->
<div class="flex items-center justify-between pt-6 border-t border-neutral-200">
  <div class="text-sm text-neutral-600">
    <span v-if="form.recentlySuccessful" class="text-success-600 font-medium">
      ✓ Profile updated successfully!
    </span>
  </div>
  <button
    type="submit"
    :disabled="form.processing"
    class="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 focus:bg-primary-700 active:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition ease-in-out duration-150"
    :class="{ 'opacity-50 cursor-not-allowed': form.processing }"
  >
    <svg v-if="form.processing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    {{ form.processing ? 'Updating...' : 'Update Profile' }}
  </button>
</div>
</form>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3';
import { ref, watch, onMounted } from 'vue';
import FormSection from '@/Components/Forms/FormSection.vue';
import FormField from '@/Components/Forms/FormField.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';
import BaseSelect from '@/Components/Base/BaseSelect.vue';
import BaseTextarea from '@/Components/Base/BaseTextarea.vue';

const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
});

const sameAsCurrent = ref(false);

// Form Options
const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' }
];

const relationshipOptions = [
  { label: 'Spouse', value: 'spouse' },
  { label: 'Parent', value: 'parent' },
  { label: 'Child', value: 'child' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Friend', value: 'friend' },
  { label: 'Other', value: 'other' }
];

const employmentTypeOptions = [
  { label: 'Full Time', value: 'full_time' },
  { label: 'Part Time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Intern', value: 'intern' },
  { label: 'Consultant', value: 'consultant' }
];

// Helper function to format date for HTML input
const formatDateForInput = (date) => {
  if (!date) return '';
  
  // If it's already a string in YYYY-MM-DD format, return as is
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // If it's a date object or string, convert to YYYY-MM-DD format
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day}`;
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      //console.log('Date formatting:', { original: date, formatted });
    }
    
    return formatted;
  } catch (error) {
    console.warn('Error formatting date:', error);
    return '';
  }
};

// Initialize form with employee data
const form = useForm({
  name: props.user.name,
  date_of_birth: props.employee.date_of_birth_formatted || formatDateForInput(props.employee.date_of_birth),
  gender: props.employee.gender || '',
  phone: props.employee.phone || '',
  personal_email: props.employee.personal_email || '',
  nationality: props.employee.nationality || '',
  work_location: props.employee.work_location || '',
  current_address: props.employee.current_address || '',
  permanent_address: props.employee.permanent_address || '',
  emergency_contact_name: props.employee.emergency_contact_name || '',
  emergency_contact_relationship: props.employee.emergency_contact_relationship || '',
  emergency_contact_phone: props.employee.emergency_contact_phone || '',
  emergency_contact_email: props.employee.emergency_contact_email || '',
  skills: props.employee.skills || '',
  education: props.employee.education || '',
});

const copyCurrent = () => {
  if (sameAsCurrent.value) {
    form.permanent_address = form.current_address;
  }
};

// Watch for changes in current address when checkbox is checked
watch(() => form.current_address, (newValue) => {
  if (sameAsCurrent.value) {
    form.permanent_address = newValue;
  }
});

// Watch for changes in employee data and update form
watch(() => props.employee, (newEmployee) => {
  if (newEmployee) {
    form.date_of_birth = newEmployee.date_of_birth_formatted || formatDateForInput(newEmployee.date_of_birth);
    form.gender = newEmployee.gender || '';
    form.phone = newEmployee.phone || '';
    form.personal_email = newEmployee.personal_email || '';
    form.nationality = newEmployee.nationality || '';
    form.work_location = newEmployee.work_location || '';
    form.current_address = newEmployee.current_address || '';
    form.permanent_address = newEmployee.permanent_address || '';
    form.emergency_contact_name = newEmployee.emergency_contact_name || '';
    form.emergency_contact_relationship = newEmployee.emergency_contact_relationship || '';
    form.emergency_contact_phone = newEmployee.emergency_contact_phone || '';
    form.emergency_contact_email = newEmployee.emergency_contact_email || '';
    form.skills = newEmployee.skills || '';
    form.education = newEmployee.education || '';
  }
}, { deep: true });

// Watch for changes in user data and update form
watch(() => props.user, (newUser) => {
  if (newUser) {
    form.name = newUser.name;
  }
}, { deep: true });

const updateProfile = () => {
  form.patch(route('profile.update-employee'), {
    preserveScroll: true,
    onSuccess: () => {
      // Success message is handled by the form's recentlySuccessful property
      // The page will reload with fresh data, so the watchers will handle the update
    },
  });
};

// Ensure proper initialization on component mount
onMounted(() => {
  if (props.employee.date_of_birth) {
    form.date_of_birth = props.employee.date_of_birth_formatted || formatDateForInput(props.employee.date_of_birth);
  }
});
</script>