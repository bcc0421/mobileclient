﻿
/**
 * 
 */
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams, RequestOptionsArgs, RequestMethod } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Observable } from "rxjs";
import { Utils } from "./Utils";
import { NativeService } from "./NativeService";
@Injectable()
export class HttpService {
    constructor(public http: Http,
        private nativeService: NativeService) {
    }

    public request(url: string, options: RequestOptionsArgs): Observable<Response> {
        url = this.replaceUrl(url);
        // if (options.headers) {
        //   options.headers.append('token', this.globalData.token);
        // } else {
        //   options.headers = new Headers({
        //     'token': this.globalData.token
        //   });
        // }
        return Observable.create((observer) => {
            if (options.body && !options.body.hideloading) {//是否显示loading
                this.nativeService.showLoading();
            }
            //console.log('%c 请求前 %c', 'color:blue', '', 'url', url, 'options', options);
            this.http.request(url, options).subscribe(res => {
                this.nativeService.hideLoading();
                // console.log('%c 请求成功 %c', 'color:green', '', 'url', url, 'options', options, 'res', res);
                observer.next(res);
            }, err => {
                this.nativeService.hideLoading();
                this.requestFailed(url, options, err);//处理请求失败
                observer.error(err);
            });
        });
    }

    public get(url: string, paramMap: any = null): Observable<Response> {
        return this.request(url, new RequestOptions({
            method: RequestMethod.Get,
            search: HttpService.buildURLSearchParams(paramMap)
        }));
    }

    public post(url: string, body: any = {}): Observable<Response> {
        //判断当前是否登录，如果登录则加载access_token
        var hd_info = {
            'Content-Type': 'application/json; charset=UTF-8',
            'access_token': '123'
        };
        if (this.nativeService.UserSession != null) {
            hd_info.access_token = this.nativeService.UserSession.access_token;
        }
        return this.request(url, new RequestOptions({
            method: RequestMethod.Post,
            body: body,
            headers: new Headers(hd_info)
        }));
    }

    public postFormData(url: string, paramMap: any = null): Observable<Response> {
        return this.request(url, new RequestOptions({
            method: RequestMethod.Post,
            search: HttpService.buildURLSearchParams(paramMap).toString(),
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            })
        }));
    }

    public put(url: string, body: any = null): Observable<Response> {
        return this.request(url, new RequestOptions({
            method: RequestMethod.Put,
            body: body
        }));
    }

    public delete(url: string, paramMap: any = null): Observable<Response> {
        return this.request(url, new RequestOptions({
            method: RequestMethod.Delete,
            search: HttpService.buildURLSearchParams(paramMap).toString()
        }));
    }

    public patch(url: string, body: any = null): Observable<Response> {
        return this.request(url, new RequestOptions({
            method: RequestMethod.Patch,
            body: body
        }));
    }

    public head(url: string, paramMap: any = null): Observable<Response> {
        return this.request(url, new RequestOptions({
            method: RequestMethod.Head,
            search: HttpService.buildURLSearchParams(paramMap).toString()
        }));
    }

    public options(url: string, paramMap: any = null): Observable<Response> {
        return this.request(url, new RequestOptions({
            method: RequestMethod.Options,
            search: HttpService.buildURLSearchParams(paramMap).toString()
        }));
    }

    /**
     * 将对象转为查询参数
     * @param paramMap
     * @returns {URLSearchParams}
     */
    private static buildURLSearchParams(paramMap): URLSearchParams {
        let params = new URLSearchParams();
        if (!paramMap) {
            return params;
        }
        for (let key in paramMap) {
            let val = paramMap[key];
            if (val instanceof Date) {
                val = Utils.dateFormat(val, 'yyyy-MM-dd HH:mm:ss')
            }
            params.set(key, val);
        }
        return params;
    }

    /**
     * 处理请求失败事件
     * @param url
     * @param options
     * @param err
     */
    private requestFailed(url: string, options: RequestOptionsArgs, err) {
        this.nativeService.hideLoading();
        console.log('%c 请求失败 %c', 'color:red', '', 'url', url, 'options', options, 'err', err);
        let msg = '请求发生异常', status = err.status;
        // if (!this.nativeService.isConnecting()) {
        //   msg = '请求失败，请连接网络';
        // } else {
        if (status === 0) {
            msg = '请求失败，请求响应出错';
        } else if (status === 404) {
            msg = '请求失败，未找到请求地址';
        } else if (status === 500) {
            msg = '请求失败，服务器出错，请稍后再试';
        }
        // }
        this.nativeService.showToast(msg);
    }

    /**
     * url中如果有双斜杠替换为单斜杠
     * 如:http://88.128.18.144:8080//api//demo.替换后http://88.128.18.144:8080/api/demo
     * @param url
     * @returns {string}
     */
    private replaceUrl(url) {
        if (url.indexOf('http://') == -1) {
            url = this.nativeService.appServer.node + url;
        }
        return 'http://' + url.substring(7).replace(/\/\//g, '/');
    }
    //文件上传服务器 data
    //file64：图片，语音，视频64位后的编码
    //type:上传文件类型（0:图片；1:语音；2:小视频）
    fileupload(data) {
        return new Promise((resolve) => {
            this.post(this.nativeService.appServer.file + "upload", data).subscribe(data => {
                if (data.json().code == 200) {
                    resolve(data.json().info);
                } else {
                    this.nativeService.showToast(data.json().info);
                }
            });
        });
    }
}