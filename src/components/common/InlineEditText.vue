<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder: string
  displayClass?: string
  inputClass?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editing = ref(false)
const draft = ref('')

function startEdit() {
  draft.value = props.modelValue
  editing.value = true
}
function save() {
  emit('update:modelValue', draft.value.trim())
  editing.value = false
}
</script>

<template>
  <input
    v-if="editing"
    v-model="draft"
    :placeholder="placeholder"
    autofocus
    class="rounded-control border border-clay-400 outline-none px-2 py-1"
    :class="inputClass"
    @keyup.enter="save"
    @blur="save"
  />
  <span v-else class="cursor-pointer" :class="[displayClass, !modelValue ? 'text-sand-400' : '']" @click="startEdit">
    {{ modelValue || placeholder }}
  </span>
</template>
