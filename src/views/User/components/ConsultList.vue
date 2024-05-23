<script setup lang="ts">
import type { ConsultType } from '@/enums'
import ConsultItem from './ConsultItem.vue'
import { getConsultOrderList } from '@/services/consult'
import { ref } from 'vue'
import type { ConsultOrderListParams, ConsultOrderItem } from '@/types/consult'
const props = defineProps<{
  type: ConsultType
}>()
const params = ref<ConsultOrderListParams>({
  current: 1,
  pageSize: 5,
  type: props.type
})
const list = ref<ConsultOrderItem[]>([])
const loading = ref(false)
const finished = ref(false)
const onLoad = async () => {
  const res = await getConsultOrderList(params.value)
  list.value.push(...res.data.rows)
  if (params.value.current >= res.data.pageTotal) {
    finished.value = true
  } else {
    params.value.current++
  }
  loading.value = false
}

// 订单删除
const onDelete = (id: string) => {
  list.value = list.value.filter((item) => item.id !== id)
  if (!list.value.length) {
    // 边界处理 - 列表无数据了, 重新渲染一下
    onLoad()
  }
}
</script>

<template>
  <div class="consult-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <consult-item
        @on-delete="onDelete"
        v-for="item in list"
        :item="item"
        :key="item.id"
      />
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.consult-list {
  padding: 10px 15px;
}
</style>
