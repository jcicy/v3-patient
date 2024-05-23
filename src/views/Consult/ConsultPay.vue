<script setup lang="ts">
import {
  getConsultOrderPre,
  getPatientInfo,
  getConsultOrderId
} from '@/services/consult'
import type { ConsultOrderPreData, ParticalConsult } from '@/types/consult'
import { useConsultStore } from '@/stores'
import { ref } from 'vue'
import { onMounted } from 'vue'
import type { Patient } from '@/types/user'
import { useRouter } from 'vue-router'
const router = useRouter()
import { showConfirmDialog, showDialog, showToast } from 'vant'
import { onBeforeRouteLeave } from 'vue-router'
const store = useConsultStore()

// 预支付信息
// 1. 定义预支付变量
const payInfo = ref<ConsultOrderPreData>()
const getPayInfo = async () => {
  const res = await getConsultOrderPre({
    type: store.consult.type, // 问诊类型
    illnessType: store.consult.illnessType // 三甲 / 普通
  })
  payInfo.value = res.data
  // 设置优惠券id
  store.setCouponId(payInfo.value.couponId)
}

// 患者详情
const patientInfo = ref<Patient>()
const getPatient = async () => {
  // 三种方案
  // 1. 类型断言
  // 2. 非空断言
  // 3. 逻辑判断
  // const res = await getPatientInfo(store.consult.patientId as string)
  // const res = await getPatientInfo(store.consult.patientId!)
  if (!store.consult.patientId) return
  const res = await getPatientInfo(store.consult.patientId)
  patientInfo.value = res.data
}

// 支付协议
const agree = ref(false)
// 控制抽屉显示
const show = ref(false)
// 订单ID
const orderId = ref('')
// loading效果
const loading = ref(false)
// 立即支付 - 获取订单ID
const submit = async () => {
  if (!agree.value) return showToast('请勾选支付协议')
  loading.value = true
  const res = await getConsultOrderId(store.consult)
  // 记录订单id
  orderId.value = res.data.id
  // 清理问诊信息
  // store.clear()
  // 取消loading效果
  loading.value = false
  // 抽屉显示
  show.value = true
}

// keyof ParticalConsult  从ParticalConsult对象中取出, 得到了一个联合类型
type ConsultKey = keyof ParticalConsult

onMounted(() => {
  const validkeys: ConsultKey[] = [
    'type',
    'illnessType',
    'depId',
    'illnessDesc',
    'illnessTime',
    'consultFlag',
    'patientId'
  ]
  const valid = validkeys.every((item) => store.consult[item] !== undefined)
  if (!valid) {
    return showDialog({
      title: '温馨提示',
      message: '支付信息不完整请重新填写, 如果未支付可以去记录中继续支付'
    }).then(() => {
      // 点击确认, 回到首页 - 不挽留,. 订单id 刷新后会丢失
      router.push('/')
    })
  }

  // if (
  //   !store.consult.type ||
  //   !store.consult.illnessDesc ||
  //   !store.consult.patientId
  // ) {
  //   return false
  // }

  // 预支付信息
  getPayInfo()
  // 患者详情
  getPatient()
})

// 阻止返回上页  - 针对有订单id的情况下
onBeforeRouteLeave(() => {
  // 在当前页面路由离开之前
  if (orderId.value) return false
})

// 挽留用户 - 监测抽屉组件关闭之前
const onBeforeClose = () => {
  showConfirmDialog({
    title: '关闭支付',
    message: '取消支付将无法获得医生回复, 医生接诊名额有限, 是否确认关闭',
    cancelButtonText: '仍要关闭',
    confirmButtonText: '继续支付'
  })
    .then(() => {
      // 继续支付
      return false
    })
    .catch(() => {
      // 仍要关闭
      // 1. 清空订单id
      orderId.value = ''
      // 2. 跳转到问诊页面
      router.push('/user/consult')
    })
}
</script>

<template>
  <div class="consult-pay-page" v-if="payInfo && patientInfo">
    <cp-nav-bar title="支付" />
    <div class="pay-info">
      <p class="tit">图文问诊 {{ payInfo.payment }} 元</p>
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <p class="desc">
        <span>极速问诊</span>
        <span>自动分配医生</span>
      </p>
    </div>
    <van-cell-group>
      <van-cell
        title="优惠券"
        :value="`-¥${payInfo.couponDeduction.toFixed(2)}`"
      />
      <van-cell
        title="积分抵扣"
        :value="`-¥${payInfo.pointDeduction.toFixed(2)}`"
      />
      <van-cell
        title="实付款"
        :value="`¥${payInfo.actualPayment.toFixed(2)}`"
        class="pay-price"
      />
    </van-cell-group>
    <div class="pay-space"></div>
    <van-cell-group>
      <van-cell
        title="患者信息"
        :value="`${patientInfo.name} | ${patientInfo.genderValue} | ${patientInfo.age}岁`"
      ></van-cell>
      <van-cell title="病情描述" :label="store.consult.illnessDesc"></van-cell>
    </van-cell-group>
    <div class="pay-schema">
      <van-checkbox v-model="agree"
        >我已同意 <span class="text">支付协议</span></van-checkbox
      >
    </div>
    <!-- 底部操作栏 -->
    <van-submit-bar
      button-type="primary"
      :price="payInfo.actualPayment * 100"
      button-text="立即支付"
      text-align="left"
      :loading="loading"
      @click="submit"
    />
    <!-- 底部支付抽屉 -->
    <cp-pay-sheet
      pay-callback="/room"
      :order-id="orderId"
      :actual-payment="payInfo.actualPayment"
      :on-before-close="onBeforeClose"
      v-model:show="show"
    ></cp-pay-sheet>
  </div>
  <div class="consult-pay-page" v-else>
    <cp-nav-bar title="支付" />
    <!-- 骨架屏 -->
    <van-skeleton title :row="10" style="margin-top: 20px" />
  </div>
</template>

<style lang="scss" scoped>
.consult-pay-page {
  padding: 46px 0 50px 0;
}
.pay-info {
  display: flex;
  padding: 15px;
  flex-wrap: wrap;
  align-items: center;
  .tit {
    width: 100%;
    font-size: 16px;
    margin-bottom: 10px;
  }
  .img {
    margin-right: 10px;
    width: 38px;
    height: 38px;
    border-radius: 4px;
    overflow: hidden;
  }
  .desc {
    flex: 1;
    > span {
      display: block;
      color: var(--cp-tag);
      &:first-child {
        font-size: 16px;
        color: var(--cp-text2);
      }
    }
  }
}
.pay-price {
  ::v-deep() {
    .vam-cell__title {
      font-size: 16px;
    }
    .van-cell__value {
      font-size: 16px;
      color: var(--cp-price);
    }
  }
}
.pay-space {
  height: 12px;
  background-color: var(--cp-bg);
}
.pay-schema {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  .text {
    color: var(--cp-primary);
  }
}
::v-deep() {
  .van-submit-bar__button {
    font-weight: normal;
    width: 160px;
  }
}
</style>
