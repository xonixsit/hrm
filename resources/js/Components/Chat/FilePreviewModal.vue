<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="open" class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                @click.self="closeModal">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                    @click="closeModal"></div>

                <!-- Modal Container -->
                <div class="relative flex flex-col rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
                    :class="[
                        isDark ? 'bg-gray-900' : 'bg-white',
                        isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl h-[90vh]'
                    ]">
                    
                    <!-- Header -->
                    <div class="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
                        :class="isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                            <!-- File Icon -->
                            <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                                :class="isDark ? 'bg-gray-700' : 'bg-gray-100'"
                            >
                                <svg 
                                    class="w-6 h-6" 
                                    :style="{ color: getFileColor(file.extension) }"
                                    fill="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                                </svg>
                            </div>
                            <!-- File Name -->
                            <div class="flex-1 min-w-0">
                                <h3 class="text-lg font-semibold truncate" 
                                    :class="isDark ? 'text-white' : 'text-gray-900'">
                                    {{ file.filename }}
                                </h3>
                                <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                    {{ file.extension.toUpperCase() }} • {{ formatFileSize(file.size) }}
                                </p>
                            </div>
                        </div>
                        
                        <!-- Actions -->
                        <div class="flex items-center gap-2 flex-shrink-0">
                            <!-- Fullscreen Toggle Button -->
                            <button @click="toggleFullscreen"
                                class="p-2 rounded-lg transition-colors"
                                :class="isDark 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                                :title="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'">
                                <!-- Fullscreen Icon -->
                                <svg v-if="!isFullscreen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                                </svg>
                                <!-- Exit Fullscreen Icon -->
                                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                        d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"/>
                                </svg>
                            </button>

                            <!-- Download Button -->
                            <a :href="file.url" 
                                :download="file.filename"
                                class="p-2 rounded-lg transition-colors"
                                :class="isDark 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                                title="Download file">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                </svg>
                            </a>
                            
                            <!-- Close Button -->
                            <button @click="closeModal"
                                class="p-2 rounded-lg transition-colors"
                                :class="isDark 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                                title="Close">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                        d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Preview Content -->
                    <div class="flex-1 overflow-hidden flex flex-col"
                        :class="isDark ? 'bg-gray-800' : 'bg-gray-100'">
                        
                        <!-- Loading State -->
                        <div v-if="loading" class="flex-1 flex items-center justify-center">
                            <div class="text-center">
                                <svg class="w-12 h-12 animate-spin mx-auto mb-4" 
                                    :class="isDark ? 'text-blue-400' : 'text-blue-600'" 
                                    fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                </svg>
                                <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                                    Loading {{ file.extension.toUpperCase() }} file...
                                </p>
                            </div>
                        </div>

                        <!-- Error State -->
                        <div v-else-if="error" class="flex-1 flex items-center justify-center p-8">
                            <div class="text-center">
                                <svg class="w-16 h-16 mx-auto mb-4" :class="isDark ? 'text-red-400' : 'text-red-500'"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                                <h3 class="text-lg font-semibold mb-2" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                                    Failed to load file
                                </h3>
                                <p class="text-sm mb-4" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                    {{ error }}
                                </p>
                            </div>
                        </div>

                        <template v-else>
                            <!-- Excel Preview with Sheet Tabs -->
                            <div v-if="isExcel(file.extension) && excelData" class="flex-1 flex flex-col overflow-hidden">
                                <!-- Sheet Tabs -->
                                <div v-if="excelData.sheets.length > 1" 
                                    class="flex gap-1 px-4 py-2 border-b overflow-x-auto"
                                    :class="isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'">
                                    <button
                                        v-for="(sheet, index) in excelData.sheets"
                                        :key="index"
                                        @click="activeSheet = index"
                                        class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap"
                                        :class="activeSheet === index
                                            ? (isDark 
                                                ? 'bg-gray-800 text-white border-b-2 border-blue-500' 
                                                : 'bg-gray-50 text-gray-900 border-b-2 border-blue-600')
                                            : (isDark
                                                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')"
                                    >
                                        {{ sheet.name }}
                                    </button>
                                </div>

                                <!-- Excel Table -->
                                <div class="flex-1 overflow-auto p-4">
                                    <div class="inline-block min-w-full">
                                        <table class="border-collapse border rounded-lg overflow-hidden shadow-lg"
                                            :class="isDark ? 'border-gray-700' : 'border-gray-300'">
                                            <thead>
                                                <tr :class="isDark ? 'bg-gray-700' : 'bg-gray-200'">
                                                    <th v-for="(cell, colIndex) in excelData.sheets[activeSheet].data[0]"
                                                        :key="colIndex"
                                                        class="border px-4 py-2 text-left text-sm font-semibold"
                                                        :class="isDark 
                                                            ? 'border-gray-600 text-gray-200' 
                                                            : 'border-gray-300 text-gray-700'">
                                                        {{ cell || '' }}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="(row, rowIndex) in excelData.sheets[activeSheet].data.slice(1)"
                                                    :key="rowIndex"
                                                    :class="rowIndex % 2 === 0 
                                                        ? (isDark ? 'bg-gray-800' : 'bg-white')
                                                        : (isDark ? 'bg-gray-850' : 'bg-gray-50')">
                                                    <td v-for="(cell, colIndex) in row"
                                                        :key="colIndex"
                                                        class="border px-4 py-2 text-sm"
                                                        :class="isDark 
                                                            ? 'border-gray-700 text-gray-300' 
                                                            : 'border-gray-300 text-gray-700'">
                                                        {{ cell || '' }}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <!-- Word Document Preview -->
                            <div v-else-if="isWord(file.extension) && wordHtml" 
                                class="flex-1 overflow-auto p-8">
                                <div class="max-w-4xl mx-auto prose prose-sm"
                                    :class="isDark 
                                        ? 'prose-invert prose-headings:text-gray-200 prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-gray-200' 
                                        : 'prose-gray prose-headings:text-gray-900 prose-p:text-gray-700'"
                                    v-html="wordHtml">
                                </div>
                            </div>

                            <!-- PDF Preview -->
                            <iframe v-else-if="file.extension === 'pdf'"
                                :src="file.url"
                                class="w-full h-full border-0"
                                title="PDF Preview"
                            ></iframe>

                            <!-- Text/CSV Preview -->
                            <div v-else-if="['txt', 'csv'].includes(file.extension)"
                                class="flex-1 overflow-auto p-6">
                                <pre class="text-sm font-mono whitespace-pre-wrap"
                                    :class="isDark ? 'text-gray-300' : 'text-gray-800'">{{ textContent }}</pre>
                            </div>

                            <!-- Image Preview -->
                            <div v-else-if="isImage(file.extension)"
                                class="flex-1 flex items-center justify-center p-6">
                                <img :src="file.url" 
                                    :alt="file.filename"
                                    class="max-w-full max-h-full object-contain rounded-lg shadow-lg">
                            </div>

                            <!-- Video Preview -->
                            <div v-else-if="isVideo(file.extension)"
                                class="flex-1 flex items-center justify-center p-6">
                                <video :src="file.url" 
                                    controls
                                    class="max-w-full max-h-full rounded-lg shadow-lg">
                                    Your browser does not support video playback.
                                </video>
                            </div>

                            <!-- Audio Preview -->
                            <div v-else-if="isAudio(file.extension)"
                                class="flex-1 flex items-center justify-center p-6">
                                <audio :src="file.url" 
                                    controls
                                    class="w-full max-w-2xl">
                                    Your browser does not support audio playback.
                                </audio>
                            </div>

                            <!-- Cannot Preview (Word, PowerPoint, etc) -->
                            <div v-else class="flex-1 flex items-center justify-center p-8">
                                <div class="text-center">
                                    <svg class="w-24 h-24 mx-auto mb-4" :class="isDark ? 'text-gray-600' : 'text-gray-400'"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    <h3 class="text-lg font-semibold mb-2" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                                        Preview not available
                                    </h3>
                                    <p class="text-sm mb-4" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                                        This file type cannot be previewed in the browser
                                    </p>
                                    <a :href="file.url" 
                                        :download="file.filename"
                                        class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                        </svg>
                                        Download File
                                    </a>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

const props = defineProps({
    open: Boolean,
    file: Object,
    isDark: Boolean
});

const emit = defineEmits(['close']);

const textContent = ref('');
const excelData = ref(null);
const wordHtml = ref('');
const activeSheet = ref(0);
const loading = ref(false);
const error = ref('');
const isFullscreen = ref(false);

// Watch for file changes to load content
watch(() => props.file, async (newFile) => {
    if (!newFile) return;
    
    loading.value = true;
    error.value = '';
    textContent.value = '';
    excelData.value = null;
    wordHtml.value = '';
    activeSheet.value = 0;

    try {
        if (['txt', 'csv'].includes(newFile.extension)) {
            const response = await axios.get(newFile.url, { responseType: 'text' });
            textContent.value = response.data;
        } else if (isExcel(newFile.extension)) {
            await loadExcelFile(newFile.url);
        } else if (isWord(newFile.extension)) {
            await loadWordFile(newFile.url);
        }
    } catch (err) {
        console.error('Failed to load file:', err);
        error.value = 'Failed to load file content. Please try downloading instead.';
    } finally {
        loading.value = false;
    }
}, { immediate: true });

const loadExcelFile = async (url) => {
    try {
        // Fetch the file as array buffer
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const data = new Uint8Array(response.data);
        
        // Read the workbook
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Parse all sheets
        const sheets = workbook.SheetNames.map(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            
            return {
                name: sheetName,
                data: jsonData
            };
        });
        
        excelData.value = { sheets };
    } catch (err) {
        console.error('Failed to parse Excel file:', err);
        throw new Error('Failed to parse Excel file');
    }
};

const loadWordFile = async (url) => {
    try {
        // Fetch the file as array buffer
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        
        // Convert to Word HTML using Mammoth
        const result = await mammoth.convertToHtml({ arrayBuffer: response.data });
        wordHtml.value = result.value;
        
        // Log any messages/warnings
        if (result.messages.length > 0) {
            console.log('Mammoth conversion messages:', result.messages);
        }
    } catch (err) {
        console.error('Failed to parse Word file:', err);
        throw new Error('Failed to parse Word document');
    }
};

const closeModal = () => {
    isFullscreen.value = false;
    emit('close');
};

const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value;
};

const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
};

const getFileColor = (ext) => {
    const colors = {
        pdf: '#DC2626',
        xls: '#059669', xlsx: '#059669',
        doc: '#2563EB', docx: '#2563EB',
        ppt: '#EA580C', pptx: '#EA580C',
        csv: '#14B8A6',
        txt: '#6B7280',
        zip: '#7C3AED', rar: '#7C3AED',
        mp3: '#EC4899', mp4: '#EC4899',
        jpg: '#F59E0B', jpeg: '#F59E0B', png: '#F59E0B', gif: '#F59E0B',
    };
    return colors[ext] || '#8B5CF6';
};

const isExcel = (ext) => {
    return ['xls', 'xlsx'].includes(ext);
};

const isWord = (ext) => {
    return ['doc', 'docx'].includes(ext);
};

const isImage = (ext) => {
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
};

const isVideo = (ext) => {
    return ['mp4', 'webm', 'ogg'].includes(ext);
};

const isAudio = (ext) => {
    return ['mp3', 'wav', 'ogg', 'aac'].includes(ext);
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
    transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
    transform: scale(0.9);
}
</style>
