<script setup lang="ts">
import { getUnreadCount } from '@/services/consult'
import { onMounted } from 'vue'
import { ref } from 'vue'

const count = ref(0)
const getCount = async () => {
  const res = await getUnreadCount()
  count.value = res.data
  console.log(res.data)
}
onMounted(() => getCount())
</script>

<template>
  <div class="layout-page">
    <router-view></router-view>
    <van-tabbar route>
      <van-tabbar-item to="/home"
        >首页
        <template #icon="{ active }">
          <cp-icon
            :name="`home-index-${active ? 'active' : 'default'}`"
          ></cp-icon>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/article"
        >健康百科
        <template #icon="{ active }">
          <cp-icon
            :name="`home-article-${active ? 'active' : 'default'}`"
          ></cp-icon>
        </template>
      </van-tabbar-item>
      <van-tabbar-item :badge="count || ''" to="/notify"
        >消息中心
        <template #icon="{ active }">
          <cp-icon
            :name="`home-notice-${active ? 'active' : 'default'}`"
          ></cp-icon>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/user"
        >我的
        <template #icon="{ active }">
          <cp-icon
            :name="`home-mine-${active ? 'active' : 'default'}`"
          ></cp-icon>
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style lang="scss" scoped></style>
