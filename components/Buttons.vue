<script setup lang="ts">
interface ButtonsProps {
  isPlaying: boolean
}

const props = defineProps<ButtonsProps>()
const emit = defineEmits(['toggleMetronome', 'reset'])
</script>

<template>
  <div class="flex w-full flex-row-reverse lg:flex-col gap-2">
    <Button
      class="w-1/2 lg:w-auto text-white py-2 px-4 rounded font-medium transition-colors !border-transparent"
      :class="{
        'bg-red-600 hover:bg-red-500 active:bg-red-700': props.isPlaying,
        'bg-primary-600 hover:!bg-primary-500 active:!bg-primary-700': !props.isPlaying
      }"
      @click="emit('toggleMetronome')"
    >
      {{ isPlaying ? 'Stop' : 'Start' }}
    </Button>
    <Button
      class="w-1/2 lg:w-auto text-secondary-700 dark:text-secondary-200 bg-white py-2 px-4 rounded hover:text-blue-600 hover:border-blue-600 active:text-blue-700 border border-secondary-300 dark:border-secondary-500 font-medium transition-colors dark:bg-secondary-800 dark:hover:text-blue-300 dark:hover:border-blue-300"
      @click="emit('reset')"
    >
      Reset
    </Button>
  </div>
</template>
