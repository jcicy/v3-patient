import Mock from 'mockjs'
const rules = [
  {
    url: '/patient/message/sys/list',
    method: 'get',
    timeout: 1000,
    response: () => {
      const data = []
      for (let i = 0; i < 10; i++) {
        data.push(
          Mock.mock({
            title: '@ctitle(3,10)',
            id: '@id',
            type: '@integer(1,3)',
            content: '@ctitle(10,15)',
            status: '@integer(0,1)',
            createTime: '@time'
          })
        )
      }
      return {
        code: 10000,
        message: '请求成功!!!!',
        data
      }
    }
  }
]

export default rules
