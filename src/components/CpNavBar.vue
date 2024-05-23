<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const emit = defineEmits<{
  (e: 'click-right'): void
}>()

const onClickLeft = () => {
  if (props.back) return props.back()
  if (history.state.back) {
    router.back()
  } else {
    router.push('/')
  }
}
const onClickRight = () => {
  emit('click-right')
}

const props = defineProps<{
  title?: string
  rightText?: string
  back?: () => void
}>()
</script>

<template>
  <van-nav-bar
    fixed
    :title="title"
    :right-text="rightText"
    left-arrow
    @click-left="onClickLeft"
    @click-right="onClickRight"
  />
</template>

<style lang="scss" scoped>
// 深度作用选择器
:deep() {
  .van-nav-bar {
    &__arrow {
      color: var(--cp-text1);
      font-size: 18px;
    }
    &__text {
      font-size: 15px;
    }
  }
}
</style>
