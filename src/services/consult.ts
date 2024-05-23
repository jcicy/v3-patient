import type {
  ConsultOrderItem,
  ConsultOrderListParams,
  ConsultOrderPage,
  ConsultOrderPreData,
  ConsultOrderPreParams,
  DoctorPage,
  FollowType,
  Image,
  KnowledgePage,
  KnowledgeParams,
  PageParams,
  ParticalConsult,
  TopDep
} from '@/types/consult'
import type { Patient } from '@/types/user'
import { request } from '@/utils/request'

// 首页获取文章列表
export const getKnowledgeList = (params: KnowledgeParams) =>
  request<KnowledgePage>('/patient/home/knowledge', 'GET', params)

// 关注医生列表

export const getDoctorList = (params: PageParams) =>
  request<DoctorPage>('/home/page/doc', 'GET', params)

// 关注/取消关注医生
// export const followOrUnFollow = (data: { id: string, type: FollowType = 'doc' }) =>
export const followOrUnFollow = (id: string, type: FollowType = 'doc') =>
  request('/like', 'POST', { id, type })

// 获取科室
export const getAllDep = () => request<TopDep[]>('/dep/all')

// 上传图片
export const uploadImage = (file: File) => {
  const data = new FormData()
  data.append('file', file)
  return request<Image>('/upload', 'POST', data)
}

// 预支付信息
export const getConsultOrderPre = (params: ConsultOrderPreParams) =>
  request<ConsultOrderPreData>('/patient/consult/order/pre', 'GET', params)

// 患者详情
export const getPatientInfo = (id: string) =>
  request<Patient>(`/patient/info/${id}`)

// 获取订单id
export const getConsultOrderId = (data: ParticalConsult) =>
  request<{ id: string }>('/patient/consult/order', 'POST', data)

// 完成支付
export const createOrderPay = (data: {
  paymentMethod: 0 | 1 | 2
  orderId: string
  payCallback: string
}) => request<{ payUrl: string }>('/patient/consult/pay', 'POST', data)

// 订单详情
export const getConsultOrderDetail = (orderId: string) =>
  request<ConsultOrderItem>('/patient/consult/order/detail', 'GET', {
    orderId
  })

// 未读消息
export const getUnreadCount = () =>
  request<number>('/patient/message/unRead/all')

// 查看处方
export const getPrescriptionPic = (id: string) =>
  request<{ url: string }>(`/patient/consult/prescription/${id}`)

// 评价医生
export const evaluateDoctor = (data: {
  docId: string
  orderId: string
  score: number
  content: string
  anonymousFlag: 0 | 1 // 1 匿名 / 0 非匿名
}) => request('/patient/order/evaluate', 'POST', data)

// 问诊记录
export const getConsultOrderList = (params: ConsultOrderListParams) =>
  request<ConsultOrderPage>('/patient/consult/order/list', 'GET', params)

// 取消订单
export const cancelOrder = (id: string) =>
  request(`/patient/order/cancel/${id}`, 'PUT')

// 删除订单
export const deleteOrder = (id: string) =>
  request(`/patient/order/${id}`, 'DELETE')
