<script setup lang="ts">
import type {RuleExpression} from "vee-validate";

type AcceptProp = string[] | string

const {
  accept = ['image/jpeg', 'image/png', 'application/pdf'],
  maxFiles = 1,
  maxSizeMb = 4,
  name,
  rules,

  disabled = false,
  label,
  hideErrors = false,
  placeholder = ''
} = defineProps<{
  name: string
  label?: string
  inputClass?: string | string[];
  hideErrors?: boolean;
  disabled?: boolean;
  inputId?: string
  icon?: string
  accept?: AcceptProp
  maxFiles?: number
  maxSizeMb?: number
  rules?: RuleExpression<any>
  placeholder?: string;
}>()

const inputRef = useTemplateRef('inputRef')

const _rules = computed(() => rules)

const {value: filesListValue, errorMessage, setValue, meta, errors} = useField<File[]>(() => name, _rules, {
  initialValue: [],
  label
})

const acceptAttr = computed(() => Array.isArray(accept) ? accept.join(',') : accept)

function getFileSignature(f: File) {
  return `${f.name}-${f.size}-${f.lastModified}`
}


const allowedTypes = Array.isArray(accept) ? accept : accept.split(',')

const checkFiles = computed(() =>
    (filesListValue.value ?? []).map((file, index) => ({
      file,
      // 1) ne dépasse pas le max, 2) type autorisé, 3) taille OK
      accepted:
          index < maxFiles &&
          allowedTypes.includes(file.type) &&
          file.size <= maxSizeMb * 1024 * 1024,
    }))
)

function dedupeFiles(newFiles: File[]): File[] {
  const seen = new Set((filesListValue.value ?? []).map(getFileSignature))
  return newFiles.filter(f => !seen.has(getFileSignature(f)))
}

function onChange() {
  const input = inputRef.value!
  const validFiles = Array.from(input.files ?? [])
  const mergedFiles = dedupeFiles(validFiles)

  const remaining = maxFiles - (filesListValue.value?.length ?? 0)

  const toAdd = mergedFiles.slice(0, Math.max(0, remaining))
  const overflow = mergedFiles.slice(Math.max(0, remaining))

  setValue([...(filesListValue.value ?? []), ...toAdd, ...overflow])

  input.value = ''
}

function removeAt(i: number) {
  const copy = (filesListValue.value ?? []).slice()
  copy.splice(i, 1)
  setValue(copy)
}

function clearAll() {
  setValue([])
  if (inputRef.value) inputRef.value.value = ''
}

function openFileSelector() {
  inputRef.value?.click()
}
</script>

<template>
  <div>
    <div>
      <slot :id="inputId" :error="errorMessage"></slot>

      <div class="relative">
        <input
            ref="inputRef"
            type="file"
            class="hidden"
            multiple
            :id="inputId"
            :accept="acceptAttr"
            :disabled="disabled"
            @change="onChange"
        />

        <span>
          <i class="absolute top-1/2 right-6 -translate-y-1/2 -translate-x-1/2 icon icon-upload text-gold-400" />
        </span>

        <input
            class="w-full default-input"
            readonly
            :disabled="disabled"
            :class="[inputClass, errorMessage ? 'input-error': undefined]"
            :placeholder="placeholder"
            @click="openFileSelector"
            type="text">
        <i v-if="icon" class="icon absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" :class="icon" />
      </div>

      <transition name="fade">
          <span class="error-message" v-if="errorMessage && !hideErrors">
              {{ errorMessage }}
          </span>
      </transition>

      <div class="flex items-center gap-2 mt-2 flex-wrap justify-between text-xs">
        <div class="text-sm" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>

        <button
            v-if="(filesListValue?.length ?? 0) > 0"
            type="button"
            class="underline cursor-pointer hover:no-underline text-gold-400"
            @click="clearAll">
          Tout effacer
        </button>
      </div>
    </div>

    <ul v-if="(filesListValue?.length ?? 0) > 0" class="text-sm my-2">
      <li
          v-for="(f, i) in checkFiles"
          :key="f.file.name + f.file.lastModified + i"
          class=" py-2 px-4 flex items-center justify-between rounded-sm mt-1"
          :class="[!f.accepted ? 'bg-red-300' : 'bg-gold-400/60']">
        <div class="text-ellipsis">
          {{ f.file.name }} — {{ (f.file.size / 1024 / 1024).toFixed(2) }} MB
        </div>

        <button
            type="button"
            title="Retirer le fichier"
            class="text-white text-xs icon icon-cross cursor-pointer shrink-0"
            @click="removeAt(i)"
        ></button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
</style>