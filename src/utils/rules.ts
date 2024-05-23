import type { FieldRule } from 'vant'

// 手机号
const mobileRules: FieldRule[] = [
  { required: true, message: '手机号不能为空' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
]

// 密码
const passwordRules: FieldRule[] = [
  { required: true, message: '密码不能为空' },
  { pattern: /^\w{8,24}$/, message: '请输入正确的密码' }
]

// 验证码
const codeRules: FieldRule[] = [
  { required: true, message: '验证码不能为空' },
  { pattern: /^\d{6}$/, message: '请输入正确的验证码' }
]

// 姓名
const nameRules: FieldRule[] = [
  { required: true, message: '请输入姓名' },
  { pattern: /^(?:[\u4e00-\u9fa5·]{2,16})$/, message: '中文2-16个字符' }
]

// 身份证号
const idCardRules: FieldRule[] = [
  { required: true, message: '请输入身份证号' },
  {
    pattern:
      /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|10|11|12)(?:0[1-9]|[1-2]\d|30|31)\d{3}[\dXx]$/,
    message: '身份证号不正确'
  }
]

export { mobileRules, passwordRules, codeRules, nameRules, idCardRules }
