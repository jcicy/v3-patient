<script setup lang="ts">
import { request } from '@/utils/request'
request(import.meta.env.VITE_CALL_BACK + '/patient/message/sys/list').then(
  (res) => {
    console.log(res)
  }
)
</script>

<template>
  <div class="article-page">article</div>
</template>

<style lang="scss" scoped></style>
