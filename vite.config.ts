import { viteMockServe } from 'vite-plugin-mock'
import { createHtmlPlugin } from 'vite-plugin-html'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 组件配置
import Components from 'unplugin-vue-components/vite'
// vant解析器
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  // base: '/hm', // 基础路径
  server: {
    port: 80,
    host: true
  },
  plugins: [
    viteMockServe({
      mockPath: './src/mock', // mock数据来源
      localEnabled: true // 是否在本地开发环境下加载数据
    }),
    createHtmlPlugin(),
    vue(),
    Components({
      // 不自动生成类型声明文件
      dts: false,
      // importStyle -> 不自动导入样式 -> main.ts已经提前导入了
      resolvers: [VantResolver({ importStyle: false })]
    }),
    createSvgIconsPlugin({
      // 指定图标文件夹，绝对路径（NODE代码）
      // eslint-disable-next-line no-undef
      iconDirs: [path.resolve(process.cwd(), 'src/icons')]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
