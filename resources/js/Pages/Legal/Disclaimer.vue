<template>
    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                Disclaimer
            </h2>
        </template>

        <div class="py-12">
            <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-8 bg-white border-b border-gray-200">
                        <!-- Header Section -->
                        <div class="mb-8">
                            <div class="flex items-center mb-4">
                                <div class="bg-yellow-100 p-3 rounded-full mr-4">
                                    <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z">
                                        </path>
                                    </svg>
                                </div>
                                <div>
                                    <h1 class="text-2xl font-bold text-gray-900">Disclaimer</h1>
                                    <p class="text-gray-600">Important information regarding the use of Xonobics HRMS
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Disclaimer Content -->
                        <div class="prose prose-lg max-w-none">
                            <div class="space-y-8">
                                <!-- General Disclaimer -->
                                <section>
                                    <h2 class="text-xl font-semibold text-gray-900 mb-4">General Disclaimer</h2>
                                    <div class="bg-gray-50 p-6 rounded-lg">
                                        <p class="text-gray-700 leading-relaxed">
                                            The information contained in this Human Resource Management System (HRMS) is
                                            for general information purposes only.
                                            While we endeavor to keep the information up to date and correct, we make no
                                            representations or warranties of any kind,
                                            express or implied, about the completeness, accuracy, reliability,
                                            suitability, or availability with respect to the
                                            system or the information, products, services, or related graphics contained
                                            in the system for any purpose.
                                        </p>
                                    </div>
                                </section>

                                <!-- System Usage -->
                                <section>
                                    <h2 class="text-xl font-semibold text-gray-900 mb-4">System Usage</h2>
                                    <ul class="space-y-3 text-gray-700">
                                        <li class="flex items-start">
                                            <svg class="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
                                                fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clip-rule="evenodd"></path>
                                            </svg>
                                            This system is intended for authorized personnel only and should be used in
                                            accordance with company policies.
                                        </li>
                                        <li class="flex items-start">
                                            <svg class="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
                                                fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clip-rule="evenodd"></path>
                                            </svg>
                                            Users are responsible for maintaining the confidentiality of their login
                                            credentials.
                                        </li>
                                        <li class="flex items-start">
                                            <svg class="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
                                                fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clip-rule="evenodd"></path>
                                            </svg>
                                            Any misuse of the system may result in disciplinary action and/or
                                            termination of access.
                                        </li>
                                    </ul>
                                </section>

                                <!-- Data Accuracy -->
                                <section>
                                    <h2 class="text-xl font-semibold text-gray-900 mb-4">Data Accuracy</h2>
                                    <div class="bg-blue-50 border-l-4 border-blue-400 p-6">
                                        <p class="text-gray-700 leading-relaxed">
                                            While we strive to ensure the accuracy of all data within the system, users
                                            are responsible for
                                            verifying the accuracy of their personal information, attendance records,
                                            leave balances, and other
                                            data. Any discrepancies should be reported immediately to the HR department
                                            or system administrators.
                                        </p>
                                    </div>
                                </section>

                                <!-- Technical Limitations -->
                                <section>
                                    <h2 class="text-xl font-semibold text-gray-900 mb-4">Technical Limitations</h2>
                                    <div class="grid md:grid-cols-2 gap-6">
                                        <div class="bg-yellow-50 p-6 rounded-lg">
                                            <h3 class="font-semibold text-gray-900 mb-2">System Availability</h3>
                                            <p class="text-gray-700 text-sm">
                                                The system may be temporarily unavailable due to maintenance, updates,
                                                or technical issues.
                                                We are not liable for any inconvenience caused by system downtime.
                                            </p>
                                        </div>
                                        <div class="bg-red-50 p-6 rounded-lg">
                                            <h3 class="font-semibold text-gray-900 mb-2">Data Backup</h3>
                                            <p class="text-gray-700 text-sm">
                                                While we maintain regular backups, users should keep their own records
                                                of important
                                                information as an additional precaution.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <!-- Privacy and Confidentiality -->
                                <section>
                                    <h2 class="text-xl font-semibold text-gray-900 mb-4">Privacy and Confidentiality
                                    </h2>
                                    <div class="bg-green-50 p-6 rounded-lg">
                                        <p class="text-gray-700 leading-relaxed mb-4">
                                            All information stored in this system is considered confidential and
                                            proprietary to the organization.
                                            Users must not:
                                        </p>
                                        <ul class="space-y-2 text-gray-700">
                                            <li class="flex items-center">
                                                <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor"
                                                    viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd"
                                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                        clip-rule="evenodd"></path>
                                                </svg>
                                                Share login credentials with unauthorized persons
                                            </li>
                                            <li class="flex items-center">
                                                <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor"
                                                    viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd"
                                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                        clip-rule="evenodd"></path>
                                                </svg>
                                                Access information beyond their authorized scope
                                            </li>
                                            <li class="flex items-center">
                                                <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor"
                                                    viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd"
                                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                        clip-rule="evenodd"></path>
                                                </svg>
                                                Disclose confidential information to third parties
                                            </li>
                                        </ul>
                                    </div>
                                </section>

                                <!-- Limitation of Liability -->
                                <section>
                                    <h2 class="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
                                    <div class="bg-gray-100 p-6 rounded-lg border-l-4 border-gray-400">
                                        <p class="text-gray-700 leading-relaxed">
                                            In no event shall Xonobics or its employees be liable for any loss or damage
                                            including without limitation,
                                            indirect or consequential loss or damage, or any loss or damage whatsoever
                                            arising from loss of data or
                                            profits arising out of, or in connection with, the use of this system.
                                        </p>
                                    </div>
                                </section>

                                <!-- Contact Information -->
                                <section>
                                    <h2 class="text-xl font-semibold text-gray-900 mb-4">Questions or Concerns</h2>
                                    <div class="bg-blue-50 p-6 rounded-lg">
                                        <p class="text-gray-700 leading-relaxed mb-4">
                                            If you have any questions about this disclaimer or the use of the HRMS
                                            system, please contact:
                                        </p>
                                        <div class="space-y-2 text-gray-700">
                                            <div class="flex items-center">
                                                <svg class="w-5 h-5 text-blue-500 mr-3" fill="none"
                                                    stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                                                    </path>
                                                </svg>
                                                <span>HR Department: hr@xonobics.com</span>
                                            </div>
                                            <div class="flex items-center">
                                                <svg class="w-5 h-5 text-blue-500 mr-3" fill="none"
                                                    stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z">
                                                    </path>
                                                </svg>
                                                <span>IT Support: support@xonobics.com</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <!-- Last Updated -->
                                <section class="border-t pt-6">
                                    <p class="text-sm text-gray-500 text-center">
                                        This disclaimer was last updated on {{ new Date().toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                        }) }}
                                    </p>
                                </section>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
                            <Link :href="route('dashboard')"
                                class="text-gray-600 hover:text-gray-800 flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                            Back to Dashboard
                            </Link>
                            <div class="flex space-x-4">
                                <Link :href="route('legal.privacy')" class="text-blue-600 hover:text-blue-800">
                                Privacy Policy
                                </Link>
                                <Link :href="route('support.create')"
                                    class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700">
                                Contact Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<script setup>
    import { Link } from '@inertiajs/vue3'
    import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
</script>