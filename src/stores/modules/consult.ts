import type { ConsultType } from '@/enums'
import type { IllnessConsult, ParticalConsult } from '@/types/consult'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConsultStore = defineStore(
  'cp-consult',
  () => {
    const consult = ref<ParticalConsult>({})
    // 记录问诊类型 - 问医生 / 极速问诊 / 开药问诊
    const setType = (type: ConsultType) => (consult.value.type = type)
    // 记录问诊级别
    const setIllnessType = (illnessType: 0 | 1) =>
      (consult.value.illnessType = illnessType)
    // 记录问诊科室
    const setDepId = (depId: string) => (consult.value.depId = depId)
    // 记录病情描述
    const setIllness = (illnessForm: IllnessConsult) => {
      consult.value.illnessDesc = illnessForm.illnessDesc
      consult.value.illnessTime = illnessForm.illnessTime
      consult.value.consultFlag = illnessForm.consultFlag
      consult.value.pictures = illnessForm.pictures
    }
    // 记录患者id
    const setPatient = (id: string) => (consult.value.patientId = id)
    // 记录优惠券id
    const setCouponId = (id: string) => (consult.value.couponId = id)
    // 清理问诊信息
    const clear = () => (consult.value = {})
    return {
      consult,
      setType,
      setIllnessType,
      setDepId,
      setIllness,
      setPatient,
      setCouponId,
      clear
    }
  },
  {
    persist: true // 开启本地持久化
  }
)
