import type { User } from '@/types/user'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'cp-user',
  () => {
    // 1. 定义用户数据
    const user = ref<User>()
    // 2. 定义设置用户数据的方法
    const setUser = (u: User) => {
      user.value = u
    }
    // 3. 定义移除用户数据的方法
    const delUser = () => {
      user.value = undefined
    }
    // 4. 统一return 出去
    return { user, setUser, delUser }
  },
  {
    persist: true // 持久化
  }
)
