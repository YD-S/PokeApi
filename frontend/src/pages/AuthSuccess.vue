<template>
  <div class="flex items-center justify-center min-h-screen">
    <p class="text-gray-600">Logging you in with Google...</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const accessToken = route.query.accessToken as string
const refreshToken = route.query.refreshToken as string

if (accessToken && refreshToken) {
  auth.googleLoginSuccess(accessToken, refreshToken)
  router.replace('/')
} else {
  router.replace('/login')
}
</script>