<script setup lang="ts">
// import { ref } from 'vue'
import DoctorCard from './DoctorCard.vue'
import type { DoctorList } from '@/types/consult'
import { useWindowSize } from '@vueuse/core'
import { getDoctorList } from '@/services/consult'
import { ref } from 'vue'
import { onMounted } from 'vue'

const { width } = useWindowSize()
const list = ref<DoctorList>([])
const loadList = async () => {
  const res = await getDoctorList({
    current: 1,
    pageSize: 5
  })
  console.log(res.data.rows)
  list.value = [
    {
      id: 'string',
      name: '王医生',
      avatar: 'string',
      hospitalName: 'string',
      gradeName: 'string',
      depName: 'string',
      positionalTitles: 'string',
      likeFlag: 0,
      serviceFee: 0,
      consultationNum: 0,
      score: 0,
      major: 'string'
    },
    {
      id: 'string',
      name: '张医生',
      avatar: 'string',
      hospitalName: 'string',
      gradeName: 'string',
      depName: 'string',
      positionalTitles: 'string',
      likeFlag: 0,
      serviceFee: 0,
      consultationNum: 0,
      score: 0,
      major: 'string'
    },
    {
      id: 'string',
      name: '李医生',
      avatar: 'string',
      hospitalName: 'string',
      gradeName: 'string',
      depName: 'string',
      positionalTitles: 'string',
      likeFlag: 0,
      serviceFee: 0,
      consultationNum: 0,
      score: 0,
      major: 'string'
    },
    {
      id: 'string',
      name: '赵医生',
      avatar: 'string',
      hospitalName: 'string',
      gradeName: 'string',
      depName: 'string',
      positionalTitles: 'string',
      likeFlag: 0,
      serviceFee: 0,
      consultationNum: 0,
      score: 0,
      major: 'string'
    },
    {
      id: 'string',
      name: '苏医生',
      avatar: 'string',
      hospitalName: 'string',
      gradeName: 'string',
      depName: 'string',
      positionalTitles: 'string',
      likeFlag: 0,
      serviceFee: 0,
      consultationNum: 0,
      score: 0,
      major: 'string'
    }
  ]
  list.value = res.data.rows
}
onMounted(() => {
  loadList()
})
</script>

<template>
  <div class="follow-doctor">
    <div className="head">
      <p>推荐关注</p>
      <a href="javascript:;"> 查看更多<i class="van-icon van-icon-arrow" /></a>
    </div>
    <div class="body">
      <!-- swipe 组件 -->
      <!-- 
        width 宽度 = 自定义  375屏幕上 - 150px
        loop 开启循环播放 - 不开启
        showIndicators  是否开启指示器 - 不开启
       -->
      <van-swipe
        :width="(150 / 375) * width"
        :loop="false"
        class="my-swipe"
        :showIndicators="false"
      >
        <van-swipe-item v-for="item in list" :key="item.id">
          <DoctorCard :item="item"></DoctorCard>
        </van-swipe-item>
      </van-swipe>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.follow-doctor {
  background-color: var(--cp-bg);
  height: 250px;
  .head {
    display: flex;
    justify-content: space-between;
    height: 45px;
    align-items: center;
    padding: 0 15px;
    font-size: 13px;
    > a {
      color: var(--cp-tip);
    }
  }
  .body {
    width: 100%;
    overflow: hidden;
  }
}
</style>
