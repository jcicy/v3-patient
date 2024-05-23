import type { IllnessTime } from '@/enums'
import { flagOptions, timeOptions } from '@/services/constants'

// 患病时长
export const getIllnessTime = (time?: IllnessTime) =>
  timeOptions.find((item) => item.value === time)?.label

// 是否就诊
export const getConsultFlag = (flag?: 0 | 1) =>
  flagOptions.find((item) => item.value === flag)?.label
