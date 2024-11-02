<script setup lang="ts">
import Metronome from '~/components/Metronome.vue'
</script>

<template>
  <div class="p-20 bg-secondary-50 h-screen flex justify-center">
    <Metronome :enable-humanize="true" />
    <!-- <Metronome :enable-humanize="false" /> -->
  </div>
</template>
