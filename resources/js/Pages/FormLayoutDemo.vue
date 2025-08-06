<template>
  <div class="form-layout-demo-page">
    <FormLayoutDemo />
  </div>
</template>

<script setup>
import { Head } from '@inertiajs/vue3';
import FormLayoutDemo from '@/Components/Examples/FormLayoutDemo.vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

defineOptions({
  layout: AuthenticatedLayout,
});
</script>

<style scoped>
.form-layout-demo-page {
  @apply min-h-screen bg-neutral-50 py-8;
}
</style>