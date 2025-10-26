<template>
  <div class="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
    <h2 class="text-2xl font-semibold text-gray-800 text-center">
      Create Your Pokémon
    </h2>

    <!-- Mode Switch -->
    <div class="flex justify-center gap-4">
      <button
          @click="mode = 'prompt'"
          :class="[
          'px-4 py-2 rounded-md font-medium transition',
          mode === 'prompt' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700',
        ]"
      >
        Prompt Mode
      </button>
      <button
          @click="mode = 'compose'"
          :class="[
          'px-4 py-2 rounded-md font-medium transition',
          mode === 'compose' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700',
        ]"
      >
        Compose Mode
      </button>
    </div>

    <!-- Prompt Mode -->
    <div v-if="mode === 'prompt'" class="space-y-4">
      <input
          v-model="name"
          type="text"
          placeholder="Enter Pokémon name"
          class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
      />

      <textarea
          v-model="prompt"
          rows="4"
          placeholder="Describe your Pokémon..."
          class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
      />

      <button
          @click="createPokemonPrompt"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
      >
        {{ loading ? 'Generating...' : 'Generate Pokémon' }}
      </button>
    </div>

    <!-- Compose Mode -->
    <div v-else class="space-y-4">
      <input
          v-model="name"
          type="text"
          placeholder="Enter Pokémon name"
          class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
      />

      <div>
        <label class="font-medium text-gray-700">Choose up to 3 animals:</label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          <button
              v-for="animal in animals"
              :key="animal"
              @click="toggleSelection(selectedAnimals, animal)"
              :class="[
              'border rounded-md px-2 py-1 text-sm transition',
              selectedAnimals.includes(animal)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-100 text-gray-700 border-gray-300',
            ]"
          >
            {{ animal }}
          </button>
        </div>
      </div>

      <div>
        <label class="font-medium text-gray-700">Choose up to 3 abilities:</label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          <button
              v-for="ability in abilities"
              :key="ability"
              @click="toggleSelection(selectedAbilities, ability)"
              :class="[
              'border rounded-md px-2 py-1 text-sm transition',
              selectedAbilities.includes(ability)
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-gray-100 text-gray-700 border-gray-300',
            ]"
          >
            {{ ability }}
          </button>
        </div>
      </div>

      <button
          @click="createPokemonCompose"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
      >
        {{ loading ? 'Generating...' : 'Generate Pokémon' }}
      </button>
    </div>

    <!-- Result Preview -->
    <div v-if="imageUrl" class="text-center space-y-3">
      <h3 class="text-lg font-semibold">{{ name }}</h3>
      <img
          :src="backendUrl + imageUrl"
          alt="Generated Pokémon"
          class="rounded-lg mx-auto w-full max-w-sm object-cover shadow-md"
      />
      <router-link
          :to="'/'"
          class="block bg-green-600 text-white px-4 py-2 rounded-md mt-4 hover:bg-green-700 transition"
      >
        Back to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createWithPrompt, createComposed, getOptions } from '../api/pokemon'

const mode = ref<'prompt' | 'compose'>('prompt')
const name = ref('')
const prompt = ref('')
const animals = ref<string[]>([])
const abilities = ref<string[]>([])
const selectedAnimals = ref<string[]>([])
const selectedAbilities = ref<string[]>([])
const loading = ref(false)
const imageUrl = ref('')
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

onMounted(async () => {
  try {
    const res = await getOptions()
    animals.value = res.data.animals
    abilities.value = res.data.abilities
  } catch (err) {
    console.error('❌ Failed to load options:', err)
  }
})

const toggleSelection = (list: any[], value: string) => {
  const index = list.indexOf(value)
  if (index === -1 && list.length < 3) list.push(value)
  else if (index !== -1) list.splice(index, 1)
}

const createPokemonPrompt = async () => {
  if (!name.value || !prompt.value) return alert('Please enter name and prompt.')
  loading.value = true
  try {
    const res = await createWithPrompt({ name: name.value, prompt: prompt.value })
    imageUrl.value = res.data.imageUrl
  } catch (err) {
    console.error('❌ Error creating Pokémon from prompt:', err)
  } finally {
    loading.value = false
  }
}

const createPokemonCompose = async () => {
  if (!name.value || selectedAnimals.value.length === 0 || selectedAbilities.value.length === 0)
    return alert('Please enter name, select animals, and abilities.')
  loading.value = true
  try {
    const res = await createComposed({
      name: name.value,
      animals: selectedAnimals.value,
      abilities: selectedAbilities.value,
    })
    imageUrl.value = res.data.imageUrl
  } catch (err) {
    console.error('❌ Error creating Pokémon from composition:', err)
  } finally {
    loading.value = false
  }
}
</script>