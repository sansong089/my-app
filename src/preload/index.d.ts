import { ElectronAPI } from '@electron-toolkit/preload'

import type { BrowserInstance } from '@/typings/browser'

interface BrowserInstanceService {
  create: (data: Omit<BrowserInstance, 'id' | 'created_at' | 'updated_at'>) => Promise<BrowserInstance>
  getAll: () => Promise<BrowserInstance[]>
  get: (id: number) => Promise<BrowserInstance | null>
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
