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
import { MuiThemeProvider } from 'material-ui/styles';
import _ from 'lodash';

const templateFillers = [
    {
        durationRange: '(duration >= 0 and duration <= 900001)',
        startTimestampRange: '(startTimestamp >= 0 AND startTimestamp <= {{to}}L )',
        endTimestampRange: '(endTimestamp >= {{from}}L AND endTimestamp <= {{now}}L)',
        duration: ' < 15 mins',
    },
    {
        durationRange: '(duration >= 900001 and duration <= 3600001)',
        startTimestampRange: '(startTimestamp >= 0 AND startTimestamp <= {{to}}L )',
        endTimestampRange: '(endTimestamp >= {{from}}L AND endTimestamp <= {{now}}L)',
        duration: ' < 1 hr',
    },
    {
        durationRange: '(duration >= 3600001 and duration <= 43200001)',
        startTimestampRange: '(startTimestamp >= 0 AND startTimestamp <= {{to}}L )',
        endTimestampRange: '(endTimestamp >= {{from}}L AND endTimestamp <= {{now}}L)',
        duration: ' < 12 hrs',
    },
    {
        durationRange: '(duration >= 43200001 and duration <= 86400001)',
        startTimestampRange: '(startTimestamp >= 0 AND startTimestamp <= {{to}}L )',
        endTimestampRange: '(endTimestamp >= {{from}}L AND endTimestamp <= {{now}}L)',
        duration: ' < 24 hrs',
    },
    {
        durationRange: '(duration >= 86400001 and duration <= 9223372036854775807L)',
        startTimestampRange: '(startTimestamp >= 0 AND startTimestamp <= {{to}}L )',
        endTimestampRange: '(endTimestamp >= {{from}}L AND endTimestamp <= {{now}}L)',
        duration: ' > 24 hrs',
    },
];

class IsAnalyticsSessionCount extends Widget {
    constructor(props) {
        super(props);

        this.chartConfig = {
            x: 'duration',
            charts: [
                {
                    type: 'bar',
                    y: 'count1',
                    fill: '#00e600',
                    mode: 'stacked',
                },
            ],
            yAxisLabel: 'Session count',
            xAxisLabel: 'Duration',
            pagination: 'true',
            maxLength: 10,
            legend: false,
            yDomain: [0, 10],
        };

        this.metadata = {
            names: ['duration', 'count1'],
            types: ['ordinal', 'linear'],
        };

        this.state = {
            data: [],
            metadata: this.metadata,
            providerConfig: null,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
        };

        this.appendArray = [];

        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.handleUserSelection = this.handleUserSelection.bind(this);
        this.assembleQuery = this.assembleQuery.bind(this);
        this.sendQuery = this.sendQuery.bind(this);
    }

    handleResize() {
        this.setState({ width: this.props.glContainer.width, height: this.props.glContainer.height });
    }

    componentDidMount() {
        super.subscribe(this.handleUserSelection);
        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                this.setState({
                    providerConfig: message.data.configs.providerConfig,
                });
            });
    }

    componentWillUnmount() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
    }

    handleDataReceived(message) {
        let receivedData = message.data;
        if (!receivedData.length) {
            receivedData = [[templateFillers[this.appendArray.length].duration, 0]];
        }

        this.appendArray.push(receivedData[0]);
        if (this.appendArray.length < 5) {
            this.sendQuery(this.appendArray.length);
        } else if (this.appendArray.length === 5) {
            this.setState({
                data: this.appendArray,
            }, () => { this.appendArray = []; });
        }
    }

    handleUserSelection(message) {
        this.setState({
            fromDate: message.from,
            toDate: message.to,
        }, this.assembleQuery);
    }

    assembleQuery() {
        this.sendQuery(0);
    }

    sendQuery(queryIndex) {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
        const dataProviderConfigs = _.cloneDeep(this.state.providerConfig);
        const query = dataProviderConfigs.configs.config.queryData.query
            .replace('{{durationRange}}', templateFillers[queryIndex].durationRange)
            .replace('{{startTimestampRange}}', templateFillers[queryIndex].startTimestampRange)
            .replace('{{endTimestampRange}}', templateFillers[queryIndex].endTimestampRange)
            .replace('{{duration}}', templateFillers[queryIndex].duration)
            .replace('{{from}}', this.state.fromDate)
            .replace('{{to}}', this.state.toDate)
            .replace('{{now}}', new Date().getTime());
        dataProviderConfigs.configs.config.queryData.query = query;

        super.getWidgetChannelManager()
            .subscribeWidget(this.props.id + queryIndex, this.handleDataReceived, dataProviderConfigs);
    }

    render() {
        if (this.state.data.length) {
            const maxDataPoint = _.maxBy(this.state.data, element => element[1]);
            this.chartConfig.yDomain = [0, maxDataPoint[1]];
        }

        return (
            <MuiThemeProvider muiTheme={this.props.muiTheme}>
                <VizG
                    config={this.chartConfig}
                    metadata={this.state.metadata}
                    data={this.state.data}
                    height={this.state.height}
                    width={this.state.width}
                    theme={this.props.muiTheme.name}
                />
            </MuiThemeProvider>
        );
    }
}
global.dashboard.registerWidget('IsAnalyticsSessionCount', IsAnalyticsSessionCount);
