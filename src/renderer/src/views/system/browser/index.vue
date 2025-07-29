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
      <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="browserList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="分组id" align="center" prop="groupId" />
      <el-table-column label="标签" align="center" prop="label" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
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
import type { FormInstance } from 'element-plus'
import {
  listBrowser,
  getBrowser,
  delBrowser,
  addBrowser,
  updateBrowser
} from '@/api/system/browser'
import type { BrowserInstance } from '@/typings/browser'
import type { CreateBrowserInstanceDto, UpdateBrowserInstanceDto } from '@/../../preload/index.d'

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
      browserList: [] as BrowserInstance[],
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
  created() {
    this.getList()
  },
  methods: {
    /** 查询浏览器实例列表 */
    getList() {
      this.loading = true
      listBrowser(this.queryParams).then((response) => {
        this.browserList = response.data?.rows || []
        this.total = response.data?.total || 0
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
    handleSelectionChange(selection: BrowserInstance[]) {
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
    handleUpdate(row: BrowserInstance) {
      this.reset()
      const id = row.id || this.ids[0]
      if (id) {
        getBrowser(id).then((response) => {
          if (response.data) {
            this.form = { ...response.data }
            this.open = true
            this.title = '修改浏览器实例'
          }
        })
      }
    },
    /** 提交按钮 */
    submitForm() {
      const browserRef = this.$refs.browserRef as FormInstance
      browserRef.validate((valid: boolean) => {
        if (valid) {
          // 确保必要的字段不为null
          if (this.form.groupId !== null && this.form.label !== null) {
            if (this.form.id != null) {
              const updateData: UpdateBrowserInstanceDto = {
                id: this.form.id,
                groupId: this.form.groupId,
                label: this.form.label,
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
              const createData: CreateBrowserInstanceDto = {
                groupId: this.form.groupId,
                label: this.form.label,
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
    handleDelete(row: BrowserInstance) {
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
