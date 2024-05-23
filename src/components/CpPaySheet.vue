<script setup lang="ts">
import { createOrderPay } from '@/services/consult'
import { showLoadingToast, showToast } from 'vant'
import { ref } from 'vue'

const props = defineProps<{
  show: boolean // 控制抽屉显示
  onBeforeClose?: () => void // 关闭抽屉前 - 处理函数 (可选)
  actualPayment: number // 实付款
  orderId: string // 订单id
  payCallback: string // 回跳地址
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()
const paymentMethod = ref<0 | 1>()

// 完成支付
const pay = async () => {
  if (paymentMethod.value === undefined) return showToast('请选择支付方式')
  if (paymentMethod.value === 0) return showToast('暂不支持微信支持')
  showLoadingToast({
    message: '跳转支付',
    duration: 0
  })
  const res = await createOrderPay({
    orderId: props.orderId, // 订单id
    paymentMethod: paymentMethod.value, // 支付方式
    payCallback: import.meta.env.VITE_CALL_BACK + props.payCallback // 回调地址 - 聊天室
  })
  location.href = res.data.payUrl // 支付宝的加密地址
}
</script>

<template>
  <van-action-sheet
    :close-on-popstate="false"
    :show="show"
    @update:show="emit('update:show', $event)"
    title="选择支付方式"
    :closeable="false"
    :before-close="onBeforeClose"
  >
    <div class="pay-type">
      <p class="amount">￥{{ actualPayment.toFixed(2) }}</p>
      <van-cell-group>
        <van-cell title="微信支付" @click="paymentMethod = 0">
          <template #icon><cp-icon name="consult-wechat" /></template>
          <template #extra
            ><van-checkbox :checked="paymentMethod === 0"
          /></template>
        </van-cell>
        <van-cell title="支付宝支付" @click="paymentMethod = 1">
          <template #icon><cp-icon name="consult-alipay" /></template>
          <template #extra
            ><van-checkbox :checked="paymentMethod === 1"
          /></template>
        </van-cell>
      </van-cell-group>
      <div class="btn">
        <van-button @click="pay" type="primary" round block
          >立即支付</van-button
        >
      </div>
    </div>
  </van-action-sheet>
</template>

<style lang="scss" scoped>
.pay-type {
  .amount {
    padding: 20px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }
  .btn {
    padding: 15px;
  }
  .van-cell {
    align-items: center;
    .cp-icon {
      margin-right: 10px;
      font-size: 18px;
    }
    .van-checkbox :deep(.van-checkbox__icon) {
      font-size: 16px;
    }
  }
}
</style>
