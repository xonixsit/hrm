<template>
  <AuthenticatedLayout>
    <div class="flex h-[calc(100vh-80px)] bg-gray-50">

      <!-- Sidebar: Chat Sessions -->
      <div class="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 class="text-sm font-bold text-gray-900">TaxGPT</h1>
              <p class="text-xs text-gray-500">Tax Assistant</p>
            </div>
          </div>
          <form :action="route('taxgpt.new')" method="POST">
            <input type="hidden" name="_token" :value="csrfToken" />
            <button type="submit"
              class="w-full flex items-center gap-2 px-3 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>
          </form>
        </div>

        <!-- Sessions List -->
        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <p v-if="sessions.length === 0" class="text-xs text-gray-400 text-center py-4">No chats yet</p>
          <div v-for="session in sessions" :key="session.id"
            class="group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
            :class="activeSession?.id === session.id ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50'"
            @click="openSession(session.id)">
            <svg class="w-4 h-4 shrink-0" :class="activeSession?.id === session.id ? 'text-teal-600' : 'text-gray-400'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span class="text-xs text-gray-700 truncate flex-1">{{ session.title }}</span>
            <form :action="route('taxgpt.delete', session.id)" method="POST"
              @submit.prevent="deleteSession(session.id)"
              class="opacity-0 group-hover:opacity-100 shrink-0">
              <button type="submit" class="text-gray-400 hover:text-red-500 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="flex-1 flex flex-col min-w-0">

        <!-- No session selected -->
        <div v-if="!activeSession" class="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div class="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-4">
            <svg class="w-9 h-9 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">TaxGPT — Your Tax Assistant</h2>
          <p class="text-sm text-gray-500 max-w-sm mb-6">Get instant answers on GST, income tax, TDS, and more while on a customer call.</p>
          <div class="grid grid-cols-2 gap-3 max-w-md w-full">
            <button v-for="q in quickQuestions" :key="q" @click="startWithQuestion(q)"
              class="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 hover:border-teal-400 hover:bg-teal-50 transition-colors">
              {{ q }}
            </button>
          </div>
        </div>

        <!-- Active session -->
        <template v-else>
          <!-- Chat header -->
          <div class="px-6 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
            <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span class="text-sm font-medium text-gray-800 truncate">{{ activeSession.title }}</span>
          </div>

          <!-- Messages -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div v-if="localMessages.length === 0" class="text-center text-sm text-gray-400 py-8">
              Ask anything about tax, GST, TDS, or compliance...
            </div>
            <div v-for="msg in localMessages" :key="msg.id ?? msg.tempId"
              :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
              <div :class="[
                'max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
              ]">
                <div v-if="msg.role === 'assistant'" class="whitespace-pre-wrap" v-html="formatMessage(msg.content) + (isLoading && msg === localMessages[localMessages.length - 1] ? '<span class=\'inline-block w-0.5 h-4 bg-gray-500 ml-0.5 animate-pulse align-middle\'></span>' : '')"></div>
                <div v-else>{{ msg.content }}</div>
              </div>
            </div>
            <!-- Typing indicator (shown only before first token arrives) -->
            <div v-if="isLoading && localMessages[localMessages.length - 1]?.content === ''" class="flex justify-start">
              <div class="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div class="flex gap-1 items-center">
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="px-6 py-4 bg-white border-t border-gray-200">
            <div v-if="error" class="mb-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ error }}</div>
            <div class="flex gap-3 items-end">
              <textarea
                v-model="inputMessage"
                @keydown.enter.exact.prevent="sendMessage"
                placeholder="Ask about GST, income tax, TDS, deductions... (Enter to send)"
                rows="2"
                class="flex-1 resize-none px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                :disabled="isLoading"
              ></textarea>
              <button @click="sendMessage" :disabled="isLoading || !inputMessage.trim()"
                class="px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-2">TaxGPT may make mistakes. Verify critical information before advising customers.</p>
          </div>
        </template>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue';
import { router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

const props = defineProps({
  sessions: { type: Array, default: () => [] },
  activeSession: { type: Object, default: null },
  messages: { type: Array, default: () => [] },
});

const localMessages = ref([...props.messages]);
const inputMessage = ref('');
const isLoading = ref(false);
const error = ref('');
const messagesContainer = ref(null);
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

const quickQuestions = [
  'What is the GST rate on software services?',
  'How is TDS calculated on salary?',
  'What are the income tax slabs for FY 2024-25?',
  'When is GST return filing due?',
];

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

onMounted(scrollToBottom);

const openSession = (id) => {
  router.visit(route('taxgpt.show', id));
};

const deleteSession = async (id) => {
  if (!confirm('Delete this chat?')) return;
  await fetch(route('taxgpt.delete', id), {
    method: 'DELETE',
    headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
  });
  router.visit(route('taxgpt.index'));
};

const startWithQuestion = async (question) => {
  // Create new session then send
  const res = await fetch(route('taxgpt.new'), {
    method: 'POST',
    headers: { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/json', 'Accept': 'application/json' },
  });
  // The controller redirects — just visit new and set input
  router.visit(route('taxgpt.index'), {
    onSuccess: () => { inputMessage.value = question; }
  });
};

const sendMessage = async () => {
  const text = inputMessage.value.trim();
  if (!text || isLoading.value || !props.activeSession) return;

  error.value = '';
  inputMessage.value = '';

  // Optimistic user message
  localMessages.value.push({ tempId: Date.now(), role: 'user', content: text });
  await scrollToBottom();

  // Placeholder for streaming assistant response
  const assistantMsg = reactive({ tempId: Date.now() + 1, role: 'assistant', content: '' });
  localMessages.value.push(assistantMsg);
  isLoading.value = true;

  try {
    const res = await fetch(route('taxgpt.stream', props.activeSession.id), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to get response');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE lines from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete last line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;

        const jsonStr = trimmed.slice(6);
        try {
          const parsed = JSON.parse(jsonStr);

          if (parsed.error) throw new Error(parsed.error);

          if (parsed.token) {
            assistantMsg.content += parsed.token;
            await scrollToBottom();
          }

          if (parsed.done) {
            if (parsed.session_title) {
              const s = props.sessions.find(s => s.id === props.activeSession.id);
              if (s) s.title = parsed.session_title;
            }
          }
        } catch (parseErr) {
          if (parseErr.message !== 'Unexpected end of JSON input') throw parseErr;
        }
      }
    }
  } catch (e) {
    error.value = e.message;
    localMessages.value.splice(-2, 2);
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};

const formatMessage = (text) => {
  // Basic markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/\n/g, '<br>');
};
</script>
