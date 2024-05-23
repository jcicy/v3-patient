import './style/main.scss'
import 'vant/lib/index.css'
import { createApp } from 'vue'
import pinia from './stores'
import 'virtual:svg-icons-register'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(pinia)
app.use(router)

app.mount('#app')

// 测试获取环境变量
// console.log(import.meta.env)
