<script setup lang="ts">
interface HumanizedTemporInfoProps {
  tempo: number
  transitionStartTempo: number
  transitionEndTempo: number
}

const props = defineProps<HumanizedTemporInfoProps>()
</script>

<template>
  <div class="flex justify-between text-sm">
    <div class="font-medium">Humanized tempo</div>
    <div class="font-primary-mono">{{ props.tempo.toFixed(2) }} BPM</div>
  </div>

  <!-- <div class="flex justify-between text-xxs lg:text-xs">
    <div class="rounded bg-primary-100 dark:bg-primary-900 px-2 py-1">
      <span class="font-semibold">From:</span> {{ props.transitionStartTempo.toFixed(2) }}
    </div>
    <div class="rounded bg-primary-100 dark:bg-primary-900 px-2 py-1">
      <span class="font-semibold">To:</span> {{ props.transitionEndTempo.toFixed(2) }}
    </div>
  </div> -->
</template>
