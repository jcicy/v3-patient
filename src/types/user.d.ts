// 用户信息类型
export type User = {
  token: string
  refreshToken: string
  avatar: string
  mobile: string
  account: string
  id: string
}

type OmitUser = Omit<User, 'token' | 'refreshToken'>

// 个人中心类型
export type UserInfo = OmitUser & {
  /** 关注 */
  likeNumber: number
  /** 收藏 */
  collectionNumber: number
  /** 积分 */
  score: number
  /** 优惠券 */
  couponNumber: number
  orderInfo: {
    /** 待付款 */
    paidNumber: number
    /** 待发货 */
    receivedNumber: number
    /** 待收货 */
    shippedNumber: number
    /** 已完成 */
    finishedNumber: number
  }
}

// 患者类型

export type Patient = {
  /**
   * 年龄
   */
  age?: number
  /**
   * 是否设置为默认患者 0不是默认 1是默认患者
   */
  defaultFlag: 0 | 1
  /**
   * 性别 1男 0女
   */
  gender: 0 | 1
  /**
   * 性别值
   */
  genderValue?: string
  id?: string
  /**
   * 患者身份证号
   */
  idCard: string
  /**
   * 患者姓名
   */
  name: string
}

export type PatientList = Patient[]
