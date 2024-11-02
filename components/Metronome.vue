<script lang="ts" setup>
import MetronomeSlider from './MetronomeSlider.vue'

interface MetronomeProps {
  enableHumanize: boolean
}

const props = defineProps<MetronomeProps>()

const baseTempo = ref<number>(120) // Base tempo without humanization
const tempo = ref<number>(120) // Current playing tempo
const beatsPerMeasure = ref<number>(4)
const isPlaying = ref<boolean>(false)
const currentBeat = ref<number>(0)
let metronomeInterval: number | null = null

// Humanize parameters
const humanizeAmount = ref<number>(2.5) // Maximum amount (in BPM) to vary from base tempo
const humanizeFrequency = ref<number>(5) // Frequency in seconds for tempo to change
let elapsedHumanizeTime = 0 // Time tracker for humanize frequency

// Volume parameters
const originalVolume = ref<number>(1) // Volume for original metronome
const humanizedVolume = ref<number>(1) // Volume for humanized metronome

function toggleMetronome() {
  isPlaying.value ? stopMetronome() : startMetronome()
}

function startMetronome() {
  stopMetronome()
  tempo.value = baseTempo.value // Set initial tempo to base tempo
  isPlaying.value = true
  updateMetronomeInterval() // Start metronome with current tempo
}

function stopMetronome() {
  if (metronomeInterval) clearInterval(metronomeInterval)
  isPlaying.value = false
  currentBeat.value = 0
  elapsedHumanizeTime = 0 // Reset elapsed time
}

function playBeat() {
  // Create audio instances here to ensure they are fresh and avoid crashes
  const humanizedTickSound = new Audio('/ticks/Synth_Square_A_hi.wav')
  const humanizedRestSound = new Audio('/ticks/Synth_Square_A_lo.wav')
  const originalTickSound = new Audio('/ticks/Perc_Clap_hi.wav')
  const originalRestSound = new Audio('/ticks/Perc_Clap_lo.wav')

  // Set volume for each sound
  originalTickSound.volume = originalVolume.value
  originalRestSound.volume = originalVolume.value
  humanizedTickSound.volume = humanizedVolume.value
  humanizedRestSound.volume = humanizedVolume.value

  console.log(
    `Beat ${currentBeat.value + 1} of ${
      beatsPerMeasure.value
    }, Tempo: ${tempo.value.toFixed(2)} BPM`
  )

  // Play the appropriate sound for the beat
  if (currentBeat.value === 0) {
    humanizedTickSound.play()
    originalTickSound.play()
  } else {
    humanizedRestSound.play()
    originalRestSound.play()
  }

  // Advance the beat counter
  currentBeat.value = (currentBeat.value + 1) % beatsPerMeasure.value

  // Check if humanize should adjust the tempo at the start of each frequency interval
  if (props.enableHumanize) {
    elapsedHumanizeTime += 60000 / tempo.value // Add elapsed time per beat in ms
    if (elapsedHumanizeTime >= humanizeFrequency.value * 1000) {
      humanizeTempo() // Adjust the tempo
      updateMetronomeInterval() // Restart interval with the new tempo
      elapsedHumanizeTime = 0 // Reset elapsed time counter
    }
  }
}

function updateMetronomeInterval() {
  if (metronomeInterval) clearInterval(metronomeInterval)
  metronomeInterval = window.setInterval(playBeat, 60000 / tempo.value)
}

function humanizeTempo() {
  const minTempo = baseTempo.value - baseTempo.value * (humanizeAmount.value / 100)
  const maxTempo = baseTempo.value + baseTempo.value * (humanizeAmount.value / 100)
  tempo.value = Math.random() * (maxTempo - minTempo) + minTempo
  console.log(`Humanized Tempo: ${tempo.value.toFixed(2)} BPM`)
}

watch([baseTempo, beatsPerMeasure], startMetronome)
onUnmounted(stopMetronome)
</script>

<template>
  <div
    class="w-full max-w-sm m-auto flex flex-col gap-4 bg-white p-8 rounded-lg shadow-lg"
  >
    <h1 class="text-3xl font-bold mb-4 text-center uppercase">Humanome</h1>

    <MetronomeSlider label="Tempo" unit="BPM" :min="40" :max="208" v-model="baseTempo" />

    <hr />

    <MetronomeSlider
      label="Humanize Amount"
      unit="%"
      :min="0"
      :max="10"
      :step="0.1"
      v-model="humanizeAmount"
    />
    <MetronomeSlider
      label="Humanize Frequency"
      unit="s"
      :min="1"
      :max="10"
      v-model="humanizeFrequency"
    />

    <hr />

    <MetronomeSlider label="Original volume" :min="0" :max="1" v-model="originalVolume" />
    <MetronomeSlider
      label="Humanized volume"
      :min="0"
      :max="1"
      v-model="humanizedVolume"
    />

    <!-- <div>
      <div class="flex justify-between">
        <label class="block text-sm font-semibold">Tempo </label>
        <div class="block text-sm">{{ baseTempo.toFixed(2) }} BPM</div>
      </div>
      <input
        type="range"
        min="40"
        max="208"
        v-model="baseTempo"
        @input="tempo = baseTempo"
        class="w-full"
      />
    </div> -->

    <hr />

    <!-- <div>
      <div class="flex justify-between">
        <label class="block text-sm font-semibold">Humanize Amount </label>
        <div class="block text-sm">{{ humanizeAmount }}</div>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        step="0.1"
        v-model="humanizeAmount"
        class="w-full"
      />
    </div> -->

    <!-- <div>
      <label class="block text-sm font-medium"
        >Humanize Frequency: {{ humanizeFrequency }}</label
      >
      <input type="range" min="1" max="10" v-model="humanizeFrequency" class="w-full" />
    </div> -->

    <!-- <hr /> -->

    <!-- <div>
      <label class="block text-sm font-medium"
        >Original volume: {{ originalVolume }}</label
      >
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="originalVolume"
        class="w-full"
      />
    </div> -->

    <!-- <div>
      <label class="block text-sm font-medium"
        >Humanized volume: {{ humanizedVolume }}</label
      >
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="humanizedVolume"
        class="w-full"
      />
    </div> -->

    <button
      @click="toggleMetronome"
      class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
    >
      {{ isPlaying ? 'Stop' : 'Start' }}
    </button>

    <div v-if="isPlaying" class="text-center">
      Humanized tempo: {{ tempo.toFixed(2) }}
    </div>
  </div>
</template>
