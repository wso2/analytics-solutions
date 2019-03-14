/*
 *  Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
import Axios from 'axios';

const sessionUser = 'DASHBOARD_USER';

export default class DashboardSiddhiAppAPIS {
    /**
     * This method will return the AXIOS http client.
     * @returns httpClient
     */
    static getHTTPClient() {
        let httpClient = Axios.create({
            baseURL: window.location.origin + '/' + window.contextPath.substr(1) + '/apis/datasearch',
            timeout: 12000,
            headers: {'Authorization': 'Bearer ' + DashboardSiddhiAppAPIS.getUser().SDID}
        });
        return httpClient;
    }

    /**
     * Get list of store elements in a siddhi app
     *
     * @param appName: name of the siddhi app
     * @returns {Array}
     */
    static getSiddhiAppStoreElements(appName){
        return DashboardSiddhiAppAPIS.getHTTPClient().get('/siddhi-apps/'+appName);
    }

    /**
     * Get list of siddhi apps which has store elements
     *
     * @returns {Array}
     */
    static getAllSiddhiApps(){
        return DashboardSiddhiAppAPIS.getHTTPClient().get('/siddhi-apps');
    }

    /**
     * Get user from the session cookie.
     *
     * @returns {{}|null} User object
     */
    static getUser() {
        const buffer = DashboardSiddhiAppAPIS.getCookie(sessionUser);
        return buffer ? JSON.parse(buffer) : null;
    }

    /**
     * Get JavaScript accessible cookies saved in browser, by giving the cooke name.
     * @param {String} name : Name of the cookie which need to be retrived
     * @returns {String|null} : If found a cookie with given name , return its value,Else null value is returned
     */
    static getCookie(name) {
        name = `${name}=`;
        const arr = document.cookie.split(';');
        for (let i = 0; i < arr.length; i++) {
            let c = arr[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }
}
