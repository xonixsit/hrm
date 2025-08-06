<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Edit Feedback</h1>
    <form @submit.prevent="submit">
      <div class="mb-4">
        <label for="reviewee_id" class="block text-sm font-medium text-gray-700">Reviewee</label>
        <select v-model="form.reviewee_id" id="reviewee_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
          <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
        </select>
        <div v-if="form.errors.reviewee_id" class="text-red-500 text-sm">{{ form.errors.reviewee_id }}</div>
      </div>
      <div class="mb-4">
        <label for="period" class="block text-sm font-medium text-gray-700">Period</label>
        <input v-model="form.period" type="text" id="period" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        <div v-if="form.errors.period" class="text-red-500 text-sm">{{ form.errors.period }}</div>
      </div>
      <div class="mb-4">
        <label for="comments" class="block text-sm font-medium text-gray-700">Comments</label>
        <textarea v-model="form.comments" id="comments" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
        <div v-if="form.errors.comments" class="text-red-500 text-sm">{{ form.errors.comments }}</div>
      </div>
      <div class="mb-4">
        <label for="rating" class="block text-sm font-medium text-gray-700">Rating</label>
        <input v-model="form.rating" type="number" id="rating" min="1" max="5" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        <div v-if="form.errors.rating" class="text-red-500 text-sm">{{ form.errors.rating }}</div>
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Update</button>
    </form>
  </div>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
  feedback: Object,
  users: Array,
});

const form = useForm({
  reviewee_id: props.feedback.reviewee_id,
  period: props.feedback.period,
  comments: props.feedback.comments,
  rating: props.feedback.rating,
});

const submit = () => {
  form.put(route('feedbacks.update', props.feedback.id));
};
</script>