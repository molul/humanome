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
let shouldHumanizeNextBeat = false // Flag to indicate if we should humanize on next beat

// Volume parameters
const originalVolume = ref<number>(1) // Volume for original metronome
const humanizedVolume = ref<number>(1) // Volume for humanized metronome

function toggleMetronome() {
  if (isPlaying.value) {
    stopMetronome()
  } else {
    startMetronome()
  }
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
  shouldHumanizeNextBeat = false // Reset humanize flag
}

// const humanizedTickSound = ref()
// const humanizedRestSound = ref()
// const originalTickSound = ref()
// const originalRestSound = ref()

// Function to set initial volume for audio instances
// function setupSounds() {
//   humanizedTickSound.value = new Audio('/ticks/Synth_Square_A_hi.wav')
//   humanizedRestSound.value = new Audio('/ticks/Synth_Square_A_lo.wav')
//   originalTickSound.value = new Audio('/ticks/Perc_Clap_hi.wav')
//   originalRestSound.value = new Audio('/ticks/Perc_Clap_lo.wav')

//   originalTickSound.value.volume = originalVolume.value
//   originalRestSound.value.volume = originalVolume.value
//   humanizedTickSound.value.volume = humanizedVolume.value
//   humanizedRestSound.value.volume = humanizedVolume.value
// }

// // Call setupSounds() when the component mounts
// onMounted(() => {
//   setupSounds()
// })

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

  console.info(
    `Beat ${currentBeat.value + 1} of ${
      beatsPerMeasure.value
    }, Tempo: ${tempo.value.toFixed(2)} BPM`
  )

  // Play the appropriate sound for the beat
  if (currentBeat.value === 0) {
    humanizedTickSound.play()
    originalTickSound.play()
    // humanizedTickSound.value.play()
    // originalTickSound.value.play()
  } else {
    humanizedRestSound.play()
    originalRestSound.play()
    // humanizedRestSound.value.play()
    // originalRestSound.value.play()
  }

  // Advance the beat counter
  currentBeat.value = (currentBeat.value + 1) % beatsPerMeasure.value

  // Check if humanize should adjust the tempo at the start of each frequency interval
  if (props.enableHumanize) {
    elapsedHumanizeTime += 60000 / tempo.value // Add elapsed time per beat in ms
    if (elapsedHumanizeTime >= humanizeFrequency.value * 1000) {
      shouldHumanizeNextBeat = true // Set flag to humanize on the next beat
    }

    // If the flag is set, humanize the tempo at the start of the next beat
    if (shouldHumanizeNextBeat) {
      humanizeTempo() // Adjust the tempo
      updateMetronomeInterval() // Restart interval with the new tempo
      elapsedHumanizeTime = 0 // Reset elapsed time counter
      shouldHumanizeNextBeat = false // Reset flag after humanizing
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
  console.info(`Humanized Tempo: ${tempo.value.toFixed(2)} BPM`)
}

watch([baseTempo, beatsPerMeasure], () => {
  if (isPlaying.value) {
    startMetronome()
  }
})

onUnmounted(stopMetronome)
</script>

<template>
  <div
    class="w-full lg:max-w-sm m-auto flex flex-col gap-4 bg-white p-8 rounded-lg shadow-lg border border-secondary-300"
  >
    <div class="flex items-center gap-3 justify-center">
      <Icon name="mdi:metronome" class="size-8" />
      <h1 class="text-3xl font-bold text-center uppercase">Humanome</h1>
    </div>

    <div>
      <MetronomeSlider
        v-model="baseTempo"
        label="Tempo"
        unit="BPM"
        :min="40"
        :max="250"
      />

      <div class="flex justify-between text-sm">
        <div class="font-medium">Humanized tempo</div>
        <div>{{ tempo.toFixed(2) }} BPM</div>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <label for="timeSignature" class="block text-sm font-semibold"
        >Time Signature</label
      >
      <select
        id="timeSignature"
        v-model="beatsPerMeasure"
        class="mt-1 px-1 py-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      >
        <option value="1">1/1</option>
        <option value="2">2/4</option>
        <option value="3">3/4</option>
        <option value="4">4/4</option>
        <option value="5">5/4</option>
        <option value="6">6/8</option>
        <option value="7">7/8</option>
        <option value="8">8/8</option>
      </select>
    </div>

    <hr />

    <MetronomeSlider
      v-model="humanizeAmount"
      label="Humanize Amount"
      unit="%"
      :min="0"
      :max="10"
      :step="0.1"
    />
    <MetronomeSlider
      v-model="humanizeFrequency"
      label="Humanize Frequency"
      unit="s"
      :min="1"
      :max="10"
    />

    <hr />

    <MetronomeSlider
      v-model="humanizedVolume"
      label="Humanized volume"
      :min="0"
      :max="1"
      :step="0.01"
    />
    <MetronomeSlider
      v-model="originalVolume"
      label="Original volume"
      :min="0"
      :max="1"
      :step="0.01"
    />

    <hr />

    <button
      class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      @click="toggleMetronome"
    >
      {{ isPlaying ? 'Stop' : 'Start' }}
    </button>
  </div>
</template>
