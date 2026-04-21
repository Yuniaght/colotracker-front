<script setup lang="ts">
import {type RuleExpression, useField} from "vee-validate";

type TextProps = {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  inputClass?: string | string[];
  hideErrors?: boolean;
  disabled?: boolean;
  inputId?: string
  submit_button?: boolean;
  icon?: string
  rules?: RuleExpression<any>
}

const {name, disabled = false, label = '', type = 'text', hideErrors = false, placeholder = '', rules: _rules} = defineProps<TextProps>()

const rules = computed(() => _rules)

const {errorMessage, value: inputValue, handleBlur, handleChange} = useField(
    name,
    rules,
    {label}
);
</script>

<template>
  <div class="pb-6">
    <slot :id="inputId" :error="errorMessage"></slot>

    <div class="relative">
      <input
          :name="name"
          :disabled="disabled"
          class="w-full default-input"
          :class="[inputClass, errorMessage ? 'input-error': undefined]"
          :type="type"
          :value="inputValue"
          :placeholder="placeholder"
          :id="inputId"
          @input="handleChange"
          @blur="handleBlur">
      <i v-if="icon" class="icon absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" :class="icon"></i>
    </div>

    <transition name="fade">
            <span class="error-message" v-if="errorMessage && !hideErrors">
                {{ errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1) }}
            </span>
    </transition>
  </div>
</template>
