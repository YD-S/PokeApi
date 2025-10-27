<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 class="text-2xl font-semibold text-center mb-6 text-gray-800">
        Login to your account
      </h2>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
              v-model="email"
              type="email"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
              v-model="password"
              type="password"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
          />
        </div>

        <button
            type="submit"
            class="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition"
            :disabled="loading"
        >
          {{ loading ? "Logging in..." : "Login" }}
        </button>
      </form>

      <!-- Divider -->
      <div class="flex items-center my-6">
        <hr class="flex-grow border-gray-300" />
        <span class="px-3 text-gray-400 text-sm">or</span>
        <hr class="flex-grow border-gray-300" />
      </div>

      <!-- Google Login Button -->
      <button
          @click="loginWithGoogle"
          class="w-full border border-gray-300 rounded-lg py-2 font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition"
      >
        <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google logo"
            class="w-5 h-5"
        />
        <span class="text-gray-700">Continue with Google</span>
      </button>

      <!-- Register Link -->
      <p class="text-center text-sm text-gray-600 mt-6">
        Don’t have an account?
        <router-link to="/register" class="text-blue-600 hover:underline">
          Register
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const auth = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    await auth.login(email.value, password.value);
    await router.push("/");
  } catch (err: any) {
    alert(err.response?.data?.message || "Login failed");
  } finally {
    loading.value = false;
  }
};

const loginWithGoogle = () => {
  window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
};
</script>