import { BrowserService } from '../services/BrowserService'
import { IpcHandler } from './IpcHandler'
import type { PageParams } from '../../types/page'
import type { BrowserQuery, BrowserCreateDTO, BrowserUpdateDTO } from '../../types/browser'

export function registerBrowserIpc(service: BrowserService): void {
  IpcHandler.registerHandlers({
    'browser:list': (page: PageParams, query?: BrowserQuery) => service.list(page, query),
    'browser:getById': (id: number) => service.getById(id),
    'browser:create': (data: BrowserCreateDTO) => service.create(data),
    'browser:update': (data: BrowserUpdateDTO) => service.update(data),
    'browser:delete': (id: number) => service.delete(id)
  })
}
