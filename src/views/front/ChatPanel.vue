<template>
  <el-card class="chat-container">
    <div class="chat-window" ref="chatWindow">
      <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['chat-msg', msg.role === 'user' ? 'msg-user' : 'msg-ai']"
      >
        <div class="msg-bubble">{{ msg.content }}</div>
      </div>
      <div ref="bottomAnchor"></div>
    </div>

    <el-input
        v-model="input"
        type="textarea"
        placeholder="请输入问题并按下回车发送"
        @keyup.enter="send"
        :disabled="loading"
        rows="2"
    />
    <div class="footer">
      <el-switch
          v-model="useStream"
          active-text="流式模式"
          inactive-text="完整模式"
          :disabled="true"
      />
      <el-button
          @click="send"
          :loading="loading"
          type="primary"
          class="send-btn"
      >发送</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ✅ SiliconFlow Key + 模型
const apiKey = 'sk-iftppqkfikuvnhrqutlgutihawgcfihppeusfnjnmescnztq'
const model = 'Qwen/Qwen2.5-VL-72B-Instruct'

const input = ref('')
const messages = ref<Message[]>([
  {
    role: 'assistant',
    content: '您好，我是您的健康体检问诊助手，有什么可以帮您的吗？'
  }
])

const loading = ref(false)
const chatWindow = ref<HTMLElement | null>(null)


const send = async () => {
  const question = input.value.trim()
  if (!question || loading.value) return

  messages.value.push({ role: 'user', content: question })
  input.value = ''
  const aiMsg: Message = { role: 'assistant', content: '' }
  messages.value.push(aiMsg)

  loading.value = true

  try {
    const res = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: question }
        ],
        stream: false,
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
        stop: [],
        n: 1
      })
    })

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    aiMsg.content = content || 'AI 没有返回任何内容。'
    await scrollToBottom()
  } catch (err) {
    ElMessage.error('请求失败，请检查网络或 API Key 设置')
    messages.value.pop()
  } finally {
    loading.value = false
  }
}

const bottomAnchor = ref<HTMLElement | null>(null)
const scrollToBottom = async () => {
  await nextTick()
  bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' }) // ✅ 保证滚到底部
}
</script>

<style scoped>
.chat-container {
  //margin-left: 50px;
  width: 100%;
  height: 750px;
  margin-left: 10%;

  padding: 16px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.chat-window {
  height: 500px;
  flex: 1;
  overflow-y: auto;
  background: #f4f4f4;
  padding: 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.chat-msg {
  display: flex;
  margin: 8px 0;
}

.msg-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
  word-break: break-word;
  line-height: 1.6;
}

.msg-user {
  justify-content: flex-end;
}

.msg-user .msg-bubble {
  background: #cce7ff;
  color: #000;
  border-bottom-right-radius: 0;
}

.msg-ai {
  justify-content: flex-start;
}

.msg-ai .msg-bubble {
  background: #e6e6e6;
  color: #000;
  border-bottom-left-radius: 0;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.send-btn {
  margin-left: 10px;
}

</style>
