// 前端API适配层，将前端参数转换为后端参数格式

export function getAll(): Promise<Record<string, string>> {
  return window.api.systemSettings.getAll().then((res) => {
    if (res.code !== 200) throw new Error(res.message)
    return res.data!
  })
}

export function get(varName: string): Promise<string | null> {
  return window.api.systemSettings.get(varName).then((res) => {
    if (res.code !== 200) throw new Error(res.message)
    return res.data ?? null
  })
}

export function set(varName: string, value: string): Promise<void> {
  return window.api.systemSettings.set(varName, value).then((res) => {
    if (res.code !== 200) throw new Error(res.message)
  })
}

export function mset(data: Record<string, string>): Promise<void> {
  return window.api.systemSettings.mset(data).then((res) => {
    if (res.code !== 200) throw new Error(res.message)
  })
}
