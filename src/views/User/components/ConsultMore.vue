<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{
  disabled: boolean
}>()
const showPopover = ref(false)
const actions = [
  // 查看处方 - 禁用 - 是否有处方id
  { text: '查看处方', disabled: props.disabled },
  { text: '删订单' }
]

const emit = defineEmits<{
  // 预览
  (e: 'on-preview'): void
  // 删除
  (e: 'on-delete'): void
}>()

const onSelect = (action: { text: string }, index: number) => {
  if (index === 0) emit('on-preview')
  if (index === 1) emit('on-delete')
}
</script>

<template>
  <van-popover
    v-model:show="showPopover"
    :actions="actions"
    placement="top-start"
    @select="onSelect"
  >
    <template #reference> 更多 </template>
  </van-popover>
</template>

<style lang="scss" scoped></style>
