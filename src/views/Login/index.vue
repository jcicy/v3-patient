<script setup lang="ts">
import { ref } from 'vue'
import { mobileRules, passwordRules, codeRules } from '@/utils/rules'
import { loginByPassword, getMobileCode, loginByCode } from '@/services/user'
import { showSuccessToast, showToast, type FormInstance } from 'vant'
import { useUserStore } from '@/stores'
import { useRouter, useRoute } from 'vue-router'
import { onUnmounted } from 'vue'
const router = useRouter()
const route = useRoute()

// 是否是密码登录
const isPass = ref(true)
// 密码是否可见
const isShow = ref(false)

// 手机号/密码/验证码
const mobile = ref('')
const password = ref('')
const isAgree = ref(false)
const code = ref('')

// 表单实例
const form = ref<FormInstance | null>(null)
// 倒计时
const time = ref(0)
// 定时器ID
let timerId: number
// 发送验证码
const sendCode = async () => {
  // time > 0 处在倒计时过程中
  if (time.value > 0) return
  // 针对于手机号校验
  await form.value?.validate('mobile')
  await getMobileCode(mobile.value, 'login')
  showSuccessToast('获取验证码成功')
  // console.log(res.data.code)
  time.value = 60
  clearInterval(timerId)
  timerId = setInterval(() => {
    time.value--
    if (time.value <= 0) clearInterval(timerId)
  }, 1000)
}

// 组件销毁前 -清除定时器 - 提高代码性能
onUnmounted(() => {
  clearInterval(timerId)
})

// 表单提交
const onSubmit = async () => {
  // 1.判断是否勾选协议
  if (!isAgree.value) return showToast('请勾选用户协议')
  // 2.发送请求
  const res = isPass.value
    ? await loginByPassword(mobile.value, password.value)
    : await loginByCode(mobile.value, code.value)
  // 3.存储用户信息
  const userStore = useUserStore()
  userStore.setUser(res.data)
  // 4.提示用户
  showSuccessToast('登录成功')
  // http://www.xxxx/login?returnUrl=/xxxxx/
  // 5. 基于页面路径参数, 回调到指定的页面 or /user
  router.replace(
    // (router.currentRoute.value.query.returnUrl as string) || '/user'
    (route.query.returnUrl as string) || '/user'
  )
}
</script>

<template>
  <div class="login-page">
    <cp-nav-bar
      right-text="注册"
      @click-right="$router.push('/register')"
    ></cp-nav-bar>
    <!-- 头部 -->
    <div class="login-head">
      <h3>{{ isPass ? '密码登录' : '短信验证码登录' }}</h3>
      <a href="javascript:;" @click="isPass = !isPass">
        <span>{{ isPass ? '短信验证码登录' : '密码登录' }}</span>
        <van-icon name="arrow"></van-icon>
      </a>
    </div>
    <!-- 表单 -->
    <van-form ref="form" @submit="onSubmit" autocomplete="off">
      <van-field
        v-model="mobile"
        placeholder="请输入手机号"
        name="mobile"
        type="tel"
        :rules="mobileRules"
      ></van-field>
      <!-- 密码 -->
      <van-field
        v-if="isPass"
        v-model="password"
        placeholder="请输入密码"
        :rules="passwordRules"
        :type="isShow ? 'text' : 'password'"
      >
        <template #button>
          <!-- 
            vue2 
             .native 修饰符 根元素绑定事件
            vue3 
             .navtive移除 
           -->
          <cp-icon
            @click="isShow = !isShow"
            :name="`login-eye-${isShow ? 'on' : 'off'}`"
          ></cp-icon>
        </template>
      </van-field>
      <!-- 短信验证码 -->
      <van-field
        v-else
        v-model="code"
        placeholder="短信验证码"
        :rules="codeRules"
        type="text"
      >
        <template #button>
          <span
            @click="sendCode"
            :class="{ active: time > 0 }"
            class="btn-send"
          >
            {{ time > 0 ? `${time}s后再次发送` : '发送验证码' }}
          </span>
        </template>
      </van-field>
      <div class="cp-cell">
        <van-checkbox v-model="isAgree">
          <span>我已同意</span>
          <a href="javascript:;">用户协议</a>
          <span>及</span>
          <a href="javascript:;">隐私条款</a>
        </van-checkbox>
      </div>
      <div class="cp-cell">
        <van-button native-type="submit" block round type="primary"
          >登 录</van-button
        >
      </div>
      <div class="cp-cell">
        <a href="javascript:;">忘记密码？</a>
      </div>
    </van-form>
    <!-- 底部 -->
    <div class="login-other">
      <van-divider>第三方登录</van-divider>
      <div class="icon">
        <img src="@/assets/qq.svg" alt="" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  &-page {
    padding-top: 46px;
  }
  &-head {
    display: flex;
    padding: 30px 30px 50px;
    justify-content: space-between;
    align-items: flex-end;
    line-height: 1;
    h3 {
      font-weight: normal;
      font-size: 24px;
    }
    a {
      font-size: 15px;
    }
  }
  &-other {
    margin-top: 60px;
    padding: 0 30px;
    .icon {
      display: flex;
      justify-content: center;
      img {
        width: 36px;
        height: 36px;
        padding: 4px;
      }
    }
  }
}
.van-form {
  padding: 0 14px;
  .cp-cell {
    height: 52px;
    line-height: 24px;
    padding: 14px 16px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    .van-checkbox {
      a {
        color: var(--cp-primary);
        padding: 0 5px;
      }
    }
  }
  .btn-send {
    color: var(--cp-primary);
    &.active {
      color: rgba(22, 194, 163, 0.5);
    }
  }
}
</style>
