<template>
  <AuthenticatedLayout>
    <DetailPage
      :title="`Feedback for ${feedback.reviewee?.name}`"
      :subtitle="`${feedback.period} • Submitted by ${feedback.reviewer?.name}`"
      :icon="MessageSquareIcon"
      :status="feedbackStatus"
      :breadcrumbs="breadcrumbs"
      :actions="pageActions"
      :back-url="route('feedbacks.index')"
      layout="two-column"
    >
      <!-- Primary Content -->
      <template #primary>
        <div class="space-y-6">
          <!-- Rating Overview Card -->
          <InfoCard title="Performance Rating" icon="star">
            <div class="space-y-6">
              <!-- Overall Rating with Sentiment -->
              <div class="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-lg">
                <div class="flex items-center space-x-4">
                  <div :class="[
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    getSentimentBgColor(feedback.rating)
                  ]">
                    <Icon :name="getSentimentIcon(feedback.rating)" :class="[
                      'w-7 h-7',
                      getSentimentTextColor(feedback.rating)
                    ]" />
                  </div>
                  <div>
                    <div class="flex items-center space-x-2">
                      <div class="flex items-center space-x-1">
                        <Icon
                          v-for="star in 5"
                          :key="star"
                          name="star-solid"
                          :class="[
                            'w-6 h-6',
                            star <= feedback.rating ? 'text-yellow-400' : 'text-neutral-300'
                          ]"
                        />
                      </div>
                      <span class="text-2xl font-bold text-neutral-900">
                        {{ feedback.rating }}/5
                      </span>
                    </div>
                    <p class="text-sm text-neutral-600 mt-1">
                      {{ getRatingLabel(feedback.rating) }} • {{ getSentimentLabel(feedback.rating) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Category Ratings -->
              <div v-if="feedback.categoryRatings" class="space-y-3">
                <h4 class="text-sm font-medium text-neutral-700">Category Breakdown</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    v-for="(rating, category) in feedback.categoryRatings"
                    :key="category"
                    class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div class="flex items-center space-x-2">
                      <Icon :name="getCategoryIcon(category)" class="w-4 h-4 text-neutral-600" />
                      <span class="text-sm font-medium text-neutral-900 capitalize">
                        {{ category.replace(/([A-Z])/g, ' $1').trim() }}
                      </span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <Icon
                        v-for="star in 5"
                        :key="star"
                        name="star-solid"
                        :class="[
                          'w-3 h-3',
                          star <= rating ? 'text-yellow-400' : 'text-neutral-300'
                        ]"
                      />
                      <span class="text-sm font-medium text-neutral-700 ml-1">{{ rating }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sentiment Indicator -->
              <div class="flex items-center justify-center p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    getSentimentBgColor(feedback.rating)
                  ]">
                    <Icon :name="getSentimentIcon(feedback.rating)" :class="[
                      'w-6 h-6',
                      getSentimentTextColor(feedback.rating)
                    ]" />
                  </div>
                  <div>
                    <p class="font-medium text-neutral-900">{{ getSentimentLabel(feedback.rating) }}</p>
                    <p class="text-sm text-neutral-600">Overall feedback sentiment</p>
                  </div>
                </div>
              </div>
            </div>
          </InfoCard>

          <!-- Feedback Content -->
          <div class="space-y-6">
            <!-- Strengths -->
            <InfoCard v-if="feedback.strengths" title="Strengths & Achievements" icon="check-circle">
              <div class="prose prose-sm max-w-none">
                <p class="text-neutral-700 leading-relaxed whitespace-pre-wrap">{{ feedback.strengths }}</p>
              </div>
            </InfoCard>

            <!-- Areas for Improvement -->
            <InfoCard v-if="feedback.improvements" title="Areas for Development" icon="trending-up">
              <div class="prose prose-sm max-w-none">
                <p class="text-neutral-700 leading-relaxed whitespace-pre-wrap">{{ feedback.improvements }}</p>
              </div>
            </InfoCard>

            <!-- General Comments -->
            <InfoCard title="Additional Comments" icon="message-square">
              <div class="prose prose-sm max-w-none">
                <p class="text-neutral-700 leading-relaxed whitespace-pre-wrap">{{ feedback.comments }}</p>
              </div>
            </InfoCard>

            <!-- Goals and Recommendations -->
            <div v-if="feedback.goals?.length || feedback.support" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Recommended Goals -->
              <InfoCard v-if="feedback.goals?.length" title="Recommended Goals" icon="target">
                <ul class="space-y-2">
                  <li
                    v-for="(goal, index) in feedback.goals"
                    :key="index"
                    class="flex items-start space-x-3"
                  >
                    <div class="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                      <span class="text-xs font-semibold text-primary-700">{{ index + 1 }}</span>
                    </div>
                    <p class="text-sm text-neutral-700 leading-relaxed">{{ goal }}</p>
                  </li>
                </ul>
              </InfoCard>

              <!-- Support & Resources -->
              <InfoCard v-if="feedback.support" title="Support & Resources" icon="heart">
                <div class="prose prose-sm max-w-none">
                  <p class="text-neutral-700 leading-relaxed whitespace-pre-wrap">{{ feedback.support }}</p>
                </div>
              </InfoCard>
            </div>
          </div>

          <!-- Response Section -->
          <div v-if="canRespond" class="border-t border-neutral-200 pt-6">
            <div class="bg-neutral-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <Icon name="chat" class="w-5 h-5 mr-2 text-primary-600" />
                Response to Feedback
              </h3>
              
              <div v-if="feedback.response" class="mb-4">
                <div class="bg-white rounded-lg p-4 border border-neutral-200">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-neutral-900">{{ feedback.reviewee?.name }}</span>
                    <span class="text-xs text-neutral-500">
                      {{ formatDate(feedback.response_date) }}
                    </span>
                  </div>
                  <p class="text-neutral-700 leading-relaxed whitespace-pre-wrap">{{ feedback.response }}</p>
                </div>
              </div>

              <div v-if="!feedback.response && isReviewee">
                <form @submit.prevent="submitResponse" class="space-y-4">
                  <BaseTextarea
                    v-model="responseForm.response"
                    placeholder="Share your thoughts on this feedback, acknowledge the points raised, or discuss your development plans..."
                    rows="4"
                    :disabled="responseForm.processing"
                    :character-count="true"
                    :max-length="1000"
                  />
                  <div class="flex items-center justify-end space-x-3">
                    <BaseButton
                      variant="secondary"
                      label="Cancel"
                      @click="cancelResponse"
                      :disabled="responseForm.processing"
                    />
                    <BaseButton
                      variant="primary"
                      label="Submit Response"
                      type="submit"
                      :disabled="responseForm.processing || !responseForm.response.trim()"
                      :loading="responseForm.processing"
                    />
                  </div>
                </form>
              </div>

              <div v-if="!feedback.response && !isReviewee" class="text-center py-4">
                <Icon name="clock" class="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p class="text-neutral-600">Waiting for {{ feedback.reviewee?.name }} to respond</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Secondary Content (Sidebar) -->
      <template #secondary>
        <div class="space-y-6">
          <!-- Feedback Metadata -->
          <InfoCard title="Feedback Details" icon="info">
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-neutral-500">Reviewer</dt>
                <dd class="mt-1 flex items-center space-x-2">
                  <div class="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-xs font-semibold text-primary-700">
                      {{ getInitials(feedback.reviewer?.name) }}
                    </span>
                  </div>
                  <span class="text-sm text-neutral-900">{{ feedback.reviewer?.name }}</span>
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-neutral-500">Reviewee</dt>
                <dd class="mt-1 flex items-center space-x-2">
                  <div class="w-6 h-6 bg-secondary-100 rounded-full flex items-center justify-center">
                    <span class="text-xs font-semibold text-secondary-700">
                      {{ getInitials(feedback.reviewee?.name) }}
                    </span>
                  </div>
                  <span class="text-sm text-neutral-900">{{ feedback.reviewee?.name }}</span>
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-neutral-500">Review Period</dt>
                <dd class="mt-1 text-sm text-neutral-900">{{ feedback.period }}</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-neutral-500">Submitted</dt>
                <dd class="mt-1 text-sm text-neutral-900">{{ formatDate(feedback.created_at) }}</dd>
              </div>
              
              <div v-if="feedback.updated_at !== feedback.created_at">
                <dt class="text-sm font-medium text-neutral-500">Last Updated</dt>
                <dd class="mt-1 text-sm text-neutral-900">{{ formatDate(feedback.updated_at) }}</dd>
              </div>
            </dl>
          </InfoCard>

          <!-- Quick Actions -->
          <InfoCard title="Quick Actions" icon="bolt">
            <div class="space-y-3">
              <BaseButton
                v-if="canEdit"
                :href="route('feedbacks.edit', feedback.id)"
                variant="secondary"
                icon-left="pencil"
                label="Edit Feedback"
                full-width
              />
              
              <BaseButton
                variant="secondary"
                icon-left="document-download"
                label="Export PDF"
                full-width
                @click="exportPDF"
              />
              
              <BaseButton
                variant="secondary"
                icon-left="envelope"
                label="Share Feedback"
                full-width
                @click="shareFeedback"
              />
              
              <BaseButton
                v-if="canDelete"
                variant="ghost"
                icon-left="trash"
                label="Delete Feedback"
                full-width
                @click="deleteFeedback"
                class="text-red-600 hover:text-red-700 hover:bg-red-50"
              />
            </div>
          </InfoCard>

          <!-- Related Feedbacks -->
          <InfoCard v-if="relatedFeedbacks?.length" title="Related Feedbacks" icon="folder">
            <div class="space-y-3">
              <Link
                v-for="related in relatedFeedbacks"
                :key="related.id"
                :href="route('feedbacks.show', related.id)"
                class="block p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-neutral-900">{{ related.period }}</p>
                    <p class="text-xs text-neutral-600">by {{ related.reviewer?.name }}</p>
                  </div>
                  <div class="flex items-center space-x-1">
                    <Icon
                      v-for="star in 5"
                      :key="star"
                      name="star-solid"
                      :class="[
                        'w-3 h-3',
                        star <= related.rating ? 'text-yellow-400' : 'text-neutral-300'
                      ]"
                    />
                  </div>
                </div>
              </Link>
            </div>
          </InfoCard>
        </div>
      </template>
    </DetailPage>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link, useForm, router } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import { ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import DetailPage from '@/Components/Layout/DetailPage.vue';
import InfoCard from '@/Components/Layout/InfoCard.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';
import BaseTextarea from '@/Components/Base/BaseTextarea.vue';
import Icon from '@/Components/Base/Icon.vue';
import { useAuth } from '@/composables/useAuth';
import { useNotifications } from '@/composables/useNotifications';

const props = defineProps({
  feedback: Object,
  relatedFeedbacks: {
    type: Array,
    default: () => []
  }
});

const { user, hasAnyRole, getUserProperty } = useAuth();
const { showNotification } = useNotifications();

// Reactive state
const showResponseForm = ref(false);

// Response form
const responseForm = useForm({
  response: ''
});

// Computed properties
const userId = computed(() => getUserProperty('id'));
const isAdminOrHR = computed(() => hasAnyRole(['Admin', 'HR']));
const isReviewee = computed(() => props.feedback.reviewee_id === userId.value);
const canEdit = computed(() => props.feedback.reviewer_id === userId.value || isAdminOrHR.value);
const canDelete = computed(() => canEdit.value);
const canRespond = computed(() => isReviewee.value || isAdminOrHR.value);

// Feedback status
const feedbackStatus = computed(() => {
  if (props.feedback.response) {
    return {
      label: 'Responded',
      variant: 'success'
    };
  }
  return {
    label: 'Pending Response',
    variant: 'warning'
  };
});

// Breadcrumbs
const breadcrumbs = computed(() => [
  { label: 'Feedbacks', href: route('feedbacks.index') },
  { label: `${props.feedback.reviewee?.name} - ${props.feedback.period}`, current: true }
]);

// Page actions
const pageActions = computed(() => {
  const actions = [];
  
  if (canEdit.value) {
    actions.push({
      id: 'edit',
      label: 'Edit',
      icon: 'pencil',
      variant: 'secondary',
      href: route('feedbacks.edit', props.feedback.id)
    });
  }
  
  actions.push({
    id: 'export',
    label: 'Export PDF',
    icon: 'document-download',
    variant: 'secondary'
  });
  
  if (canDelete.value) {
    actions.push({
      id: 'delete',
      label: 'Delete',
      icon: 'trash',
      variant: 'danger'
    });
  }
  
  return actions;
});

// Helper functions
const getRatingLabel = (rating) => {
  const labels = {
    1: 'Needs Improvement',
    2: 'Below Expectations',
    3: 'Meets Expectations',
    4: 'Exceeds Expectations',
    5: 'Exceptional'
  };
  return labels[rating] || 'No rating';
};

const getCategoryIcon = (category) => {
  const icons = {
    communication: 'chat',
    teamwork: 'users',
    technical: 'cog',
    leadership: 'star',
    initiative: 'bolt',
    reliability: 'shield'
  };
  return icons[category] || 'star';
};

const getSentimentIcon = (rating) => {
  if (rating >= 4) return 'heart';
  if (rating >= 3) return 'star';
  return 'warning';
};

const getSentimentBgColor = (rating) => {
  if (rating >= 4) return 'bg-green-100';
  if (rating >= 3) return 'bg-yellow-100';
  return 'bg-red-100';
};

const getSentimentTextColor = (rating) => {
  if (rating >= 4) return 'text-green-600';
  if (rating >= 3) return 'text-yellow-600';
  return 'text-red-600';
};

const getSentimentLabel = (rating) => {
  if (rating >= 4) return 'Positive Feedback';
  if (rating >= 3) return 'Constructive Feedback';
  return 'Needs Attention';
};

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Event handlers
const submitResponse = () => {
  responseForm.post(route('feedbacks.respond', props.feedback.id), {
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Response Submitted',
        message: 'Your response to the feedback has been submitted successfully.'
      });
      showResponseForm.value = false;
    },
    onError: () => {
      showNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to submit your response. Please try again.'
      });
    }
  });
};

const cancelResponse = () => {
  responseForm.reset();
  showResponseForm.value = false;
};

const exportPDF = () => {
  window.open(route('feedbacks.export-pdf', props.feedback.id), '_blank');
  showNotification({
    type: 'success',
    title: 'Export Started',
    message: 'Your PDF export is being prepared for download.'
  });
};

const shareFeedback = () => {
  if (navigator.share) {
    navigator.share({
      title: `Feedback for ${props.feedback.reviewee?.name}`,
      text: `Performance feedback for ${props.feedback.reviewee?.name} - ${props.feedback.period}`,
      url: window.location.href
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      showNotification({
        type: 'success',
        title: 'Link Copied',
        message: 'Feedback link has been copied to your clipboard.'
      });
    });
  }
};

const deleteFeedback = () => {
  if (confirm(`Are you sure you want to delete this feedback for ${props.feedback.reviewee?.name}?`)) {
    router.delete(route('feedbacks.destroy', props.feedback.id), {
      onSuccess: () => {
        showNotification({
          type: 'success',
          title: 'Feedback Deleted',
          message: 'The feedback has been successfully deleted.'
        });
        router.visit(route('feedbacks.index'));
      },
      onError: () => {
        showNotification({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete the feedback. Please try again.'
        });
      }
    });
  }
};
</script>