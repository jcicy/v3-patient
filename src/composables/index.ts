import { OrderType } from '@/enums'
import {
  cancelOrder,
  deleteOrder,
  followOrUnFollow,
  getPrescriptionPic
} from '@/services/consult'
import { getMedicalOrderDetail } from '@/services/order'
import type { ConsultOrderItem, FollowType } from '@/types/consult'
import type { OrderDetail } from '@/types/order'
import {
  showFailToast,
  showImagePreview,
  showSuccessToast,
  showToast
} from 'vant'
import { onMounted, ref } from 'vue'

// 关注文章/医生逻辑
export const useFollow = (type: FollowType = 'doc') => {
  const loading = ref(false)
  // 关注
  const follow = async (item: { id: string; likeFlag: 0 | 1 }) => {
    loading.value = true
    try {
      await followOrUnFollow(item.id, type)
      item.likeFlag = item.likeFlag === 1 ? 0 : 1
    } finally {
      loading.value = false
    }
  }
  return { loading, follow }
}

// 处方预览
export const useShowPrescription = () => {
  const showPrescription = async (id?: string) => {
    if (!id) return showToast('处方id不存在!')
    const res = await getPrescriptionPic(id)
    showImagePreview([res.data.url])
  }
  return {
    showPrescription
  }
}

// 取消订单
export const useCancelConsultOrder = () => {
  const loading = ref(false)
  const cancelConsultOrder = async (item: ConsultOrderItem) => {
    try {
      // 加载效果
      loading.value = true
      // 发送请求
      await cancelOrder(item.id)
      // 提示用户 - 取消订单成功
      showSuccessToast('取消成功')
      // 修改订单的状态 + 状态文字
      item.status = OrderType.ConsultCancel
      item.statusValue = '已取消'
    } catch (error) {
      // 提示用户 - 取消失败
      showFailToast('取消失败')
    } finally {
      // 无论失败 or 成功 - 关闭加载效果
      loading.value = false
    }
  }
  return {
    loading,
    cancelConsultOrder
  }
}

// 删除订单
export const useDeleteConsultOrder = (cb: () => void) => {
  const deleteLoading = ref(false)
  const deleteConsultOrder = async (item: ConsultOrderItem) => {
    try {
      deleteLoading.value = true
      await deleteOrder(item.id)
      showSuccessToast('删除成功')
      cb && cb()
      // // 子传父 -> 通知父组件 -> 删除
      // emit('on-delete', item.id)
    } catch (error) {
      showFailToast('删除失败')
    } finally {
      deleteLoading.value = false
    }
  }
  return {
    deleteConsultOrder,
    deleteLoading
  }
}

// 药品订单详情
export const useGetMedicalDetail = (id: string) => {
  const order = ref<OrderDetail>()
  const loading = ref(false) // 扩展loading - 后续可以使用
  onMounted(async () => {
    loading.value = true
    const res = await getMedicalOrderDetail(id)
    order.value = res.data
    loading.value = false
  })
  return { order, loading }
}
