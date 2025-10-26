<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <!-- Global Navbar -->
    <header class="bg-white shadow-md sticky top-0 z-50">
      <nav class="container mx-auto flex items-center justify-between px-6 py-4">
        <h1 class="text-xl font-semibold text-blue-600">
          PokéAPI Creator
        </h1>

        <div class="flex items-center gap-4">
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
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './store/auth'
const auth = useAuthStore()
</script>
