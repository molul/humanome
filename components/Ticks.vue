<script setup lang="ts">
interface TicksProps {
  beatsPerMeasure: number
  isPlaying: boolean
  currentBeat: number
  highlightColor: string
  reduceOpacity: boolean
}

const props = defineProps<TicksProps>()
</script>

<template>
  <div class="flex gap-2 justify-between">
    <div
      v-for="beat in props.beatsPerMeasure"
      :key="`${beat}`"
      :class="[
        'w-full h-8 rounded shadow-md border-2 border-black/20 transition-all',
        [
          props.isPlaying && props.currentBeat === beat
            ? props.highlightColor
            : 'bg-secondary-300 dark:bg-secondary-500',
          props.reduceOpacity && 'opacity-20'
        ]
      ]"
    ></div>
  </div>
</template>
