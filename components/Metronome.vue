<script lang="ts" setup>
import MetronomeSlider from './MetronomeSlider.vue'

const baseTempo = ref<number>(120) // Base tempo without humanization
const tempo = ref<number>(120) // Current playing tempo
const beatsPerMeasure = ref<number>(4)
const isPlaying = ref<boolean>(false)

const currentOriginalBeat = ref<number>(0)
const currentHumanizedBeat = ref<number>(0)

let originalMetronomeInterval: number | null = null
let humanizedMetronomeInterval: number | null = null

// Humanize parameters
const humanizeAmount = ref<number>(3) // Maximum amount (in BPM) to vary from base tempo
const humanizeFrequency = ref<number>(5) // Frequency in seconds for tempo to change
let elapsedHumanizeTime = 0 // Time tracker for humanize frequency
let shouldHumanizeNextBeat = false // Flag to indicate if we should humanize on next beat

// Volume parameters
const originalVolume = ref<number>(0) // Volume for original metronome
const humanizedVolume = ref<number>(1) // Volume for humanized metronome

// Audio clips
const humanizedTickSound = ref()
const humanizedRestSound = ref()
const originalTickSound = ref()
const originalRestSound = ref()

onMounted(() => {
  humanizedTickSound.value = new Audio('/ticks/Synth_Square_A_hi.wav')
  humanizedRestSound.value = new Audio('/ticks/Synth_Square_A_lo.wav')

  // Set volume for humanized sounds
  humanizedTickSound.value.volume = humanizedVolume.value
  humanizedRestSound.value.volume = humanizedVolume.value

  originalTickSound.value = new Audio('/ticks/Perc_Clap_hi.wav')
  originalRestSound.value = new Audio('/ticks/Perc_Clap_lo.wav')

  // Set volume for original sounds
  originalTickSound.value.volume = originalVolume.value
  originalRestSound.value.volume = originalVolume.value
})

// ----------------------------------------
// toggleMetronome
// ----------------------------------------
function toggleMetronome() {
  if (isPlaying.value) {
    stopOriginalMetronome()
    stopHumanizedMetronome()
  } else {
    startOriginalMetronome()
    startHumanizedMetronome()
  }
}

// ----------------------------------------
// startOriginalMetronome
// ----------------------------------------
function startOriginalMetronome() {
  stopOriginalMetronome()
  tempo.value = baseTempo.value // Set initial tempo to base tempo
  isPlaying.value = true
  updateOriginalMetronomeInterval() // Start metronome with current tempo
}

// ----------------------------------------
// startHumanizedMetronome
// ----------------------------------------
function startHumanizedMetronome() {
  stopHumanizedMetronome()
  tempo.value = baseTempo.value // Set initial tempo to base tempo
  isPlaying.value = true
  updateHumanizedMetronomeInterval() // Start metronome with current tempo
}

// ----------------------------------------
// stopOriginalMetronome
// ----------------------------------------
function stopOriginalMetronome() {
  if (originalMetronomeInterval) clearInterval(originalMetronomeInterval)
  isPlaying.value = false
  currentOriginalBeat.value = 0
}

// ----------------------------------------
// stopHumanizedMetronome
// ----------------------------------------
function stopHumanizedMetronome() {
  if (humanizedMetronomeInterval) clearInterval(humanizedMetronomeInterval)
  isPlaying.value = false
  currentHumanizedBeat.value = 0
  elapsedHumanizeTime = 0 // Reset elapsed time
  shouldHumanizeNextBeat = false // Reset humanize flag
}

// ----------------------------------------
// playOriginalBeatSound
// ----------------------------------------
function playOriginalBeatSound() {
  originalTickSound.value.volume = originalVolume.value
  originalRestSound.value.volume = originalVolume.value

  if (currentOriginalBeat.value === 0) {
    originalTickSound.value.play()
  } else {
    originalRestSound.value.play()
  }
}

// ----------------------------------------
// playHumanizedBeatSound
// ----------------------------------------
function playHumanizedBeatSound() {
  humanizedTickSound.value.volume = humanizedVolume.value
  humanizedRestSound.value.volume = humanizedVolume.value

  if (currentHumanizedBeat.value === 0) {
    humanizedTickSound.value.play()
  } else {
    humanizedRestSound.value.play()
  }
}

// ----------------------------------------
// playOriginalBeat
// ----------------------------------------
function playOriginalBeat() {
  console.info(
    `Original Beat ${currentOriginalBeat.value + 1} of ${
      beatsPerMeasure.value
    }, Tempo: ${tempo.value.toFixed(2)} BPM`
  )

  playOriginalBeatSound() // Play original sounds

  // Advance the beat counter
  currentOriginalBeat.value = (currentOriginalBeat.value + 1) % beatsPerMeasure.value

  updateOriginalMetronomeInterval() // Restart interval with the new tempo
}

// ----------------------------------------
// updateOriginalMetronomeInterval
// ----------------------------------------
function updateOriginalMetronomeInterval() {
  if (originalMetronomeInterval) clearInterval(originalMetronomeInterval)
  originalMetronomeInterval = window.setInterval(
    playOriginalBeat,
    60000 / baseTempo.value
  )
}

// ----------------------------------------
// playHumanizedBeat
// ----------------------------------------
function playHumanizedBeat() {
  console.info(
    `Humanized Beat ${currentHumanizedBeat.value + 1} of ${
      beatsPerMeasure.value
    }, Tempo: ${tempo.value.toFixed(2)} BPM`
  )

  playHumanizedBeatSound() // Play humanized sounds

  // Advance the beat counter
  currentHumanizedBeat.value = (currentHumanizedBeat.value + 1) % beatsPerMeasure.value

  // Check if humanize should adjust the tempo at the start of each frequency interval
  elapsedHumanizeTime += 60000 / tempo.value // Add elapsed time per beat in ms
  if (elapsedHumanizeTime >= humanizeFrequency.value * 1000) {
    shouldHumanizeNextBeat = true // Set flag to humanize on the next beat
  }

  // If the flag is set, humanize the tempo at the start of the next beat
  if (shouldHumanizeNextBeat) {
    humanizeTempo() // Adjust the tempo
    updateHumanizedMetronomeInterval() // Restart interval with the new tempo
    elapsedHumanizeTime = 0 // Reset elapsed time counter
    shouldHumanizeNextBeat = false // Reset flag after humanizing
  }
}

// ----------------------------------------
// updateHumanizedMetronomeInterval
// ----------------------------------------
function updateHumanizedMetronomeInterval() {
  if (humanizedMetronomeInterval) clearInterval(humanizedMetronomeInterval)
  humanizedMetronomeInterval = window.setInterval(playHumanizedBeat, 60000 / tempo.value)
}

// ----------------------------------------
// humanizeTempo
// ----------------------------------------
function humanizeTempo() {
  const minTempo = baseTempo.value - baseTempo.value * (humanizeAmount.value / 100)
  const maxTempo = baseTempo.value + baseTempo.value * (humanizeAmount.value / 100)
  tempo.value = Math.random() * (maxTempo - minTempo) + minTempo
  console.info(`New humanized Tempo: ${tempo.value.toFixed(2)} BPM`)
}

// ----------------------------------------
// watch
// ----------------------------------------
watch([baseTempo, beatsPerMeasure], () => {
  if (isPlaying.value) {
    startOriginalMetronome()
    startHumanizedMetronome()
  }
})

// ----------------------------------------
// onUnmounted
// ----------------------------------------
onUnmounted(stopOriginalMetronome)
onUnmounted(stopHumanizedMetronome)
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
