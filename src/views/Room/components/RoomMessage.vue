<script setup lang="ts">
import { MsgType, PrescriptionStatus } from '@/enums'
import type { Image } from '@/types/consult'
import type { Message, Prescription } from '@/types/room'
import { showImagePreview, showToast } from 'vant'
import { useUserStore } from '@/stores'
import EvaluateCard from './EvaluateCard.vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
// 处方预览
import { useShowPrescription } from '@/composables'
const { showPrescription } = useShowPrescription()
import { getIllnessTime, getConsultFlag } from '@/utils/filter'
const store = useUserStore()
const router = useRouter()

defineProps<{
  item: Message
}>()

// 时间转换
const formatTime = (time: string) => dayjs(time).format('HH:mm')

// 预览图片
const showPreview = (imgList?: Image[]) => {
  if (imgList && imgList.length) {
    showImagePreview(imgList.map((item) => item.url))
  } else {
    showToast('暂无图片')
  }
}

// 加载图片
const loadSuccess = (isscroll?: boolean) => {
  // 只有第一页的图片消息才会滚动到页面底部
  if (isscroll === false) return
  // 等到图片加载完成之后, 再执行scrollTo 方法即可 - 图片加载是异步的
  window.scrollTo(0, document.body.scrollHeight)
}

// 购买药品
const buy = (pre: Prescription) => {
  // 判断处方是否有效
  if (pre.status === PrescriptionStatus.Invalid) return showToast('处方已失效')
  // 未支付 && 无订单ID
  if (pre.status === PrescriptionStatus.NotPayment && !pre.orderId) {
    // 药品支付页面 - 生成订单, 完成支付
    return router.push(`/order/pay?id=${pre.id}`)
  }
  // 有订单ID ||  支付状态未知  ===> 跳转到药品订单详情 - 查看药品相关的信息
  router.push(`/order/${pre.orderId}`)
}
</script>

<template>
  <!-- 患者卡片 -->
  <div class="msg msg-illness" v-if="item.msgType === MsgType.CardPat">
    <div class="patient van-hairline--bottom">
      <p>
        {{ item.msg.consultRecord?.patientInfo.name }}
        {{ item.msg.consultRecord?.patientInfo.genderValue }}
        {{ item.msg.consultRecord?.patientInfo.age }}岁
      </p>
      <p>
        {{ getIllnessTime(item.msg.consultRecord?.illnessTime) }} |
        {{ getConsultFlag(item.msg.consultRecord?.consultFlag) }}
      </p>
    </div>
    <van-row>
      <van-col span="6">病情描述</van-col>
      <van-col span="18">{{ item.msg.consultRecord?.illnessDesc }}</van-col>
      <van-col span="6">图片</van-col>
      <van-col span="18" @click="showPreview(item.msg.consultRecord?.pictures)"
        >点击查看</van-col
      >
    </van-row>
  </div>
  <!-- 通知-通用 -->
  <div class="msg msg-tip" v-if="item.msgType === MsgType.Notify">
    <div class="content">
      <span>{{ item.msg.content }}</span>
    </div>
  </div>
  <!-- 通知-温馨提示 -->
  <div class="msg msg-tip" v-if="item.msgType === MsgType.NotifyTip">
    <div class="content">
      <span class="green">温馨提示：</span>
      <span>{{ item.msg.content }}</span>
    </div>
  </div>
  <!-- 通知-结束 -->
  <div
    class="msg msg-tip msg-tip-cancel"
    v-if="item.msgType === MsgType.NotifyCancel"
  >
    <div class="content">
      <span>{{ item.msg.content }}</span>
    </div>
  </div>
  <!-- 发送文字 -->
  <div
    class="msg msg-to"
    v-if="item.msgType === MsgType.MsgText && item.from === store.user?.id"
  >
    <div class="content">
      <div class="time">{{ formatTime(item.createTime) }}</div>
      <div class="pao">{{ item.msg.content }}</div>
    </div>
    <van-image :src="item.fromAvatar" />
  </div>
  <!-- 发送图片 -->
  <div
    class="msg msg-to"
    v-if="item.msgType === MsgType.MsgImage && item.from === store.user?.id"
  >
    <div class="content">
      <div class="time">{{ formatTime(item.createTime) }}</div>
      <!-- 图片消息 -->
      <van-image
        @load="loadSuccess(item.isscroll)"
        fit="contain"
        :src="item.msg.picture?.url"
      />
    </div>
    <!-- 头像 -->
    <van-image :src="item.fromAvatar" />
  </div>
  <!-- 接收文字 -->
  <div
    class="msg msg-from"
    v-if="item.msgType === MsgType.MsgText && item.from !== store.user?.id"
  >
    <van-image :src="item.fromAvatar" />
    <div class="content">
      <div class="time">{{ formatTime(item.createTime) }}</div>
      <div class="pao">{{ item.msg.content }}</div>
    </div>
  </div>
  <!-- 接收图片 -->
  <div
    class="msg msg-from"
    v-if="item.msgType === MsgType.MsgImage && item.from !== store.user?.id"
  >
    <!-- 头像 -->
    <van-image :src="item.fromAvatar" />
    <div class="content">
      <div class="time">{{ formatTime(item.createTime) }}</div>
      <!-- 图片消息 -->
      <van-image
        @load="loadSuccess(item.isscroll)"
        fit="contain"
        :src="item.msg.picture?.url"
      />
    </div>
  </div>
  <!-- 处方卡片 -->
  <div class="msg msg-recipe" v-if="item.msgType === MsgType.CardPre">
    <div class="content" v-if="item.msg.prescription">
      <div class="head van-hairline--bottom">
        <div class="head-tit">
          <h3>电子处方</h3>
          <p @click="showPrescription(item.msg.prescription.id)">
            原始处方 <van-icon name="arrow"></van-icon>
          </p>
        </div>
        <p>
          {{ item.msg.prescription.name }}
          {{ item.msg.prescription.genderValue }}
          {{ item.msg.prescription.age }}岁
          {{ item.msg.prescription.diagnosis }}
        </p>
        <p>开方时间：{{ item.msg.prescription.createTime }}</p>
      </div>
      <div class="body">
        <div
          class="body-item"
          v-for="med in item.msg.prescription.medicines"
          :key="med.id"
        >
          <div class="durg">
            <p>{{ med.name }} {{ med.specs }}</p>
            <p>{{ med.usageDosag }}</p>
          </div>
          <div class="num">x{{ med.quantity }}</div>
        </div>
      </div>
      <div class="foot" @click="buy(item.msg.prescription)">
        <span>购买药品</span>
      </div>
    </div>
  </div>
  <!-- 评价卡片 -->
  <div
    class="msg"
    v-if="
      item.msgType === MsgType.CardEva || item.msgType === MsgType.CardEvaForm
    "
  >
    <EvaluateCard :evaluateDoc="item.msg.evaluateDoc"></EvaluateCard>
  </div>
</template>

<style lang="scss" scoped>
@import '@/style/room.scss';
</style>
