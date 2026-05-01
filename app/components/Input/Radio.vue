<script setup lang="ts">
import {useField} from "vee-validate";
import type {RuleExpression} from "vee-validate";

type RadioProps = {
  placeholder?: string
  inputClass?: string | string[]
  labelClass?: string | string[]
  hideErrors?: boolean

  name: string
  checkedValue: string | number
  label?: string
  rules?: RuleExpression<any>
  disabled?: boolean
  inputId?: string
}

const {
  name,
  disabled = false,
  label = '',
  rules: _rules,
  checkedValue,
} = defineProps<RadioProps>()

const {handleChange, value: fieldValue, errorMessage, checked} = useField(name, _rules, {
  label,
  type: "radio"
});

const isChecked = computed(() => fieldValue.value === checkedValue)
</script>

<template>
  <div>
    <label class="radio-chip inline-flex items-center gap-2 font-semibold" :class="[labelClass, {'radio-chip--checked' : isChecked}]" :for="inputId">
      <input
          class="flex-grow-0 flex-shrink-0 radiobutton"
          :class="[inputClass]"
          :value="checkedValue"
          :name="name"
          :checked="isChecked"
          @change="handleChange"
          :disabled="disabled"
          type="radio"
          :id="inputId"
      />

      <span class="inline-block select-none cursor-pointer">
        <slot :checked="isChecked" :error="errorMessage" :id="inputId"></slot>
      </span>

    </label>

    <transition name="fade">
      <span class="error-message" v-if="errorMessage && !hideErrors">
        {{ errorMessage }}
      </span>
    </transition>

  </div>
</template>