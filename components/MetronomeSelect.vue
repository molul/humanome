<script lang="ts" setup>
interface MetronomeSliderProps {
  label: string
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
  <div class="flex justify-between items-center">
    <label for="timeSignature" class="block text-sm font-semibold">{{
      props.label
    }}</label>
    <select
      id="timeSignature"
      :value="props.modelValue"
      class="mt-1 px-1 py-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      @change="onInput"
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
</template>
