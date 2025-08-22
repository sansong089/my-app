<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="分组id" prop="groupId">
        <el-input
          v-model="queryParams.groupId"
          placeholder="请输入分组id"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input
          v-model="queryParams.label"
          placeholder="请输入标签"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="VideoPlay"
          :disabled="batchStartDisabled"
          @click="handleBatchStart"
          >批量启动</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Close"
          :disabled="batchStopDisabled"
          @click="handleBatchStop"
          >批量停止</el-button
        >
      </el-col>
      <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="browserList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="分组id" align="center" prop="groupId" />
      <el-table-column label="标签" align="center" prop="label" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'running' ? 'success' : 'info'">
            {{ scope.row.status === 'running' ? '运行中' : '已停止' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-if="scope.row.status !== 'running'"
            link
            type="success"
            icon="VideoPlay"
            @click="handleStart(scope.row)"
            >启动</el-button
          >
          <el-button
            v-if="scope.row.status === 'running'"
            link
            type="danger"
            icon="Close"
            @click="handleStop(scope.row)"
            >停止</el-button
          >
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />

    <!-- 添加或修改浏览器实例对话框 -->
    <el-dialog v-model="open" :title="title" width="780px" append-to-body>
      <el-form ref="browserRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="分组id" prop="groupId">
              <el-input v-model="form.groupId" placeholder="请输入分组id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签" prop="label">
              <el-input v-model="form.label" placeholder="请输入标签" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  listBrowser,
  getBrowser,
  addBrowser,
  updateBrowser,
  delBrowser,
  startBrowser,
  stopBrowser
} from '@/api/browser'

export default defineComponent({
  name: 'Browser',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [] as number[],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 浏览器实例表格数据
      browserList: [] as Array<{
        id: number
        groupId: number
        label: string
        remark?: string
        status: 'stopped' | 'running'
      }>,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        groupId: null,
        label: null
      },
      // 表单参数
      form: {
        id: null as number | null,
        groupId: null as number | null,
        label: null as string | null,
        remark: null as string | null
      },
      // 表单校验
      rules: {
        groupId: [{ required: true, message: '分组id不能为空', trigger: 'blur' }],
        label: [{ required: true, message: '标签不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    // 批量启动按钮是否禁用
    batchStartDisabled() {
      // 没有选择任何项时禁用
      if (this.multiple) {
        return true
      }

      // 获取所有选中项的状态
      const selectedItems = this.browserList.filter(item => this.ids.includes(item.id))

      // 如果所有选中项都是运行状态，则禁用批量启动按钮
      return selectedItems.every(item => item.status === 'running')
    },

    // 批量停止按钮是否禁用
    batchStopDisabled() {
      // 没有选择任何项时禁用
      if (this.multiple) {
        return true
      }

      // 获取所有选中项的状态
      const selectedItems = this.browserList.filter(item => this.ids.includes(item.id))

      // 如果所有选中项都是停止状态，则禁用批量停止按钮
      return selectedItems.every(item => item.status === 'stopped')
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询浏览器实例列表 */
    getList() {
      this.loading = true
      const page = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize
      }
      const query = {
        groupId: this.queryParams.groupId,
        label: this.queryParams.label
      }
      listBrowser(page, query)
        .then((response) => {
          this.browserList = response.rows
          this.total = response.total
          this.loading = false
        })
        .catch((error) => {
          console.error('查询失败:', error)
          this.$modal.msgError(error.message || '查询失败')
          this.loading = false
        })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        groupId: null,
        label: null,
        remark: null
      }
      this.$nextTick(() => {
        if (this.$refs.browserRef) {
          ;(this.$refs.browserRef as HTMLFormElement).resetFields()
        }
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$nextTick(() => {
        if (this.$refs.queryRef) {
          ;(this.$refs.queryRef as HTMLFormElement).resetFields()
        }
      })
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加浏览器实例'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids[0]
      if (id) {
        getBrowser(id)
          .then((response) => {
            this.form = {
              id: response.id,
              groupId: response.groupId,
              label: response.label,
              remark: response.remark ?? null
            }
            this.open = true
            this.title = '修改浏览器实例'
          })
          .catch((error) => {
            console.error('查询失败:', error)
            this.$modal.msgError(error.message || '查询失败')
          })
      }
    },
    /** 提交按钮 */
    submitForm() {
      const browserRef = this.$refs.browserRef as any
      browserRef.validate((valid: boolean) => {
        if (valid) {
          // 确保必要的字段不为null
          if (this.form.groupId !== null && this.form.label !== null) {
            if (this.form.id != null) {
              const updateData = {
                id: this.form.id,
                groupId: this.form.groupId!,
                label: this.form.label!,
                remark: this.form.remark !== null ? this.form.remark : undefined
              }
              updateBrowser(updateData)
                .then(() => {
                  this.$modal.msgSuccess('修改成功')
                  this.open = false
                  this.getList()
                })
                .catch((error) => {
                  console.error('修改失败:', error)
                  this.$modal.msgError(error.message || '修改失败')
                })
            } else {
              const createData = {
                groupId: Number(this.form.groupId!),
                label: this.form.label!,
                remark: this.form.remark !== null ? this.form.remark : undefined
              }
              addBrowser(createData)
                .then(() => {
                  this.$modal.msgSuccess('新增成功')
                  this.open = false
                  this.getList()
                })
                .catch((error) => {
                  console.error('新增失败:', error)
                  this.$modal.msgError(error.message || '新增失败')
                })
            }
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids[0]
      this.$modal
        .confirm('是否确认删除浏览器实例编号为"' + ids + '"的数据项？')
        .then(() => {
          return delBrowser(ids)
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        })
        .catch(() => {})
    },

    /** 启动按钮操作 */
    handleStart(row) {
      const id = row.id
      this.$modal
        .confirm('是否确认启动浏览器实例编号为"' + id + '"？')
        .then(() => {
          return startBrowser(id)
        })
        .then(() => {
          this.$modal.msgSuccess('启动成功')
          row.status = 'running'
        })
        .catch((error) => {
          console.error('启动失败:', error)
          this.$modal.msgError(error.message || '启动失败')
        })
    },

    /** 停止按钮操作 */
    handleStop(row) {
      const id = row.id
      this.$modal
        .confirm('是否确认停止浏览器实例编号为"' + id + '"？')
        .then(() => {
          return stopBrowser(id)
        })
        .then(() => {
          this.$modal.msgSuccess('停止成功')
          row.status = 'stopped'
        })
        .catch((error) => {
          console.error('停止失败:', error)
          this.$modal.msgError(error.message || '停止失败')
        })
    },

    /** 批量启动按钮操作 */
    handleBatchStart() {
      if (this.ids.length === 0) {
        this.$modal.msgError('请选择至少一个浏览器实例')
        return
      }

      this.$modal
        .confirm('是否确认启动选中的' + this.ids.length + '个浏览器实例？')
        .then(() => {
          // 创建一个Promise数组，每个元素代表一个启动操作
          const promises = this.ids.map((id) => startBrowser(id))

          // 使用Promise.all等待所有启动操作完成
          return Promise.all(promises)
        })
        .then(() => {
          this.$modal.msgSuccess('批量启动成功')
          // 刷新列表
          this.getList()
        })
        .catch((error) => {
          console.error('批量启动失败:', error)
          this.$modal.msgError(error.message || '批量启动失败')
          // 即使部分失败也刷新列表以更新状态
          this.getList()
        })
    },

    /** 批量停止按钮操作 */
    handleBatchStop() {
      if (this.ids.length === 0) {
        this.$modal.msgError('请选择至少一个浏览器实例')
        return
      }

      this.$modal
        .confirm('是否确认停止选中的' + this.ids.length + '个浏览器实例？')
        .then(() => {
          // 创建一个Promise数组，每个元素代表一个停止操作
          const promises = this.ids.map((id) => stopBrowser(id))

          // 使用Promise.all等待所有停止操作完成
          return Promise.all(promises)
        })
        .then(() => {
          this.$modal.msgSuccess('批量停止成功')
          // 刷新列表
          this.getList()
        })
        .catch((error) => {
          console.error('批量停止失败:', error)
          this.$modal.msgError(error.message || '批量停止失败')
          // 即使部分失败也刷新列表以更新状态
          this.getList()
        })
    },

    /** 导出按钮操作 */
    handleExport() {
      // @ts-ignore: download method from mixin
      this.download(
        'system/browser/export',
        {
          ...this.queryParams
        },
        `browser_${new Date().getTime()}.xlsx`
      )
    }
  }
})
</script>
