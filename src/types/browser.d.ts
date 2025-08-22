export interface BrowserEntity {
  id: number
  groupId: number
  label: string
  remark: string | null
  pid: number | null // 进程ID
  status: 'stopped' | 'running' // 浏览器状态
  createdAt: Date
  updatedAt: Date
}

export interface BrowserVO {
  id: number
  groupId: number
  label: string
  remark?: string
  pid: number | null // 进程ID
  status: 'stopped' | 'running' // 浏览器状态
  createdAt: Date
  updatedAt: Date
}

export interface BrowserQuery {
  groupId?: number
  label?: string
}

export interface BrowserCreateDTO {
  groupId: number
  label: string
  remark?: string
}

export interface BrowserUpdateDTO extends Partial<BrowserCreateDTO> {
  id: number
}
