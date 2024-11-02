<script lang="ts" setup>
import { computed } from 'vue'

interface MetronomeSliderProps {
  label: string
  unit?: string
  min: number
  max: number
  icon?: string
  step?: number
  modelValue: number
}

const props = defineProps<MetronomeSliderProps>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void
}>()

// Computed property for two-way binding with PrimeVue Slider
const sliderValue = computed({
  get: () => props.modelValue,
  set: (value: number) => emit('update:modelValue', value)
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex justify-between">
      <label class="block text-sm font-semibold">{{ props.label }} </label>
      <div class="block text-sm">{{ props.modelValue }} {{ props.unit }}</div>
    </div>

    <div class="flex gap-4 items-center">
      <Icon v-if="props.icon" :name="props.icon" class="size-6" />

      <Slider
        v-model="sliderValue"
        :min="props.min"
        :max="props.max"
        :step="props.step"
        class="w-full"
      />
    </div>
  </div>
</template>
