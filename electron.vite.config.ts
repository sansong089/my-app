import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@root': resolve('src')
      }
    },
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [resolve('src/renderer/src/assets/icons/svg')],
        symbolId: 'icon-[dir]-[name]'
      })
    ]
  }
})
