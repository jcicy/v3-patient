import router from '@/router'
import { useUserStore } from '@/stores'
import axios, { type Method } from 'axios'
import { showToast } from 'vant'

export const baseURL = 'https://consult-api.itheima.net'

const instance = axios.create({
  //  1. 基础地址，超时时间
  baseURL,
  timeout: 10000
})

instance.interceptors.request.use(
  (config) => {
    //  2. 携带token
    const userStore = useUserStore()
    if (userStore.user?.token) {
      config.headers.Authorization = `Bearer ${userStore.user.token}`
    }
    return config
  },
  (err) => Promise.reject(err)
)

instance.interceptors.response.use(
  (res) => {
    // 3. 处理业务失败
    // {  data: {}, headers: {}, config: {} }
    const { code, message } = res.data
    if (code !== 10000) {
      // 请求成功, 业务失败
      // 提示用户 + 返回错误的promise
      showToast(message || '业务处理失败!')
      return Promise.reject(res.data)
    }
    // 4. 摘取核心响应数据 - 数据剥离
    return res.data
  },
  (err) => {
    // 5. 处理401错误
    if (err.response.status === 401) {
      const userStore = useUserStore()
      // 1. 清除token
      userStore.delUser()
      // 2. 携带当前路径并跳转到登录页面
      router.push({
        path: '/login',
        query: {
          // 完整路径
          returnUrl: router.currentRoute.value.fullPath
        }
      })
    }
    return Promise.reject(err)
  }
)

// request方法实现

type Data<T> = {
  code: number
  message: string
  data: T
}

export const request = <T>(
  url: string,
  method: Method = 'GET',
  submitData?: object
) => {
  return instance.request<any, Data<T>>({
    url,
    method,
    // get -> params / post -> data
    [method.toLowerCase() === 'get' ? 'params' : 'data']: submitData
  })
}

export default instance
