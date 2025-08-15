<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Submit Work Report"
      subtitle="Record your daily communication activities"
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
                  <FormLabel for="follow_up_calls" required>Follow-up Calls</FormLabel>
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
                  <FormLabel for="successful_calls" required>Successful Calls</FormLabel>
                  <FormInput
                    id="successful_calls"
                    v-model="form.successful_calls"
                    type="number"
                    min="0"
                    :error="form.errors.successful_calls"
                    required
                  />
                  <FormError :message="form.errors.successful_calls" />
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
              Submit Report
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

const form = useForm({
  date: new Date().toISOString().split('T')[0], // Default to today's date
  calls: 0,
  calls_not_received: 0,
  disconnected_calls: 0,
  follow_up_calls: 0,
  successful_calls: 0,
  emails: 0,
  whatsapp: 0,
  sms: 0,
  notes: '',
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Work Reports', href: route('work-reports.index') },
  { label: 'Submit Report', current: true }
]);

const submitForm = () => {
  form.post(route('work-reports.store'), {
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