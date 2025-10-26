<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-semibold text-gray-800">Your Pokémon</h2>
      <router-link
          to="/create"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        + Create New
      </router-link>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-gray-500 text-center py-10">
      Loading your Pokémon...
    </div>

    <!-- Empty state -->
    <div v-else-if="pokemons.length === 0" class="text-gray-500 text-center py-10">
      You haven’t created any Pokémon yet.
    </div>

    <!-- Pokémon Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
          v-for="p in pokemons"
          :key="p.id"
          class="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
      >
        <img
            :src="backendUrl + p.imageUrl"
            alt="Pokemon image"
            class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-800 truncate">{{ p.name }}</h3>
          <p class="text-sm text-gray-500 truncate mb-3">{{ p.prompt }}</p>

          <div class="flex justify-between items-center">
            <router-link
                :to="`/pokemon/${p.id}`"
                class="text-blue-600 text-sm hover:underline"
            >
              View
            </router-link>

            <div class="flex items-center gap-2">
              <button
                  @click="togglePokemonVisibility(p)"
                  :class="[
                  'text-xs px-2 py-1 rounded-md transition',
                  p.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600',
                ]"
              >
                {{ p.isPublic ? 'Public' : 'Private' }}
              </button>

              <button
                  @click="DeletePokemon(p.id)"
                  class="text-xs px-2 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserPokemons, toggleVisibility, deletePokemon } from '../api/pokemon'

const pokemons = ref<any[]>([])
const loading = ref(true)
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const fetchPokemons = async () => {
  try {
    const res = await getUserPokemons()
    pokemons.value = res.data
  } catch (err) {
    console.error('❌ Error fetching pokemons:', err)
  } finally {
    loading.value = false
  }
}

const togglePokemonVisibility = async (pokemon: any) => {
  try {
    const res = await toggleVisibility(pokemon.id, !pokemon.isPublic)
    console.log('✅ Visibility toggled:', res.data)
  } catch (err) {
    console.error('❌ Error toggling visibility:', err)
  }
}

const DeletePokemon = async (id: number) => {
  if (!confirm('Are you sure you want to delete this Pokémon?')) return
  try {
    await deletePokemon(id)
    pokemons.value = pokemons.value.filter((p) => p.id !== id)
  } catch (err) {
    console.error('❌ Error deleting pokemon:', err)
  }
}

onMounted(fetchPokemons)
</script>

<style scoped>
img {
  transition: transform 0.2s ease;
}
img:hover {
  transform: scale(1.05);
}
</style>
