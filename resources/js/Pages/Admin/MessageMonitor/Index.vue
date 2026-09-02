<script setup>
import { ref, computed } from 'vue';
import { Head, router } from '@inertiajs/vue3';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ImageLightbox from '@/Components/Chat/ImageLightbox.vue';
import FilePreviewModal from '@/Components/Chat/FilePreviewModal.vue';
import { 
    DocumentTextIcon,
    DocumentIcon,
    TableCellsIcon,
    PresentationChartBarIcon,
    ArchiveBoxIcon,
    PhotoIcon,
    MusicalNoteIcon,
    FilmIcon,
    PaperClipIcon,
} from '@heroicons/vue/24/outline';
import { useTheme } from '@/composables/useTheme';
import DOMPurify from 'dompurify';

const sanitize = (html) => DOMPurify.sanitize(html, { 
    USE_PROFILES: { html: true },
    ADD_TAGS: ['svg', 'path', 'circle'],
    ADD_ATTR: ['xmlns', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'style']
});
const { isDark } = useTheme();

const props = defineProps({
    messages:     Object,   // paginated
    users:        Array,
    groups:       Array,
    tab:          String,
    filters:      Object,
    stats:        Object,
    blockedUsers: Array,    // [{ blocker_id, blocker_name, blocked_id, blocked_name, created_at }]
});

const breadcrumbs = [
    { label: 'Dashboard',       href: route('dashboard') },
    { label: 'Message Monitor', href: route('admin.message-monitor.index') },
];

// ── Filter state ──────────────────────────────────────────────────────────────
const activeTab = ref(props.tab || 'direct');
const fromDate  = ref(props.filters.from_date);
const toDate    = ref(props.filters.to_date);
const fromUser  = ref(props.filters.from_user  || '');
const toUser    = ref(props.filters.to_user    || '');
const groupId   = ref(props.filters.group_id   || '');
const keyword   = ref(props.filters.keyword    || '');

function switchTab(t) {
    activeTab.value = t;
    toUser.value    = '';
    groupId.value   = '';
    applyFilters();
}

function applyFilters() {
    const params = {
        tab:       activeTab.value,
        from_date: fromDate.value,
        to_date:   toDate.value,
        keyword:   keyword.value   || undefined,
        from_user: fromUser.value  || undefined,
    };
    if (activeTab.value === 'direct') {
        params.to_user  = toUser.value  || undefined;
    } else {
        params.group_id = groupId.value || undefined;
    }
    router.get(route('admin.message-monitor.index'), params,
        { preserveScroll: true, preserveState: true });
}

const refreshing = ref(false);
function refresh() {
    refreshing.value = true;
    router.reload({ preserveScroll: true, preserveState: true,
        onFinish: () => { refreshing.value = false; } });
}

const exportUrl = computed(() => {
    const p = new URLSearchParams();
    p.set('tab',       activeTab.value);
    p.set('from_date', fromDate.value);
    p.set('to_date',   toDate.value);
    if (fromUser.value) p.set('from_user', fromUser.value);
    if (keyword.value)  p.set('keyword',   keyword.value);
    if (activeTab.value === 'direct' && toUser.value)  p.set('to_user',  toUser.value);
    if (activeTab.value === 'groups' && groupId.value) p.set('group_id', groupId.value);
    return route('admin.message-monitor.export') + '?' + p.toString();
});

function resetFilters() {
    const today = new Date().toISOString().split('T')[0];
    fromDate.value = today; toDate.value = today;
    fromUser.value = ''; toUser.value = ''; groupId.value = ''; keyword.value = '';
    applyFilters();
}

function setPreset(preset) {
    const now   = new Date();
    const today = now.toISOString().split('T')[0];
    if (preset === 'today') {
        fromDate.value = today; toDate.value = today;
    } else if (preset === 'yesterday') {
        const y = new Date(now); y.setDate(y.getDate() - 1);
        const ys = y.toISOString().split('T')[0];
        fromDate.value = ys; toDate.value = ys;
    } else if (preset === 'week') {
        const w = new Date(now); w.setDate(w.getDate() - 6);
        fromDate.value = w.toISOString().split('T')[0]; toDate.value = today;
    } else if (preset === 'month') {
        fromDate.value = today.slice(0, 8) + '01'; toDate.value = today;
    }
    applyFilters();
}

// ── Message preview modal ─────────────────────────────────────────────────────
const viewingMsg = ref(null);
function openMsg(msg)  { viewingMsg.value = msg; }
function closeMsg()    { viewingMsg.value = null; }

// ── Blocked users modal ───────────────────────────────────────────────────────
const showBlockedModal = ref(false);

// Image lightbox state
const showImageLightbox = ref(false);
const lightboxImageSrc = ref('');
const lightboxImageAlt = ref('');

// File preview modal state
const showFilePreview = ref(false);
const previewFile = ref(null);

// Image lightbox functions
const openImageLightbox = (imageSrc, imageAlt = 'Image') => {
    lightboxImageSrc.value = imageSrc;
    lightboxImageAlt.value = imageAlt;
    showImageLightbox.value = true;
};

const closeImageLightbox = () => {
    showImageLightbox.value = false;
    lightboxImageSrc.value = '';
    lightboxImageAlt.value = '';
};

// File preview functions
const openFilePreview = (fileInfo) => {
    console.log('openFilePreview called with:', fileInfo);
    
    if (!fileInfo) {
        console.error('No fileInfo provided to openFilePreview');
        return;
    }
    
    if (!fileInfo.url) {
        console.error('No file URL available for preview. FileInfo:', fileInfo);
        return;
    }
    
    // Format file size for display
    const formatSize = (bytes) => {
        if (!bytes || bytes === 0) return 0;
        return bytes;
    };
    
    previewFile.value = {
        filename: fileInfo.filename,
        url: fileInfo.url,
        size: formatSize(fileInfo.size),
        extension: (fileInfo.extension || 'unknown').toLowerCase(),
    };
    
    console.log('Opening file preview with previewFile:', previewFile.value);
    showFilePreview.value = true;
    console.log('showFilePreview set to:', showFilePreview.value);
};

const closeFilePreview = () => {
    console.log('Closing file preview');
    showFilePreview.value = false;
    previewFile.value = null;
};

// Handle image clicks in messages
const handleMessageClick = (event) => {
    if (event.target.tagName === 'IMG' && event.target.classList.contains('rt-image')) {
        event.preventDefault();
        event.stopPropagation();
        openImageLightbox(event.target.src, event.target.alt);
    }
};

// Check if message contains images
function hasImages(message) {
    return message && message.includes('<img');
}

// Check if message contains file attachments (using backend detection)
function hasFiles(msg) {
    const result = msg && msg.has_file;
    console.log('hasFiles check:', { msg_id: msg?.id, has_file: msg?.has_file, file_info: msg?.file_info });
    return result;
}

// Get file info from backend
function getFileInfo(msg) {
    const info = msg?.file_info || null;
    console.log('getFileInfo:', { msg_id: msg?.id, file_info: info });
    return info;
}

// Format file size helper
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return null;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
}

// Get file icon component for modal (returns Vue component)
function getFileIconComponent(extension) {
    const ext = (extension || '').toLowerCase();
    
    const icons = {
        'pdf': DocumentTextIcon,
        'doc': DocumentIcon,
        'docx': DocumentIcon,
        'txt': DocumentTextIcon,
        'xls': TableCellsIcon,
        'xlsx': TableCellsIcon,
        'csv': TableCellsIcon,
        'ppt': PresentationChartBarIcon,
        'pptx': PresentationChartBarIcon,
        'zip': ArchiveBoxIcon,
        'rar': ArchiveBoxIcon,
        '7z': ArchiveBoxIcon,
        'jpg': PhotoIcon,
        'jpeg': PhotoIcon,
        'png': PhotoIcon,
        'gif': PhotoIcon,
        'svg': PhotoIcon,
        'webp': PhotoIcon,
        'mp3': MusicalNoteIcon,
        'wav': MusicalNoteIcon,
        'ogg': MusicalNoteIcon,
        'aac': MusicalNoteIcon,
        'mp4': FilmIcon,
        'avi': FilmIcon,
        'mov': FilmIcon,
        'webm': FilmIcon,
    };
    
    return icons[ext] || PaperClipIcon;
}

// Get file icon SVG (same as chat/file manager)
function getFileIconSVG(ext) {
    ext = (ext || '').toLowerCase();
    
    // PDF - Bright Red
    if (ext === 'pdf') {
        return `<svg style="width: 1.25rem; height: 1.25rem; color: #DC2626;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 18h2v1H7v-1zm7-1h2v1h-2v-1zM7 14h2v2H7v-2zm12-3v8c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h6l4 4z"/>
            <path d="M13 9V4.5l4.5 4.5H13z"/>
        </svg>`;
    }
    // Excel - Emerald Green
    if (['xls', 'xlsx'].includes(ext)) {
        return `<svg style="width: 1.25rem; height: 1.25rem; color: #059669;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-1.5v-2H14v2h-1zm0-4h-1.5V9H14v4h-1zm3 4h-1.5v-2H17v2h-1zm0-4h-1.5V9H17v4h-1z"/>
            <path d="M7 9h4v2H7V9zm0 4h4v2H7v-2z"/>
        </svg>`;
    }
    // Word - Bright Blue
    if (['doc', 'docx'].includes(ext)) {
        return `<svg style="width: 1.25rem; height: 1.25rem; color: #2563EB;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            <path d="M8 16h8v2H8v-2zm0-4h8v2H8v-2zm0-4h5v2H8V8z"/>
        </svg>`;
    }
    // PowerPoint - Vivid Orange
    if (['ppt', 'pptx'].includes(ext)) {
        return `<svg style="width: 1.25rem; height: 1.25rem; color: #EA580C;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            <path d="M8 15h8v2H8v-2z"/>
            <circle cx="12" cy="10" r="2"/>
        </svg>`;
    }
    // CSV - Bright Teal
    if (ext === 'csv') {
        return `<svg style="width: 1.25rem; height: 1.25rem; color: #14B8A6;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            <path d="M8 10h2v2H8v-2zm4 0h2v2h-2v-2zm-4 4h2v2H8v-2zm4 0h2v2h-2v-2z"/>
        </svg>`;
    }
    // Text - Medium Gray
    if (ext === 'txt') {
        return `<svg style="width: 1.25rem; height: 1.25rem; color: #6B7280;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            <path d="M8 16h8v2H8v-2zm0-4h8v2H8v-2zm0-4h5v2H8V8z"/>
        </svg>`;
    }
    // Archives - Purple
    if (['zip', 'rar', '7z'].includes(ext)) {
        return `<svg style="width: 1.25rem; height: 1.25rem; color: #7C3AED;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            <path d="M10 9h4v1h-4V9zm0 2h4v1h-4v-1zm0 2h4v1h-4v-1z"/>
        </svg>`;
    }
    // Default - Purple
    return `<svg style="width: 1.25rem; height: 1.25rem; color: #8B5CF6;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
    </svg>`;
}

// Get larger file icon SVG for modal
function getFileIconSVGLarge(ext) {
    ext = (ext || '').toLowerCase();
    
    // PDF - Bright Red
    if (ext === 'pdf') {
        return `<svg style="width: 3rem; height: 3rem; color: #DC2626;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 18h2v1H7v-1zm7-1h2v1h-2v-1zM7 14h2v2H7v-2zm12-3v8c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h6l4 4z"/>
            <path d="M13 9V4.5l4.5 4.5H13z"/>
        </svg>`;
    }
    // Excel - Emerald Green
    if (['xls', 'xlsx'].includes(ext)) {
        return `<svg style="width: 3rem; height: 3rem; color: #059669;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-1.5v-2H14v2h-1zm0-4h-1.5V9H14v4h-1zm3 4h-1.5v-2H17v2h-1zm0-4h-1.5V9H17v4h-1z"/>
            <path d="M7 9h4v2H7V9zm0 4h4v2H7v-2z"/>
        </svg>`;
    }
    // Word - Bright Blue
    if (['doc', 'docx'].includes(ext)) {
        return `<svg style="width: 3rem; height: 3rem; color: #2563EB;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            <path d="M8 16h8v2H8v-2zm0-4h8v2H8v-2zm0-4h5v2H8V8z"/>
        </svg>`;
    }
    // PowerPoint - Vivid Orange
    if (['ppt', 'pptx'].includes(ext)) {
        return `<svg style="width: 3rem; height: 3rem; color: #EA580C;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            <path d="M8 15h8v2H8v-2z"/>
            <circle cx="12" cy="10" r="2"/>
        </svg>`;
    }
    // CSV - Bright Teal
    if (ext === 'csv') {
        return `<svg style="width: 3rem; height: 3rem; color: #14B8A6;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            <path d="M8 10h2v2H8v-2zm4 0h2v2h-2v-2zm-4 4h2v2H8v-2zm4 0h2v2h-2v-2z"/>
        </svg>`;
    }
    // Text - Medium Gray
    if (ext === 'txt') {
        return `<svg style="width: 3rem; height: 3rem; color: #6B7280;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            <path d="M8 16h8v2H8v-2zm0-4h8v2H8v-2zm0-4h5v2H8V8z"/>
        </svg>`;
    }
    // Archives - Purple
    if (['zip', 'rar', '7z'].includes(ext)) {
        return `<svg style="width: 3rem; height: 3rem; color: #7C3AED;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            <path d="M10 9h4v1h-4V9zm0 2h4v1h-4v-1zm0 2h4v1h-4v-1z"/>
        </svg>`;
    }
    // Default - Purple
    return `<svg style="width: 3rem; height: 3rem; color: #8B5CF6;" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
    </svg>`;
}

// Extract first image src from HTML message
function getFirstImageSrc(message) {
    if (!message) return null;
    const match = message.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
}

// Strip HTML tags for plain text display
function stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// ── Admin delete ──────────────────────────────────────────────────────────────
const deletingId  = ref(null);
const confirmId   = ref(null); // ID waiting for confirmation

function askDelete(id) {
    confirmId.value = id;
}
function cancelDelete() {
    confirmId.value = null;
}
async function confirmDelete(id) {
    deletingId.value = id;
    try {
        await axios.delete(route('admin.message-monitor.destroy', id));
        confirmId.value  = null;
        viewingMsg.value = null;
        // Reload the current page data without losing filters
        router.reload({ preserveScroll: true, preserveState: true });
    } catch (e) {
        console.error('Delete failed:', e);
    } finally {
        deletingId.value = null;
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDT(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
}
function truncate(str, n = 80) {
    return str && str.length > n ? str.slice(0, n) + '…' : (str || '—');
}
function initials(name) {
    return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
</script>

<template>
    <Head title="Message Monitor — Admin" />
    <AuthenticatedLayout>
        <PageLayout
            title="Message Monitor"
            subtitle="Admin view of staff messages — separated by Direct Messages and Group Chats"
            :breadcrumbs="breadcrumbs"
            maxWidth="full">

            <template #actions>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    🔒 Admin Only — Read Only
                </span>
            </template>

            <div class="space-y-5">

                <!-- ── Stats ─────────────────────────────────────────────── -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div v-for="s in [
                        { label: 'Total Messages', value: stats.total_messages, icon: '💬' },
                        { label: 'Active Users',   value: stats.active_users,   icon: '👥' },
                        { label: 'Date From',      value: filters.from_date,    icon: '📅' },
                        { label: 'Date To',        value: filters.to_date,      icon: '📅' },
                    ]" :key="s.label"
                        class="rounded-xl border px-4 py-3 flex items-center gap-3"
                        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
                        <span class="text-xl">{{ s.icon }}</span>
                        <div>
                            <p class="text-[10px] font-bold uppercase tracking-wider"
                                :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ s.label }}</p>
                            <p class="text-sm font-extrabold"
                                :class="isDark ? 'text-white' : 'text-slate-900'">{{ s.value }}</p>
                        </div>
                    </div>
                </div>

                <!-- ── Tabs ───────────────────────────────────────────────── -->
                <div class="flex items-center gap-1 border-b"
                     :class="isDark ? 'border-gray-700' : 'border-slate-200'">
                    <button
                        @click="switchTab('direct')"
                        class="relative px-5 py-3 text-sm font-semibold transition-colors focus:outline-none"
                        :class="activeTab === 'direct'
                            ? (isDark ? 'text-teal-400 after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-teal-400' : 'text-teal-600 after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-teal-500')
                            : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-slate-700')">
                        💬 Direct Messages
                    </button>
                    <button
                        @click="switchTab('groups')"
                        class="relative px-5 py-3 text-sm font-semibold transition-colors focus:outline-none"
                        :class="activeTab === 'groups'
                            ? (isDark ? 'text-teal-400 after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-teal-400' : 'text-teal-600 after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-teal-500')
                            : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-slate-700')">
                        👥 Group Chats
                    </button>
                </div>

                <!-- ── Filters ───────────────────────────────────────────── -->
                <div class="rounded-2xl border p-5 space-y-4"
                    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">

                    <!-- Quick presets -->
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xs font-bold" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Quick:</span>
                        <button v-for="p in [{k:'today',l:'Today'},{k:'yesterday',l:'Yesterday'},{k:'week',l:'Last 7 Days'},{k:'month',l:'This Month'}]"
                            :key="p.k" @click="setPreset(p.k)"
                            class="px-3 py-1 rounded-lg text-xs font-bold border transition-all"
                            :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700'">
                            {{ p.l }}
                        </button>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <!-- From date -->
                        <div>
                            <label class="text-[11px] font-bold block mb-1"
                                :class="isDark ? 'text-gray-400' : 'text-slate-600'">From Date</label>
                            <input v-model="fromDate" type="date"
                                class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'" />
                        </div>
                        <!-- To date -->
                        <div>
                            <label class="text-[11px] font-bold block mb-1"
                                :class="isDark ? 'text-gray-400' : 'text-slate-600'">To Date</label>
                            <input v-model="toDate" type="date"
                                class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'" />
                        </div>
                        <!-- Sender (both tabs) -->
                        <div>
                            <label class="text-[11px] font-bold block mb-1"
                                :class="isDark ? 'text-gray-400' : 'text-slate-600'">Sender</label>
                            <select v-model="fromUser"
                                class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                                <option value="">All Senders</option>
                                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
                            </select>
                        </div>
                        <!-- Recipient — direct only -->
                        <div v-if="activeTab === 'direct'">
                            <label class="text-[11px] font-bold block mb-1"
                                :class="isDark ? 'text-gray-400' : 'text-slate-600'">Recipient</label>
                            <select v-model="toUser"
                                class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                                <option value="">All Recipients</option>
                                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
                            </select>
                        </div>
                        <!-- Group filter — groups tab only -->
                        <div v-else>
                            <label class="text-[11px] font-bold block mb-1"
                                :class="isDark ? 'text-gray-400' : 'text-slate-600'">Group</label>
                            <select v-model="groupId"
                                class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'">
                                <option value="">All Groups</option>
                                <option v-for="g in groups" :key="g.id" :value="g.id">
                                    {{ g.name }}{{ g.is_default ? ' (Company)' : '' }}
                                </option>
                            </select>
                        </div>
                        <!-- Keyword -->
                        <div>
                            <label class="text-[11px] font-bold block mb-1"
                                :class="isDark ? 'text-gray-400' : 'text-slate-600'">Keyword</label>
                            <input v-model="keyword" type="text" placeholder="Search message…"
                                class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-teal-500"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'"
                                @keyup.enter="applyFilters" />
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 flex-wrap">
                        <button @click="applyFilters"
                            class="px-5 py-2 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-all"
                            style="background:linear-gradient(135deg,#006970,#00a9b4)">
                            🔍 Apply Filters
                        </button>
                        <button @click="resetFilters"
                            class="px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                            :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                            ↺ Reset
                        </button>
                        <a :href="exportUrl"
                            class="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                            :class="isDark ? 'bg-emerald-900/40 border-emerald-700 text-emerald-300 hover:bg-emerald-900/60' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'">
                            ⬇ Export {{ activeTab === 'groups' ? 'Group' : 'Direct' }} CSV
                        </a>
                        <span class="text-xs" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                            {{ messages.total }} message{{ messages.total !== 1 ? 's' : '' }} found
                        </span>
                    </div>
                </div>

                <!-- ── Table ─────────────────────────────────────────────── -->
                <div class="rounded-2xl border overflow-hidden"
                    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">

                    <!-- Toolbar -->
                    <div class="flex items-center justify-between px-5 py-3 border-b"
                        :class="isDark ? 'border-gray-700' : 'border-slate-200 bg-slate-50'">
                        <span class="text-xs font-semibold"
                            :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                            {{ messages.total }} result{{ messages.total !== 1 ? 's' : '' }}
                            — {{ activeTab === 'groups' ? 'Group Chats' : 'Direct Messages' }}
                        </span>
                        <button @click="refresh" :disabled="refreshing"
                            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-60"
                            :class="isDark ? 'bg-gray-700 border-gray-600 text-teal-300 hover:bg-gray-600' : 'bg-white border-teal-200 text-teal-700 hover:bg-teal-50'">
                            <svg class="w-3.5 h-3.5" :class="refreshing ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                            </svg>
                            {{ refreshing ? 'Refreshing…' : 'Refresh' }}
                        </button>
                        <button @click="showBlockedModal = true"
                            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all"
                            :class="isDark ? 'bg-red-900/30 border-red-700 text-red-400 hover:bg-red-900/50' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'">
                            <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/>
                            </svg>
                            Blocked Users
                            <span v-if="blockedUsers?.length" class="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold"
                                :class="isDark ? 'bg-red-700 text-white' : 'bg-red-500 text-white'">
                                {{ blockedUsers.length }}
                            </span>
                        </button>
                    </div>

                    <!-- ── DIRECT MESSAGES table ───────────────────────── -->
                    <template v-if="activeTab === 'direct'">
                        <div class="grid grid-cols-12 border-b text-[11px] font-extrabold uppercase tracking-wider"
                            :class="isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'">
                            <div class="col-span-2 px-4 py-3">From</div>
                            <div class="col-span-2 px-4 py-3">To</div>
                            <div class="col-span-6 px-4 py-3">Message</div>
                            <div class="col-span-2 px-4 py-3">Date & Time</div>
                            <!-- Delete column hidden for now -->
                        </div>

                        <div v-if="messages.data.length === 0"
                            class="flex flex-col items-center justify-center py-16 text-center">
                            <p class="text-3xl mb-3">💬</p>
                            <p class="font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-800'">No direct messages found</p>
                            <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Try adjusting your filters</p>
                        </div>

                        <div v-else class="divide-y" :class="isDark ? 'divide-gray-700' : 'divide-slate-100'">
                            <div v-for="(msg, i) in messages.data" :key="msg.id"
                                class="grid grid-cols-12 text-xs transition-colors"
                                :class="[
                                    i % 2 === 0 ? (isDark ? 'bg-gray-800' : 'bg-white') : (isDark ? 'bg-gray-750' : 'bg-slate-50/50'),
                                    isDark ? 'hover:bg-gray-700' : 'hover:bg-teal-50/40'
                                ]">
                                <div class="col-span-2 px-4 py-3.5 flex items-center gap-2">
                                    <span class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shrink-0"
                                        style="background:linear-gradient(135deg,#006970,#00a9b4)">
                                        {{ initials(msg.sender_name) }}
                                    </span>
                                    <div class="min-w-0">
                                        <p class="font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-900'">{{ msg.sender_name }}</p>
                                        <p class="text-[10px] truncate" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ msg.sender_email }}</p>
                                    </div>
                                </div>
                                <div class="col-span-2 px-4 py-3.5 flex items-center gap-2">
                                    <span class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shrink-0 bg-indigo-500">
                                        {{ initials(msg.recipient_name) }}
                                    </span>
                                    <div class="min-w-0">
                                        <p class="font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-900'">{{ msg.recipient_name }}</p>
                                        <p class="text-[10px] truncate" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ msg.recipient_email }}</p>
                                    </div>
                                </div>
                                <!-- Message col-span-6 DIRECT -->
                                <div class="col-span-6 px-4 py-3.5 flex items-center gap-2">
                                    <!-- File indicator with type-specific SVG icon -->
                                    <span v-if="hasFiles(msg)" 
                                          class="shrink-0 flex items-center" 
                                          :title="`${getFileInfo(msg)?.type || 'File attachment'}`"
                                          v-html="getFileIconSVG(getFileInfo(msg)?.extension)">
                                    </span>
                                    
                                    <!-- Show thumbnail if message only contains image -->
                                    <div v-if="hasImages(msg.message) && stripHtml(msg.message).trim().length === 0" class="flex items-center gap-2">
                                        <img :src="getFirstImageSrc(msg.message)" 
                                            alt="Message image" 
                                            class="w-12 h-12 object-cover rounded-lg border cursor-pointer"
                                            :class="isDark ? 'border-gray-600' : 'border-slate-200'"
                                            @click="openMsg(msg)" />
                                        <span class="text-xs" :class="isDark ? 'text-gray-400' : 'text-slate-500'">📷 Image</span>
                                    </div>
                                    <!-- Show text with indicator if has images + text -->
                                    <div v-else-if="hasImages(msg.message)" class="flex items-center gap-2 flex-1 min-w-0">
                                        <span class="text-xs shrink-0" :class="isDark ? 'text-gray-400' : 'text-slate-500'">📷</span>
                                        <p class="leading-relaxed flex-1 min-w-0 truncate" :class="isDark ? 'text-gray-200' : 'text-slate-800'">{{ truncate(stripHtml(msg.message)) }}</p>
                                    </div>
                                    <!-- Text only -->
                                    <p v-else class="leading-relaxed flex-1" :class="isDark ? 'text-gray-200' : 'text-slate-800'">{{ truncate(stripHtml(msg.message)) }}</p>
                                    <button @click="openMsg(msg)"
                                        class="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all"
                                        :class="isDark ? 'border-teal-700 text-teal-400 hover:bg-teal-900/30' : 'border-teal-200 text-teal-600 hover:bg-teal-50'">
                                        View
                                    </button>
                                </div>
                                <!-- Date -->
                                <div class="col-span-2 px-4 py-3.5 flex items-center">
                                    <p :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ formatDT(msg.created_at) }}</p>
                                </div>
                                <!-- Delete hidden for now -->
                            </div>
                        </div>
                    </template>

                    <!-- ── GROUP MESSAGES table ────────────────────────── -->
                    <template v-else>
                        <div class="grid grid-cols-12 border-b text-[11px] font-extrabold uppercase tracking-wider"
                            :class="isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'">
                            <div class="col-span-2 px-4 py-3">Group</div>
                            <div class="col-span-2 px-4 py-3">Sender</div>
                            <div class="col-span-6 px-4 py-3">Message</div>
                            <div class="col-span-2 px-4 py-3">Date & Time</div>
                            <!-- Delete column hidden for now -->
                        </div>

                        <div v-if="messages.data.length === 0"
                            class="flex flex-col items-center justify-center py-16 text-center">
                            <p class="text-3xl mb-3">👥</p>
                            <p class="font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-800'">No group messages found</p>
                            <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Try adjusting your filters</p>
                        </div>

                        <div v-else class="divide-y" :class="isDark ? 'divide-gray-700' : 'divide-slate-100'">
                            <div v-for="(msg, i) in messages.data" :key="msg.id"
                                class="grid grid-cols-12 text-xs transition-colors"
                                :class="[
                                    i % 2 === 0 ? (isDark ? 'bg-gray-800' : 'bg-white') : (isDark ? 'bg-gray-750' : 'bg-slate-50/50'),
                                    isDark ? 'hover:bg-gray-700' : 'hover:bg-teal-50/40'
                                ]">
                                <!-- Group name + badge -->
                                <div class="col-span-2 px-4 py-3.5 flex items-center gap-2">
                                    <span class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shrink-0"
                                        :style="msg.is_default_group ? 'background:linear-gradient(135deg,#b45309,#d97706)' : 'background:linear-gradient(135deg,#006970,#00a9b4)'">
                                        {{ msg.is_default_group ? '🏢' : '👥' }}
                                    </span>
                                    <div class="min-w-0">
                                        <p class="font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-900'">{{ msg.group_name }}</p>
                                        <span v-if="msg.is_default_group"
                                            class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-700">Company</span>
                                    </div>
                                </div>
                                <!-- Sender -->
                                <div class="col-span-2 px-4 py-3.5 flex items-center gap-2">
                                    <span class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shrink-0"
                                        style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
                                        {{ initials(msg.sender_name) }}
                                    </span>
                                    <div class="min-w-0">
                                        <p class="font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-900'">{{ msg.sender_name }}</p>
                                        <p class="text-[10px] truncate" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ msg.sender_email }}</p>
                                    </div>
                                </div>
                                <!-- Message col-span-6 GROUP -->
                                <div class="col-span-6 px-4 py-3.5 flex items-center gap-2">
                                    <!-- File indicator with type-specific SVG icon -->
                                    <span v-if="hasFiles(msg)" 
                                          class="shrink-0 flex items-center" 
                                          :title="`${getFileInfo(msg)?.type || 'File attachment'}`"
                                          v-html="getFileIconSVG(getFileInfo(msg)?.extension)">
                                    </span>
                                    
                                    <!-- Show thumbnail if message only contains image -->
                                    <div v-if="hasImages(msg.message) && stripHtml(msg.message).trim().length === 0" class="flex items-center gap-2">
                                        <img :src="getFirstImageSrc(msg.message)" 
                                            alt="Message image" 
                                            class="w-12 h-12 object-cover rounded-lg border cursor-pointer"
                                            :class="isDark ? 'border-gray-600' : 'border-slate-200'"
                                            @click="openMsg(msg)" />
                                        <span class="text-xs" :class="isDark ? 'text-gray-400' : 'text-slate-500'">📷 Image</span>
                                    </div>
                                    <!-- Show text with indicator if has images + text -->
                                    <div v-else-if="hasImages(msg.message)" class="flex items-center gap-2 flex-1 min-w-0">
                                        <span class="text-xs shrink-0" :class="isDark ? 'text-gray-400' : 'text-slate-500'">📷</span>
                                        <p class="leading-relaxed flex-1 min-w-0 truncate" :class="isDark ? 'text-gray-200' : 'text-slate-800'">{{ truncate(stripHtml(msg.message)) }}</p>
                                    </div>
                                    <!-- Text only -->
                                    <p v-else class="leading-relaxed flex-1" :class="isDark ? 'text-gray-200' : 'text-slate-800'">{{ truncate(stripHtml(msg.message)) }}</p>
                                    <button @click="openMsg(msg)"
                                        class="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all"
                                        :class="isDark ? 'border-teal-700 text-teal-400 hover:bg-teal-900/30' : 'border-teal-200 text-teal-600 hover:bg-teal-50'">
                                        View
                                    </button>
                                </div>
                                <!-- Date -->
                                <div class="col-span-2 px-4 py-3.5 flex items-center">
                                    <p :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ formatDT(msg.created_at) }}</p>
                                </div>
                                <!-- Delete hidden for now -->
                            </div>
                        </div>
                    </template>

                    <!-- Pagination (shared) -->
                    <div v-if="messages.last_page > 1"
                        class="flex items-center justify-between px-5 py-3 border-t text-xs"
                        :class="isDark ? 'border-gray-700 bg-gray-800' : 'border-slate-200 bg-slate-50'">
                        <span :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                            Showing {{ messages.from }}–{{ messages.to }} of {{ messages.total }}
                        </span>
                        <div class="flex items-center gap-1">
                            <a v-if="messages.prev_page_url" :href="messages.prev_page_url"
                                class="px-3 py-1.5 rounded-lg border font-bold transition-all"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'">
                                ← Prev
                            </a>
                            <span class="px-3 py-1.5 font-mono font-bold"
                                :class="isDark ? 'text-white' : 'text-slate-800'">
                                {{ messages.current_page }} / {{ messages.last_page }}
                            </span>
                            <a v-if="messages.next_page_url" :href="messages.next_page_url"
                                class="px-3 py-1.5 rounded-lg border font-bold transition-all"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'">
                                Next →
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </PageLayout>
    </AuthenticatedLayout>

    <!-- ── Full Message Modal ────────────────────────────────────────────── -->
    <Teleport to="body">
        <Transition name="msg-fade">
            <div v-if="viewingMsg"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
                @click.self="closeMsg">
                <div class="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
                    style="max-height:80vh"
                    :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'">
                    <div class="px-5 py-4 border-b flex items-center justify-between"
                        :class="isDark ? 'border-gray-700' : 'border-slate-200 bg-slate-50'">
                        <div class="min-w-0">
                            <p class="text-xs font-bold" :class="isDark ? 'text-white' : 'text-slate-900'">
                                <template v-if="activeTab === 'groups'">
                                    {{ viewingMsg.group_name }} · {{ viewingMsg.sender_name }}
                                </template>
                                <template v-else>
                                    {{ viewingMsg.sender_name }} → {{ viewingMsg.recipient_name }}
                                </template>
                            </p>
                            <p class="text-[10px] mt-0.5" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                                {{ formatDT(viewingMsg.created_at) }}
                            </p>
                        </div>
                        <button @click="closeMsg"
                            class="w-7 h-7 rounded-full flex items-center justify-center border transition-all shrink-0"
                            :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'">
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <div class="p-5 overflow-y-auto modal-scroll msg-body"
                         style="scroll-behavior:smooth;"
                         @click="handleMessageClick">
                        <!-- File attachment button (clickable to open preview) -->
                        <button v-if="hasFiles(viewingMsg) && getFileInfo(viewingMsg)?.url" 
                             @click="openFilePreview(getFileInfo(viewingMsg))"
                             class="mb-4 p-4 rounded-lg border flex items-center gap-4 w-full text-left transition-all hover:shadow-md"
                             :class="isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'">
                            <span class="shrink-0 flex items-center" v-html="getFileIconSVGLarge(getFileInfo(viewingMsg)?.extension)"></span>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-bold truncate" :class="isDark ? 'text-white' : 'text-slate-900'">
                                    {{ getFileInfo(viewingMsg)?.filename || 'File Attachment' }}
                                </p>
                                <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                                    {{ getFileInfo(viewingMsg)?.type || 'Document' }}
                                    <span v-if="formatFileSize(getFileInfo(viewingMsg)?.size)"> · {{ formatFileSize(getFileInfo(viewingMsg).size) }}</span>
                                </p>
                            </div>
                            <div class="flex flex-col items-center gap-1 flex-shrink-0">
                                <svg class="w-6 h-6" :class="isDark ? 'text-gray-400' : 'text-slate-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                                <span class="text-[9px] font-bold uppercase" :class="isDark ? 'text-gray-500' : 'text-slate-400'">Preview</span>
                            </div>
                        </button>
                        
                        <!-- File attachment info (non-clickable if no URL) -->
                        <div v-else-if="hasFiles(viewingMsg)" 
                             class="mb-4 p-4 rounded-lg border flex items-center gap-4"
                             :class="isDark ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'">
                            <span class="shrink-0 flex items-center" v-html="getFileIconSVGLarge(getFileInfo(viewingMsg)?.extension)"></span>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-bold truncate" :class="isDark ? 'text-white' : 'text-slate-900'">
                                    {{ getFileInfo(viewingMsg)?.filename || 'File Attachment' }}
                                </p>
                                <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                                    {{ getFileInfo(viewingMsg)?.type || 'Document' }}
                                    <span v-if="formatFileSize(getFileInfo(viewingMsg)?.size)"> · {{ formatFileSize(getFileInfo(viewingMsg).size) }}</span>
                                </p>
                            </div>
                        </div>
                        
                        <!-- Message content -->
                        <div class="text-sm leading-relaxed whitespace-pre-wrap"
                            :class="isDark ? 'text-gray-200' : 'text-slate-800'"
                            v-html="sanitize(viewingMsg.message)"></div>
                    </div>
                    <!-- Delete from modal — hidden for now -->
                    <!--
                    <div class="px-5 py-3 border-t flex items-center justify-end gap-2"
                        :class="isDark ? 'border-gray-700 bg-gray-800' : 'border-slate-100 bg-slate-50'">
                        ...
                    </div>
                    -->
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- ── Blocked Users Modal ──────────────────────────────────────────── -->
    <Teleport to="body">
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="showBlockedModal"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
                @click.self="showBlockedModal = false">
                <Transition enter-active-class="transition duration-200 ease-out"
                    enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                    <div v-if="showBlockedModal"
                        class="w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
                        :class="isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'">

                        <!-- Header -->
                        <div class="flex items-center justify-between px-5 py-4 border-b"
                            :class="isDark ? 'border-gray-700 bg-gray-800' : 'border-slate-200 bg-slate-50'">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <svg class="w-4 h-4 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-sm font-bold" :class="isDark ? 'text-white' : 'text-slate-800'">Blocked Users</p>
                                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
                                        {{ blockedUsers?.length || 0 }} active block{{ blockedUsers?.length !== 1 ? 's' : '' }}
                                    </p>
                                </div>
                            </div>
                            <button @click="showBlockedModal = false"
                                class="w-7 h-7 rounded-full flex items-center justify-center border transition-all"
                                :class="isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'">
                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>

                        <!-- Body -->
                        <div class="overflow-y-auto blocked-scroll" style="max-height:58vh">
                            <!-- Empty -->
                            <div v-if="!blockedUsers?.length" class="py-14 text-center">
                                <div class="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                                    :class="isDark ? 'bg-gray-700' : 'bg-slate-100'">
                                    <svg class="w-6 h-6" :class="isDark ? 'text-gray-500' : 'text-slate-400'" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                                <p class="text-sm font-medium" :class="isDark ? 'text-gray-300' : 'text-slate-600'">No blocked users</p>
                                <p class="text-xs mt-1" :class="isDark ? 'text-gray-500' : 'text-slate-400'">No employees have blocked each other</p>
                            </div>

                            <!-- Table -->
                            <div v-else class="divide-y" :class="isDark ? 'divide-gray-700' : 'divide-slate-100'">
                                <!-- Header -->
                                <div class="grid grid-cols-[1fr_auto_1fr_auto] gap-2 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide border-b"
                                    :class="isDark ? 'border-gray-700 bg-gray-750 text-gray-400' : 'border-slate-200 bg-slate-50 text-slate-500'">
                                    <span>Blocked User</span>
                                    <span class="text-center px-1">→</span>
                                    <span>Blocked By</span>
                                    <span class="text-right">Date</span>
                                </div>
                                <!-- Rows -->
                                <div v-for="b in blockedUsers" :key="b.id"
                                    class="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center px-4 py-3 transition-colors"
                                    :class="isDark ? 'hover:bg-gray-700/50' : 'hover:bg-red-50/40'">
                                    <!-- Blocked user (victim) -->
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shrink-0 bg-slate-400">
                                            {{ initials(b.blocked_name) }}
                                        </span>
                                        <div class="min-w-0">
                                            <p class="font-semibold truncate text-xs" :class="isDark ? 'text-white' : 'text-slate-800'">{{ b.blocked_name }}</p>
                                            <p class="text-[10px] truncate" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ b.blocked_email }}</p>
                                        </div>
                                    </div>
                                    <!-- Arrow -->
                                    <svg class="w-3.5 h-3.5 flex-shrink-0" :class="isDark ? 'text-red-400' : 'text-red-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                    </svg>
                                    <!-- Blocker -->
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shrink-0"
                                            style="background:linear-gradient(135deg,#dc2626,#f97316)">
                                            {{ initials(b.blocker_name) }}
                                        </span>
                                        <div class="min-w-0">
                                            <p class="font-semibold truncate text-xs" :class="isDark ? 'text-white' : 'text-slate-800'">{{ b.blocker_name }}</p>
                                            <p class="text-[10px] truncate" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ b.blocker_email }}</p>
                                        </div>
                                    </div>
                                    <!-- Date -->
                                    <span class="text-[10px] whitespace-nowrap text-right shrink-0" :class="isDark ? 'text-gray-400' : 'text-slate-400'">
                                        {{ formatDT(b.created_at) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>

    <!-- Image Lightbox -->
    <ImageLightbox
        :is-open="showImageLightbox"
        :image-src="lightboxImageSrc"
        :image-alt="lightboxImageAlt"
        @close="closeImageLightbox"
    />

    <!-- File Preview Modal -->
    <FilePreviewModal
        :open="showFilePreview"
        :file="previewFile"
        @close="closeFilePreview"
    />
</template>

<style scoped>
.msg-fade-enter-active { transition: opacity 0.2s, transform 0.25s cubic-bezier(.16,1,.3,1); }
.msg-fade-leave-active { transition: opacity 0.15s ease; }
.msg-fade-enter-from   { opacity:0; transform:scale(0.95); }
.msg-fade-leave-to     { opacity:0; }

/* Smooth themed scrollbar inside the message view modal */
.modal-scroll {
    scroll-behavior: smooth;
}
.modal-scroll::-webkit-scrollbar {
    width: 5px;
}
.modal-scroll::-webkit-scrollbar-track {
    background: transparent;
}
.modal-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #0d9488, #06b6d4);
    border-radius: 999px;
}
.modal-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #0f766e, #0891b2);
}
.modal-scroll {
    scrollbar-width: thin;
    scrollbar-color: #0d9488 transparent;
}

/* Rich text message rendering */
.msg-body :deep(b),
.msg-body :deep(strong) { 
    font-weight: 700; 
}

.msg-body :deep(i),
.msg-body :deep(em) { 
    font-style: italic; 
}

.msg-body :deep(u) { 
    text-decoration: underline; 
}

.msg-body :deep(s),
.msg-body :deep(strike) { 
    text-decoration: line-through; 
}

.msg-body :deep(blockquote) {
    border-left: 3px solid #14b8a6;
    padding-left: 12px;
    margin: 8px 0;
    font-style: italic;
    opacity: 0.9;
}

.msg-body :deep(ul) {
    list-style-type: disc;
    list-style-position: inside;
    padding-left: 0;
    margin: 6px 0;
}

.msg-body :deep(ol) {
    list-style-type: decimal;
    list-style-position: inside;
    padding-left: 0;
    margin: 6px 0;
}

.msg-body :deep(a),
.msg-body :deep(a.rt-link) {
    color: #0ea5e9;
    text-decoration: underline;
}

.msg-body :deep(code),
.msg-body :deep(code.rt-code) {
    font-family: ui-monospace, 'Courier New', monospace;
    background: rgba(0,0,0,0.1);
    border-radius: 3px;
    padding: 2px 5px;
    font-size: 0.9em;
}

.msg-body :deep(img.rt-image) {
    max-width: 100%;
    max-height: 400px;
    height: auto;
    border-radius: 8px;
    margin: 8px 0;
    display: block;
    cursor: pointer;
    transition: transform 0.2s;
}

.msg-body :deep(img.rt-image):hover {
    transform: scale(1.02);
}

/* Hide file attachment HTML since we show it separately */
.msg-body :deep(.rt-file-attachment) {
    display: none;
}

/* Blocked users smooth scroll */
.blocked-scroll {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
}
.blocked-scroll::-webkit-scrollbar {
    width: 4px;
}
.blocked-scroll::-webkit-scrollbar-track {
    background: transparent;
}
.blocked-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #dc2626, #f97316);
    border-radius: 999px;
}
.blocked-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #b91c1c, #ea580c);
}
.blocked-scroll {
    scrollbar-width: thin;
    scrollbar-color: #dc2626 transparent;
}
</style>
