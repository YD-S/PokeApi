<template>
  <div class="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
    <!-- Global Navbar -->
    <header class="bg-white shadow-md sticky top-0 z-50">
      <nav class="container mx-auto flex flex-wrap items-center justify-between px-4 py-4">
        <div class="flex items-center justify-between w-full sm:w-auto">
          <h1 class="text-xl font-semibold text-blue-600">PokéAPI Creator</h1>

          <!-- Mobile toggle -->
          <button
              class="sm:hidden text-gray-700 hover:text-blue-600 transition"
              @click="menuOpen = !menuOpen"
          >
            <svg
                v-if="!menuOpen"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Nav links -->
        <div
            :class="[
            'w-full sm:w-auto flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0',
            menuOpen ? 'block' : 'hidden sm:flex'
          ]"
        >
          <router-link
              to="/"
              class="text-gray-700 hover:text-blue-600 font-medium transition"
              v-if="auth.accessToken"
          >
            Dashboard
          </router-link>

          <router-link
              to="/create"
              class="text-gray-700 hover:text-blue-600 font-medium transition"
              v-if="auth.accessToken"
          >
            Create Pokémon
          </router-link>

          <router-link
              to="/login"
              class="text-gray-700 hover:text-blue-600 font-medium transition"
              v-if="!auth.accessToken"
          >
            Login
          </router-link>

          <button
              v-if="auth.accessToken"
              @click="auth.logout"
              class="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-grow container mx-auto px-4 py-8">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-auto">
      <div class="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
        © 2025 PokéAPI Creator - Built by YashDev Singh
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from './store/auth'

const auth = useAuthStore()
const menuOpen = ref(false)
</script>