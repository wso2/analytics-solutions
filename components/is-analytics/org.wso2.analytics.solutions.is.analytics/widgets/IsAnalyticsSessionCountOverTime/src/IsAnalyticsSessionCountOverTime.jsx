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
import Widget from '@wso2-dashboards/widget';
import {MuiThemeProvider, darkBaseTheme, getMuiTheme} from 'material-ui/styles';

class IsAnalyticsSessionCountOverTime extends Widget {
    constructor(props) {
        super(props);

        this.ChartConfig = {
            x: "timestamp",
            charts: [
                {
                    type: "line",
                    y: "Active",
                    fill: "#1aa3ff"
                },
                {
                    type: "line",
                    y: "New",
                    fill: "#ff7f0e"
                },
                {
                    type: "line",
                    y: "Terminated",
                    fill: "#00e600"
                }
            ],
            maxLength: 10,
            yAxisLabel: 'Session Count',
            xAxisLabel: 'Time',
            legend: true,
            append: false,
            brush: true
        };

        this.metadata = {
               names: ['timestamp', 'Active', 'New', 'Terminated'],
               types: ['ordinal', 'linear', 'linear', 'linear']
        };

        this.state = {
            data: [],
            metadata: this.metadata,
            ChartConfig: this.ChartConfig,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            btnGroupHeight: 50
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
        let ChartConfig = _.cloneDeep(this.state.ChartConfig);
        let {metadata, data} = message;
        metadata.types[0] = 'TIME';

        switch(this.state.per)
        {
            case "minute":
                ChartConfig.tipTimeFormat= '%d/%m/%Y %H:%M:%S';
                break;
            case "hour":
                ChartConfig.tipTimeFormat= '%d/%m/%Y %H:%M:%S';
                break;
            case "day":
                ChartConfig.tipTimeFormat= '%d/%m/%Y';
                break;
        }
        this.setState({
            metadata: metadata,
            data: data,
            ChartConfig: ChartConfig
        });
    }

    setReceivedMsg(message) {
        this.setState({
            per: message.granularity,
            fromDate: message.from,
            toDate: message.to
        }, this.assembleQuery);
    }

    assembleQuery() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
        let dataProviderConfigs = _.cloneDeep(this.state.providerConfig);
        let query = dataProviderConfigs.configs.config.queryData.query;
        query = query
            .replace("{{per}}", this.state.per)
            .replace("{{from}}", this.state.fromDate)
            .replace("{{to}}", this.state.toDate);
        dataProviderConfigs.configs.config.queryData.query = query;
        super.getWidgetChannelManager()
            .subscribeWidget(this.props.id, this.handleDataReceived, dataProviderConfigs);
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
                <section style={{paddingTop: 50}}>
                    <VizG
                        config={this.state.ChartConfig}
                        metadata={this.state.metadata}
                        data={this.state.data}
                        height={this.state.height -this.state.btnGroupHeight}
                        width={this.state.width}
                        theme={this.props.muiTheme.name}
                    />
                </section>
            </MuiThemeProvider>
        );
    }
}
global.dashboard.registerWidget("IsAnalyticsSessionCountOverTime", IsAnalyticsSessionCountOverTime);
