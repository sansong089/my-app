/* eslint-disable camelcase */
import axios from 'axios';
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus';
import errorCode from '@/utils/errorCode';
import { tansParams, blobValidate, getMimeType } from '@/utils/tools';
import cache from '@/plugins/cache';
import { saveAs } from 'file-saver';

let downloadLoadingInstance: ReturnType<typeof ElLoading.service>;

// 是否显示重新登录
export const isRelogin = { show: false };

// 创建axios实例
const service = axios.create({
    // axios中请求配置有baseURL选项，表示请求URL公共部分
    baseURL: import.meta.env.VITE_APP_BASE_API,
    // 超时
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
});

// request拦截器
service.interceptors.request.use(
    config => {
        // 是否需要防止数据重复提交
        const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;
        // get请求映射params参数
        if (config.method === 'get' && config.params) {
            let url = config.url + '?' + tansParams(config.params);
            url = url.slice(0, -1);
            config.params = {};
            config.url = url;
        }
        if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
            const requestObj = {
                url: config.url,
                data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
                time: new Date().getTime(),
            };
            const sessionObj = cache.session.getJSON('sessionObj');
            if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
                cache.session.setJSON('sessionObj', requestObj);
            } else {
                const s_url = sessionObj.url; // 请求地址
                const s_data = sessionObj.data; // 请求数据
                const s_time = sessionObj.time; // 请求时间
                const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
                if (
                    s_data === requestObj.data &&
                    requestObj.time - s_time < interval &&
                    s_url === requestObj.url
                ) {
                    const message = '数据正在处理，请勿重复提交';
                    console.warn(`[${s_url}]: ` + message);
                    return Promise.reject(new Error(message));
                } else {
                    cache.session.setJSON('sessionObj', requestObj);
                }
            }
        }
        return config;
    },
    error => {
        console.log(error);
        Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    res => {
        // 未设置状态码则默认成功状态
        const code = res.data.code || 200;
        // 获取错误信息
        const msg = errorCode[code] || res.data.msg || errorCode['default'];
        // 二进制数据则直接返回
        if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
            return res;
        }
        if (code === 401) {
            return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
        } else if (code === 500) {
            ElMessage({
                message: msg,
                type: 'error',
            });
            return Promise.reject(new Error(msg));
        } else if (code === 601) {
            ElMessage({
                message: msg,
                type: 'warning',
            });
            return Promise.reject(new Error(msg));
        } else if (code !== 200) {
            ElNotification.error({
                title: msg,
            });
            return Promise.reject('error');
        } else {
            return Promise.resolve(res.data);
        }
    },
    error => {
        console.log('err' + error);
        let { message } = error;
        if (message === 'Network Error') {
            message = '后端接口连接异常';
        } else if (message.includes('timeout')) {
            message = '系统接口请求超时';
        } else if (message.includes('Request failed with status code')) {
            message = '系统接口' + message.substr(message.length - 3) + '异常';
        }
        ElMessage({
            message: message,
            type: 'error',
            duration: 5 * 1000,
        });
        return Promise.reject(error);
    }
);

// 通用下载方法
export function myDownload(downloadConfig: { url: string; params: any; filename?: string; config?: any }) {
    downloadLoadingInstance = ElLoading.service({
        text: '正在下载数据，请稍候',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    return service
        .post(
            downloadConfig.url,
            { ...downloadConfig.params },
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                responseType: 'blob',
                ...downloadConfig.config,
            }
        )
        .then(async (response: any) => {
            if (response.data.type === 'application/json') {
                // 下载文件失败
                const reader = new FileReader();
                reader.readAsText(response.data, 'utf-8'); // 设置读取的数据以及返回的数据类型为utf-8
                reader.onload = e => {
                    if (e.target) {
                        const res = JSON.parse(e.target.result! as string);
                        ElMessage.error(res.msg || '下载失败');
                    }
                    downloadLoadingInstance.close();
                    return Promise.reject(e.target?.result);
                };
            } else {
                const isBlob = blobValidate(response.data);
                if (isBlob) {
                    debugger;
                    let blob = null;
                    if (!downloadConfig.filename) {
                        blob = new Blob([response.data], {
                            type: `${getMimeType(response.headers['download-filename'].split('/')[1])}`,
                        });
                    } else {
                        blob = new Blob([response.data], {
                            type: `${getMimeType(downloadConfig.filename.split('.')[1])}`,
                        });
                    }
                    const patt = new RegExp('filename=([^;]+\\.[^\\.;]+);*');
                    let contentDisposition = null;
                    let result = null;
                    let fileName = downloadConfig.filename
                        ? downloadConfig.filename
                        : response.headers['download-filename'];
                    if (response.headers['content-disposition'] !== undefined) {
                        // 文件名称存在得的情况下
                        contentDisposition = decodeURI(response.headers['content-disposition']);
                        result = patt.exec(contentDisposition);
                        fileName = result && result[1];
                        fileName = fileName && fileName.replace(/\"/g, '');
                    }
                    saveAs(blob, fileName);
                } else {
                    const resText = await response.data.text();
                    const rspObj = JSON.parse(resText);
                    const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
                    ElMessage.error(errMsg);
                }
                downloadLoadingInstance.close();
            }
        })
        .catch(r => {
            console.error(r);
            ElMessage.error('下载文件出现错误，请联系管理员！');
            downloadLoadingInstance.close();
        });
}

// 通用下载方法
export function download(url: string, params: any, filename: string, config: any = {}) {
    downloadLoadingInstance = ElLoading.service({
        text: '正在下载数据，请稍候',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    return service
        .post(url, params, {
            transformRequest: [
                params => {
                    return tansParams(params);
                },
            ],
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            responseType: 'blob',
            ...config,
        })
        .then(async (data: any) => {
            const isBlob = blobValidate(data);
            if (isBlob) {
                const blob = new Blob([data]);
                saveAs(blob, filename);
            } else {
                const resText = await data.text();
                const rspObj = JSON.parse(resText);
                const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
                ElMessage.error(errMsg);
            }
            downloadLoadingInstance.close();
        })
        .catch(r => {
            console.error(r);
            ElMessage.error('下载文件出现错误，请联系管理员！');
            downloadLoadingInstance.close();
        });
}

export default service;
