import axios from 'axios';
import { ElMessage } from 'element-plus';
import { saveAs } from 'file-saver';
import errorCode from '@/utils/errorCode';
import { blobValidate } from '@/utils/tools';

const baseURL = import.meta.env.VITE_APP_BASE_API;

export default {
    name(name: string, isDelete = true) {
        const url = baseURL + '/common/download?fileName=' + encodeURIComponent(name) + '&delete=' + isDelete;
        axios({
            method: 'get',
            url: url,
            responseType: 'blob',
        }).then(res => {
            const isBlob = blobValidate(res.data);
            if (isBlob) {
                const blob = new Blob([res.data]);
                this.saveAs(blob, decodeURIComponent(res.headers['download-filename']));
            } else {
                this.printErrMsg(res.data);
            }
        });
    },
    resource(resource: any) {
        const url = baseURL + '/common/download/resource?resource=' + encodeURIComponent(resource);
        axios({
            method: 'get',
            url: url,
            responseType: 'blob',
        }).then(res => {
            const isBlob = blobValidate(res.data);
            if (isBlob) {
                const blob = new Blob([res.data]);
                this.saveAs(blob, decodeURIComponent(res.headers['download-filename']));
            } else {
                this.printErrMsg(res.data);
            }
        });
    },
    zip(url: string, name: string) {
        url = baseURL + url;
        axios({
            method: 'get',
            url: url,
            responseType: 'blob',
        }).then(res => {
            const isBlob = blobValidate(res.data);
            if (isBlob) {
                const blob = new Blob([res.data], { type: 'application/zip' });
                this.saveAs(blob, name);
            } else {
                this.printErrMsg(res.data);
            }
        });
    },
    saveAs(text: any, name: string, opts?: any) {
        saveAs(text, name, opts);
    },
    async printErrMsg(data: any) {
        const resText = await data.text();
        const rspObj = JSON.parse(resText);
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
        ElMessage.error(errMsg);
    },
};
