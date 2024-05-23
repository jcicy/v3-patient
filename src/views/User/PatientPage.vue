<script setup lang="ts">
import {
  getPatientList,
  addPatient,
  editPatient,
  delPatient
} from '@/services/user'
import type { PatientList, Patient } from '@/types/user'
import { computed } from 'vue'
import { onMounted } from 'vue'
import { ref } from 'vue'
import { nameRules, idCardRules } from '@/utils/rules'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, type FormInstance, showSuccessToast } from 'vant'
import { useConsultStore } from '@/stores'
const store = useConsultStore()
const route = useRoute()
const router = useRouter()
const list = ref<PatientList>([])

// 界面兼容
// 1. 判断是否是选择患者界面 - 页面路径参数
const isChange = computed(() => route.query.ischange === '1')

const loadList = async () => {
  const res = await getPatientList()
  list.value = res.data
  // 3. 默认选中效果
  // 3.1 患者列表存在 && 选择患者的逻辑
  if (list.value.length && isChange.value) {
    // 3.2 判断列表中是否存在默认项
    // 3.2.1 存在默认项 -> 默认项高亮 / 第一项
    const defPatient = list.value.find((item) => item.defaultFlag === 1)
    if (defPatient) {
      patientId.value = defPatient.id
    } else {
      patientId.value = list.value[0].id
    }
  }
}

// 2. 选中患者效果
const patientId = ref()
const selectPatient = (item: Patient) => {
  patientId.value = item.id
}

// 4. 下一步
const next = () => {
  // 1. 存储患者id
  store.setPatient(patientId.value)
  // 2. 跳转
  router.push('/consult/pay')
}

onMounted(() => {
  loadList()
})

// 提供单选按钮渲染选项 - 数组
const options = [
  { label: '男', value: 1 },
  { label: '女', value: 0 }
]

// 定义患者信息
const initPatient: Patient = {
  name: '', // 姓名
  gender: 1, // 性别 1 男 / 0 女
  idCard: '', // 身份证号
  defaultFlag: 0 // 是否是默认就诊人 0 否 / 1 是
}

const patient = ref<Patient>({
  ...initPatient
})

// 控制弹层显示
const show = ref(false)
const showPopup = (item?: Patient) => {
  console.log(item)
  if (item) {
    // 编辑患者
    const { name, idCard, gender, defaultFlag, id } = item
    patient.value = { name, idCard, gender, defaultFlag, id }
  } else {
    patient.value = { ...initPatient }
  }
  show.value = true
}

const defaultFlag = computed({
  get: () => (patient.value.defaultFlag === 0 ? false : true),
  set(value) {
    patient.value.defaultFlag = value ? 1 : 0
  }
})

// 保存 - 添加患者
const formRef = ref<FormInstance>()
const onSubmit = async () => {
  await formRef.value?.validate()
  // substr substring slice
  // slice(从哪开始的下标, 截止到哪)
  // slice(-2, -1)
  // 身份证号倒数第二位 偶数 0 - 女 / 奇数 1 - 男
  const gender = +patient.value.idCard.slice(-2, -1) % 2 // 0 偶数 / 1 奇数
  if (gender !== patient.value.gender) {
    await showConfirmDialog({
      title: '温馨提示',
      message: '填写的姓名和身份证号不一致\n您确认要提交么?'
    })
  }
  // 发送请求 - 添加/编辑患者
  patient.value.id
    ? await editPatient(patient.value)
    : await addPatient(patient.value)
  // 关闭弹层
  show.value = false
  // 提示用户
  showSuccessToast(patient.value.id ? '编辑成功' : '添加成功')
  // 重新渲染列表
  loadList()
}

// 删除
const del = async () => {
  // await delPatient(patient.value.id!)
  if (patient.value.id) {
    await delPatient(patient.value.id)
    show.value = false
    showSuccessToast('删除成功')
    loadList()
  }
}
</script>

<template>
  <div class="patient-page">
    <cp-nav-bar :title="isChange ? '选择患者' : '家庭档案'"></cp-nav-bar>
    <!-- 头部提示 -->
    <div class="patient-change" v-if="isChange">
      <h3>请选择患者信息</h3>
      <p>以便医生给出更准确的治疗，信息仅医生可见</p>
    </div>
    <div class="patient-list">
      <div
        :class="{ selected: item.id === patientId }"
        @click="selectPatient(item)"
        v-for="item in list"
        :key="item.id"
        class="patient-item"
      >
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <!-- <span class="id">321111********6164</span> -->
          <span class="id">{{
            item.idCard.replace(/^(.{6}).+(.{4})$/, '$1********$2')
          }}</span>
          <span>{{ item.genderValue }}</span>
          <span>{{ item.age }}岁</span>
        </div>
        <div class="icon" @click.stop="showPopup(item)">
          <cp-icon name="user-edit" />
        </div>
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <div class="patient-add" @click="showPopup()" v-if="list.length < 6">
        <cp-icon name="user-add" />
        <p>添加患者</p>
      </div>
      <div class="patient-tip">最多可添加 6 人</div>
    </div>
    <!-- 底部按钮 -->
    <div class="patient-next" @click="next" v-if="isChange">
      <van-button type="primary" round block>下一步</van-button>
    </div>
    <van-popup v-model:show="show" position="right">
      <cp-nav-bar
        :back="() => (show = false)"
        :title="patient.id ? '编辑患者' : '添加患者'"
        rightText="保存"
        @click-right="onSubmit"
      ></cp-nav-bar>
      <van-form ref="formRef">
        <van-field
          v-model="patient.name"
          label="真实姓名"
          placeholder="请输入真实姓名"
          :rules="nameRules"
        />
        <van-field
          v-model="patient.idCard"
          label="身份证号"
          placeholder="请输入身份证号"
          :rules="idCardRules"
        />
        <van-field label="性别" class="pb4">
          <!-- 单选按钮组件 -->
          <template #input>
            <cp-radio-btn
              v-model="patient.gender"
              :options="options"
            ></cp-radio-btn>
          </template>
        </van-field>
        <van-field label="默认就诊人">
          <template #input>
            <van-checkbox v-model="defaultFlag" :icon-size="18" round />
          </template>
        </van-field>
      </van-form>
      <van-action-bar @click="del" v-if="patient.id">
        <van-action-bar-button>删除</van-action-bar-button>
      </van-action-bar>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.patient-change {
  padding: 15px;
  > h3 {
    font-weight: normal;
    margin-bottom: 5px;
  }
  > p {
    color: var(--cp-text3);
  }
}
.patient-next {
  padding: 15px;
  background-color: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 80px;
  box-sizing: border-box;
}

// 底部操作栏
.van-action-bar {
  padding: 0 10px;
  margin-bottom: 10px;
  .van-button {
    color: var(--cp-price);
    background-color: var(--cp-bg);
  }
}
.patient-page {
  padding: 46px 0 80px;
  :deep() {
    .van-popup {
      width: 100%;
      height: 100%;
      padding-top: 46px;
    }
  }
}
.patient-list {
  padding: 15px;
}
.patient-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: var(--cp-bg);
  border-radius: 8px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid var(--cp-bg);
  transition: all 0.3s;
  overflow: hidden;
  .info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    span {
      color: var(--cp-tip);
      margin-right: 20px;
      line-height: 30px;
      &.name {
        font-size: 16px;
        color: var(--cp-text1);
        width: 80px;
        margin-right: 0;
      }
      &.id {
        color: var(--cp-text2);
        width: 180px;
      }
    }
  }
  .icon {
    color: var(--cp-tag);
    width: 20px;
    text-align: center;
  }
  .tag {
    position: absolute;
    right: 60px;
    top: 21px;
    width: 30px;
    height: 16px;
    font-size: 10px;
    color: #fff;
    background-color: var(--cp-primary);
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &.selected {
    border-color: var(--cp-primary);
    background-color: var(--cp-plain);
    .icon {
      color: var(--cp-primary);
    }
  }
}
.patient-add {
  background-color: var(--cp-bg);
  color: var(--cp-primary);
  text-align: center;
  padding: 15px 0;
  border-radius: 8px;
  .cp-icon {
    font-size: 24px;
  }
}
.patient-tip {
  color: var(--cp-tag);
  padding: 12px 0;
}
.pb4 {
  padding-bottom: 4px;
}
</style>
