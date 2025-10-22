<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      @click="handleBackdropClick"
    >
      <!-- Confetti Canvas -->
      <canvas
        ref="confettiCanvas"
        class="absolute inset-0 w-full h-full pointer-events-none"
      ></canvas>

      <!-- Birthday Popup -->
      <div
        class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100"
        @click.stop
      >
        <!-- Header with gradient background -->
        <div class="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 text-center text-white relative">
          <div class="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-indigo-400/20"></div>
          <div class="relative z-10">
            <div class="text-6xl mb-2 animate-bounce">🎉</div>
            <h2 class="text-2xl font-bold mb-1">Happy Birthday!</h2>
            <p class="text-pink-100 text-sm">Wishing you a wonderful day from the team</p>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 text-center">
          <div class="mb-4">
            <div class="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span class="text-2xl font-bold text-purple-700">
                {{ getInitials(employee.user.name) }}
              </span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-1">
              {{ employee.user.name }}
            </h3>
            <p class="text-gray-600 text-sm">
              {{ employee.job_title || 'Team Member' }}
            </p>
          </div>

          <div class="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-6">
            <div class="flex items-center justify-center space-x-2 text-purple-700">
              <span class="text-2xl">🎂</span>
              <span class="font-medium">
                {{ employee.age ? `Turning ${employee.age} today!` : 'Celebrating another year!' }}
              </span>
            </div>
          </div>

          <div class="text-gray-600 text-sm mb-6 leading-relaxed">
            Hope your special day is filled with happiness, laughter, and all your favorite things! 
            Thank you for being such an amazing part of our Xonobics family. 🌟
          </div>

          <!-- Birthday Message from Xonobics -->
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-100">
            <div class="flex items-center justify-center space-x-2 text-blue-700 mb-2">
              <span class="text-lg">🎊</span>
              <span class="font-semibold text-sm">From all of us at Xonobics</span>
            </div>
            <p class="text-xs text-blue-600 text-center">
              May this new year of your life bring you joy, success, and wonderful memories!
            </p>
          </div>

          <!-- Close Button -->
          <div class="flex justify-center">
            <button
              @click="close"
              class="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
            >
              Thank You! 🎉
            </button>
          </div>
        </div>

        <!-- Footer with Xonobics Logo -->
        <div class="bg-gray-50 px-6 py-4 text-center border-t border-gray-100">
          <div class="flex justify-center">
            <ApplicationLogo class="h-12 w-auto opacity-80" />
          </div>
        </div>

        <!-- Decorative elements -->
        <div class="absolute top-4 left-4 text-yellow-400 animate-pulse">✨</div>
        <div class="absolute top-6 right-6 text-pink-400 animate-pulse">🎈</div>
        <div class="absolute bottom-4 left-6 text-purple-400 animate-pulse">🎁</div>
        <div class="absolute bottom-6 right-4 text-indigo-400 animate-pulse">🌟</div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import ApplicationLogo from '@/Components/ApplicationLogo.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  employee: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const confettiCanvas = ref(null)
let confettiAnimation = null

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

const handleBackdropClick = () => {
  close()
}

const close = () => {
  emit('close')
}



// Confetti Animation Class
class ConfettiAnimation {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.particles = []
    this.colors = ['#ff6b9d', '#c44569', '#f8b500', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3']
    this.isRunning = false
    
    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  createParticle(x, y) {
    return {
      x: x || Math.random() * this.canvas.width,
      y: y || -10,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -8 - 2,
      gravity: 0.3,
      friction: 0.99,
      size: Math.random() * 8 + 4,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      life: 1,
      decay: Math.random() * 0.02 + 0.01,
      shape: Math.random() > 0.5 ? 'circle' : 'square'
    }
  }

  burst() {
    // Create burst of particles from center
    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2
    
    for (let i = 0; i < 50; i++) {
      const particle = this.createParticle(
        centerX + (Math.random() - 0.5) * 100,
        centerY + (Math.random() - 0.5) * 100
      )
      particle.vx = (Math.random() - 0.5) * 15
      particle.vy = (Math.random() - 0.5) * 15
      this.particles.push(particle)
    }
  }

  start() {
    this.isRunning = true
    
    // Initial burst
    this.burst()
    
    // Continuous particles from top
    this.particleInterval = setInterval(() => {
      if (this.particles.length < 100) {
        for (let i = 0; i < 3; i++) {
          this.particles.push(this.createParticle())
        }
      }
    }, 100)
    
    this.animate()
  }

  stop() {
    this.isRunning = false
    if (this.particleInterval) {
      clearInterval(this.particleInterval)
    }
  }

  animate() {
    if (!this.isRunning) return

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]

      // Update physics
      particle.vy += particle.gravity
      particle.vx *= particle.friction
      particle.vy *= particle.friction
      particle.x += particle.vx
      particle.y += particle.vy
      particle.rotation += particle.rotationSpeed
      particle.life -= particle.decay

      // Remove dead or off-screen particles
      if (particle.life <= 0 || 
          particle.y > this.canvas.height + 50 || 
          particle.x < -50 || 
          particle.x > this.canvas.width + 50) {
        this.particles.splice(i, 1)
        continue
      }

      // Draw particle
      this.ctx.save()
      this.ctx.translate(particle.x, particle.y)
      this.ctx.rotate(particle.rotation * Math.PI / 180)
      this.ctx.globalAlpha = particle.life
      this.ctx.fillStyle = particle.color

      if (particle.shape === 'circle') {
        this.ctx.beginPath()
        this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2)
        this.ctx.fill()
      } else {
        this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
      }

      this.ctx.restore()
    }

    requestAnimationFrame(() => this.animate())
  }
}

onMounted(async () => {
  if (props.show) {
    await nextTick()
    if (confettiCanvas.value) {
      confettiAnimation = new ConfettiAnimation(confettiCanvas.value)
      confettiAnimation.start()
    }
  }
})

onUnmounted(() => {
  if (confettiAnimation) {
    confettiAnimation.stop()
  }
})

// Watch for show prop changes
import { watch } from 'vue'
watch(() => props.show, async (newShow) => {
  if (newShow) {
    await nextTick()
    if (confettiCanvas.value && !confettiAnimation) {
      confettiAnimation = new ConfettiAnimation(confettiCanvas.value)
      confettiAnimation.start()
    } else if (confettiAnimation) {
      confettiAnimation.start()
    }
  } else {
    if (confettiAnimation) {
      confettiAnimation.stop()
    }
  }
})
</script>

<style scoped>
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -20px, 0);
  }
  70% {
    transform: translate3d(0, -10px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>