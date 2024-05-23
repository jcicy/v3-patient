<script setup lang="ts">
import type { EvaluateDoc } from '@/types/room'
import { showToast } from 'vant'
import { computed } from 'vue'
import { ref } from 'vue'
import { evaluateDoctor } from '@/services/consult'
import { inject } from 'vue'
import type { Ref } from 'vue'
import type { ConsultOrderItem } from '@/types/consult'

defineProps<{
  evaluateDoc?: EvaluateDoc
}>()
// 订单详情信息
const consult = inject<Ref<ConsultOrderItem>>('consult')
// 修改评价卡片方法
const evaluateCard = inject<(score: number) => void>('evaluateCard')

// 分数
const score = ref(0)
// 评价内容
const content = ref('')
// 是否匿名  匿名 /  true - 非匿名 / false
const anonymousFlag = ref(false)
// 按钮是否禁用
const disabled = computed(() => !content.value || !score.value)
// 提交评价
const submit = async () => {
  console.log(consult?.value)

  if (!score.value) return showToast('请填写评分')
  if (!content.value) return showToast('请填写内容')
  if (consult?.value.docInfo) {
    await evaluateDoctor({
      score: score.value,
      content: content.value,
      anonymousFlag: anonymousFlag.value === true ? 1 : 0,
      docId: consult?.value.docInfo?.id, // 医生信息
      orderId: consult.value.id //订单Id
    })
    evaluateCard && evaluateCard(score.value)
  }
}
</script>

<template>
  <!-- 已评价 -->
  <div class="evaluate-card" v-if="evaluateDoc">
    <p class="title">医生服务评价</p>
    <p class="desc">我们会更加努力提升服务质量</p>
    <van-rate
      :modelValue="score"
      size="7vw"
      gutter="3vw"
      color="#FADB14"
      void-icon="star"
      void-color="rgba(0,0,0,0.04)"
    />
  </div>
  <!-- 待评价 -->
  <div v-else class="evaluate-card">
    <p class="title">感谢您的评价</p>
    <p class="desc">本次在线问诊服务您还满意吗？</p>
    <van-rate
      v-model="score"
      size="7vw"
      gutter="3vw"
      color="#FADB14"
      void-icon="star"
      void-color="rgba(0,0,0,0.04)"
    />
    <van-field
      type="textarea"
      maxlength="150"
      show-word-limit
      rows="3"
      v-model="content"
      placeholder="请描述您对医生的评价或是在医生看诊过程中遇到的问题"
    ></van-field>
    <div class="footer">
      <van-checkbox v-model="anonymousFlag">匿名评价</van-checkbox>
      <van-button
        class="van-button"
        :class="{ disabled }"
        @click="submit"
        type="primary"
        size="small"
        round
      >
        提交评价
      </van-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.evaluate-card {
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  padding: 15px;
  .title {
    font-size: 15px;
    margin-bottom: 5px;
  }
  .desc {
    font-size: 12px;
    margin-bottom: 15px;
    color: var(--cp-tip);
  }
  .van-field {
    background-color: var(--cp-bg);
    margin: 15px 0;
    border-radius: 8px;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    :deep() {
      .van-checkbox {
        .van-icon {
          font-size: 12px;
        }
        &__label {
          font-size: 12px;
          color: var(--cp-tip);
        }
        height: 16px;
      }
      .van-button {
        padding: 0 16px;
        &.disabled {
          opacity: 1;
          background: #fafafa;
          color: #d9dbde;
          border: #fafafa;
        }
      }
    }
  }
}
</style>
