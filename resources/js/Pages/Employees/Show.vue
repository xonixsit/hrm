<template>
  <AuthenticatedLayout>
    <PageLayout :title="employee.user.name"
      :subtitle="`${employee.job_title} • ${employee.department?.name || 'No Department'}`" :breadcrumbs="breadcrumbs"
      :actions="headerActions">
      <!-- Employee Header Card -->
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
        <div class="relative">
          <!-- Cover Background -->
          <div class="h-32 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600"></div>

          <!-- Employee Info Overlay -->
          <div class="relative px-6 pb-6">
            <div class="flex items-end space-x-6 -mt-16">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <div class="h-24 w-24 rounded-full bg-white p-1 shadow-lg">
                  <div
                    class="h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span class="text-2xl font-bold text-white">
                      {{ getInitials(employee.user.name) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Employee Details -->
              <div class="flex-1 min-w-0 pb-2">
                <div class="flex items-center justify-between">
                  <div>
                    <h1 class="text-2xl font-bold text-gray-900">{{ employee.user.name }}</h1>
                    <p class="text-lg text-gray-600">{{ employee.job_title }}</p>
                    <div class="flex items-center mt-2 space-x-4">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ employee.employee_code }}
                      </span>
                      <span :class="getStatusClasses(employee.status)"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ employee.status || 'Active' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CalendarIcon class="h-8 w-8 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Years of Service</p>
              <p class="text-2xl font-semibold text-gray-900">{{ calculateYearsOfService() }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <BuildingOfficeIcon class="h-8 w-8 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Department</p>
              <p class="text-lg font-semibold text-gray-900">{{ employee.department?.name || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <DocumentTextIcon class="h-8 w-8 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Contract Type</p>
              <p class="text-lg font-semibold text-gray-900">{{ employee.contract_type || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <EnvelopeIcon class="h-8 w-8 text-orange-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Contact</p>
              <p class="text-sm font-semibold text-gray-900 truncate">{{ employee.user.email }}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Primary Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Personal Information -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center">
                <UserIcon class="h-5 w-5 text-gray-400 mr-2" />
                <h3 class="text-lg font-medium text-gray-900">Personal Information</h3>
              </div>
              <p class="text-sm text-gray-600 mt-1">Personal details and contact information</p>
            </div>
            <div class="px-6 py-4">
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Full Name</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.user.name }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Email Address</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.user.email }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Employee Code</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.employee_code || 'Not assigned' }}</dd>
                </div>
                <div v-if="canViewPersonalInfo">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Date of Birth</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ formatDate(employee.date_of_birth) || 'Not provided'
                    }}</dd>
                </div>
                <div v-if="canViewPersonalInfo">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Gender</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ formatGender(employee.gender) || 'Not provided' }}
                  </dd>
                </div>
                <div v-if="canViewPersonalInfo">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Nationality</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.nationality || 'Not provided' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Phone</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.phone || 'Not provided' }}</dd>
                </div>
                <div v-if="canViewContactInfo">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Personal Email</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.personal_email || 'Not provided' }}</dd>
                </div>
                <div v-if="canViewContactInfo && employee.current_address" class="md:col-span-2">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Current Address</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.current_address }}</dd>
                </div>
                <div v-if="canViewContactInfo && employee.permanent_address" class="md:col-span-2">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Permanent Address</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.permanent_address }}</dd>
                </div>
                <!-- Legacy address field for backward compatibility -->
                <div v-if="!employee.current_address && !employee.permanent_address && employee.address"
                  class="md:col-span-2">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Address</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.address }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Emergency Contact Information -->
          <div v-if="canViewContactInfo && hasEmergencyContact"
            class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900">Emergency Contact</h3>
              </div>
              <p class="text-sm text-gray-600 mt-1">Contact person in case of emergency</p>
            </div>
            <div class="px-6 py-4">
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-if="employee.emergency_contact_name">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Contact Name</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.emergency_contact_name }}</dd>
                </div>
                <div v-if="employee.emergency_contact_relationship">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Relationship</dt>
                  <dd class="text-sm font-medium text-gray-900">{{
                    formatRelationship(employee.emergency_contact_relationship) }}</dd>
                </div>
                <div v-if="employee.emergency_contact_phone">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Phone Number</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.emergency_contact_phone }}</dd>
                </div>
                <div v-if="employee.emergency_contact_email">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Email Address</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.emergency_contact_email }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Employment Information -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center">
                <BriefcaseIcon class="h-5 w-5 text-gray-400 mr-2" />
                <h3 class="text-lg font-medium text-gray-900">Employment Information</h3>
              </div>
              <p class="text-sm text-gray-600 mt-1">Job-related details and organizational structure</p>
            </div>
            <div class="px-6 py-4">
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Department</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.department?.name || 'No department assigned'
                    }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Job Title</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.job_title || 'No title assigned' }}</dd>
                </div>
                <div v-if="employee.manager">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Manager</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.manager?.name || 'No manager assigned' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Employment Type</dt>
                  <dd class="flex items-center">
                    <span :class="getEmploymentTypeBadgeClasses(employee.employment_type)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ formatEmploymentType(employee.employment_type) || 'Full Time' }}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Contract Type</dt>
                  <dd class="flex items-center">
                    <span :class="getContractTypeBadgeClasses(employee.contract_type)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ employee.contract_type || 'Not specified' }}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Work Location</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.work_location || 'Not specified' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Join Date</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ formatDate(employee.join_date) }}</dd>
                </div>
                <div class="md:col-span-2">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Time with Company</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ getTimeWithCompany(employee.join_date) }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Salary Information (Admin/HR Only) -->
          <div v-if="canViewSalaryInfo && (employee.salary || employee.bank_name)"
            class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900">Compensation & Banking</h3>
              </div>
              <p class="text-sm text-gray-600 mt-1">Salary and banking information (confidential)</p>
            </div>
            <div class="px-6 py-4">
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-if="employee.salary">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Annual Salary</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ formatSalary(employee.salary,
                    employee.salary_currency) }}</dd>
                </div>
                <div v-if="employee.bank_name">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Bank Name</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.bank_name }}</dd>
                </div>
                <div v-if="employee.bank_account_number">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Account Number</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ maskAccountNumber(employee.bank_account_number) }}
                  </dd>
                </div>
                <div v-if="employee.bank_routing_number">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Routing Number</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.bank_routing_number }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Additional Information -->
          <div v-if="hasAdditionalInfo" class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900">Additional Information</h3>
              </div>
              <p class="text-sm text-gray-600 mt-1">Skills, certifications, and other details</p>
            </div>
            <div class="px-6 py-4">
              <dl class="space-y-6">
                <div v-if="employee.skills">
                  <dt class="text-sm font-medium text-gray-500 mb-2">Skills</dt>
                  <dd class="text-sm text-gray-900">
                    <div class="flex flex-wrap gap-2">
                      <span v-for="skill in parseSkills(employee.skills)" :key="skill"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ skill }}
                      </span>
                    </div>
                  </dd>
                </div>
                <div v-if="employee.certifications">
                  <dt class="text-sm font-medium text-gray-500 mb-2">Certifications</dt>
                  <dd class="text-sm text-gray-900">
                    <div class="flex flex-wrap gap-2">
                      <span v-for="cert in parseCertifications(employee.certifications)" :key="cert"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {{ cert }}
                      </span>
                    </div>
                  </dd>
                </div>
                <div v-if="employee.education">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Education</dt>
                  <dd class="text-sm text-gray-900 whitespace-pre-line">{{ employee.education }}</dd>
                </div>
                <div v-if="employee.notes">
                  <dt class="text-sm font-medium text-gray-500 mb-1">Notes</dt>
                  <dd class="text-sm text-gray-900 whitespace-pre-line">{{ employee.notes }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center">
                <ClockIcon class="h-5 w-5 text-gray-400 mr-2" />
                <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <p class="text-sm text-gray-600 mt-1">Latest updates and changes</p>
            </div>
            <div class="px-6 py-4">
              <div class="space-y-4">
                <div class="flex items-center space-x-3">
                  <UserIcon class="h-5 w-5 text-gray-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-900">Employee record created</p>
                    <p class="text-xs text-gray-500">{{ formatDateTime(employee.created_at) }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <PencilIcon class="h-5 w-5 text-gray-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-900">Last updated</p>
                    <p class="text-xs text-gray-500">{{ formatDateTime(employee.updated_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Employee Summary -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Employee Summary</h3>
            </div>
            <div class="px-6 py-4">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Status</span>
                  <span :class="getStatusClasses(employee.status)"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                    {{ employee.status || 'Active' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Years of Service</span>
                  <span class="text-sm font-medium text-gray-900">{{ calculateYearsOfService() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Contract</span>
                  <span :class="getContractTypeBadgeClasses(employee.contract_type)"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                    {{ employee.contract_type || 'N/A' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Department</span>
                  <span class="text-sm font-medium text-gray-900 truncate">{{ employee.department?.name || 'N/A'
                    }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- System Information -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center">
                <InformationCircleIcon class="h-5 w-5 text-gray-400 mr-2" />
                <h3 class="text-lg font-medium text-gray-900">System Information</h3>
              </div>
            </div>
            <div class="px-6 py-4">
              <dl class="space-y-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Employee ID</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ employee.id }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Created</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ formatDateTime(employee.created_at) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 mb-1">Last Modified</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ formatDateTime(employee.updated_at) }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Employee Offboarding Section -->
      <div v-if="!employee.exit_date" class="mt-8 bg-white shadow-sm rounded-lg border border-orange-200">
        <div class="px-6 py-4 border-b border-orange-200 bg-orange-50">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <h3 class="text-lg font-medium text-orange-900">Employee Offboarding</h3>
          </div>
          <p class="text-sm text-orange-700 mt-1">Process employee exit while preserving historical data</p>
        </div>
        <div class="px-6 py-4">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900">Mark as Exit</h4>
              <p class="text-sm text-gray-600 mt-1">
                Mark this employee as having left the organization. This will deactivate their account while preserving
                all historical data for audit purposes.
              </p>
            </div>
            <button @click="showExitModal = true"
              class="ml-6 flex items-center px-4 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Mark as Exit
            </button>
          </div>
        </div>
      </div>

      <!-- Employee Exit Information (if already exited) -->
      <div v-else class="mt-8 bg-white shadow-sm rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900">Employee Exit Information</h3>
            </div>
            <button v-if="canReactivate" @click="handleReactivate"
              class="flex items-center px-3 py-1.5 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reactivate
            </button>
          </div>
        </div>
        <div class="px-6 py-4">
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt class="text-sm font-medium text-gray-500 mb-1">Exit Date</dt>
              <dd class="text-sm font-medium text-gray-900">{{ formatDate(employee.exit_date) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500 mb-1">Exit Reason</dt>
              <dd class="text-sm font-medium text-gray-900">{{ employee.exit_reason || 'Not specified' }}</dd>
            </div>
            <div v-if="employee.exit_notes" class="md:col-span-2">
              <dt class="text-sm font-medium text-gray-500 mb-1">Exit Notes</dt>
              <dd class="text-sm font-medium text-gray-900">{{ employee.exit_notes }}</dd>
            </div>
            <div v-if="employee.exit_processed_at">
              <dt class="text-sm font-medium text-gray-500 mb-1">Processed On</dt>
              <dd class="text-sm font-medium text-gray-900">{{ formatDateTime(employee.exit_processed_at) }}</dd>
            </div>
            <div v-if="employee.exit_processed_by">
              <dt class="text-sm font-medium text-gray-500 mb-1">Processed By</dt>
              <dd class="text-sm font-medium text-gray-900">{{ employee.exit_processed_by?.name || 'System' }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Exit Modal -->
      <div v-if="showExitModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click="showExitModal = false">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
          <div class="mt-3">
            <div class="flex items-center mb-4">
              <svg class="w-6 h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900">Mark Employee as Exit</h3>
            </div>

            <form @submit.prevent="handleMarkAsExit">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Exit Date</label>
                  <input v-model="exitForm.exit_date" type="date" :max="today" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Exit Reason</label>
                  <select v-model="exitForm.exit_reason" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="">Select reason...</option>
                    <option value="Resignation">Resignation</option>
                    <option value="Termination">Termination</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Contract End">Contract End</option>
                    <option value="Layoff">Layoff</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                  <textarea v-model="exitForm.exit_notes" rows="3"
                    placeholder="Any additional information about the exit..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"></textarea>
                </div>
              </div>

              <div class="flex justify-end space-x-3 mt-6">
                <button type="button" @click="showExitModal = false"
                  class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  Cancel
                </button>
                <button type="submit" :disabled="exitForm.processing"
                  class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50">
                  {{ exitForm.processing ? 'Processing...' : 'Mark as Exit' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="mt-12 bg-white shadow-sm rounded-lg border border-red-200">
        <div class="px-6 py-4 border-b border-red-200 bg-red-50">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 class="text-lg font-medium text-red-900">Danger Zone</h3>
          </div>
          <p class="text-sm text-red-700 mt-1">Irreversible and destructive actions</p>
        </div>
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900">Remove Employee</h4>
              <p class="text-sm text-gray-600 mt-1">
                Remove this employee from the system. They will be hidden from all records and filters, but data is
                preserved for audit purposes. This can be undone by administrators.
              </p>
            </div>
            <button @click="handleDelete"
              class="ml-6 flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
              <TrashIcon class="h-4 w-4 mr-2" />
              Remove Employee
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { router } from '@inertiajs/vue3'
  import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
  import PageLayout from '@/Components/Layout/PageLayout.vue'
  import InfoCard from '@/Components/Layout/InfoCard.vue'

  import {
    PencilIcon,
    TrashIcon,
    ArrowLeftIcon,
    UserIcon,
    BriefcaseIcon,
    ClockIcon,
    InformationCircleIcon,
    CalendarIcon,
    BuildingOfficeIcon,
    DocumentTextIcon,
    EnvelopeIcon
  } from '@heroicons/vue/24/outline'

  const props = defineProps({
    employee: {
      type: Object,
      required: true
    },
    permissions: {
      type: Object,
      required: true
    }
  })

  // RBAC Permissions (from server-side)
  const canViewPersonalInfo = computed(() => props.permissions.canViewPersonalInfo)
  const canViewContactInfo = computed(() => props.permissions.canViewContactInfo)
  const canViewSalaryInfo = computed(() => props.permissions.canViewSalaryInfo)
  const canEdit = computed(() => props.permissions.canEdit)
  const canEditEmploymentInfo = computed(() => props.permissions.canEditEmploymentInfo)
  const canMarkAsExit = computed(() => props.permissions.canMarkAsExit)
  const canReactivate = computed(() => props.permissions.canReactivate)
  const canDelete = computed(() => props.permissions.canDelete)

  // Helper computed properties
  const hasEmergencyContact = computed(() => {
    return props.employee.emergency_contact_name ||
      props.employee.emergency_contact_phone ||
      props.employee.emergency_contact_email
  })

  const hasAdditionalInfo = computed(() => {
    return props.employee.skills ||
      props.employee.certifications ||
      props.employee.education ||
      props.employee.notes
  })

  // Reactive state
  const loading = ref(false)
  const showExitModal = ref(false)
  const exitForm = ref({
    exit_date: '',
    exit_reason: '',
    exit_notes: '',
    processing: false
  })

  // Computed properties

  const today = computed(() => {
    return new Date().toISOString().split('T')[0]
  })

  const breadcrumbs = computed(() => [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Employees', href: route('employees.index') },
    { label: props.employee.user.name, current: true }
  ])

  const headerActions = computed(() => {
    const actions = [];

    if (canEdit.value) {
      actions.push({
        id: 'edit-employee',
        label: 'Edit Employee',
        icon: 'pencil',
        variant: 'primary',
        handler: () => router.visit(route('employees.edit', props.employee.id))
      });
    }

    actions.push({
      id: 'back-to-list',
      label: 'Back to Employees',
      icon: 'arrow-left',
      variant: 'secondary',
      handler: () => router.visit(route('employees.index'))
    });

    return actions;
  })

  const personalInfoData = computed(() => ({
    name: {
      label: 'Full Name',
      value: props.employee.user.name,
      type: 'text',
      editable: true
    },
    email: {
      label: 'Email Address',
      value: props.employee.user.email,
      type: 'email',
      editable: true
    },
    employee_code: {
      label: 'Employee Code',
      value: props.employee.employee_code,
      type: 'text',
      editable: true,
      emptyText: 'Not assigned'
    },
    status: {
      label: 'Status',
      value: props.employee.status || 'Active',
      type: 'badge',
      badgeVariant: getStatusVariant(props.employee.status),
      editable: true
    }
  }))

  const employmentInfoData = computed(() => ({
    department: {
      label: 'Department',
      value: props.employee.department?.name,
      type: 'text',
      emptyText: 'No department assigned'
    },
    job_title: {
      label: 'Job Title',
      value: props.employee.job_title,
      type: 'text',
      editable: true,
      emptyText: 'No title assigned'
    },
    contract_type: {
      label: 'Contract Type',
      value: props.employee.contract_type,
      type: 'badge',
      badgeVariant: getContractTypeVariant(props.employee.contract_type),
      emptyText: 'Not specified'
    },
    join_date: {
      label: 'Join Date',
      value: props.employee.join_date,
      type: 'date'
    },
    time_with_company: {
      label: 'Time with Company',
      value: getTimeWithCompany(props.employee.join_date),
      type: 'text'
    }
  }))

  const activityData = computed(() => [
    {
      label: 'Employee record created',
      value: formatDateTime(props.employee.created_at),
      icon: UserIcon,
      description: 'Initial employee record'
    },
    {
      label: 'Last updated',
      value: formatDateTime(props.employee.updated_at),
      icon: PencilIcon,
      description: 'Most recent modification'
    }
  ])

  const systemInfoData = computed(() => ({
    id: {
      label: 'Employee ID',
      value: props.employee.id,
      type: 'text'
    },
    created_at: {
      label: 'Created',
      value: props.employee.created_at,
      type: 'datetime'
    },
    updated_at: {
      label: 'Last Modified',
      value: props.employee.updated_at,
      type: 'datetime'
    }
  }))

  const quickActions = computed(() => [
    {
      id: 'edit',
      label: 'Edit Employee',
      icon: PencilIcon,
      variant: 'primary',
      handler: () => router.visit(route('employees.edit', props.employee.id)),
      permissions: ['employee.edit']
    },
    {
      id: 'delete',
      label: 'Delete Employee',
      icon: TrashIcon,
      variant: 'error',
      handler: handleDelete,
      permissions: ['employee.delete']
    }
  ])

  // Methods
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') {
      return '--';
    }
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const calculateYearsOfService = () => {
    if (!props.employee.join_date) return '0';

    const joinDate = new Date(props.employee.join_date);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));

    return diffYears.toString();
  }

  const getStatusClasses = (status) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status?.toLowerCase()) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'suspended':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  const getContractTypeBadgeClasses = (contractType) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (contractType) {
      case 'Full-time':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Part-time':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Contract':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Intern':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeWithCompany = (joinDate) => {
    if (!joinDate) return 'N/A'

    const join = new Date(joinDate)
    const now = new Date()
    const diffTime = Math.abs(now - join)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'}`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months === 1 ? '' : 's'}`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.floor((diffDays % 365) / 30)
      let result = `${years} year${years === 1 ? '' : 's'}`
      if (remainingMonths > 0) {
        result += `, ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`
      }
      return result
    }
  }

  // Helper methods for new fields
  const formatGender = (gender) => {
    const genderMap = {
      'male': 'Male',
      'female': 'Female',
      'other': 'Other',
      'prefer_not_to_say': 'Prefer not to say'
    }
    return genderMap[gender] || gender
  }

  const formatEmploymentType = (type) => {
    const typeMap = {
      'full_time': 'Full Time',
      'part_time': 'Part Time',
      'contract': 'Contract',
      'intern': 'Intern',
      'consultant': 'Consultant'
    }
    return typeMap[type] || type
  }

  const formatRelationship = (relationship) => {
    const relationshipMap = {
      'spouse': 'Spouse',
      'parent': 'Parent',
      'child': 'Child',
      'sibling': 'Sibling',
      'friend': 'Friend',
      'other_relative': 'Other Relative',
      'other': 'Other'
    }
    return relationshipMap[relationship] || relationship
  }

  const formatSalary = (salary, currency = 'USD') => {
    if (!salary) return 'Not specified'
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    })
    return formatter.format(salary)
  }

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return 'Not provided'
    if (accountNumber.length <= 4) return accountNumber
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4)
  }

  const parseSkills = (skills) => {
    if (!skills) return []
    if (typeof skills === 'string') {
      try {
        return JSON.parse(skills)
      } catch {
        return skills.split(',').map(s => s.trim()).filter(s => s)
      }
    }
    return Array.isArray(skills) ? skills : []
  }

  const parseCertifications = (certifications) => {
    if (!certifications) return []
    if (typeof certifications === 'string') {
      try {
        return JSON.parse(certifications)
      } catch {
        return certifications.split(',').map(s => s.trim()).filter(s => s)
      }
    }
    return Array.isArray(certifications) ? certifications : []
  }

  const getEmploymentTypeBadgeClasses = (type) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    switch (type) {
      case 'full_time':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'part_time':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'contract':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'intern':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'consultant':
        return `${baseClasses} bg-indigo-100 text-indigo-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${props.employee.user.name}? This action cannot be undone.`)) {
      loading.value = true

      router.delete(route('employees.destroy', props.employee.id), {
        onSuccess: () => {
          router.visit(route('employees.index'))
        },
        onError: () => {
          alert('Failed to delete employee. Please try again.')
          loading.value = false
        },
        onFinish: () => {
          loading.value = false
        }
      })
    }
  }

  const handleMarkAsExit = () => {
    if (!confirm(`Are you sure you want to mark ${props.employee.user.name} as exited? This will deactivate their account.`)) {
      return
    }

    exitForm.value.processing = true

    router.post(route('employees.mark-as-exit', props.employee.id), {
      exit_date: exitForm.value.exit_date,
      exit_reason: exitForm.value.exit_reason,
      exit_notes: exitForm.value.exit_notes
    }, {
      preserveScroll: true,
      onSuccess: () => {
        showExitModal.value = false
        // Reset form
        exitForm.value = {
          exit_date: '',
          exit_reason: '',
          exit_notes: '',
          processing: false
        }
      },
      onError: (errors) => {
        console.error('Failed to mark as exit:', errors)
        alert('Failed to process employee exit. Please try again.')
      },
      onFinish: () => {
        exitForm.value.processing = false
      }
    })
  }

  const handleReactivate = () => {
    if (!confirm(`Are you sure you want to reactivate ${props.employee.user.name}? This will restore their account access.`)) {
      return
    }

    loading.value = true

    router.post(route('employees.reactivate', props.employee.id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        // Employee reactivated successfully
      },
      onError: (errors) => {
        console.error('Failed to reactivate employee:', errors)
        alert('Failed to reactivate employee. Please try again.')
      },
      onFinish: () => {
        loading.value = false
      }
    })
  }

  const handleFieldUpdate = (updateData) => {
    loading.value = true

    const data = {
      [updateData.field]: updateData.newValue
    }

    router.patch(route('employees.update', props.employee.id), data, {
      preserveScroll: true,
      onSuccess: () => {
        // Field updated successfully
      },
      onError: (errors) => {
        console.error('Failed to update field:', errors)
        alert('Failed to update field. Please try again.')
      },
      onFinish: () => {
        loading.value = false
      }
    })
  }
</script>