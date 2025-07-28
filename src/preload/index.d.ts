import { ElectronAPI } from '@electron-toolkit/preload'

interface BrowserInstance {
  id: number
  group_id: number
  label: string
  remark?: string | null
  created_at: Date
  updated_at: Date
}

interface BrowserInstanceService {
  create: (data: Omit<BrowserInstance, 'id' | 'created_at' | 'updated_at'>) => Promise<BrowserInstance>
  getAll: () => Promise<BrowserInstance[]>
  update: (data: Partial<BrowserInstance> & { id: number }) => Promise<BrowserInstance>
  delete: (id: number) => Promise<BrowserInstance>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      browserInstanceService: BrowserInstanceService
    }
  }
}
