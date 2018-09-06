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
import Pagination from 'material-ui-pagination';

const dataPerPage = 10;

class IsAnalyticsTopLongestSession extends Widget {
    constructor(props) {
        super(props);

        this.chartConfig = {
            x: 'username',
            charts: [
                {
                    type: 'bar',
                    y: 'duration',
                    color: 'sessionId',
                    colorScale: ['#00e600'],
                    orientation: 'left',
                },
            ],
            yAxisLabel: ' Duration (s)',
            xAxisLabel: 'Username',
            maxLength: 10,
            legend: false,
            append: false,
        };

        this.metadata = {
            names: ['sessionId', 'username', 'duration'],
            types: ['ordinal', 'ordinal', 'linear'],
        };

        this.state = {
            data: [],
            metadata: this.metadata,
            chartConfig: this.chartConfig,
            providerConfig: null,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            currentDataSet: [],
            currentPageNumber: 1,
        };

        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.handleUserSelection = this.handleUserSelection.bind(this);
        this.assembleQuery = this.assembleQuery.bind(this);
        this.updateTable = this.updateTable.bind(this);
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
        message.data = message.data.reverse();
        this.updateTable(message.data, this.state.currentPageNumber);
    }

    updateTable(data, pageNumber) {
        const internalPageNumber = pageNumber - 1;
        const startPoint = internalPageNumber * dataPerPage;
        let endPoint = startPoint + dataPerPage;
        const totalPageCount = Math.ceil(data.length / dataPerPage);
        const dataLength = data.length;
        if (endPoint > dataLength) {
            endPoint = dataLength;
        }
        const dataSet = data.slice(startPoint, endPoint);

        this.setState({
            data,
            currentDataSet: dataSet,
            currentPageNumber: pageNumber,
            pageCount: totalPageCount,
        });
    }

    handleUserSelection(message) {
        this.setState({
            fromDate: message.from,
            toDate: message.to,
        }, this.assembleQuery);
    }

    assembleQuery() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
        const dataProviderConfigs = _.cloneDeep(this.state.providerConfig);
        let { query } = dataProviderConfigs.configs.config.queryData;
        query = query
            .replace('{{from}}', this.state.fromDate)
            .replace('{{to}}', this.state.toDate)
            .replace('{{now}}', new Date().getTime());
        dataProviderConfigs.configs.config.queryData.query = query;
        super.getWidgetChannelManager()
            .subscribeWidget(this.props.id, this.handleDataReceived, dataProviderConfigs);
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={this.props.muiTheme}>
                <div>
                    <VizG
                        config={this.state.chartConfig}
                        metadata={this.state.metadata}
                        data={this.state.currentDataSet}
                        height={this.state.height * 0.9}
                        width={this.state.width}
                        theme={this.props.muiTheme.name}
                    />
                    <Pagination
                        total={this.state.pageCount}
                        current={this.state.currentPageNumber}
                        display={3}
                        onChange={number => this.updateTable(this.state.data, number)}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}
global.dashboard.registerWidget('IsAnalyticsTopLongestSession', IsAnalyticsTopLongestSession);
