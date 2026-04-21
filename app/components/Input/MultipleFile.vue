<script setup lang="ts">
import type {RuleExpression} from "vee-validate";
import { useDropZone } from '@vueuse/core'

const dropZoneRef = ref<HTMLDivElement>()

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

} = defineProps<{
  name: string
  label?: string
  inputClass?: string | string[];
  hideErrors?: boolean;
  disabled?: boolean;
  inputId?: string
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
  handleFiles(validFiles)
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

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: (files: File[] | null) => {
    if (!files || disabled) return
    handleFiles(files)
  },
})

function handleFiles(newFiles: File[]) {
  const mergedFiles = dedupeFiles(newFiles)
  const remaining = maxFiles - (filesListValue.value?.length ?? 0)
  
  const toAdd = mergedFiles.slice(0, Math.max(0, remaining))
  const overflow = mergedFiles.slice(Math.max(0, remaining))

  setValue([...(filesListValue.value ?? []), ...toAdd, ...overflow])
}

</script>

<template>
  <div class="pb-6">
    <slot :id="inputId" :error="errorMessage"></slot>

    <div 
      ref="dropZoneRef"
      @click="openFileSelector"
      :class="[
        'relative w-full h-48 border-2 border-dashed rounded-[20px] transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center',
        !isOverDropZone ? 'border-emerald-blue bg-dim-white' : 'border-dark-navy bg-light-green shadow-inner scale-[1.01]',
        errorMessage ? 'border-rose-red bg-rose-red/5' : ''
      ]"
    >
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

      <div class="mb-4 text-emerald-blue text-4xl">
        <i class="icon icon-upload" />
      </div>

      <p class="text-dark-navy font-bold text-lg leading-tight">
        Cliquez pour ajouter une image 
        <span class="font-normal opacity-70">ou glissez-déposez</span>
      </p>

      <div class="mt-2 text-emerald-blue/80 text-sm font-medium">
        <slot name="footer" v-if="$slots.footer"></slot>
        <p v-else>
          {{ Array.isArray(accept) ? accept.join(', ').replace(/image\//g, '').toUpperCase() : accept.replace(/image\//g, '').toUpperCase() }} 
          (Max. {{ maxSizeMb }}MB)
        </p>
      </div>

      <div v-if="filesListValue?.length" class="absolute top-4 right-4">
         <span class="bg-skin-orange text-dark-navy text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-wider">
           {{ filesListValue.length }} sélectionné(s)
         </span>
      </div>
    </div>

    <transition name="fade">
      <span class="text-rose-red text-xs mt-2 font-semibold block" v-if="errorMessage && !hideErrors">
        {{ errorMessage }}
      </span>
    </transition>

    <ul v-if="filesListValue?.length" class="text-sm my-3 space-y-2">
      <li
        v-for="(f, i) in checkFiles"
        :key="f.file.name + f.file.lastModified + i"
        class="py-3 px-4 flex items-center justify-between rounded-xl border transition-all shadow-sm"
        :class="[
          !f.accepted 
            ? 'border-rose-red bg-rose-red/5' 
            : 'border-emerald-blue/20 bg-pure-white hover:border-emerald-blue/40'
        ]"
      >
        <div class="flex flex-col truncate pr-4">
          <span class="font-bold text-dark-navy truncate">{{ f.file.name }}</span>
          <span class="text-[10px] text-emerald-blue font-medium">{{ (f.file.size / 1024 / 1024).toFixed(2) }} MB</span>
        </div>

        <button
          type="button"
          class="text-dark-navy/40 hover:text-rose-red transition-colors p-2 hover:bg-rose-red/10 rounded-full"
          @click.stop="removeAt(i)"
        >
          <span class="icon icon-cross text-xs">✕</span>
        </button>
      </li>
      
      <li class="pt-1 flex justify-end">
        <button 
          type="button" 
          class="text-[10px] font-black uppercase tracking-widest text-rose-red/60 hover:text-rose-red transition-colors cursor-pointer" 
          @click.stop="clearAll"
        >
          Tout effacer
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>