<script setup lang="ts">
interface TicksProps {
  beatsPerMeasure: number
  isPlaying: boolean
  currentBeat: number
  highlightColors: string[]
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
        'w-full h-8 rounded-md shadow-md border-2 border-black/20 transition-all flex items-center justify-center font-bold text-white text-lg',
        [
          props.isPlaying && props.currentBeat === beat
            ? beat === 1
              ? props.highlightColors[0]
              : props.highlightColors[1]
            : 'bg-secondary-400/70 dark:bg-secondary-500',
          props.reduceOpacity && 'opacity-20'
        ]
      ]"
    >
      {{ beat }}
    </div>
  </div>
</template>
