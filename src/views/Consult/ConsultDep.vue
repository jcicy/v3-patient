<script setup lang="ts">
import type { TopDep } from '@/types/consult'
import { ref } from 'vue'
import { getAllDep } from '@/services/consult'
import { onMounted } from 'vue'
import { computed } from 'vue'
import { useConsultStore } from '@/stores'
const store = useConsultStore()
const active = ref(0)
const depList = ref<TopDep[]>([])
const loadList = async () => {
  const res = await getAllDep()
  depList.value = res.data
}

// 二级科室
const subDep = computed(() => depList.value[active.value]?.child)

onMounted(() => {
  loadList()
})
</script>

<template>
  <div class="consult-dep-page">
    <cp-nav-bar title="选择科室" />
    <div class="wrapper">
      <!-- 一级科室 -->
      <van-sidebar v-model="active">
        <van-sidebar-item
          v-for="item in depList"
          :key="item.id"
          :title="item.name"
        />
      </van-sidebar>
      <div class="sub-dep">
        <!-- 二级科室 -->
        <router-link
          v-for="item in subDep"
          :key="item.id"
          to="/consult/illness"
          @click="store.setDepId(item.id)"
          >{{ item.name }}</router-link
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.van-sidebar {
  width: 114px;
  &-item {
    padding: 14px;
    color: var(--cp-tag);
    &--select {
      color: var(--cp-main);
      font-weight: normal;
      &::before {
        display: none;
      }
    }
  }
}
.consult-dep-page {
  padding-top: 46px;
  .wrapper {
    height: calc(100vh - 46px);
    overflow: hidden;
    display: flex;
    .sub-dep {
      flex: 1;
      height: 100%;
      overflow-y: auto;
      > a {
        display: block;
        padding: 14px 30px;
        color: var(--cp-dark);
      }
    }
  }
}
</style>
