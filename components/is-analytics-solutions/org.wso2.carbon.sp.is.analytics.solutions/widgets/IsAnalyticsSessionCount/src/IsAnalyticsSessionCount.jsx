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
import RaisedButton from 'material-ui/RaisedButton';

class IsAnalyticsSessionCount extends Widget {
    constructor(props) {
        super(props);

        this.ChartConfig = {
            x: "DURATION",
            charts: [
                {
                    type: "bar",
                    y: "COUNT1",
                    fill: "#00e600",
                    mode: "stacked",
                }
            ],
            yAxisLabel: 'Session count',
            xAxisLabel: 'Duration',
            pagination: 'true',
            maxLength: 10,
            legend: false
        };

        this.metadata = {
               names: ['DURATION', 'COUNT1'],
               types: ['ordinal', 'linear']
        };

        this.state ={
            data: [],
            metadata: this.metadata,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height
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
        let {metadata, data} = message;
        message.data = message.data.reverse();
        this.setState({
            metadata: message.metadata,
            data: message.data
        });

    }

    setReceivedMsg(message) {
        this.setState({
          fromDate: message.from,
          toDate: message.to,
        }, this.assembleQuery);
    }

    assembleQuery() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
        let dataProviderConfigs = _.cloneDeep(this.state.providerConfig);
        let query = dataProviderConfigs.configs.config.queryData.query;
        query = query
            .replace('begin', this.state.fromDate)
            .replace('finish', this.state.toDate)
            .replace('begin1', this.state.fromDate)
            .replace('finish1', this.state.toDate)
            .replace('begin2', this.state.fromDate)
            .replace('finish2', this.state.toDate)
            .replace('begin3', this.state.fromDate)
            .replace('finish3', this.state.toDate)
            .replace('begin4', this.state.fromDate)
            .replace('finish4', this.state.toDate)
            .replace('now', new Date().getTime())
            .replace('now1', new Date().getTime())
            .replace('now2', new Date().getTime())
            .replace('now3', new Date().getTime())
            .replace('now4', new Date().getTime());
        dataProviderConfigs.configs.config.queryData.query = query;
        super.getWidgetChannelManager()
            .subscribeWidget(this.props.id, this.handleDataReceived, dataProviderConfigs);
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
                <section style={{paddingTop: 25}}>
                    <VizG
                        config={this.ChartConfig}
                        metadata={this.state.metadata}
                        data={this.state.data}
                        height={this.state.height * .8}
                        width={this.state.width*1.2}
                        theme={this.props.muiTheme.name}
                    />
                </section>
            </MuiThemeProvider>
        );
    }
}
global.dashboard.registerWidget("IsAnalyticsSessionCount", IsAnalyticsSessionCount);