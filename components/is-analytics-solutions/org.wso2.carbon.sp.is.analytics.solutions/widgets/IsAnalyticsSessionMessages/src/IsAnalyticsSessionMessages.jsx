/*
 *  Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import VizG from 'react-vizgrammar';
import Widget from "@wso2-dashboards/widget";
import {MuiThemeProvider, darkBaseTheme, getMuiTheme} from 'material-ui/styles';
import RaisedButton from 'material-ui/RaisedButton';

class IsAnalyticsSessionMessages extends Widget {
    constructor(props) {
        super(props);

        this.ChartConfig = {
            charts: [
                {
                    type: "table",
                    columns: [
                    {
                        name: "USERNAME",
                        title: "Username"
                    },
                    {
                        name: "STARTTIME",
                        title: "Start Time"
                    },
                    {
                        name: "TERMINATETIME",
                        title: "Termination Time"
                    },
                    {
                        name: "ENDTIME",
                        title: "End Time"
                    },
                    {
                        name: "DURATION",
                        title: "Duration (ms)"
                    },
                    {
                        name: "ISACTIVE",
                        title: "Is Active"
                    },
                    {
                        name: "USERSTOREDOMAIN",
                        title: "User Store Domain"
                    },
                    {
                        name: "TENANTDOMAIN",
                        title: "Tenant Domain"
                    },
                    {
                        name: "REMOTEIP",
                        title: "Ip"
                    },
                    {
                        name: "REMEMBERMEFLAG",
                        title: "Remember Me Flag"
                    },
                    {
                        name: "CURRENTTIME",
                        title: "Timestamp"
                    }
                    ]
                }
            ],
            "pagination": true,
            "filterable": true,
            "append": false
        };

        this.metadata = {
            names: ['USERNAME', 'STARTTIME', 'TERMINATETIME', 'ENDTIME', 'DURATION', 'ISACTIVE', 'USERSTOREDOMAIN', 'TENANTDOMAIN', 'REMOTEIP', 'REMEMBERMEFLAG', 'CURRENTTIME'],
            types: ['ordinal', 'ordinal', 'ordinal', 'ordinal', 'time', 'ordinal', 'ordinal', 'ordinal', 'ordinal', 'ordinal', 'ordinal']
        };

        this.state = {
            data: [],
            metadata: this.metadata,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            btnGroupHeight: 100
        };

        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.setReceivedMsg = this.setReceivedMsg.bind(this);
        this.assembleQuery = this.assembleQuery.bind(this);
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }

    componentDidMount() {
        super.subscribe(this.setReceivedMsg);
        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                this.setState({
                    providerConfig: message.data.configs.providerConfig
                });
            })
    }

    componentWillUnmount() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
    }

    handleDataReceived(message) {
        message.data.map((number) => {
            for(let j=0;j<message.data.length;j++) { 
                for(let i=0;i<10;i++) {
                    if (i==5) {
                        switch(message.data[j][i]) {
                            case 0: 
                                message.data[j][i]='False';
                                break;
                            case 1: 
                                message.data[j][i]='True';
                                break;
                        }
                    }

                    if (i==3) {
                        if (message.data[j][i]=='January 1,1970 05:29:59 IST') {
                            message.data[j][i]='Live';
                        }
                    }

                    if(i==9) {
                        switch(message.data[j][i]) {
                            case 0: 
                                message.data[j][i]='False';
                                break;
                            case 1: 
                                message.data[j][i]='True';
                                break;
                        }
                    }
                }
            }
        });

        this.setState({
            metadata: message.metadata,
            data: message.data
        });   
    }

    setReceivedMsg(message) {
        this.setState({
            fromDate: message.from,
            toDate: message.to
        }, this.assembleQuery);
    }

    assembleQuery() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
        let dataProviderConfigs = _.cloneDeep(this.state.providerConfig);
        let query = dataProviderConfigs.configs.config.queryData.query;
        query = query
            .replace('begin', this.state.fromDate)
            .replace('finish', this.state.toDate);
        dataProviderConfigs.configs.config.queryData.query = query;
        super.getWidgetChannelManager()
            .subscribeWidget(this.props.id, this.handleDataReceived, dataProviderConfigs);
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
                <section style={{paddingTop: 50}}>
                    <VizG
                        config={this.ChartConfig}
                        metadata={this.state.metadata}
                        data={this.state.data}
                        height={this.state.height - this.state.btnGroupHeight}
                        width={this.state.width}
                        theme={this.props.muiTheme.name}
                    />
                </section>
            </MuiThemeProvider>
        );
    }
}
global.dashboard.registerWidget("IsAnalyticsSessionMessages", IsAnalyticsSessionMessages);