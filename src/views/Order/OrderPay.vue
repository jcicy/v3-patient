<script setup lang="ts">
import { ref } from 'vue'
import type { OrderPre, AddressItem } from '@/types/order'
import {
  getMedicalOrderPre,
  getAddressList,
  createMedicalOrder
} from '@/services/order'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { showToast } from 'vant'
import OrderMedical from './components/OrderMedical.vue'
const route = useRoute()
// 预支付信息
const orderPre = ref<OrderPre>()
const loadOrderPre = async () => {
  const res = await getMedicalOrderPre({
    prescriptionId: route.query.id as string
  })
  orderPre.value = res.data
}

// 地址信息
const addressItem = ref<AddressItem>()
const loadAddress = async () => {
  const res = await getAddressList()
  // 1. 从数组中取出默认地址
  // 2. 如果没有默认地址 - 取出第一项
  const item = res.data.find((v) => v.isDefault === 1)
  if (item) {
    addressItem.value = item
  } else {
    addressItem.value = res.data[0]
  }
}

// 立即支付
// 订单id
const orderId = ref('')
const show = ref(false)
const loading = ref(false)
const agree = ref(false)
const onSubmit = async () => {
  if (!agree.value) return showToast('请勾选用户协议')
  if (!orderPre.value?.id) return showToast('处方id不存在')
  if (!addressItem.value) return showToast('地址信息不存在')
  // 生成订单id -> 直接打开抽屉 / 否则发送请求 获取订单id
  if (!orderId.value) {
    try {
      // loading效果展示
      loading.value = true
      const res = await createMedicalOrder({
        id: orderPre.value.id, // 处方id
        addressId: addressItem.value.id // 地址id
        // couponId: orderPre.value.couponId // 优惠券id
      })
      orderId.value = res.data.id // 订单id
      // 显示抽屉
      show.value = true
    } finally {
      loading.value = false
    }
  } else {
    show.value = true
  }
}
onMounted(() => {
  loadOrderPre()
  loadAddress()
})
</script>

<template>
  <div class="order-pay-page" v-if="addressItem && orderPre">
    <cp-nav-bar title="药品支付" />
    <div class="order-address">
      <p class="area">
        <van-icon name="location" />
        <span>{{
          addressItem.province + addressItem.city + addressItem.county
        }}</span>
      </p>
      <p class="detail">{{ addressItem.addressDetail }}</p>
      <p>{{ addressItem.receiver }} {{ addressItem.mobile }}</p>
    </div>
    <!-- 药品订单 -->
    <OrderMedical :medicines="orderPre.medicines"></OrderMedical>
    <div class="order-detail">
      <van-cell-group>
        <van-cell title="药品金额" :value="`￥${orderPre.payment}`" />
        <van-cell title="运费" :value="`￥${orderPre.expressFee}`" />
        <van-cell title="优惠券" :value="`-￥${orderPre.couponDeduction}`" />
        <van-cell
          title="实付款"
          :value="`￥${orderPre.actualPayment.toFixed(2)}`"
          class="price"
        />
      </van-cell-group>
    </div>
    <div class="order-tip">
      <p class="tip">
        由于药品的特殊性，如非错发、漏发药品的情况，药品一经发出
        不得退换，请核对药品信息无误后下单。
      </p>
      <van-checkbox v-model="agree"
        >我已同意<a href="javascript:;">支付协议</a></van-checkbox
      >
    </div>
    <van-submit-bar
      :price="orderPre.actualPayment * 100"
      button-text="立即支付"
      button-type="primary"
      @click="onSubmit"
      text-align="left"
      :loading="loading"
    ></van-submit-bar>
    <!-- 抽屉组件 -->
    <cp-pay-sheet
      pay-callback="/order/pay/result"
      v-model:show="show"
      :actual-payment="orderPre.actualPayment"
      :order-id="orderId"
    ></cp-pay-sheet>
  </div>
</template>

<style lang="scss" scoped>
:deep(.van-nav-bar) {
  background-color: var(--cp-primary);
  .van-nav-bar__arrow,
  .van-nav-bar__title {
    color: #fff;
  }
}
:deep(.van-cell) {
  .van-cell__title {
    font-size: 16px;
  }
  .van-cell__value {
    font-size: 16px;
  }
  &.price {
    .van-cell__value {
      font-size: 18px;
      color: var(--cp-price);
    }
  }
}
:deep(.van-submit-bar) {
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  .van-button {
    width: 200px;
  }
}
.order-pay-page {
  padding: 46px 0 65px;
}
.order-address {
  padding: 15px 15px 0 15px;
  background-color: #fff;
  font-size: 13px;
  .area {
    color: var(--cp-tag);
    margin-bottom: 5px;
    .van-icon-location {
      color: #ff7702;
      font-size: 14px;
    }
  }
  .detail {
    font-size: 17px;
    margin-bottom: 5px;
  }
  &::after {
    content: '';
    display: block;
    height: 12px;
    background-color: var(--cp-bg);
    margin: 0 -15px;
    margin-top: 15px;
  }
}

.order-tip {
  padding: 0 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
  .tip {
    font-size: 12px;
    color: var(--cp-tag);
    width: 100%;
    &::before {
      content: '*';
      color: var(--cp-price);
      font-size: 14px;
    }
    margin-bottom: 30px;
  }
  .van-checkbox {
    a {
      color: var(--cp-primary);
    }
  }
}
</style>
