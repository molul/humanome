<script setup lang="ts">
import Metronome from '~/components/Metronome.vue'
import Header from '~/components/Header.vue'

useSeoMeta({
  title: `Humanome - The humanized metronome`,
  ogTitle: `Humanome - The humanized metronome`,
  description:
    'A metronome that slightly changes tempo from time to time to simulate human behaviour',
  ogDescription:
    'A metronome that slightly changes tempo from time to time to simulate human behaviour'
  // ogImage: 'https://example.com/image.png',
  // twitterCard: 'summary_large_image',
})
</script>

<template>
  <div
    class="p-4 lg:p-20 bg-bgLight2 dark:bg-bgDark1 text-secondary-700 dark:text-secondary-200 h-screen-dvh flex justify-center transition-colors text-sm"
  >
    <div
      class="w-full lg:max-w-sm m-auto flex flex-col gap-4 bg-bgLight1 dark:bg-bgDark2 p-6 rounded-lg shadow-lg border border-secondary-300 dark:border-secondary-500"
    >
      <Header />
      <Metronome />
      <div class="text-xs text-center font-medium">
        Developed by
        <NuxtLink class="textOnly" to="https://www.luismorcilloluque.com" target="_blank">
          Luis Morcillo Luque
        </NuxtLink>
        with Nuxt 3 &copy; 2024
      </div>
    </div>
  </div>
</template>
