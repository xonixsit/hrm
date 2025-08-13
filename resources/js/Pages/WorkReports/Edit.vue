<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Edit Work Report</h1>
    <form @submit.prevent="form.put(route('work-reports.update', workReport.id))">
      <div class="mb-4">
        <label class="block">Date</label>
        <input v-model="form.date" type="date" class="w-full border px-2 py-1" />
        <div v-if="form.errors.date" class="text-red-500">{{ form.errors.date }}</div>
      </div>
      <div class="mb-4">
        <label class="block">No. of Calls</label>
        <input v-model="form.calls" type="number" min="0" class="w-full border px-2 py-1" />
        <div v-if="form.errors.calls" class="text-red-500">{{ form.errors.calls }}</div>
      </div>
      <div class="mb-4">
        <label class="block">No. of Emails</label>
        <input v-model="form.emails" type="number" min="0" class="w-full border px-2 py-1" />
        <div v-if="form.errors.emails" class="text-red-500">{{ form.errors.emails }}</div>
      </div>
      <div class="mb-4">
        <label class="block">WhatsApp Messages</label>
        <input v-model="form.whatsapp" type="number" min="0" class="w-full border px-2 py-1" />
        <div v-if="form.errors.whatsapp" class="text-red-500">{{ form.errors.whatsapp }}</div>
      </div>
      <div class="mb-4">
        <label class="block">SMS Count</label>
        <input v-model="form.sms" type="number" min="0" class="w-full border px-2 py-1" />
        <div v-if="form.errors.sms" class="text-red-500">{{ form.errors.sms }}</div>
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded" :disabled="form.processing">Update</button>
    </form>
  </div>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3';

 defineProps({
  workReport: Object,
});

const form = useForm({
  date: props.workReport.date,
  calls: props.workReport.calls,
  emails: props.workReport.emails,
  whatsapp: props.workReport.whatsapp,
  sms: props.workReport.sms,
});
</script>