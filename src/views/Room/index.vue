<script setup lang="ts">
import RoomStatus from './components/RoomStatus.vue'
import RoomAction from './components/RoomAction.vue'
import RoomMessage from './components/RoomMessage.vue'
import { io, type Socket } from 'socket.io-client'
import { onMounted } from 'vue'
import { onUnmounted } from 'vue'
import { baseURL } from '@/utils/request'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import type { Message, TimeMessages } from '@/types/room'
import { MsgType, OrderType } from '@/enums'
import type { ConsultOrderItem, Image } from '@/types/consult'
import { getConsultOrderDetail } from '@/services/consult'
import { nextTick } from 'vue'
import { showToast } from 'vant'
import { provide } from 'vue'
const route = useRoute()
const store = useUserStore()
// 跨层级传递数据 - provide && inject

let socket: Socket

// 订单详情
const consult = ref<ConsultOrderItem>()
// 将订单详情信息传递给后代组件
provide('consult', consult)

// 将修改评分卡片方法传递给后代组件
const evaluateCard = (score: number) => {
  // 1. 找到数组中评价卡片的对象信息
  const item = list.value.find((v) => v.msgType === MsgType.CardEvaForm)
  // 2. 修改评价卡片消息类型 - 未评价 -> 已评价
  if (!item) return
  item.msgType = MsgType.CardEva
  // 3. 填充评分
  item.msg.evaluateDoc = { score }
}
provide('evaluateCard', evaluateCard)

const getConsultOrder = async () => {
  const res = await getConsultOrderDetail(route.query.orderId as string)
  console.log('订单详情---', res.data)
  consult.value = res.data
}

// 消息列表
const list = ref<Message[]>([])
// 默认是首次加载 - true
const initialMsg = ref(true)
// 下拉加载 - loading效果
const loading = ref(false)
// 记录消息时间
const time = ref('')
const onRefresh = () => {
  //向socket服务端发送数据 参数：pageSize: number, lastTime: string, orderId: string
  socket.emit('getChatMsgList', 20, time.value, route.query.orderId)
}
onMounted(() => {
  socket = io(baseURL, {
    auth: {
      // 身份认证
      token: `Bearer ${store.user?.token}`
    },
    query: {
      orderId: route.query.orderId
    }
  })
  // 获取订单详情
  getConsultOrder()
  // 监听连接成功
  socket.on('connect', () => {
    // console.log('连接建立...')
  })
  // 监听连接失败
  socket.on('disconnect', () => {
    // console.log('连接断开...')
  })
  // 监听连接异常
  socket.on('error', () => {
    // console.log('连接异常...')
  })
  // 默认消息获取
  socket.on('chatMsgList', async ({ data }: { data: TimeMessages[] }) => {
    const arr: Message[] = []
    // 遍历 - 列表转换 - list
    data.forEach((item, index) => {
      console.log('消息数据', item)
      // 记录消息时间
      if (index === 0) time.value = item.createTime
      // 新增/创建的时间消息
      arr.push({
        id: item.createTime,
        msgType: MsgType.Notify, // 通用通知
        createTime: item.createTime,
        msg: {
          content: item.createTime
        }
      })
      // isscroll 是否可以滚动  true - 可以滚动 / false - 不可以滚动
      // 第一页(首次加载) - 可以滚动 initialMsg
      // initialMsg - 首次加载的20条数据 - true  / 历史记录 - false
      item.items.forEach((v) => (v.isscroll = initialMsg.value === true))
      // 系统消息
      arr.push(...item.items)
    })
    console.log('arr数据 - 聊天消息', arr)
    // loading效果取消
    loading.value = false
    // 判断是否有消息
    if (!arr.length) return showToast('暂无更多消息了')
    // 往列表开头添加聊天数据
    list.value.unshift(...arr)
    // 首次加载处理 - 只会执行一次
    if (initialMsg.value) {
      await nextTick()
      // 读取消息 - 传入最后一条消息的id - 之前的消息全部变成已读
      socket.emit('updateMsgStatus', arr[arr.length - 1].id)
      window.scrollTo(0, document.body.scrollHeight)
      initialMsg.value = false
    }
  })
  // 监听订单状态变化
  socket.on('statusChange', () => {
    getConsultOrder()
  })
  // 接收消息
  socket.on('receiveChatMsg', async (ev) => {
    // 读取消息 - 当前消息的id
    socket.emit('updateMsgStatus', ev.id)
    // 追加一条聊天消息
    list.value.push(ev)
    // dom更新的过程异步的 nextTick
    await nextTick()
    window.scrollTo(0, document.body.scrollHeight)
    // nextTick(() => {
    //   // 等到dom更新结束之后, 再来完成页面的滚动
    //   // 滚动页面
    //   window.scrollTo(0, document.body.scrollHeight)
    // })
  })
})

onUnmounted(() => {
  // 断开连接
  socket.close()
})

// 发送文字
const sendText = (text: string) => {
  socket.emit('sendChatMsg', {
    from: store.user?.id, // 发送人的id - self
    to: consult.value?.docInfo?.id, // 医生的id
    msgType: MsgType.MsgText, // 消息类型 - 文字聊天
    msg: {
      content: text // 文字消息
    }
  })
}
// 发送图片
const sendImage = (image: Image) => {
  socket.emit('sendChatMsg', {
    from: store.user?.id, // 发送人的id - self
    to: consult.value?.docInfo?.id, // 医生的id
    msgType: MsgType.MsgImage, // 消息类型 - 图片聊天
    msg: {
      picture: image // 图片消息
    }
  })
}
</script>

<template>
  <div class="room-page">
    <cp-nav-bar title="问诊室" />
    <!-- 状态栏 -->
    <room-status
      :status="consult?.status"
      :countdown="consult?.countdown"
    ></room-status>
    <!-- 消息组件 -->
    <van-pull-refresh v-model="loading" @refresh="onRefresh">
      <room-message
        v-for="item in list"
        :key="item.id"
        :item="item"
      ></room-message>
    </van-pull-refresh>
    <!-- 操作栏 -->
    <room-action
      @send-image="sendImage"
      @send-text="sendText"
      :disabled="consult?.status !== OrderType.ConsultChat"
    ></room-action>
  </div>
</template>

<style lang="scss" scoped>
.room-page {
  padding-top: 90px;
  padding-bottom: 60px;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--cp-bg);
  .van-pull-refresh {
    width: 100%;
    min-height: calc(100vh - 150px);
  }
}
</style>
