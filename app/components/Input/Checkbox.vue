<script setup lang="ts">
import {useField} from "vee-validate";
import type {RuleExpression} from "vee-validate";

const props = defineProps<{
  placeholder?: string
  inputClass?: string | string[]
  labelClass?: string | string[]
  hideErrors?: boolean

  name: string
  checkedValue: string | boolean,
  uncheckedValue?: string | boolean
  label?: string
  rules?: RuleExpression<any>
  disabled?: boolean
}>()

const name = toRef(props, 'name');
const disabled = toRef(props, 'disabled');

const {handleChange, value, checked, errorMessage} = useField(name, props.rules, {
  checkedValue: props.checkedValue,
  uncheckedValue: props.uncheckedValue,
  label: props.label,
  type: "checkbox"
});
</script>

<template>
  <div class="pb-6">
    <label class="inline-flex gap-4" :class="labelClass">
      <input
          class="flex-grow-0 flex-shrink-0 checkbox"
          :class="[inputClass]"
          :value="checkedValue"
          :name="name"
          :checked="checked"
          @change="handleChange"
          :disabled="disabled"
          type="checkbox"
      />

      <span class="inline-block text-xs select-none cursor-pointer"><slot :checked="checked" :error="errorMessage"></slot></span>
    </label>

    <transition name="fade">
<span class="error-message" v-if="errorMessage && !props.hideErrors">
  {{ errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1) }}
</span>
    </transition>

  </div>
</template>