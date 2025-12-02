<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Edit Work Report"
      subtitle="Update your sales activity report"
      :breadcrumbs="breadcrumbs"
    >
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <form @submit.prevent="submitForm">
          <!-- Form Header -->
          <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 class="text-lg font-medium text-gray-900">Report Information</h3>
          </div>
          
          <!-- Form Content -->
          <div class="p-6 space-y-6">
            <!-- Date Field -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormLabel for="date" required>Date</FormLabel>
                <FormInput
                  id="date"
                  v-model="form.date"
                  type="date"
                  :error="form.errors.date"
                  required
                />
                <FormError :message="form.errors.date" />
              </div>
            </div>
            
            <!-- Call Statistics Section -->
            <div class="pt-4">
              <h4 class="text-md font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Call Statistics</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormLabel for="calls" required>Total Calls Made</FormLabel>
                  <FormInput
                    id="calls"
                    v-model="form.calls"
                    type="number"
                    min="0"
                    :error="form.errors.calls"
                    required
                  />
                  <FormError :message="form.errors.calls" />
                </div>
                
                <div>
                  <FormLabel for="calls_not_received" required>Calls Not Received</FormLabel>
                  <FormInput
                    id="calls_not_received"
                    v-model="form.calls_not_received"
                    type="number"
                    min="0"
                    :error="form.errors.calls_not_received"
                    required
                  />
                  <FormError :message="form.errors.calls_not_received" />
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <FormLabel for="disconnected_calls" required>Disconnected Calls</FormLabel>
                  <FormInput
                    id="disconnected_calls"
                    v-model="form.disconnected_calls"
                    type="number"
                    min="0"
                    :error="form.errors.disconnected_calls"
                    required
                  />
                  <FormError :message="form.errors.disconnected_calls" />
                </div>
                
                <div>
                  <FormLabel for="follow_up_calls" required>Callbacks</FormLabel>
                  <FormInput
                    id="follow_up_calls"
                    v-model="form.follow_up_calls"
                    type="number"
                    min="0"
                    :error="form.errors.follow_up_calls"
                    required
                  />
                  <FormError :message="form.errors.follow_up_calls" />
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <FormLabel for="voice_mails" required>Voice Mails</FormLabel>
                  <FormInput
                    id="voice_mails"
                    v-model="form.voice_mails"
                    type="number"
                    min="0"
                    :error="form.errors.voice_mails"
                    required
                  />
                  <FormError :message="form.errors.voice_mails" />
                </div>
                
                <div>
                  <FormLabel for="interested_count" required>Interested Count</FormLabel>
                  <FormInput
                    id="interested_count"
                    v-model="form.interested_count"
                    type="number"
                    min="0"
                    :error="form.errors.interested_count"
                    required
                  />
                  <FormError :message="form.errors.interested_count" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <FormLabel for="not_interested_count" required>Not Interested Count</FormLabel>
                  <FormInput
                    id="not_interested_count"
                    v-model="form.not_interested_count"
                    type="number"
                    min="0"
                    :error="form.errors.not_interested_count"
                    required
                  />
                  <FormError :message="form.errors.not_interested_count" />
                </div>
              </div>
            </div>
            
            <!-- Other Communication Section -->
            <div class="pt-4">
              <h4 class="text-md font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Other Communication</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <FormLabel for="emails" required>Number of Emails</FormLabel>
                  <FormInput
                    id="emails"
                    v-model="form.emails"
                    type="number"
                    min="0"
                    :error="form.errors.emails"
                    required
                  />
                  <FormError :message="form.errors.emails" />
                </div>
                
                <div>
                  <FormLabel for="whatsapp" required>WhatsApp Messages</FormLabel>
                  <FormInput
                    id="whatsapp"
                    v-model="form.whatsapp"
                    type="number"
                    min="0"
                    :error="form.errors.whatsapp"
                    required
                  />
                  <FormError :message="form.errors.whatsapp" />
                </div>
                
                <div>
                  <FormLabel for="sms" required>SMS Count</FormLabel>
                  <FormInput
                    id="sms"
                    v-model="form.sms"
                    type="number"
                    min="0"
                    :error="form.errors.sms"
                    required
                  />
                  <FormError :message="form.errors.sms" />
                </div>
              </div>
            </div>
            
            <!-- Notes Section -->
            <div class="pt-4">
              <h4 class="text-md font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Additional Information</h4>
              <div>
                <FormLabel for="notes">Notes</FormLabel>
                <textarea
                  id="notes"
                  v-model="form.notes"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  rows="4"
                  :class="{ 'border-red-500': form.errors.notes }"
                ></textarea>
                <FormError :message="form.errors.notes" />
              </div>
            </div>
          </div>
          
          <!-- Form Footer -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              @click="cancelForm"
              :disabled="form.processing"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              :loading="form.processing"
              :disabled="form.processing"
            >
              Update Report
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { useForm, router } from '@inertiajs/vue3';
import { computed } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import FormLabel from '@/Components/Form/FormLabel.vue';
import FormInput from '@/Components/Form/FormInput.vue';
import FormError from '@/Components/Form/FormError.vue';
import Button from '@/Components/Button.vue';

const props = defineProps({
  workReport: Object,
});

// Helper function to format date for HTML date input (timezone-safe)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  // If it's already in YYYY-MM-DD format, return as is (most common case)
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  
  // For any other format, parse it safely without timezone issues
  // Split the date string and create date object with explicit local time
  try {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      // Create date in local timezone (month is 0-indexed)
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const formattedYear = date.getFullYear();
      const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
      const formattedDay = String(date.getDate()).padStart(2, '0');
      
      return `${formattedYear}-${formattedMonth}-${formattedDay}`;
    }
  } catch (error) {
    console.warn('Date parsing error:', error);
  }
  
  // Fallback: return the original string if parsing fails
  return dateString;
};

const form = useForm({
  date: formatDateForInput(props.workReport.date),
  calls: props.workReport.calls,
  calls_not_received: props.workReport.calls_not_received || 0,
  disconnected_calls: props.workReport.disconnected_calls || 0,
  follow_up_calls: props.workReport.follow_up_calls || 0,
  voice_mails: props.workReport.voice_mails || 0,
  interested_count: props.workReport.interested_count || 0,
  not_interested_count: props.workReport.not_interested_count || 0,
  emails: props.workReport.emails,
  whatsapp: props.workReport.whatsapp,
  sms: props.workReport.sms,
  notes: props.workReport.notes || '',
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Work Reports', href: route('work-reports.index') },
  { label: 'Edit Report', current: true }
]);

const submitForm = () => {
  form.put(route('work-reports.update', props.workReport.id), {
    onSuccess: () => {
      // Form submitted successfully
    },
    onError: () => {
      // Handle errors
    }
  });
};

const cancelForm = () => {
  router.visit(route('work-reports.index'));
};
</script>