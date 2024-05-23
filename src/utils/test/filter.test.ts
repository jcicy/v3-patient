import { test, expect } from 'vitest'
import { getConsultFlag, getIllnessTime } from '../filter'
import { IllnessTime } from '@/enums'
// test() 执行函数 - 进行结果的输出
// expect 对结果的值做出判断

test('检测患病时长函数', () => {
  const illnessText = getIllnessTime(IllnessTime.HalfYear)
  expect(illnessText).toBe('半年内')
})

test('检测是否就诊函数', () => {
  const flagText = getConsultFlag(1)
  expect(flagText).toBe('就诊过')
})
