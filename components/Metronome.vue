<script lang="ts" setup>
import MetronomeSlider from './MetronomeSlider.vue'

// Existing state variables
const baseTempo = ref<number>(120) // Base tempo without humanization
const tempo = ref<number>(120) // Current playing tempo
const beatsPerMeasure = ref<number>(4)
const isPlaying = ref<boolean>(false)
const originalMetronomeStarted = ref<boolean>(false)
const humanizedMetronomeStarted = ref<boolean>(false)

const currentOriginalBeat = ref<number>(0)
const currentHumanizedBeat = ref<number>(0)

// Humanize parameters
const humanizeAmount = ref<number>(2) // Maximum amount (in BPM) to vary from base tempo
const humanizeFrequency = ref<number>(3) // Frequency in seconds for tempo to change
let elapsedHumanizeTime = 0 // Time tracker for humanize frequency
let shouldHumanizeNextBeat = false // Flag to indicate if we should humanize on next beat

// Volume parameters
const originalVolume = ref<number>(0) // Volume for original metronome
const humanizedVolume = ref<number>(1) // Volume for humanized metronome

// Audio clips
const humanizedTickSound = ref<AudioBuffer | null>(null)
const humanizedRestSound = ref<AudioBuffer | null>(null)
const originalTickSound = ref<AudioBuffer | null>(null)
const originalRestSound = ref<AudioBuffer | null>(null)

// Transition parameters
const transitionDuration = ref<number>(5000) // Duration for transitions in milliseconds
const transitionStartTempo = ref<number>(tempo.value) // Starting tempo for transitions
const transitionEndTempo = ref<number>(tempo.value) // Ending tempo for transitions
const transitionCurrentTime = ref<number>(0) // Current time in transition
const isTransitioning = ref<boolean>(false) // Flag to indicate if a transition is occurring

const _currentHumanizedBeatAux = computed(() =>
  currentHumanizedBeat.value === 0 ? beatsPerMeasure.value : currentHumanizedBeat.value
)

const _currentOriginalBeatAux = computed(() =>
  currentOriginalBeat.value === 0 ? beatsPerMeasure.value : currentOriginalBeat.value
)

// Web Audio API variables
// let audioContext: AudioContext | null = null
let originalAudioContext: AudioContext | null = null
let humanizedAudioContext: AudioContext | null = null

const lookAhead = 0.1 // How far ahead to schedule audio (in seconds)
let nextTickTimeOriginal = 0.0
let nextTickTimeHumanized = 0.0
let schedulerTimerID: number | null = null

async function loadOriginalAudioBuffer(url: string): Promise<AudioBuffer> {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return await originalAudioContext!.decodeAudioData(arrayBuffer)
}

async function loadHumanizedAudioBuffer(url: string): Promise<AudioBuffer> {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return await humanizedAudioContext!.decodeAudioData(arrayBuffer)
}

// Initialize AudioContext and load audio buffers
onMounted(async () => {
  originalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  humanizedAudioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)()

  // Load audio buffers
  originalTickSound.value = await loadOriginalAudioBuffer('/ticks/Perc_Clap_hi.wav')
  originalRestSound.value = await loadOriginalAudioBuffer('/ticks/Perc_Clap_lo.wav')
  humanizedTickSound.value = await loadHumanizedAudioBuffer(
    '/ticks/Synth_Square_A_hi.wav'
  )
  humanizedRestSound.value = await loadHumanizedAudioBuffer(
    '/ticks/Synth_Square_A_lo.wav'
  )

  // Start scheduler if metronome is already playing
  if (isPlaying.value) {
    startScheduler()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  stopScheduler()
  if (originalAudioContext) {
    originalAudioContext.close()
  }
  if (humanizedAudioContext) {
    humanizedAudioContext.close()
  }
})

// ----------------------------------------
// toggleMetronome
// ----------------------------------------
function toggleMetronome() {
  if (isPlaying.value) {
    stopOriginalMetronome()
    stopHumanizedMetronome()
    stopScheduler()
  } else {
    startOriginalMetronome()
    startHumanizedMetronome()
    startScheduler()
  }
}

// ----------------------------------------
// reset
// ----------------------------------------
function reset() {
  if (isPlaying.value) {
    stopOriginalMetronome()
    stopHumanizedMetronome()
    stopScheduler()
  }
  baseTempo.value = 120
  beatsPerMeasure.value = 4
  humanizeAmount.value = 2
  humanizeFrequency.value = 3
  humanizedVolume.value = 1
  originalVolume.value = 0
}

// ----------------------------------------
// Scheduler Functions
// ----------------------------------------

// Start the scheduler
function startScheduler() {
  if (originalAudioContext && originalAudioContext.state === 'suspended') {
    originalAudioContext.resume()
  }
  if (humanizedAudioContext && humanizedAudioContext.state === 'suspended') {
    humanizedAudioContext.resume()
  }
  nextTickTimeOriginal = originalAudioContext!.currentTime
  nextTickTimeHumanized = humanizedAudioContext!.currentTime

  // Play the first beat immediately
  scheduleOriginalBeat(nextTickTimeOriginal)
  scheduleHumanizedBeat(nextTickTimeHumanized)

  nextTickTimeOriginal += 60.0 / baseTempo.value
  nextTickTimeHumanized += 60.0 / tempo.value

  scheduler()
}

// Stop the scheduler
function stopScheduler() {
  if (schedulerTimerID !== null) {
    clearTimeout(schedulerTimerID)
    schedulerTimerID = null
  }
}

// Scheduler loop
function scheduler() {
  while (nextTickTimeOriginal < originalAudioContext!.currentTime + lookAhead) {
    scheduleOriginalBeat(nextTickTimeOriginal)
    nextTickTimeOriginal += 60.0 / baseTempo.value
  }

  while (nextTickTimeHumanized < humanizedAudioContext!.currentTime + lookAhead) {
    scheduleHumanizedBeat(nextTickTimeHumanized)
    nextTickTimeHumanized += 60.0 / tempo.value
  }

  schedulerTimerID = window.setTimeout(scheduler, 25)
}

// Schedule Original Beat
function scheduleOriginalBeat(time: number) {
  if (!originalTickSound.value || !originalRestSound.value) return

  const isDownBeat = currentOriginalBeat.value === 0
  const buffer = isDownBeat ? originalTickSound.value : originalRestSound.value

  const source = originalAudioContext!.createBufferSource()
  source.buffer = buffer

  const gainNode = originalAudioContext!.createGain()
  gainNode.gain.value = originalVolume.value

  source.connect(gainNode)
  gainNode.connect(originalAudioContext!.destination)

  source.start(time)

  // Update beat counter
  currentOriginalBeat.value = (currentOriginalBeat.value + 1) % beatsPerMeasure.value
}

// Schedule Humanized Beat
function scheduleHumanizedBeat(time: number) {
  if (!humanizedTickSound.value || !humanizedRestSound.value) return

  const isDownBeat = currentHumanizedBeat.value === 0
  const buffer = isDownBeat ? humanizedTickSound.value : humanizedRestSound.value

  const source = humanizedAudioContext!.createBufferSource()
  source.buffer = buffer

  const gainNode = humanizedAudioContext!.createGain()
  gainNode.gain.value = humanizedVolume.value

  source.connect(gainNode)
  gainNode.connect(humanizedAudioContext!.destination)

  source.start(time)

  // Update beat counter and handle humanization
  currentHumanizedBeat.value = (currentHumanizedBeat.value + 1) % beatsPerMeasure.value

  elapsedHumanizeTime += 60 / tempo.value // Elapsed time in seconds
  if (elapsedHumanizeTime >= humanizeFrequency.value) {
    shouldHumanizeNextBeat = true
    elapsedHumanizeTime = 0
  }

  if (shouldHumanizeNextBeat) {
    humanizeTempo()
    shouldHumanizeNextBeat = false
  }
}

// ----------------------------------------
// Start Original Metronome
// ----------------------------------------
function startOriginalMetronome() {
  stopOriginalMetronome()
  isPlaying.value = true
}

// ----------------------------------------
// Stop Original Metronome
// ----------------------------------------
function stopOriginalMetronome() {
  isPlaying.value = false
  currentOriginalBeat.value = 0
  originalMetronomeStarted.value = false
}

// ----------------------------------------
// Start Humanized Metronome
// ----------------------------------------
function startHumanizedMetronome() {
  stopHumanizedMetronome()
  isPlaying.value = true
}

// ----------------------------------------
// Stop Humanized Metronome
// ----------------------------------------
function stopHumanizedMetronome() {
  isPlaying.value = false
  currentHumanizedBeat.value = 0
  elapsedHumanizeTime = 0 // Reset elapsed time
  shouldHumanizeNextBeat = false // Reset humanize flag
  humanizedMetronomeStarted.value = false
}

// ----------------------------------------
// humanizeTempo
// ----------------------------------------
function humanizeTempo() {
  const minTempo = baseTempo.value - baseTempo.value * (humanizeAmount.value / 100)
  const maxTempo = baseTempo.value + baseTempo.value * (humanizeAmount.value / 100)
  const newTempo = Math.random() * (maxTempo - minTempo) + minTempo
  updateTempoWithTransition(newTempo) // Transition to the new tempo
}

// ----------------------------------------
// Function to update tempo with transition
// ----------------------------------------
function updateTempoWithTransition(newTempo: number) {
  if (isTransitioning.value) return // Prevent new transition if one is ongoing
  transitionStartTempo.value = tempo.value // Save current tempo as start
  transitionEndTempo.value = newTempo // Set new tempo as end
  transitionCurrentTime.value = 0 // Reset current time
  isTransitioning.value = true // Start transition process

  const step = 50 // Update every 50ms
  const totalSteps = Math.ceil(transitionDuration.value / step)
  let currentStep = 0

  const transitionInterval = setInterval(() => {
    currentStep++
    transitionCurrentTime.value += step

    if (currentStep >= totalSteps) {
      tempo.value = transitionEndTempo.value // Set final tempo
      clearInterval(transitionInterval) // Clear interval
      isTransitioning.value = false // End transition
    } else {
      const progress = currentStep / totalSteps
      tempo.value =
        transitionStartTempo.value +
        (transitionEndTempo.value - transitionStartTempo.value) * progress // Interpolate tempo
    }
  }, step)
}
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
          <span class="font-medium">From:</span> {{ transitionStartTempo.toFixed(2) }}
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
          'w-full h-8 rounded shadow-md border-2 border-black/20',
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
          'w-full h-8 rounded shadow-md border-2 border-black/20',
          [isPlaying && _currentOriginalBeatAux === beat ? 'bg-green-600' : 'bg-gray-300']
        ]"
      ></div>
    </div>

    <hr />

    <button
      class="text-white py-2 px-4 rounded font-semibold transition-colors"
      :class="{
        'bg-red-500 hover:bg-red-600 ': isPlaying,
        'bg-blue-500 hover:bg-blue-600 ': !isPlaying
      }"
      @click="toggleMetronome"
    >
      {{ isPlaying ? 'Stop' : 'Start' }}
    </button>

    <button
      class="bg-white py-2 px-4 rounded hover:text-blue-600 border border-secondary-300 font-semibold transition-colors"
      @click="reset"
    >
      Reset
    </button>
  </div>
</template>
