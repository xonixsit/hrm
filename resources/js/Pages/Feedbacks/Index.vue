<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Feedback Management"
      subtitle="Manage and review team feedback submissions"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Search and Filters -->
      <ContentSection>
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div class="lg:col-span-2">
            <SearchBar
              v-model="searchQuery"
              placeholder="Search feedbacks by reviewer, reviewee, or period..."
              :suggestions="searchSuggestions"
              @search="handleSearch"
              @select="handleSearchSelect"
            />
          </div>
          
          <div class="lg:col-span-2">
            <div class="flex items-center space-x-3">
              <FilterPanel
                :filter-groups="filterGroups"
                :initial-filters="filters"
                @apply-filters="handleFilters"
                @clear-filters="handleClearFilters"
                class="flex-1"
              />
              
              <BaseButton
                variant="secondary"
                icon-left="adjustments-horizontal"
                @click="showAdvancedFilters = !showAdvancedFilters"
                :aria-expanded="showAdvancedFilters"
              />
            </div>
          </div>
        </div>
      </ContentSection>

      <!-- Feedback Statistics Cards -->
      <ContentSection>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Feedbacks"
            :value="feedbackStats.total || 0"
            icon="message-square"
            color="blue"
            :trend="{ value: '+12%', positive: true }"
          />
          
          <StatsCard
            title="Average Rating"
            :value="feedbackStats.averageRating || '0.0'"
            icon="star"
            color="green"
            :trend="{ value: '+0.3', positive: true }"
          />
          
          <StatsCard
            title="This Month"
            :value="feedbackStats.thisMonth || 0"
            icon="calendar"
            color="amber"
            :trend="{ value: '+5', positive: true }"
          />
          
          <StatsCard
            title="Positive Sentiment"
            :value="feedbackStats.positiveTrend || '0%'"
            icon="heart"
            color="purple"
            :trend="{ value: '+8%', positive: true }"
          />
        </div>
      </ContentSection>

      <!-- Feedbacks Data Table -->
      <ContentSection>
        <ContentCard>
          <DataTable
            :data="feedbacks.data"
            :columns="tableColumns"
            :loading="loading"
            :show-header="true"
            :show-footer="true"
            :selectable="canBulkDelete"
            :selected-rows="selectedFeedbacks"
            :row-actions="getRowActions"
            :header-actions="tableHeaderActions"
            :search-config="searchConfig"
            :filter-config="filterConfig"
            :empty-state="emptyState"
            @search="handleTableSearch"
            @filter="handleTableFilter"
            @row-click="handleRowClick"
            @row-action="handleRowAction"
            @header-action="handleHeaderAction"
            @selection-change="handleSelectionChange"
          />
          
          <!-- Custom Pagination -->
          <TablePagination
            :from="feedbacks.from"
            :to="feedbacks.to"
            :total="feedbacks.total"
            :links="feedbacks.links"
          />
        </ContentCard>
      </ContentSection>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link, router } from '@inertiajs/vue3';
import { computed, ref, onMounted } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import PageHeader from '@/Components/Layout/PageHeader.vue';
import ContentSection from '@/Components/Layout/ContentSection.vue';
import ContentCard from '@/Components/Layout/ContentCard.vue';
import StatsCard from '@/Components/Dashboard/StatsCard.vue';
import DataTable from '@/Components/Data/DataTable.vue';
import TablePagination from '@/Components/Data/TablePagination.vue';
import SearchBar from '@/Components/Search/SearchBar.vue';
import FilterPanel from '@/Components/Search/FilterPanel.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';
import Icon from '@/Components/Base/Icon.vue';
import { useAuth } from '@/composables/useAuth';
import { useNotifications } from '@/composables/useNotifications';

const props = defineProps({
  feedbacks: Object,
  feedbackStats: {
    type: Object,
    default: () => ({})
  }
});

const { user, roles, hasRole, hasAnyRole, getUserProperty } = useAuth();
const { showNotification } = useNotifications();

// Reactive state
const loading = ref(false);
const searchQuery = ref('');
const filters = ref({});
const selectedFeedbacks = ref([]);
const showAdvancedFilters = ref(false);

const userId = computed(() => getUserProperty('id'));
const isAdminOrHR = computed(() => hasAnyRole(['Admin', 'HR']));
const canBulkDelete = computed(() => isAdminOrHR.value);

// Breadcrumbs
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Feedbacks', current: true }
]);

// Table configuration
const tableColumns = computed(() => [
  {
    key: 'reviewer',
    label: 'Reviewer',
    sortable: true,
    priority: 'high',
    formatter: (value) => value?.name || 'N/A'
  },
  {
    key: 'reviewee',
    label: 'Reviewee', 
    sortable: true,
    priority: 'high',
    formatter: (value) => value?.name || 'N/A'
  },
  {
    key: 'period',
    label: 'Period',
    sortable: true,
    priority: 'medium'
  },
  {
    key: 'rating',
    label: 'Rating',
    sortable: true,
    priority: 'high',
    align: 'center'
  },
  {
    key: 'sentiment',
    label: 'Sentiment',
    sortable: false,
    priority: 'medium',
    align: 'center'
  },
  {
    key: 'created_at',
    label: 'Submitted',
    sortable: true,
    priority: 'low',
    formatter: (value) => new Date(value).toLocaleDateString()
  }
]);

// Search configuration
const searchConfig = computed(() => ({
  enabled: true,
  placeholder: 'Search feedbacks...',
  fields: ['reviewer.name', 'reviewee.name', 'period', 'comments']
}));

// Filter configuration
const filterGroups = computed(() => [
  {
    key: 'rating',
    label: 'Rating',
    type: 'checkbox',
    options: [
      { value: '5', label: '5 Stars', count: 0 },
      { value: '4', label: '4 Stars', count: 0 },
      { value: '3', label: '3 Stars', count: 0 },
      { value: '2', label: '2 Stars', count: 0 },
      { value: '1', label: '1 Star', count: 0 }
    ]
  },
  {
    key: 'period',
    label: 'Period',
    type: 'radio',
    options: [
      { value: 'Q1 2024', label: 'Q1 2024' },
      { value: 'Q2 2024', label: 'Q2 2024' },
      { value: 'Q3 2024', label: 'Q3 2024' },
      { value: 'Q4 2024', label: 'Q4 2024' }
    ]
  },
  {
    key: 'date_range',
    label: 'Date Range',
    type: 'daterange'
  }
]);

const filterConfig = computed(() => ({
  enabled: true,
  filters: filterGroups.value
}));

// Page header actions
const headerActions = computed(() => [
  {
    id: 'create',
    label: 'Submit Feedback',
    icon: 'plus',
    variant: 'primary',
    href: route('feedbacks.create')
  }
]);

// Table header actions
const tableHeaderActions = computed(() => {
  const actions = [
    {
      id: 'export',
      label: 'Export',
      icon: 'document-download',
      variant: 'secondary'
    }
  ];

  if (canBulkDelete.value && selectedFeedbacks.value.length > 0) {
    actions.push({
      id: 'bulk-delete',
      label: `Delete (${selectedFeedbacks.value.length})`,
      icon: 'trash',
      variant: 'danger'
    });
  }

  return actions;
});

// Row actions
const getRowActions = (feedback) => {
  const actions = [
    {
      id: 'view',
      label: 'View Details',
      icon: 'eye',
      href: route('feedbacks.show', feedback.id)
    }
  ];

  if (canEdit(feedback)) {
    actions.push({
      id: 'edit',
      label: 'Edit',
      icon: 'pencil',
      href: route('feedbacks.edit', feedback.id)
    });
  }

  if (canDelete(feedback)) {
    actions.push({
      id: 'delete',
      label: 'Delete',
      icon: 'trash',
      variant: 'danger'
    });
  }

  return actions;
};

// Empty state configuration
const emptyState = computed(() => ({
  title: 'No feedbacks found',
  description: 'There are no feedback submissions to display. Start by submitting your first feedback.',
  icon: 'message-square',
  actions: [
    {
      id: 'create',
      label: 'Submit Feedback',
      variant: 'primary',
      href: route('feedbacks.create')
    }
  ]
}));

// Search suggestions
const searchSuggestions = computed(() => [
  { text: 'Q4 2024', category: 'Period' },
  { text: 'Q3 2024', category: 'Period' },
  { text: 'High rating', category: 'Filter' },
  { text: 'Recent submissions', category: 'Filter' }
]);

// Permission helpers
const canEdit = (feedback) => {
  return feedback.reviewer_id === userId.value || isAdminOrHR.value;
};

const canDelete = (feedback) => {
  return canEdit(feedback);
};

// Event handlers
const handleSearch = (query) => {
  searchQuery.value = query;
  // Implement search logic or make API call
  console.log('Searching for:', query);
};

const handleSearchSelect = (suggestion) => {
  searchQuery.value = suggestion.text;
  handleSearch(suggestion.text);
};

const handleFilters = (newFilters) => {
  filters.value = newFilters;
  // Implement filter logic or make API call
  console.log('Applying filters:', newFilters);
};

const handleClearFilters = () => {
  filters.value = {};
  // Clear filters and refresh data
  console.log('Clearing filters');
};

const handleTableSearch = (query) => {
  handleSearch(query);
};

const handleTableFilter = (filterData) => {
  // Handle table-level filtering
  console.log('Table filter:', filterData);
};

const handleRowClick = (feedback) => {
  // Navigate to feedback details
  router.visit(route('feedbacks.show', feedback.id));
};

const handleRowAction = ({ action, row }) => {
  switch (action.id) {
    case 'view':
      router.visit(route('feedbacks.show', row.id));
      break;
    case 'edit':
      router.visit(route('feedbacks.edit', row.id));
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
};

const handleHeaderAction = (action) => {
  switch (action.id) {
    case 'export':
      handleExport();
      break;
    case 'bulk-delete':
      handleBulkDelete();
      break;
  }
};

const handleSelectionChange = (selection) => {
  selectedFeedbacks.value = selection;
};

const handleDelete = (feedback) => {
  if (confirm(`Are you sure you want to delete the feedback from ${feedback.reviewer?.name}?`)) {
    loading.value = true;
    router.delete(route('feedbacks.destroy', feedback.id), {
      onSuccess: () => {
        showNotification({
          type: 'success',
          title: 'Feedback Deleted',
          message: 'The feedback has been successfully deleted.'
        });
      },
      onError: () => {
        showNotification({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete the feedback. Please try again.'
        });
      },
      onFinish: () => {
        loading.value = false;
      }
    });
  }
};

const handleBulkDelete = () => {
  if (confirm(`Are you sure you want to delete ${selectedFeedbacks.value.length} selected feedbacks?`)) {
    loading.value = true;
    const ids = selectedFeedbacks.value.map(feedback => feedback.id);
    
    router.post(route('feedbacks.bulk-delete'), { ids }, {
      onSuccess: () => {
        selectedFeedbacks.value = [];
        showNotification({
          type: 'success',
          title: 'Feedbacks Deleted',
          message: `Successfully deleted ${ids.length} feedbacks.`
        });
      },
      onError: () => {
        showNotification({
          type: 'error',
          title: 'Bulk Delete Failed',
          message: 'Failed to delete selected feedbacks. Please try again.'
        });
      },
      onFinish: () => {
        loading.value = false;
      }
    });
  }
};

const handleExport = () => {
  loading.value = true;
  window.location.href = route('feedbacks.export', {
    search: searchQuery.value,
    filters: filters.value
  });
  
  setTimeout(() => {
    loading.value = false;
    showNotification({
      type: 'success',
      title: 'Export Started',
      message: 'Your feedback export is being prepared for download.'
    });
  }, 1000);
};

// Get sentiment indicator for rating
const getSentimentIcon = (rating) => {
  if (rating >= 4) return 'heart';
  if (rating >= 3) return 'star';
  return 'warning';
};

const getSentimentColor = (rating) => {
  if (rating >= 4) return 'text-green-500';
  if (rating >= 3) return 'text-yellow-500';
  return 'text-red-500';
};

// Lifecycle
onMounted(() => {
  // Initialize any required data
  console.log('Feedbacks page mounted');
});
</script>