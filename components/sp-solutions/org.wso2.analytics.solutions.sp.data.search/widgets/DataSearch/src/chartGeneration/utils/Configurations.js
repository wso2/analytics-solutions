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
const Configurations = {
    charts: {
        lineAreaBarChart: {
            x: '',
            charts: [
                {
                    type: 'bar',
                    y: '',
                    color: '',
                    mode: ''
                }
            ],
            legend: true,
            maxLength: 100,
            append:false
        },
        scatterChart: {
            type: 'scatter',
            charts: [
                {
                    type: 'scatter',
                    x: '',
                    y: '',
                    color: '',
                    size: '',
                    maxLength: 100,
                    colorScale: [
                        '#1f77b4',
                        '#ebff3b'
                    ]
                }
            ],
            append:false,
        },
        pieChart: {
            'charts': [
                {
                    'type': 'arc',
                    'x': '',
                    'color': '',
                    'mode': 'pie'
                }
            ],
            'legend': true,
        },
        geographicalChart: {
            x: '',
            charts: [
                {
                    type: 'map',
                    y: '',
                    mapType: 'world'
                },
            ],
        }
    },
};
export default Configurations;
