<template>
    <div class="navbar">
        <hamburger
            id="hamburger-container"
            :is-active="appStore.sidebar.opened"
            class="hamburger-container"
            @toggleClick="toggleSideBar"
        />
        <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!settingsStore.topNav" />
        <top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" />

        <div class="right-menu">
            <template v-if="appStore.device !== 'mobile'">
                <header-search id="header-search" class="right-menu-item" />

                <div class="right-menu-item">
                    <el-switch
                        v-model="theme"
                        active-value="light"
                        inactive-value="dark"
                        active-action-icon="Sunny"
                        inactive-action-icon="Moon"
                        active-color="var(--bg-color-mute)"
                        @change="changeTheme"
                    >
                    </el-switch>
                </div>
<!--
                <screenfull id="screenfull" class="right-menu-item hover-effect" />

                <el-tooltip content="布局大小" effect="dark" placement="bottom">
                    <size-select id="size-select" class="right-menu-item hover-effect" />
                </el-tooltip>
-->
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import Breadcrumb from '@/components/Breadcrumb/index.vue';
import TopNav from '@/components/TopNav/index.vue';
import Hamburger from '@/components/Hamburger/index.vue';
import Screenfull from '@/components/Screenfull/index.vue';
import SizeSelect from '@/components/SizeSelect/index.vue';
import HeaderSearch from '@/components/HeaderSearch/index.vue';
import useAppStore from '@/store/modules/app';
import useSettingsStore from '@/store/modules/settings';
import { ref } from 'vue';

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const theme = ref('light');

function toggleSideBar() {
    appStore.toggleSideBar();
}

const changeTheme = (value: string | number | boolean) => {
    const html = document.getElementsByTagName('html')[0];
    html.classList.toggle('dark');
    html.classList.toggle('light');
    html.setAttribute('style', '');
    settingsStore.setSideTheme(value as string);
};

function handleCommand(command: string) {
    switch (command) {
        case 'setLayout':
            setLayout();
            break;
        default:
            break;
    }
}


const emits = defineEmits(['setLayout']);
function setLayout() {
    emits('setLayout');
}
</script>

<style lang="scss" scoped>
.navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    background: transparent;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    .hamburger-container {
        line-height: 46px;
        height: 100%;
        float: left;
        cursor: pointer;
        transition: background 0.3s;
        -webkit-tap-highlight-color: transparent;

        &:hover {
            background: rgba(0, 0, 0, 0.025);
        }
    }

    .breadcrumb-container {
        float: left;
    }

    .topmenu-container {
        position: absolute;
        left: 50px;
    }

    .errLog-container {
        display: inline-block;
        vertical-align: top;
    }

    .right-menu {
        height: 100%;
        line-height: 50px;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        &:focus {
            outline: none;
        }

        .right-menu-item {
            display: inline-block;
            padding: 0 8px;
            height: 100%;
            font-size: 18px;
            color: #5a5e66;
            vertical-align: text-bottom;

            &.hover-effect {
                cursor: pointer;
                transition: background 0.3s;

                &:hover {
                    background: rgba(0, 0, 0, 0.025);
                }
            }
        }

        .avatar-container {
            margin-right: 20px;

            .avatar-wrapper {
                margin-top: 14px;
                position: relative;

                .user-avatar {
                    cursor: pointer;
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                }

                i {
                    cursor: pointer;
                    position: absolute;
                    right: -20px;
                    top: 25px;
                    font-size: 12px;
                }
            }
        }
    }
}
</style>
