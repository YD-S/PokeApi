<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-xl shadow p-12 text-center">
      <div class="relative w-16 h-16 mx-auto mb-4">
        <div class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p class="text-gray-500">Loading Pokémon details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white rounded-xl shadow p-12 text-center space-y-4">
      <div class="text-6xl">❌</div>
      <h3 class="text-xl font-semibold text-gray-800">Oops!</h3>
      <p class="text-red-500">{{ error }}</p>
      <router-link
          to="/"
          class="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Back to Dashboard
      </router-link>
    </div>

    <!-- Success State -->
    <div v-else class="space-y-6">
      <!-- Success Banner (show if just created) -->
      <div
          v-if="isNewlyCreated"
          class="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-6 text-center animate-fade-in"
      >
        <div class="text-4xl mb-2">🎉</div>
        <h3 class="text-2xl font-bold mb-1">Pokémon Created Successfully!</h3>
        <p class="text-green-100">Your unique Pokémon has been generated</p>
      </div>

      <!-- Pokemon Card -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold mb-1">{{ pokemon.name }}</h1>
              <p class="text-blue-100 text-sm flex items-center gap-2">
                <span>Created by {{ pokemon.creator?.name || 'Unknown' }}</span>
                <span v-if="pokemon.isPublic" class="bg-green-500 text-white px-2 py-0.5 rounded text-xs">
                  Public
                </span>
                <span v-else class="bg-gray-500 text-white px-2 py-0.5 rounded text-xs">
                  Private
                </span>
              </p>
            </div>
            <div class="text-4xl">⚡</div>
          </div>
        </div>

        <!-- Image Section -->
        <div class="p-6">
          <div class="relative rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-100 to-gray-200">
            <img
                :src="backendUrl + pokemon.imageUrl"
                :alt="pokemon.name"
                class="w-full max-w-2xl mx-auto object-contain hover:scale-105 transition-transform duration-300"
                @load="imageLoaded = true"
            />
            <div v-if="!imageLoaded" class="absolute inset-0 flex items-center justify-center">
              <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="px-6 pb-6 space-y-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              📝 Description
            </h3>
            <p class="text-gray-600 leading-relaxed">{{ pokemon.prompt }}</p>
          </div>

          <!-- Metadata -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="bg-blue-50 rounded-lg p-3">
              <p class="text-blue-600 font-medium">Created</p>
              <p class="text-gray-700">{{ formatDate(pokemon.created_at) }}</p>
            </div>
            <div class="bg-purple-50 rounded-lg p-3">
              <p class="text-purple-600 font-medium">ID</p>
              <p class="text-gray-700">#{{ pokemon.id }}</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="border-t border-gray-200 p-6 bg-gray-50">
          <div class="flex flex-wrap gap-3 justify-center">
            <router-link
                to="/"
                class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium"
            >
              🏠 Dashboard
            </router-link>

            <router-link
                to="/create"
                class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition font-medium"
            >
              ➕ Create Another
            </router-link>

            <button
                v-if="pokemon.isPublic"
                @click="copyShareLink"
                class="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition font-medium"
            >
              🔗 Share Link
            </button>

            <button
                v-if="isOwner"
                @click="togglePokemonVisibility"
                :class="[
                'px-6 py-2 rounded-md font-medium transition',
                pokemon.isPublic
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-green-600 text-white hover:bg-green-700',
              ]"
            >
              {{ pokemon.isPublic ? '🔒 Make Private' : '🌍 Make Public' }}
            </button>

            <button
                v-if="isOwner"
                @click="confirmDelete"
                class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition font-medium"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Related Creator Info -->
      <div v-if="pokemon.creator" class="bg-white rounded-xl shadow p-6">
        <h3 class="font-semibold text-gray-800 mb-3">👤 Creator Info</h3>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {{ pokemon.creator.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="font-medium text-gray-800">{{ pokemon.creator.name }}</p>
            <p class="text-sm text-gray-500">{{ pokemon.creator.email }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPokemon, toggleVisibility, deletePokemon } from '../api/pokemon'
import { useAuthStore } from '../store/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const pokemon = ref<any>(null)
const loading = ref(true)
const error = ref('')
const imageLoaded = ref(false)
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const isNewlyCreated = computed(() => route.query.new === 'true')

const isOwner = computed(() => {
  return auth.user && pokemon.value && auth.user.id === pokemon.value.createdBy
})

onMounted(async () => {
  const id = route.params.id as string
  try {
    const res = await getPokemon(parseInt(id))
    pokemon.value = res.data

    if (!pokemon.value.isPublic && !auth.accessToken) {
      error.value = '🔒 This Pokémon is private and requires authentication.'
      pokemon.value = null
    } else if (!pokemon.value.isPublic && !isOwner.value) {
      error.value = '🔒 This Pokémon is private. Only the creator can view it.'
      pokemon.value = null
    }
  } catch (err: any) {
    console.error('❌ Error fetching Pokémon:', err)
    error.value = err.response?.status === 404
        ? 'Pokémon not found. It may have been deleted.'
        : 'Failed to load Pokémon details. Please try again.'
  } finally {
    loading.value = false
  }
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const copyShareLink = async () => {
  try {
    const shareUrl = `${window.location.origin}/pokemon/${pokemon.value.id}`
    await navigator.clipboard.writeText(shareUrl)
    alert('✅ Share link copied to clipboard!')
  } catch {
    alert('❌ Failed to copy link. Please copy manually from the URL bar.')
  }
}

const togglePokemonVisibility = async () => {
  if (!isOwner.value) return

  const newVisibility = !pokemon.value.isPublic
  try {
    await toggleVisibility(pokemon.value.id, newVisibility)
    pokemon.value.isPublic = newVisibility
    alert(`✅ Pokémon is now ${newVisibility ? 'public' : 'private'}`)
  } catch (err) {
    console.error('❌ Error toggling visibility:', err)
    alert('Failed to update visibility. Please try again.')
  }
}

const confirmDelete = async () => {
  if (!isOwner.value) return

  if (!confirm(`Are you sure you want to delete "${pokemon.value.name}"? This action cannot be undone.`)) {
    return
  }

  try {
    await deletePokemon(pokemon.value.id)
    alert('✅ Pokémon deleted successfully')
    await router.push('/')
  } catch (err) {
    console.error('❌ Error deleting Pokémon:', err)
    alert('Failed to delete Pokémon. Please try again.')
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>