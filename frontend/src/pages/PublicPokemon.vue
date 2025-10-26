<template>
  <div class="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
    <div v-if="loading" class="text-center text-gray-500 py-10">
      Loading Pokémon details...
    </div>

    <div v-else-if="error" class="text-center text-red-500 py-10">
      {{ error }}
    </div>

    <div v-else>
      <h2 class="text-2xl font-bold text-gray-800 text-center">{{ pokemon.name }}</h2>
      <img
          :src="backendUrl + pokemon.imageUrl"
          alt="Pokemon image"
          class="rounded-lg mx-auto w-full max-w-md object-cover shadow-md"
      />

      <div class="text-center text-gray-600 mt-4">
        <p class="text-sm mb-3">{{ pokemon.prompt }}</p>
        <p class="text-xs">
          Created by:
          <span class="font-medium text-gray-800">
            {{ pokemon.creator?.name || 'Unknown' }}
          </span>
          ({{ pokemon.creator?.email }})
        </p>
      </div>

      <div class="flex justify-center gap-3 mt-6">
        <button
            v-if="pokemon.isPublic"
            @click="copyLink"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Copy Share Link
        </button>

        <router-link
            v-if="auth.accessToken"
            to="/"
            class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
        >
          Back to Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPokemon } from '../api/pokemon'
import { useAuthStore } from '../store/auth'

const route = useRoute()
const auth = useAuthStore()
const pokemon = ref<any>(null)
const loading = ref(true)
const error = ref('')
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

onMounted(async () => {
  const id = route.params.id as string
  try {
    const res = await getPokemon(id)
    pokemon.value = res.data

    if (!pokemon.value.isPublic && !auth.accessToken) {
      error.value = '❌ This Pokémon is private.'
      pokemon.value = null
    }
  } catch (err: any) {
    console.error('❌ Error fetching Pokémon:', err)
    error.value = 'Pokémon not found or unavailable.'
  } finally {
    loading.value = false
  }
})

const copyLink = async () => {
  try {
    const shareUrl = `${window.location.origin}/pokemon/${pokemon.value.id}`
    await navigator.clipboard.writeText(shareUrl)
    alert('✅ Share link copied to clipboard!')
  } catch {
    alert('❌ Failed to copy link.')
  }
}
</script>

<style scoped>
img {
  transition: transform 0.3s ease;
}
img:hover {
  transform: scale(1.05);
}
</style>