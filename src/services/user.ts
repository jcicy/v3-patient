import type { Patient, PatientList, User, UserInfo } from '@/types/user'
import { request } from '@/utils/request'

// 密码登录
export const loginByPassword = (mobile: string, password: string) =>
  request<User>('/login/password', 'POST', { mobile, password })

// 获取验证码
// login登录register注册changeMobile更换手机号forgetPassword找回密码, bindMobile绑定三方登录，区分验证码
type CodeType =
  | 'login'
  | 'register'
  | 'changeMobile'
  | 'forgetPassword'
  | 'bindMobile'
export const getMobileCode = (mobile: string, type: CodeType) =>
  request<{ code: string }>('/code', 'GET', {
    mobile,
    type
  })

// 短信验证码登录
export const loginByCode = (mobile: string, code: string) =>
  request<User>('/login', 'POST', {
    mobile,
    code
  })

// 获取用户信息 - 个人中心
export const getUserInfo = () => request<UserInfo>('/patient/myUser')

// 患者信息
export const getPatientList = () => request<PatientList>('/patient/mylist')

// 添加患者信息
export const addPatient = (patient: Patient) =>
  request('/patient/add', 'POST', patient)

// 编辑患者信息
export const editPatient = (patient: Patient) =>
  request('/patient/update', 'PUT', patient)

// 删除患者信息
export const delPatient = (id: string) =>
  request(`/patient/del/${id}`, 'DELETE')
