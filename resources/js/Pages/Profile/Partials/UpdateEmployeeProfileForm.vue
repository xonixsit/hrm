<template>
  <form @submit.prevent="updateProfile" class="space-y-6">
    <!-- Personal Information Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Date of Birth -->
      <div>
        <label for="date_of_birth" class="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth
        </label>
        <input
          id="date_of_birth"
          v-model="form.date_of_birth"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': form.errors.date_of_birth }"
        />
        <p v-if="form.errors.date_of_birth" class="mt-1 text-sm text-red-600">
          {{ form.errors.date_of_birth }}
        </p>
      </div>

      <!-- Gender -->
      <div>
        <label for="gender" class="block text-sm font-medium text-gray-700 mb-1">
          Gender
        </label>
        <select
          id="gender"
          v-model="form.gender"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': form.errors.gender }"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        <p v-if="form.errors.gender" class="mt-1 text-sm text-red-600">
          {{ form.errors.gender }}
        </p>
      </div>

      <!-- Phone -->
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': form.errors.phone }"
          placeholder="Enter your phone number"
        />
        <p v-if="form.errors.phone" class="mt-1 text-sm text-red-600">
          {{ form.errors.phone }}
        </p>
      </div>

      <!-- Personal Email -->
      <div>
        <label for="personal_email" class="block text-sm font-medium text-gray-700 mb-1">
          Personal Email
        </label>
        <input
          id="personal_email"
          v-model="form.personal_email"
          type="email"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': form.errors.personal_email }"
          placeholder="Enter your personal email"
        />
        <p v-if="form.errors.personal_email" class="mt-1 text-sm text-red-600">
          {{ form.errors.personal_email }}
        </p>
      </div>

      <!-- Nationality -->
      <div>
        <label for="nationality" class="block text-sm font-medium text-gray-700 mb-1">
          Nationality
        </label>
        <input
          id="nationality"
          v-model="form.nationality"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': form.errors.nationality }"
          placeholder="Enter your nationality"
        />
        <p v-if="form.errors.nationality" class="mt-1 text-sm text-red-600">
          {{ form.errors.nationality }}
        </p>
      </div>

      <!-- Work Location -->
      <div>
        <label for="work_location" class="block text-sm font-medium text-gray-700 mb-1">
          Work Location
        </label>
        <input
          id="work_location"
          v-model="form.work_location"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': form.errors.work_location }"
          placeholder="Enter your work location"
        />
        <p v-if="form.errors.work_location" class="mt-1 text-sm text-red-600">
          {{ form.errors.work_location }}
        </p>
      </div>
    </div>

    <!-- Address Information -->
    <div class="space-y-4">
      <h4 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
        Address Information
      </h4>
      
      <!-- Current Address -->
      <div>
        <label for="current_address" class="block text-sm font-medium text-gray-700 mb-1">
          Current Address
        </label>
        <textarea
          id="current_address"
          v-model="form.current_address"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': form.errors.current_address }"
          placeholder="Enter your current address"
        ></textarea>
        <p v-if="form.errors.current_address" class="mt-1 text-sm text-red-600">
          {{ form.errors.current_address }}
        </p>
      </div>

      <!-- Permanent Address -->
      <div>
        <label for="permanent_address" class="block text-sm font-medium text-gray-700 mb-1">
          Permanent Address
        </label>
        <div class="flex items-center mb-2">
          <input
            id="same_as_current"
            v-model="sameAsCurrent"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            @change="copyCurrent"
          />
          <label for="same_as_current" class="ml-2 text-sm text-gray-600">
            Same as current address
          </label>
        </div>
        <textarea
          id="permanent_address"
          v-model="form.permanent_address"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': form.errors.permanent_address }"
          placeholder="Enter your permanent address"
        ></textarea>
        <p v-if="form.errors.permanent_address" class="mt-1 text-sm text-red-600">
          {{ form.errors.permanent_address }}
        </p>
      </div>
    </div>

    <!-- Emergency Contact -->
    <div class="space-y-4">
      <h4 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
        Emergency Contact
      </h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Emergency Contact Name -->
        <div>
          <label for="emergency_contact_name" class="block text-sm font-medium text-gray-700 mb-1">
            Contact Name
          </label>
          <input
            id="emergency_contact_name"
            v-model="form.emergency_contact_name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': form.errors.emergency_contact_name }"
            placeholder="Enter emergency contact name"
          />
          <p v-if="form.errors.emergency_contact_name" class="mt-1 text-sm text-red-600">
            {{ form.errors.emergency_contact_name }}
          </p>
        </div>

        <!-- Emergency Contact Relationship -->
        <div>
          <label for="emergency_contact_relationship" class="block text-sm font-medium text-gray-700 mb-1">
            Relationship
          </label>
          <select
            id="emergency_contact_relationship"
            v-model="form.emergency_contact_relationship"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': form.errors.emergency_contact_relationship }"
          >
            <option value="">Select Relationship</option>
            <option value="spouse">Spouse</option>
            <option value="parent">Parent</option>
            <option value="sibling">Sibling</option>
            <option value="child">Child</option>
            <option value="friend">Friend</option>
            <option value="other">Other</option>
          </select>
          <p v-if="form.errors.emergency_contact_relationship" class="mt-1 text-sm text-red-600">
            {{ form.errors.emergency_contact_relationship }}
          </p>
        </div>

        <!-- Emergency Contact Phone -->
        <div>
          <label for="emergency_contact_phone" class="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone
          </label>
          <input
            id="emergency_contact_phone"
            v-model="form.emergency_contact_phone"
            type="tel"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': form.errors.emergency_contact_phone }"
            placeholder="Enter emergency contact phone"
          />
          <p v-if="form.errors.emergency_contact_phone" class="mt-1 text-sm text-red-600">
            {{ form.errors.emergency_contact_phone }}
          </p>
        </div>

        <!-- Emergency Contact Email -->
        <div>
          <label for="emergency_contact_email" class="block text-sm font-medium text-gray-700 mb-1">
            Contact Email
          </label>
          <input
            id="emergency_contact_email"
            v-model="form.emergency_contact_email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': form.errors.emergency_contact_email }"
            placeholder="Enter emergency contact email"
          />
          <p v-if="form.errors.emergency_contact_email" class="mt-1 text-sm text-red-600">
            {{ form.errors.emergency_contact_email }}
          </p>
        </div>
      </div>
    </div>

    <!-- Skills and Education -->
    <div class="space-y-4">
      <h4 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
        Professional Information
      </h4>
      
      <!-- Skills -->
      <div>
        <label for="skills" class="block text-sm font-medium text-gray-700 mb-1">
          Skills
        </label>
        <textarea
          id="skills"
          v-model="form.skills"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': form.errors.skills }"
          placeholder="List your skills (comma-separated)"
        ></textarea>
        <p class="mt-1 text-xs text-gray-500">
          Enter your skills separated by commas (e.g., JavaScript, Project Management, Communication)
        </p>
        <p v-if="form.errors.skills" class="mt-1 text-sm text-red-600">
          {{ form.errors.skills }}
        </p>
      </div>

      <!-- Education -->
      <div>
        <label for="education" class="block text-sm font-medium text-gray-700 mb-1">
          Education
        </label>
        <textarea
          id="education"
          v-model="form.education"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': form.errors.education }"
          placeholder="Enter your educational background"
        ></textarea>
        <p v-if="form.errors.education" class="mt-1 text-sm text-red-600">
          {{ form.errors.education }}
        </p>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="flex items-center justify-between pt-6 border-t border-gray-200">
      <div class="text-sm text-gray-600">
        <span v-if="form.recentlySuccessful" class="text-green-600 font-medium">
          ✓ Profile updated successfully!
        </span>
      </div>
      <button
        type="submit"
        :disabled="form.processing"
        class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
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
      console.log('Date formatting:', { original: date, formatted });
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