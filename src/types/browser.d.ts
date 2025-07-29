export interface BrowserEntity {
  id: number
  groupId: number
  label: string
  remark: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BrowserVO {
  id: number
  groupId: number
  label: string
  remark?: string
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
