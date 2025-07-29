export interface PageParams {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  rows: T[]
  total: number
}
