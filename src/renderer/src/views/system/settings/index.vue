<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统设施设置</span>
            </div>
          </template>

          <el-form ref="formRef" :model="form" :rules="rules" label-width="180px">
            <el-form-item label="Chrome可执行文件" prop="chrome_path">
              <el-input v-model="form.chrome_path" placeholder="请选择Chrome可执行文件路径" readonly>
                <template #append>
                  <el-button @click="selectChromePath">
                    <el-icon><Folder /></el-icon>
                    选择
                  </el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="Chrome用户数据目录" prop="user_data_path">
              <el-input v-model="form.user_data_path" placeholder="请选择Chrome用户数据目录" readonly>
                <template #append>
                  <el-button @click="selectUserDataPath">
                    <el-icon><Folder /></el-icon>
                    选择
                  </el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitForm" :loading="loading">
                <el-icon><Check /></el-icon>
                保存设置
              </el-button>
              <el-button @click="resetForm">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { get, mset } from '@/api/systemSettings'
import { ElMessage, ElMessageBox } from 'element-plus'

export default defineComponent({
  name: 'SystemSettings',
  data() {
    return {
      loading: false,
      form: {
        chrome_path: '',
        user_data_path: ''
      },
      rules: {
        chrome_path: [
          { required: true, message: '请选择Chrome可执行文件路径', trigger: 'blur' }
        ],
        user_data_path: [
          { required: true, message: '请选择Chrome用户数据目录', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.loadSettings()
  },
  methods: {
    // 加载系统设置
    async loadSettings() {
      try {
        this.loading = true
        const [chromePath, userDataPath] = await Promise.all([
          get('chrome_path'),
          get('user_data_path')
        ])

        this.form.chrome_path = chromePath || ''
        this.form.user_data_path = userDataPath || ''
      } catch (error) {
        console.error('加载设置失败:', error)
        ElMessage.error('加载设置失败')
      } finally {
        this.loading = false
      }
    },

    // 选择Chrome可执行文件
    async selectChromePath() {
      console.log('开始选择Chrome可执行文件...')
      try {
        console.log('调用 window.api.dialog.selectFile...')
        const result = await window.api.dialog.selectFile({
          filters: [
            { name: '可执行文件', extensions: ['exe'] },
            { name: '所有文件', extensions: ['*'] }
          ]
        })
        console.log('选择文件结果:', result)

        if (result) {
          console.log('选择的文件路径:', result)
          this.form.chrome_path = result
          ElMessage.success('文件选择成功')
        } else {
          console.log('用户取消了文件选择或选择失败')
        }
      } catch (error) {
        console.error('选择文件失败:', error)
        ElMessage.error('选择文件失败: ' + (error instanceof Error ? error.message : String(error)))
      }
    },

    // 选择用户数据目录
    async selectUserDataPath() {
      console.log('开始选择用户数据目录...')
      try {
        console.log('调用 window.api.dialog.selectFolder...')
        const result = await window.api.dialog.selectFolder()
        console.log('选择目录结果:', result)

        if (result) {
          console.log('选择的目录路径:', result)
          this.form.user_data_path = result
          ElMessage.success('目录选择成功')
        } else {
          console.log('用户取消了目录选择或选择失败')
        }
      } catch (error) {
        console.error('选择目录失败:', error)
        ElMessage.error('选择目录失败: ' + (error instanceof Error ? error.message : String(error)))
      }
    },

    // 提交表单
    submitForm() {
      const formRef = this.$refs.formRef as HTMLFormElement & {
        validate: (callback: (valid: boolean) => void) => void
      }
      formRef.validate(async (valid: boolean) => {
        if (!valid) return

        try {
          this.loading = true
          await mset({
            chrome_path: this.form.chrome_path,
            user_data_path: this.form.user_data_path
          })

          ElMessage.success('保存成功')
        } catch (error) {
          console.error('保存失败:', error)
          ElMessage.error('保存失败')
        } finally {
          this.loading = false
        }
      })
    },

    // 重置表单
    resetForm() {
      ElMessageBox.confirm('确定要重置为默认值吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loadSettings()
        ElMessage.success('已重置')
      }).catch(() => {})
    }
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-form {
  max-width: 800px;
}

:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-input-group__append .el-button) {
  border: none;
  padding: 8px 12px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-input-group__append .el-icon) {
  margin: 0;
}
</style>
