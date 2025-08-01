<template>
  <div
    :class="{ 'has-logo': showLogo }"
    :style="{
      backgroundColor:
        sideTheme === 'dark' ? variables.menuBackground : variables.menuLightBackground
    }"
  >
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar :class="sideTheme" wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="
          sideTheme === 'dark' ? variables.menuBackground : variables.menuLightBackground
        "
        :text-color="sideTheme === 'dark' ? variables.menuColor : variables.menuLightColor"
        :unique-opened="true"
        :active-text-color="theme"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="(routeItem, index) in sidebarRouters"
          :key="routeItem.path + index"
          :item="routeItem"
          :base-path="routeItem.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Sidebar'
}
</script>
<script setup lang="ts">
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import variables from '@/assets/styles/variables.module.scss'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const sidebarRouters = computed(() => permissionStore.sidebarRouters)
const showLogo = computed(() => settingsStore.sidebarLogo)
const sideTheme = computed(() => settingsStore.sideTheme)
const theme = computed(() => settingsStore.theme)
const isCollapse = computed(() => !appStore.sidebar.opened)

const activeMenu = computed(() => {
  const { meta, path } = route
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu as string
  }
  return path
})
</script>
