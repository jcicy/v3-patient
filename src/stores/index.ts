// pinia独立维护 - 职能单一
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(persist)
export default pinia

// 所有模块的统一导出
// 1. 先导入, 再导出
// import { useUserStore } from './modules/user'
// export { useUserStore }

// 2. 直接将对应的模块中所有的成员进行导出
export * from './modules/user'
export * from './modules/consult'
