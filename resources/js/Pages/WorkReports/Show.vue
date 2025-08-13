<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Work Report Details</h1>
    <div class="bg-white p-4 rounded shadow">
      <p v-if="isManagerOrAdmin"><strong>Employee:</strong> {{ workReport.employee.user.name }}</p>
      <p><strong>Date:</strong> {{ workReport.date }}</p>
      <p><strong>Calls:</strong> {{ workReport.calls }}</p>
      <p><strong>Emails:</strong> {{ workReport.emails }}</p>
      <p><strong>WhatsApp:</strong> {{ workReport.whatsapp }}</p>
      <p><strong>SMS:</strong> {{ workReport.sms }}</p>
    </div>
    <div class="mt-4">
      <Link :href="route('work-reports.edit', workReport.id)" class="bg-green-500 text-white px-4 py-2 rounded mr-2">Edit</Link>
      <Link :href="route('work-reports.index')" class="bg-gray-500 text-white px-4 py-2 rounded">Back</Link>
    </div>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth';
import { computed } from 'vue';

const props = defineProps({
  workReport: Object,
});

const { hasAnyRole } = useAuth();
const isManagerOrAdmin = computed(() => hasAnyRole(['Admin', 'Manager']));
</script>