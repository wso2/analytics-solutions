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

class IsAnalyticsSessionCountOverTime extends Widget {
    constructor(props) {
        super(props);

        this.ChartConfig = {
            x: 'timestamp',
            charts: [
                {
                    type: 'line',
                    y: 'Active',
                    fill: '#1aa3ff',
                },
                {
                    type: 'line',
                    y: 'New',
                    fill: '#ff7f0e',
                },
                {
                    type: 'line',
                    y: 'Terminated',
                    fill: '#00e600',
                },
            ],
            maxLength: 10,
            yAxisLabel: 'Session Count',
            xAxisLabel: 'Time',
            legend: true,
            append: false,
            brush: true,
        };

        this.metadata = {
            names: ['timestamp', 'Active', 'New', 'Terminated'],
            types: ['ordinal', 'linear', 'linear', 'linear'],
        };

        this.state = {
            data: [],
            metadata: this.metadata,
            ChartConfig: this.ChartConfig,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
        };

        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.handleUserSelection = this.handleUserSelection.bind(this);
        this.assembleQuery = this.assembleQuery.bind(this);
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
        const { metadata, data } = message;
        metadata.types[0] = 'TIME';
        this.setState({
            metadata,
            data,
        });

        this.setState((prevState) => {
            const ChartConfig = _.cloneDeep(prevState.ChartConfig);
            switch (prevState.per) {
                case 'minute':
                    ChartConfig.tipTimeFormat = '%d/%m/%Y %H:%M:%S';
                    break;
                case 'hour':
                    ChartConfig.tipTimeFormat = '%d/%m/%Y %H:%M:%S';
                    break;
                case 'day':
                    ChartConfig.tipTimeFormat = '%d/%m/%Y';
                    break;
                default:
                    // This will never hit
            }
            return { ChartConfig };
        });
    }


    handleUserSelection(message) {
        this.setState({
            per: message.granularity,
            fromDate: message.from,
            toDate: message.to,
        }, this.assembleQuery);
    }

    assembleQuery() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
        const dataProviderConfigs = _.cloneDeep(this.state.providerConfig);
        let { query } = dataProviderConfigs.configs.config.queryData;
        query = query
            .replace('{{per}}', this.state.per)
            .replace('{{from}}', this.state.fromDate)
            .replace('{{to}}', this.state.toDate);
        dataProviderConfigs.configs.config.queryData.query = query;
        super.getWidgetChannelManager()
            .subscribeWidget(this.props.id, this.handleDataReceived, dataProviderConfigs);
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={this.props.muiTheme}>
                <VizG
                    config={this.state.ChartConfig}
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
global.dashboard.registerWidget('IsAnalyticsSessionCountOverTime', IsAnalyticsSessionCountOverTime);
