<template>
  <AuthenticatedLayout>
    <PageLayout title="Role Management" subtitle="Assign and manage user roles in the system"
      :breadcrumbs="breadcrumbs">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SimpleInfoCard v-for="role in roleStats" :key="role.name" :title="role.name" :value="role.count"
          :subtitle="`${role.count === 1 ? 'user' : 'users'} with this role`" :icon="role.icon" :color="role.color" />
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div class="px-6 py-4 border-b border-neutral-200">
          <h3 class="text-lg font-semibold text-neutral-900">User Role Assignments</h3>
          <p class="text-sm text-neutral-600 mt-1">Manage roles for all employees in the system</p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-200 role-management-table">
            <thead class="bg-neutral-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Employee
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-48">
                  Role Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-neutral-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-neutral-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-sm font-semibold text-primary-700">
                        {{ getInitials(user.name) }}
                      </span>
                    </div>
                    <div class="ml-4 min-w-0">
                      <div class="text-sm font-medium text-neutral-900 truncate">{{ user.name }}</div>
                      <div class="text-sm text-neutral-500 truncate">{{ user.email }}</div>
                      <div class="text-xs text-neutral-400">ID: {{ user.employee_code }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap gap-1">
                    <span v-if="user.roles.length === 0"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 role-badge">
                      No Role
                    </span>
                    <span v-for="role in user.roles" :key="role" :class="getRoleBadgeClass(role)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium role-badge">
                      {{ role }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                  <span class="truncate">{{ user.job_title || 'Not specified' }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                    {{ user.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-medium">
                  <div class="w-44">
                    <!-- Role Assignment Section -->
                    <div class="space-y-2">
                      <label class="block text-xs font-medium text-neutral-700">
                        Assign Role
                      </label>
                      <BaseSelect :model-value="user.roles[0] || ''" :options="roleOptions" placeholder="Select role"
                        size="sm" class="w-full" @update:model-value="(role) => assignRole(user.id, role)" />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
  import { computed } from 'vue'
  import { router } from '@inertiajs/vue3'
  import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
  import PageLayout from '@/Components/Layout/PageLayout.vue'
  import SimpleInfoCard from '@/Components/UI/SimpleInfoCard.vue'
  import BaseSelect from '@/Components/Base/BaseSelect.vue'
  import BaseButton from '@/Components/Base/BaseButton.vue'

  const props = defineProps({
    users: Array,
    availableRoles: Array,
    currentUserId: Number,
  })

  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard'), icon: 'home' },
    { label: 'Administration', href: '#' },
    { label: 'Role Management', href: route('admin.roles.index'), current: true },
  ]

  const roleOptions = computed(() => {
    return props.availableRoles.map(role => ({
      value: role,
      label: role
    }))
  })

  const roleStats = computed(() => {
    const stats = props.availableRoles.map(role => {
      const count = props.users.filter(user => user.roles.includes(role)).length
      return {
        name: role,
        count,
        icon: getRoleIcon(role),
        color: getRoleColor(role)
      }
    })

    // Add "No Role" stat
    const noRoleCount = props.users.filter(user => user.roles.length === 0).length
    if (noRoleCount > 0) {
      stats.push({
        name: 'No Role',
        count: noRoleCount,
        icon: 'UserIcon',
        color: 'neutral'
      })
    }

    return stats
  })

  function getInitials(name) {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function getRoleIcon(role) {
    const icons = {
      'Admin': 'ShieldCheckIcon',
      'HR': 'UserGroupIcon',
      'Manager': 'BriefcaseIcon',
      'Employee': 'UserIcon',
    }
    return icons[role] || 'UserIcon'
  }

  function getRoleColor(role) {
    const colors = {
      'Admin': 'red',
      'HR': 'blue',
      'Manager': 'green',
      'Employee': 'yellow',
    }
    return colors[role] || 'neutral'
  }

  function getRoleBadgeClass(role) {
    const classes = {
      'Admin': 'bg-red-100 text-red-800',
      'HR': 'bg-blue-100 text-blue-800',
      'Manager': 'bg-green-100 text-green-800',
      'Employee': 'bg-yellow-100 text-yellow-800',
    }
    return classes[role] || 'bg-neutral-100 text-neutral-800'
  }



  function assignRole(userId, role) {
    if (!role) return

    // Check if user is trying to remove their own admin role
    const user = props.users.find(u => u.id === userId)
    if (userId === props.currentUserId && user?.roles.includes('Admin') && role !== 'Admin') {
      alert('You cannot remove your own Admin role.')
      return
    }

    // Don't make request if role is already assigned
    if (user?.roles.includes(role)) {
      return
    }

    router.post(route('admin.roles.assign', userId), {
      role: role
    }, {
      preserveScroll: true,
      onSuccess: () => {
        // Success message will be handled by the backend
      },
      onError: (errors) => {
        console.error('Error assigning role:', errors)
        // Show user-friendly error message
        if (errors.message) {
          alert(errors.message)
        } else {
          alert('Failed to assign role. Please try again.')
        }
      }
    })
  }


</script>

<style scoped>
  /* Custom styles for role management table */
  .role-management-table {
    /* Ensure consistent column widths */
  }

  .role-management-table th:nth-child(1) {
    width: 25%;
    min-width: 200px;
  }

  .role-management-table th:nth-child(2) {
    width: 15%;
    min-width: 120px;
  }

  .role-management-table th:nth-child(3) {
    width: 20%;
    min-width: 150px;
  }

  .role-management-table th:nth-child(4) {
    width: 10%;
    min-width: 80px;
  }

  .role-management-table th:nth-child(5) {
    width: 30%;
    min-width: 200px;
  }

  /* Improve hover effects */
  .role-management-table tbody tr:hover {
    background-color: rgb(249 250 251);
  }

  /* Better spacing for role actions column */
  .role-actions-column {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  /* Ensure consistent button heights */
  .role-management-table .base-select-wrapper,
  .role-management-table button {
    min-height: 36px;
  }

  /* Improve visual hierarchy */
  .role-badge {
    font-weight: 500;
    letter-spacing: 0.025em;
  }

  /* Better focus states */
  .role-management-table button:focus,
  .role-management-table .base-select-wrapper button:focus {
    outline: 2px solid rgb(59 130 246);
    outline-offset: 2px;
  }

  /* Responsive improvements */
  @media (max-width: 768px) {

    .role-management-table th:nth-child(3),
    .role-management-table td:nth-child(3) {
      display: none;
    }
  }

  @media (max-width: 640px) {

    .role-management-table th:nth-child(4),
    .role-management-table td:nth-child(4) {
      display: none;
    }
  }
</style>