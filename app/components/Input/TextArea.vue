<script setup lang="ts">
import {type RuleExpression, useField} from "vee-validate";

type TextProps = {
  name: string,
  label?: string,
  placeholder?: string,
  inputClass?: string | string[],
  theme?: 'input--black',
  hideErrors?: boolean,
  disabled?: boolean,
  inputId?: string,
  rules?: RuleExpression<any>,
  rows?: string,
  cols?: string,
}

const {
  label = '',
  placeholder = '',
  inputClass = '',
  hideErrors = false,
  disabled = false,
  name,
  rules: _rules,
  rows = '5',
  cols = '',
} = defineProps<TextProps>()

const rules = computed(() => _rules)

const {errorMessage, value: inputValue, handleBlur, handleChange} = useField(
    () => name,
    rules,
    {label}
);
</script>

<template>
  <div class="pb-6">
    <slot :id="inputId" :error="errorMessage"></slot>

    <div class="relative">
        <textarea
            :name="name"
            :disabled="disabled"
            class="w-full default-input"
            :class="[inputClass, theme, errorMessage ? 'input-error': undefined]"
            :value="inputValue"
            :placeholder="placeholder"
            :id="inputId"
            :rows="rows"
            :cols="cols"
            @input="handleChange"
            @blur="handleBlur"></textarea>
    </div>
    <transition name="fade">
              <span class="error-message" v-if="errorMessage && !hideErrors">
                {{ errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1) }}
              </span>
    </transition>
  </div>
</template>