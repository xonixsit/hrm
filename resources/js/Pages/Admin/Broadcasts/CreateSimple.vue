<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Create Broadcast (Simple)"
      subtitle="Simplified version for testing"
      :breadcrumbs="breadcrumbs"
    >
      <form @submit.prevent="handleSubmit" class="max-w-4xl">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="e.g., Test Broadcast"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
            <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
          </div>

          <!-- Content -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              v-model="form.content"
              rows="4"
              placeholder="Write your broadcast message here..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            ></textarea>
            <p v-if="errors.content" class="mt-1 text-sm text-red-600">{{ errors.content }}</p>
          </div>

          <!-- Actions -->
          <div class="border-t border-gray-200 pt-6 flex space-x-4">
            <button
              type="submit"
              :disabled="processing"
              class="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {{ processing ? 'Creating...' : 'Create Broadcast' }}
            </button>
            <Link
              :href="route('admin.broadcasts.index')"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue';
import { Link, useForm } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Admin', href: '#' },
  { label: 'Broadcasts', href: route('admin.broadcasts.index') },
  { label: 'Create Simple', current: true }
]);

const { data: form, errors, processing, post } = useForm({
  title: '',
  content: '',
  type: 'announcement',
  email_template: 'professional',
  notes: '',
  scheduled_at: null,
});

const handleSubmit = () => {
  console.log('Form data:', form);
  console.log('Post function:', post);
  
  try {
    post(route('admin.broadcasts.store'), {
      onSuccess: () => {
        console.log('Success!');
      },
      onError: (errors) => {
        console.log('Errors:', errors);
      }
    });
  } catch (error) {
    console.error('Submit error:', error);
  }
};
</script>