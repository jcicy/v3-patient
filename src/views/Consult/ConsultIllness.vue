<script setup lang="ts">
import { ref } from 'vue'
import type { IllnessConsult } from '@/types/consult'
import { uploadImage } from '@/services/consult'
import type {
  UploaderAfterRead,
  UploaderFileListItem
} from 'vant/lib/uploader/types'
import { computed } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { useRouter } from 'vue-router'
import { useConsultStore } from '@/stores'
import { onMounted } from 'vue'
const store = useConsultStore()
const router = useRouter()

import { timeOptions, flagOptions } from '@/services/constants'

// 表单数据
const illnessForm = ref<IllnessConsult>({
  illnessDesc: '', // 病情描述
  illnessTime: undefined, // 患病时长
  consultFlag: undefined, // 是否就诊
  pictures: [] // 图片列表
})

// 收集图片数据
const fileList = ref<{ id: string; url: string }[]>([])
// 上传图片
const onAfterRead: UploaderAfterRead = (item) => {
  if (Array.isArray(item)) return
  if (!item.file) return
  console.log('--onAfterRead', item)
  item.status = 'uploading'
  item.message = '上传中....'
  uploadImage(item.file)
    .then((res) => {
      console.log(res.data)
      item.status = 'done'
      item.message = undefined
      // 为了删除时, 找到指定的项
      item.url = res.data.url
      illnessForm.value.pictures?.push(res.data)
    })
    .catch(() => {
      item.status = 'failed'
      item.message = '上传失败...'
    })
}
// 删除图片
const onDelete = (item: UploaderFileListItem) => {
  console.log('--onDelete 删除的项', item)
  illnessForm.value.pictures = illnessForm.value.pictures?.filter((pic) => {
    return pic.url !== item.url
  })
}

// 按钮激活
const disabled = computed(() => {
  return (
    illnessForm.value.illnessDesc === '' ||
    illnessForm.value.illnessTime === undefined ||
    illnessForm.value.consultFlag === undefined
  )
})
// 下一步
const next = () => {
  if (illnessForm.value.illnessDesc === '')
    return showToast('请填写病情描述信息!')
  if (illnessForm.value.illnessTime === undefined)
    return showToast('请选择患病时长')
  if (illnessForm.value.consultFlag === undefined)
    return showToast('请选择是否就诊')
  // console.log('通过校验')
  // 1. 存储病情描述对象
  store.setIllness(illnessForm.value)
  // 2. 跳转到选择患者页面
  // ischange=1 问诊相关的业务处理 - 选择患者
  router.push('/user/patient?ischange=1')
}

onMounted(() => {
  // 之前填写过
  if (store.consult.illnessDesc) {
    showConfirmDialog({
      title: '温馨提示',
      message: '是否恢复之前填写的病情信息?',
      closeOnPopstate: false // 回退页面不关闭弹层
    }).then(() => {
      // 回显表单
      console.log(store.consult)
      const { illnessDesc, illnessTime, consultFlag, pictures } = store.consult
      illnessForm.value = { illnessDesc, illnessTime, consultFlag, pictures }
      fileList.value = pictures || []
    })
  }
})
</script>

<template>
  <div class="consult-illness-page">
    <cp-nav-bar title="图文问诊" />
    <!-- 医生提示 -->
    <div class="illness-tip van-hairline--bottom">
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <div class="info">
        <p class="tit">在线医生</p>
        <p class="tip">
          请描述你的疾病或症状、是否用药、就诊经历，需要我听过什么样的帮助
        </p>
        <p class="safe">
          <cp-icon name="consult-safe" /><span>内容仅医生可见</span>
        </p>
      </div>
    </div>
    <!-- 收集信息 -->
    <div class="illness-form">
      <van-field
        v-model="illnessForm.illnessDesc"
        type="textarea"
        rows="3"
        placeholder="请详细描述您的病情，病情描述不能为空"
      ></van-field>
      <div class="item">
        <p>本次患病多久了？</p>
        <cp-radio-btn
          v-model="illnessForm.illnessTime"
          :options="timeOptions"
        ></cp-radio-btn>
      </div>
      <div class="item">
        <p>此次病情是否去医院就诊过？</p>
        <cp-radio-btn
          v-model="illnessForm.consultFlag"
          :options="flagOptions"
        ></cp-radio-btn>
      </div>
      <!-- 上传图片 -->
      <div class="illness-img">
        <van-uploader
          :after-read="onAfterRead"
          @delete="onDelete"
          v-model="fileList"
          upload-icon="photo-o"
          upload-text="上传图片"
          :max-count="9"
          :max-size="1024 * 1024 * 5"
        ></van-uploader>
        <p v-if="!fileList.length" class="tip">
          上传内容仅医生可见,最多9张图,最大5MB
        </p>
      </div>
      <van-button @click="next" :class="{ disabled }" type="primary" block round
        >下一步</van-button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.van-button {
  font-size: 16px;
  margin-bottom: 30px;
  &.disabled {
    opacity: 1;
    background: #fafafa;
    color: #d9dbde;
    border: #fafafa;
  }
}
.illness-img {
  padding-top: 16px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  .tip {
    font-size: 12px;
    color: var(--cp-tip);
  }
  ::v-deep() {
    .van-uploader {
      &__preview {
        &-delete {
          left: -6px;
          top: -6px;
          border-radius: 50%;
          background-color: var(--cp-primary);
          width: 20px;
          height: 20px;
          &-icon {
            transform: scale(0.9) translate(-22%, 22%);
          }
        }
        &-image {
          border-radius: 8px;
          overflow: hidden;
        }
      }
      &__upload {
        border-radius: 8px;
      }
      &__upload-icon {
        color: var(--cp-text3);
      }
    }
  }
}

.consult-illness-page {
  padding-top: 46px;
}
.illness-tip {
  display: flex;
  padding: 15px;
  .img {
    width: 52px;
    height: 52px;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 10px;
  }
  .info {
    flex: 1;
    padding-left: 12px;
    .tit {
      font-size: 16px;
      margin-bottom: 5px;
    }
    .tip {
      padding: 12px;
      background: var(--cp-bg);
      color: var(--cp-text3);
      font-size: 13px;
      margin-bottom: 10px;
    }
    .safe {
      font-size: 10px;
      color: var(--cp-text3);
      display: flex;
      align-items: center;
      .cp-icon {
        font-size: 12px;
        margin-right: 2px;
      }
    }
  }
}
.illness-form {
  padding: 15px;
  .van-field {
    padding: 0;
    &::after {
      border-bottom: none;
    }
  }
  .item {
    > p {
      color: var(--cp-text3);
      padding: 15px 0;
    }
  }
}
</style>
