<template>
  <div class="attendance-edit-page">
    <!-- Page Header -->
    <PageHeader
      title="Edit Attendance"
      description="Update attendance record details"
    >
      <template #actions>
        <div class="flex space-x-2">
          <BaseButton
            :href="route('attendances.index')"
            variant="secondary"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
            </template>
            Back to List
          </BaseButton>
        </div>
      </template>
    </PageHeader>

    <!-- Main Content -->
    <PageLayout>
      <ContentSection title="Attendance Details" description="Update the attendance record information">
        <ContentCard>
          <FormLayout @submit="form.put(route('attendances.update', attendance.id))">
            <FormSection title="Time Information" description="Update clock in/out times">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="clock_in" class="block text-sm font-medium text-neutral-700 mb-1">
                    Clock In Time
                  </label>
                  <input
                    id="clock_in"
                    v-model="form.clock_in"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    :class="{ 'border-red-500': form.errors.clock_in }"
                  />
                  <div v-if="form.errors.clock_in" class="mt-1 text-sm text-red-600">
                    {{ form.errors.clock_in }}
                  </div>
                </div>

                <div>
                  <label for="clock_out" class="block text-sm font-medium text-neutral-700 mb-1">
                    Clock Out Time
                  </label>
                  <input
                    id="clock_out"
                    v-model="form.clock_out"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    :class="{ 'border-red-500': form.errors.clock_out }"
                  />
                  <div v-if="form.errors.clock_out" class="mt-1 text-sm text-red-600">
                    {{ form.errors.clock_out }}
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="Additional Information" description="Add notes or comments about this attendance record">
              <div>
                <label for="notes" class="block text-sm font-medium text-neutral-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  v-model="form.notes"
                  rows="4"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  :class="{ 'border-red-500': form.errors.notes }"
                  placeholder="Add any notes about this attendance record..."
                ></textarea>
                <div v-if="form.errors.notes" class="mt-1 text-sm text-red-600">
                  {{ form.errors.notes }}
                </div>
              </div>
            </FormSection>

            <FormActions>
              <BaseButton
                type="submit"
                variant="primary"
                :loading="form.processing"
              >
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </template>
                Update Attendance
              </BaseButton>
              <BaseButton
                :href="route('attendances.index')"
                variant="secondary"
              >
                Cancel
              </BaseButton>
            </FormActions>
          </FormLayout>
        </ContentCard>
      </ContentSection>
    </PageLayout>
  </div>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageHeader from '@/Components/Layout/PageHeader.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ContentSection from '@/Components/Layout/ContentSection.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';
import FormLayout from '@/Components/Forms/FormLayout.vue';
import FormSection from '@/Components/Forms/FormSection.vue';
import FormActions from '@/Components/Forms/FormActions.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';

defineOptions({
  layout: AuthenticatedLayout,
});

const props = defineProps({
  attendance: Object,
});

const form = useForm({
  clock_in: props.attendance.clock_in,
  clock_out: props.attendance.clock_out,
  notes: props.attendance.notes,
});
</script>

<style scoped>
.attendance-edit-page {
  @apply min-h-screen bg-neutral-50 py-8;
}
</style>