<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Work Reports"
      subtitle="Submit and manage daily work reports"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <DataTable
        :data="workReports.data"
        :columns="tableColumns"
        :loading="loading"
        :row-actions="getRowActions"
        :empty-state="emptyState"
        @row-action="handleRowAction"
      />
      <div v-if="workReports.links && workReports.links.length > 3" class="mt-6">
        <Pagination :links="workReports.links" />
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { router } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import DataTable from '@/Components/Data/DataTable.vue';
import Pagination from '@/Components/Pagination.vue';
import { useAuth } from '@/composables/useAuth';

const props = defineProps({
  workReports: Object,
});

const { hasAnyRole, hasRole } = useAuth();
const loading = ref(false);
const canCreate = computed(() => hasRole('Employee'));

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Work Reports', current: true }
]);

const headerActions = computed(() => {
  if (!canCreate.value) return [];
  return [
    {
      id: 'create',
      label: 'Submit New Report',
      variant: 'primary',
      icon: 'plus',
      handler: () => router.visit(route('work-reports.create'))
    }
  ];
});

const tableColumns = computed(() => {
  const columns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      formatter: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'calls',
      label: 'Calls',
      sortable: true
    },
    {
      key: 'emails',
      label: 'Emails',
      sortable: true
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      sortable: true
    },
    {
      key: 'sms',
      label: 'SMS',
      sortable: true
    },
  ];
  if (hasAnyRole(['Admin', 'Manager'])) {
    columns.splice(1, 0, {
      key: 'employee',
      label: 'Employee',
      sortable: true,
      formatter: (value) => value?.user?.name || 'Unavailable'
    });
  }
  return columns;
});

const getRowActions = (row) => ([
  {
    id: 'view',
    label: 'View',
    icon: 'eye',
    handler: () => router.visit(route('work-reports.show', row.id))
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: 'pencil',
    handler: () => router.visit(route('work-reports.edit', row.id))
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: 'trash',
    variant: 'danger',
    handler: () => destroy(row.id)
  },
]);

const emptyState = computed(() => ({
  title: 'No work reports found',
  description: 'There are no work reports to display. Submit your first report to get started.',
  icon: 'document-text',
  actions: canCreate.value ? [{
    id: 'create',
    label: 'Submit New Report',
    variant: 'primary',
    icon: 'plus',
    handler: () => router.visit(route('work-reports.create'))
  }] : []
}));

const destroy = (id) => {
  if (confirm('Are you sure?')) {
    router.delete(route('work-reports.destroy', id));
  }
};

const handleRowAction = (action, row) => {
  action.handler(row);
};
</script>