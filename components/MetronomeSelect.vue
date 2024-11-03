<script lang="ts" setup>
interface SelectOptionProps {
  label: string
  value: string | number
}

interface MetronomeSliderProps {
  label: string
  options: SelectOptionProps[]
  modelValue: number
}
const props = defineProps<MetronomeSliderProps>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void
}>()

const _selectValue = computed({
  get: () => props.modelValue,
  set: (value: number) => emit('update:modelValue', value)
})
</script>

<template>
  <div class="flex justify-between items-center">
    <label for="timeSignature" class="block text-sm font-semibold">{{
      props.label
    }}</label>
    <Select
      v-model="_selectValue"
      :options="props.options"
      option-label="label"
      option-value="value"
      placeholder="Select..."
    />
  </div>
</template>
