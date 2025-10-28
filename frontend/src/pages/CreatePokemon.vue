<template>
  <div class="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
    <!-- Loading Overlay -->
    <div
        v-if="loading"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center space-y-4">
        <div class="relative w-24 h-24 mx-auto">
          <!-- Spinning Pokeball Animation -->
          <div class="absolute inset-0 border-8 border-red-500 border-t-white rounded-full animate-spin"></div>
        </div>
        <h3 class="text-xl font-semibold text-gray-800">Generating Your Pokémon...</h3>
        <p class="text-gray-600 text-sm">This may take 15-30 seconds</p>
        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div class="bg-blue-600 h-2 rounded-full animate-pulse" style="width: 70%"></div>
        </div>
      </div>
    </div>

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
        ✍️ Prompt Mode
      </button>
      <button
          @click="mode = 'compose'"
          :class="[
          'px-4 py-2 rounded-md font-medium transition',
          mode === 'compose' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700',
        ]"
      >
        🎨 Compose Mode
      </button>
    </div>

    <!-- Prompt Mode -->
    <div v-if="mode === 'prompt'" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Pokémon Name</label>
        <input
            v-model="name"
            type="text"
            placeholder="e.g., Thunderwolf"
            maxlength="50"
            class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <p class="text-xs text-gray-500 mt-1">{{ name.length }}/50 characters</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
            v-model="prompt"
            rows="4"
            placeholder="Describe your Pokémon in detail... e.g., 'A majestic wolf with lightning powers, glowing blue eyes, and electric fur'"
            maxlength="500"
            class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <p class="text-xs text-gray-500 mt-1">{{ prompt.length }}/500 characters</p>
      </div>

      <button
          @click="createPokemonPrompt"
          :disabled="loading || !name.trim() || !prompt.trim()"
          class="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        ⚡ Generate Pokémon
      </button>
    </div>

    <!-- Compose Mode -->
    <div v-else class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Pokémon Name</label>
        <input
            v-model="name"
            type="text"
            placeholder="e.g., Flamewing"
            maxlength="50"
            class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <p class="text-xs text-gray-500 mt-1">{{ name.length }}/50 characters</p>
      </div>

      <div>
        <label class="font-medium text-gray-700 mb-2 block">
          Choose Animals ({{ selectedAnimals.length }}/3)
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
              v-for="animal in animals"
              :key="animal"
              @click="toggleSelection(selectedAnimals, animal, 3)"
              :disabled="!selectedAnimals.includes(animal) && selectedAnimals.length >= 3"
              :class="[
              'border rounded-md px-3 py-2 text-sm transition capitalize',
              selectedAnimals.includes(animal)
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-blue-400',
              !selectedAnimals.includes(animal) && selectedAnimals.length >= 3
                ? 'opacity-50 cursor-not-allowed'
                : '',
            ]"
          >
            {{ animal }}
          </button>
        </div>
      </div>

      <div>
        <label class="font-medium text-gray-700 mb-2 block">
          Choose Abilities ({{ selectedAbilities.length }}/3)
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
              v-for="ability in abilities"
              :key="ability"
              @click="toggleSelection(selectedAbilities, ability, 3)"
              :disabled="!selectedAbilities.includes(ability) && selectedAbilities.length >= 3"
              :class="[
              'border rounded-md px-3 py-2 text-sm transition capitalize',
              selectedAbilities.includes(ability)
                ? 'bg-green-600 text-white border-green-600 shadow-md'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-green-400',
              !selectedAbilities.includes(ability) && selectedAbilities.length >= 3
                ? 'opacity-50 cursor-not-allowed'
                : '',
            ]"
          >
            {{ ability }}
          </button>
        </div>
      </div>

      <button
          @click="createPokemonCompose"
          :disabled="loading || !name.trim() || selectedAnimals.length === 0 || selectedAbilities.length === 0"
          class="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        ⚡ Generate Pokémon
      </button>
    </div>

    <!-- Tips Section -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
      <h4 class="font-semibold text-blue-900 mb-2">💡 Tips for better results:</h4>
      <ul class="list-disc list-inside space-y-1 text-blue-800">
        <li>Be specific with descriptions (colors, features, atmosphere)</li>
        <li>Combine 2-3 animals for unique hybrids</li>
        <li>Mix complementary abilities for interesting combinations</li>
        <li>Generation takes 15-30 seconds - please be patient!</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createWithPrompt, createComposed, getOptions } from '../api/pokemon'

const router = useRouter()
const mode = ref<'prompt' | 'compose'>('prompt')
const name = ref('')
const prompt = ref('')
const animals = ref<string[]>([])
const abilities = ref<string[]>([])
const selectedAnimals = ref<string[]>([])
const selectedAbilities = ref<string[]>([])
const loading = ref(false)

onMounted(async () => {
  try {
    const res = await getOptions()
    animals.value = res.data.animals
    abilities.value = res.data.abilities
  } catch (err) {
    console.error('❌ Failed to load options:', err)
    alert('Failed to load options. Please refresh the page.')
  }
})

const toggleSelection = (list: string[], value: string, maxItems: number) => {
  const index = list.indexOf(value)
  if (index === -1) {
    if (list.length < maxItems) {
      list.push(value)
    }
  } else {
    list.splice(index, 1)
  }
}

const createPokemonPrompt = async () => {
  if (!name.value.trim() || !prompt.value.trim()) {
    alert('Please enter both name and description.')
    return
  }

  loading.value = true
  try {
    const res = await createWithPrompt({
      name: name.value.trim(),
      prompt: prompt.value.trim()
    })

    await router.push(`/pokemon/${res.data.id}`)
  } catch (err: any) {
    console.error('❌ Error creating Pokémon from prompt:', err)
    alert(err.response?.data?.message || 'Failed to generate Pokémon. Please try again.')
    loading.value = false
  }
}

const createPokemonCompose = async () => {
  if (!name.value.trim()) {
    alert('Please enter a Pokémon name.')
    return
  }
  if (selectedAnimals.value.length === 0) {
    alert('Please select at least one animal.')
    return
  }
  if (selectedAbilities.value.length === 0) {
    alert('Please select at least one ability.')
    return
  }

  loading.value = true
  try {
    const res = await createComposed({
      name: name.value.trim(),
      animals: selectedAnimals.value,
      abilities: selectedAbilities.value,
    })

    await router.push(`/pokemon/${res.data.id}`)
  } catch (err: any) {
    console.error('❌ Error creating Pokémon from composition:', err)
    alert(err.response?.data?.message || 'Failed to generate Pokémon. Please try again.')
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>