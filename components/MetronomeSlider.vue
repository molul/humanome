<script lang="ts" setup>
interface MetronomeSliderProps {
  label: string
  unit?: string
  min: number
  max: number
  step?: number
  modelValue: number
}
const props = defineProps<MetronomeSliderProps>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void
}>()

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).valueAsNumber
  emit('update:modelValue', value)
}
</script>

<template>
  <div>
    <div class="flex justify-between">
      <label class="block text-sm font-semibold">{{ props.label }} </label>
      <div class="block text-sm">{{ props.modelValue }} {{ props.unit }}</div>
    </div>
    <input
      type="range"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      :value="props.modelValue"
      class="w-full"
      @input="onInput"
    />
  </div>
</template>
