<script setup lang="ts">
import { ref } from 'vue'
import KnowledgeCard from './KnowledgeCard.vue'
import type {
  KnowledgeType,
  KnowledgeList,
  KnowledgeParams
} from '@/types/consult'
import { getKnowledgeList } from '@/services/consult'
const props = defineProps<{
  type: KnowledgeType
}>()
// 列表
const list = ref<KnowledgeList>([])
// 查询参数
const params = ref<KnowledgeParams>({
  type: props.type,
  current: 1,
  pageSize: 10
})
// 加载状态
const loading = ref(false)
// 是否加载完成
const finished = ref(false)
const onLoad = async () => {
  const res = await getKnowledgeList(params.value)
  list.value.push(...res.data.rows)
  if (params.value.current >= res.data.pageTotal) {
    finished.value = true // // 结束加载
  } else {
    params.value.current++
  }
  loading.value = false
}
</script>

<template>
  <div class="knowledge-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      @load="onLoad"
      finished-text="没有更多了!!!"
    >
      <knowledge-card
        v-for="item in list"
        :key="item.id"
        :item="item"
      ></knowledge-card>
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.knowledge-list {
  padding: 0 15px;
}
</style>
