<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import MetronomeSlider from './MetronomeSlider.vue'

const baseTempo = ref<number>(120) // Base tempo without humanization
const tempo = ref<number>(120) // Current playing tempo
const beatsPerMeasure = ref<number>(4)
const isPlaying = ref<boolean>(false)
const originalMetronomeStarted = ref<boolean>(false)
const humanizedMetronomeStarted = ref<boolean>(false)

const currentOriginalBeat = ref<number>(0)
const currentHumanizedBeat = ref<number>(0)

let originalMetronomeInterval: number | null = null
let humanizedMetronomeInterval: number | null = null

// Humanize parameters
const humanizeAmount = ref<number>(2) // Maximum amount (in BPM) to vary from base tempo
const humanizeFrequency = ref<number>(3) // Frequency in seconds for tempo to change
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

// Transition parameters
const transitionDuration = ref<number>(5000) // Duration for transitions in milliseconds
const transitionStartTempo = ref<number>(tempo.value) // Starting tempo for transitions
const transitionEndTempo = ref<number>(tempo.value) // Ending tempo for transitions
const transitionCurrentTime = ref<number>(0) // Current time in transition
const isTransitioning = ref<boolean>(false) // Flag to indicate if a transition is occurring

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

// Function to update tempo with transition
function updateTempoWithTransition(newTempo: number) {
  if (isTransitioning.value) return // Prevent new transition if one is ongoing
  transitionStartTempo.value = tempo.value // Save current tempo as start
  transitionEndTempo.value = newTempo // Set new tempo as end
  transitionCurrentTime.value = 0 // Reset current time
  isTransitioning.value = true // Start transition process

  const transitionInterval = setInterval(() => {
    if (transitionCurrentTime.value >= transitionDuration.value) {
      tempo.value = transitionEndTempo.value // Set final tempo
      clearInterval(transitionInterval) // Clear interval
      isTransitioning.value = false // End transition
    } else {
      transitionCurrentTime.value += 50 // Increase current time
      const progress = transitionCurrentTime.value / transitionDuration.value // Calculate progress
      tempo.value =
        transitionStartTempo.value +
        (transitionEndTempo.value - transitionStartTempo.value) * progress // Interpolate tempo
    }
  }, 50)
}

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
// reset
// ----------------------------------------
function reset() {
  if (isPlaying.value) {
    stopOriginalMetronome()
    stopHumanizedMetronome()
  }
  baseTempo.value = 120
  beatsPerMeasure.value = 4
  humanizeAmount.value = 2
  humanizeFrequency.value = 3
  humanizedVolume.value = 1
  originalVolume.value = 0
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
  originalMetronomeStarted.value = false
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
  humanizedMetronomeStarted.value = false
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
  // console.info(
  //   `Original Beat ${currentOriginalBeat.value + 1} of ${
  //     beatsPerMeasure.value
  //   }, Tempo: ${tempo.value.toFixed(2)} BPM`
  // )

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
    originalMetronomeStarted.value ? 60000 / tempo.value : 0
  )
  originalMetronomeStarted.value = true
}

// ----------------------------------------
// playHumanizedBeat
// ----------------------------------------
function playHumanizedBeat() {
  // console.info(
  //   `Humanized Beat ${currentHumanizedBeat.value + 1} of ${
  //     beatsPerMeasure.value
  //   }, Tempo: ${tempo.value.toFixed(2)} BPM`
  // )

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
  if (!humanizedMetronomeStarted.value) {
    humanizedMetronomeStarted.value = true
    updateHumanizedMetronomeInterval()
  }
}

// ----------------------------------------
// updateHumanizedMetronomeInterval
// ----------------------------------------
function updateHumanizedMetronomeInterval() {
  if (humanizedMetronomeInterval) clearInterval(humanizedMetronomeInterval)
  // humanizedMetronomeInterval = window.setInterval(playHumanizedBeat, 60000 / tempo.value)

  humanizedMetronomeInterval = window.setInterval(
    playHumanizedBeat,
    humanizedMetronomeStarted.value ? 60000 / tempo.value : 0
  )
}

// ----------------------------------------
// humanizeTempo
// ----------------------------------------
function humanizeTempo() {
  const minTempo = baseTempo.value - baseTempo.value * (humanizeAmount.value / 100)
  const maxTempo = baseTempo.value + baseTempo.value * (humanizeAmount.value / 100)
  const newTempo = Math.random() * (maxTempo - minTempo) + minTempo
  // console.info(`New humanized Tempo: ${newTempo.toFixed(2)} BPM`)
  updateTempoWithTransition(newTempo) // Transition to the new tempo
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

const _currentHumanizedBeatAux = computed(() =>
  currentHumanizedBeat.value === 0 ? beatsPerMeasure.value : currentHumanizedBeat.value
)
const _currentOriginalBeatAux = computed(() =>
  currentOriginalBeat.value === 0 ? beatsPerMeasure.value : currentOriginalBeat.value
)
</script>

<template>
  <div
    class="w-full lg:max-w-sm m-auto flex flex-col gap-3 bg-white p-8 rounded-lg shadow-lg border border-secondary-300"
  >
    <div class="flex items-center gap-3 justify-center">
      <Icon name="mdi:metronome" class="size-8" />
      <h1 class="text-3xl font-bold text-center uppercase">Humanome</h1>
    </div>

    <div class="flex flex-col gap-1">
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
      <div class="flex justify-between text-xs">
        <div class="rounded bg-secondary-200 p-1">
          <span class="font-medium">From</span> {{ transitionStartTempo.toFixed(2) }}
        </div>
        <div class="rounded bg-secondary-200 p-1">
          <span class="font-medium">To:</span> {{ transitionEndTempo.toFixed(2) }}
        </div>
      </div>
    </div>

    <hr />

    <div class="flex justify-between items-center">
      <label for="timeSignature" class="block text-sm font-semibold"
        >Time Signature</label
      >
      <select
        id="timeSignature"
        v-model="beatsPerMeasure"
        class="mt-1 px-1 py-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      >
        <option :value="1">1/1</option>
        <option :value="2">2/4</option>
        <option :value="3">3/4</option>
        <option :value="4">4/4</option>
        <option :value="5">5/4</option>
        <option :value="6">6/8</option>
        <option :value="7">7/8</option>
        <option :value="8">8/8</option>
        <option :value="9">9/8</option>
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
      label="Humanized metronome"
      :min="0"
      :max="1"
      :step="0.01"
      icon="mdi:volume-high"
    />
    <div class="flex gap-2 justify-between">
      <div
        v-for="beat in beatsPerMeasure"
        :key="`humanized-${beat}`"
        :class="[
          'w-full h-8 rounded',
          [
            isPlaying && _currentHumanizedBeatAux === beat
              ? 'bg-violet-600'
              : 'bg-gray-300'
          ]
        ]"
      ></div>
    </div>

    <hr />
    <MetronomeSlider
      v-model="originalVolume"
      label="Original metronome"
      :min="0"
      :max="1"
      :step="0.01"
      icon="mdi:volume-high"
    />

    <div class="flex gap-2 justify-between">
      <div
        v-for="beat in beatsPerMeasure"
        :key="`original-${beat}`"
        :class="[
          'w-full h-8 rounded',
          [isPlaying && _currentOriginalBeatAux === beat ? 'bg-green-600' : 'bg-gray-300']
        ]"
      ></div>
    </div>

    <hr />

    <button
      class="text-white py-2 px-4 rounded hover:bg-blue-600 font-semibold transition-colors"
      :class="{
        'bg-red-500': isPlaying,
        'bg-blue-500': !isPlaying
      }"
      @click="toggleMetronome"
    >
      {{ isPlaying ? 'Stop' : 'Start' }}
    </button>

    <button
      class="bg-white py-2 px-4 rounded hover:text-blue-600 border border-secondary-300 font-semibold"
      @click="reset"
    >
      Reset
    </button>
  </div>
</template>
