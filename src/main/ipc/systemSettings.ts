import { SystemSettingsService } from '../services/SystemSettingsService'
import { IpcHandler } from './IpcHandler'

export function registerSystemSettingsIpc(service: SystemSettingsService): void {
  IpcHandler.registerHandlers({
    'systemSettings:getAll': () => service.getAll(),
    'systemSettings:get': (varName) => service.get(varName),
    'systemSettings:set': (varName: string, value: string) => service.set(varName, value),
    'systemSettings:mset': (settings: Record<string, string>) => service.mset(settings)
  })
}
