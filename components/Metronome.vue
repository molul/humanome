<script lang="ts" setup>
// import { Slider } from 'primevue/slider';

const tempo = ref<number>(120)
const beatsPerMeasure = ref<number>(4)
const timeSignatureOptions = [2, 3, 4, 5, 6, 7, 8]
const isPlaying = ref<boolean>(false)
const currentBeat = ref<number>(0)
let metronomeInterval: number | null = null

const ticksPath = 'ticks'

function toggleMetronome() {
  isPlaying.value ? stopMetronome() : startMetronome()
}

function startMetronome() {
  stopMetronome()
  isPlaying.value = true
  metronomeInterval = window.setInterval(playBeat, 60000 / tempo.value)
}

function stopMetronome() {
  if (metronomeInterval) clearInterval(metronomeInterval)
  isPlaying.value = false
  currentBeat.value = 0
}

function playBeat() {
  console.log(`Beat ${currentBeat.value + 1} of ${beatsPerMeasure.value}`)
  const sound =
    currentBeat.value === 0
      ? '/ticks/Synth_Square_A_hi.wav'
      : '/ticks/Synth_Square_A_lo.wav'
  new Audio(sound).play()
  currentBeat.value = (currentBeat.value + 1) % beatsPerMeasure.value
}

watch([tempo, beatsPerMeasure], startMetronome)

onUnmounted(stopMetronome)
</script>

<template>
  <div class="metronome max-w-sm mx-auto text-center bg-white p-6 rounded-lg shadow-lg">
    <h2 class="text-2xl font-semibold mb-4">Metronome</h2>

    <div class="controls space-y-4">
      <div class="control flex flex-col items-center">
        <label for="tempo" class="font-medium text-gray-700"
          >Tempo: {{ tempo }} BPM</label
        >
        <!-- <Slider
          v-model="tempo"
          :min="40"
          :max="220"
          @change="startMetronome"
          class="w-full mt-2"
        /> -->
      </div>

      <div class="control flex flex-col items-center">
        <label for="timeSignature" class="font-medium text-gray-700"
          >Time Signature</label
        >
        <select
          v-model="beatsPerMeasure"
          @change="startMetronome"
          class="mt-2 px-3 py-2 border rounded-lg text-gray-700"
        >
          <option v-for="option in timeSignatureOptions" :key="option" :value="option">
            {{ option }}/4
          </option>
        </select>
      </div>

      <button
        @click="toggleMetronome"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {{ isPlaying ? 'Stop' : 'Start' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.metronome {
  max-width: 300px;
  margin: auto;
  text-align: center;
}
</style>
