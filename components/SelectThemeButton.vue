<script setup lang="ts">
const colorMode = useColorMode()

const icon = ref()

// ---------------------------
// switchColor
// ---------------------------
function switchColor() {
  colorMode.preference = colorMode.preference === 'light' ? 'dark' : 'light'
  switchIcon()
}

// ---------------------------
// switchIcon
// ---------------------------
function switchIcon() {
  icon.value = colorMode.preference === 'light' ? 'solar:moon-bold' : 'solar:sun-2-bold'
  // icon.value = icon.value === 'solar:sun-2-bold' ? 'solar:moon-bold' : 'solar:sun-2-bold'
}

// ---------------------------
// onMounted
// ---------------------------
onMounted(() => {
  switchIcon()
})
</script>

<template>
  <button
    v-if="icon"
    class="p-2 border rounded-md border-secondary-300 dark:border-secondary-500 hover:text-blue-600 dark:hover:text-blue-300 hover:border-blue-600 dark:hover:border-blue-300 transition-colors flex items-center"
    @click="switchColor"
  >
    <Icon :name="icon" class="size-5" />
  </button>
</template>
