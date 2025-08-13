<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Submit Feedback"
      subtitle="Provide constructive feedback to help team members grow"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <ContentSection>
        <ContentCard class="max-w-4xl mx-auto">
          <!-- Feedback Form -->
          <FormLayout
            title=""
            :actions="formActions"
            :errors="form.errors"
            :is-submitting="form.processing"
            variant="card"
            @submit="handleSubmit"
            @action="handleFormAction"
          >
            <!-- Step 1: Basic Information -->
            <FormSection title="Feedback Details" description="Select who you're providing feedback for and the review period">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Reviewee Selection -->
                <FormField
                  label="Team Member"
                  description="Select the person you're providing feedback for"
                  required
                  :error="form.errors.reviewee_id"
                >
                  <BaseSelect
                    v-model="form.reviewee_id"
                    :options="userOptions"
                    placeholder="Select a team member..."
                    searchable
                    :disabled="form.processing"
                  >
                <template #option="{ option }">
                  <div class="flex items-center gap-3">
                    <div class="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <span class="text-xs font-semibold text-primary-700">
                        {{ option.initials }}
                      </span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="font-medium text-neutral-900 truncate">{{ option.label }}</div>
                      <div class="text-xs text-neutral-500 truncate">{{ option.department }}</div>
                    </div>
                  </div>
                </template>
              </BaseSelect>
            </FormField>

            <!-- Period Selection -->
            <FormField
              label="Review Period"
              description="Specify the time period this feedback covers"
              required
              :error="form.errors.period"
            >
              <BaseSelect
                v-model="form.period"
                :options="periodOptions"
                placeholder="Select review period..."
                :disabled="form.processing"
              />
            </FormField>
          </div>
        </FormSection>

        <!-- Step 2: Rating System -->
        <FormSection title="Overall Rating" description="Rate the overall performance during this period">
          <div class="space-y-6">
            <!-- Star Rating -->
            <FormField
              label="Performance Rating"
              description="Click on the stars to rate (1 = Needs Improvement, 5 = Exceptional)"
              required
              :error="form.errors.rating"
            >
              <div class="flex items-center space-x-2">
                <div class="flex items-center space-x-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    @click="setRating(star)"
                    @mouseover="hoverRating = star"
                    @mouseleave="hoverRating = 0"
                    :class="[
                      'w-8 h-8 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded',
                      (hoverRating >= star || form.rating >= star)
                        ? 'text-yellow-400'
                        : 'text-neutral-300 hover:text-yellow-300'
                    ]"
                    :disabled="form.processing"
                  >
                    <Icon name="star-solid" class="w-full h-full" />
                  </button>
                </div>
                <span class="text-sm font-medium text-neutral-700 ml-3">
                  {{ getRatingLabel(form.rating) }}
                </span>
              </div>
            </FormField>

            <!-- Rating Categories -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="category in ratingCategories"
                :key="category.key"
                class="bg-neutral-50 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <Icon :name="category.icon" class="w-5 h-5 text-neutral-600" />
                    <span class="font-medium text-neutral-900">{{ category.label }}</span>
                  </div>
                </div>
                <div class="flex items-center space-x-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    @click="setCategoryRating(category.key, star)"
                    :class="[
                      'w-4 h-4 transition-colors duration-200',
                      form.categoryRatings[category.key] >= star
                        ? 'text-yellow-400'
                        : 'text-neutral-300 hover:text-yellow-300'
                    ]"
                    :disabled="form.processing"
                  >
                    <Icon name="star-solid" class="w-full h-full" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        <!-- Step 3: Detailed Feedback -->
        <FormSection title="Detailed Comments" description="Provide specific, constructive feedback">
          <div class="space-y-6">
            <!-- Strengths -->
            <FormField
              label="Strengths & Achievements"
              description="What did this person do well? Highlight specific achievements and strengths."
              :error="form.errors.strengths"
            >
              <BaseTextarea
                v-model="form.strengths"
                placeholder="Describe specific strengths, achievements, and positive contributions..."
                rows="4"
                :disabled="form.processing"
                :character-count="true"
                :max-length="1000"
              />
            </FormField>

            <!-- Areas for Improvement -->
            <FormField
              label="Areas for Development"
              description="What areas could benefit from improvement? Be constructive and specific."
              :error="form.errors.improvements"
            >
              <BaseTextarea
                v-model="form.improvements"
                placeholder="Suggest specific areas for development and growth opportunities..."
                rows="4"
                :disabled="form.processing"
                :character-count="true"
                :max-length="1000"
              />
            </FormField>

            <!-- General Comments -->
            <FormField
              label="Additional Comments"
              description="Any other feedback, suggestions, or observations you'd like to share."
              required
              :error="form.errors.comments"
            >
              <BaseTextarea
                v-model="form.comments"
                placeholder="Share any additional thoughts, suggestions, or observations..."
                rows="6"
                :disabled="form.processing"
                :character-count="true"
                :max-length="2000"
              />
            </FormField>
          </div>
        </FormSection>

        <!-- Step 4: Goals and Recommendations -->
        <FormSection title="Future Goals & Recommendations" description="Suggest goals and next steps">
          <div class="space-y-6">
            <!-- Recommended Goals -->
            <FormField
              label="Recommended Goals"
              description="Suggest 2-3 specific goals for the next review period"
              :error="form.errors.goals"
            >
              <div class="space-y-3">
                <div
                  v-for="(goal, index) in form.goals"
                  :key="index"
                  class="flex items-center space-x-3"
                >
                  <BaseInput
                    v-model="form.goals[index]"
                    :placeholder="`Goal ${index + 1}...`"
                    :disabled="form.processing"
                    class="flex-1"
                  />
                  <BaseButton
                    v-if="form.goals.length > 1"
                    variant="ghost"
                    icon-left="minus"
                    @click="removeGoal(index)"
                    :disabled="form.processing"
                    size="sm"
                  />
                </div>
                <BaseButton
                  v-if="form.goals.length < 5"
                  variant="ghost"
                  icon-left="plus"
                  label="Add Goal"
                  @click="addGoal"
                  :disabled="form.processing"
                  size="sm"
                />
              </div>
            </FormField>

            <!-- Support Needed -->
            <FormField
              label="Support & Resources"
              description="What support or resources would help this person succeed?"
              :error="form.errors.support"
            >
              <BaseTextarea
                v-model="form.support"
                placeholder="Suggest training, mentoring, resources, or other support..."
                rows="3"
                :disabled="form.processing"
                :character-count="true"
                :max-length="500"
              />
            </FormField>
          </div>
        </FormSection>
          </FormLayout>
        </ContentCard>
      </ContentSection>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { useForm, router } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import PageHeader from '@/Components/Layout/PageHeader.vue';
import ContentSection from '@/Components/Layout/ContentSection.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';
import FormLayout from '@/Components/Forms/FormLayout.vue';
import FormSection from '@/Components/Forms/FormSection.vue';
import FormField from '@/Components/Forms/FormField.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';
import BaseSelect from '@/Components/Base/BaseSelect.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';
import BaseTextarea from '@/Components/Base/BaseTextarea.vue';
import Icon from '@/Components/Base/Icon.vue';
import { useNotifications } from '@/composables/useNotifications';

const props = defineProps({
  users: Array,
});

const { showNotification } = useNotifications();

// Reactive state
const hoverRating = ref(0);

// Breadcrumbs
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Feedbacks', href: route('feedbacks.index') },
  { label: 'Submit Feedback', current: true }
]);

// Header actions
const headerActions = computed(() => [
  {
    id: 'back-to-feedbacks',
    label: 'Back to Feedbacks',
    icon: 'arrow-left',
    variant: 'secondary',
    handler: () => router.visit(route('feedbacks.index'))
  }
]);

// Form setup
const form = useForm({
  reviewee_id: '',
  period: '',
  rating: 0,
  categoryRatings: {
    communication: 0,
    teamwork: 0,
    technical: 0,
    leadership: 0,
    initiative: 0,
    reliability: 0
  },
  strengths: '',
  improvements: '',
  comments: '',
  goals: [''],
  support: ''
});

// User options for select
const userOptions = computed(() => {
  return props.users.map(user => ({
    value: user.id,
    label: user.name,
    department: user.department || 'No Department',
    initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase()
  }));
});

// Period options
const periodOptions = computed(() => [
  { value: 'Q1 2024', label: 'Q1 2024 (Jan - Mar)' },
  { value: 'Q2 2024', label: 'Q2 2024 (Apr - Jun)' },
  { value: 'Q3 2024', label: 'Q3 2024 (Jul - Sep)' },
  { value: 'Q4 2024', label: 'Q4 2024 (Oct - Dec)' },
  { value: 'H1 2024', label: 'H1 2024 (Jan - Jun)' },
  { value: 'H2 2024', label: 'H2 2024 (Jul - Dec)' },
  { value: 'Annual 2024', label: 'Annual 2024' }
]);

// Rating categories
const ratingCategories = computed(() => [
  {
    key: 'communication',
    label: 'Communication',
    icon: 'chat'
  },
  {
    key: 'teamwork',
    label: 'Teamwork',
    icon: 'users'
  },
  {
    key: 'technical',
    label: 'Technical Skills',
    icon: 'cog'
  },
  {
    key: 'leadership',
    label: 'Leadership',
    icon: 'star'
  },
  {
    key: 'initiative',
    label: 'Initiative',
    icon: 'bolt'
  },
  {
    key: 'reliability',
    label: 'Reliability',
    icon: 'shield'
  }
]);

// Form actions
const formActions = computed(() => [
  {
    id: 'cancel',
    label: 'Cancel',
    variant: 'secondary',
    disabled: form.processing
  },
  {
    id: 'save-draft',
    label: 'Save Draft',
    variant: 'ghost',
    disabled: form.processing
  },
  {
    id: 'submit',
    label: 'Submit Feedback',
    variant: 'primary',
    type: 'submit',
    disabled: form.processing || !isFormValid.value,
    loadingLabel: 'Submitting...'
  }
]);

// Form validation
const isFormValid = computed(() => {
  return form.reviewee_id && 
         form.period && 
         form.rating > 0 && 
         form.comments.trim().length > 0;
});

// Rating helpers
const setRating = (rating) => {
  form.rating = rating;
  hoverRating.value = 0;
};

const setCategoryRating = (category, rating) => {
  form.categoryRatings[category] = rating;
};

const getRatingLabel = (rating) => {
  const labels = {
    0: 'No rating',
    1: 'Needs Improvement',
    2: 'Below Expectations',
    3: 'Meets Expectations',
    4: 'Exceeds Expectations',
    5: 'Exceptional'
  };
  return labels[rating] || 'No rating';
};

// Goals management
const addGoal = () => {
  if (form.goals.length < 5) {
    form.goals.push('');
  }
};

const removeGoal = (index) => {
  if (form.goals.length > 1) {
    form.goals.splice(index, 1);
  }
};

// Event handlers
const handleBack = () => {
  if (hasUnsavedChanges()) {
    if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
      router.visit(route('feedbacks.index'));
    }
  } else {
    router.visit(route('feedbacks.index'));
  }
};

const handleSubmit = () => {
  // Clean up goals array (remove empty goals)
  form.goals = form.goals.filter(goal => goal.trim().length > 0);
  
  form.post(route('feedbacks.store'), {
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Feedback Submitted',
        message: 'Your feedback has been successfully submitted.'
      });
    },
    onError: () => {
      showNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'There was an error submitting your feedback. Please check the form and try again.'
      });
    }
  });
};

const handleFormAction = (action) => {
  switch (action.id) {
    case 'cancel':
      handleBack();
      break;
    case 'save-draft':
      handleSaveDraft();
      break;
    case 'submit':
      handleSubmit();
      break;
  }
};

const handleSaveDraft = () => {
  // Clean up goals array
  form.goals = form.goals.filter(goal => goal.trim().length > 0);
  
  form.post(route('feedbacks.save-draft'), {
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Draft Saved',
        message: 'Your feedback draft has been saved. You can continue editing later.'
      });
    },
    onError: () => {
      showNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save your draft. Please try again.'
      });
    }
  });
};

// Helper to check for unsaved changes
const hasUnsavedChanges = () => {
  return form.reviewee_id || 
         form.period || 
         form.rating > 0 || 
         form.comments.trim().length > 0 ||
         form.strengths.trim().length > 0 ||
         form.improvements.trim().length > 0 ||
         form.support.trim().length > 0 ||
         form.goals.some(goal => goal.trim().length > 0) ||
         Object.values(form.categoryRatings).some(rating => rating > 0);
};

// Auto-save functionality (optional)
// const autoSave = debounce(() => {
//   if (hasUnsavedChanges() && !form.processing) {
//     handleSaveDraft();
//   }
// }, 30000); // Auto-save every 30 seconds

// Watch for form changes to trigger auto-save
// watch(() => form.data(), autoSave, { deep: true });
</script>