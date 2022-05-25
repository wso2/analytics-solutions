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

class IsAnalyticsSessionMessages extends Widget {
    constructor(props) {
        super(props);

        this.chartConfig = {
            charts: [
                {
                    type: 'table',
                    columns: [
                        {
                            name: 'username',
                            title: 'Username',
                        },
                        {
                            name: 'startTime',
                            title: 'Start Time',
                        },
                        {
                            name: 'terminateTime',
                            title: 'Termination Time',
                        },
                        {
                            name: 'endTime',
                            title: 'End Time',
                        },
                        {
                            name: 'duration',
                            title: 'Duration (ms)',
                        },
                        {
                            name: 'isActive',
                            title: 'Is Active',
                        },
                        {
                            name: 'userstoreDomain',
                            title: 'User Store Domain',
                        },
                        {
                            name: 'tenantDomain',
                            title: 'Tenant Domain',
                        },
                        {
                            name: 'remoteIp',
                            title: 'Ip',
                        },
                        {
                            name: 'rememberMeFlag',
                            title: 'Remember Me Flag',
                        },
                        {
                            name: 'currentTime',
                            title: 'Timestamp',
                        },
                    ],
                },
            ],
            pagination: true,
            filterable: true,
            append: false,
            hideTotalPageCount: true,
        };

        this.metadata = {
            names: ['username', 'startTime', 'terminateTime', 'endTime', 'duration', 'isActive',
                'userstoreDomain', 'tenantDomain', 'remoteIp', 'rememberMeFlag', 'currentTime'],
            types: ['ordinal', 'ordinal', 'ordinal', 'ordinal', 'time', 'ordinal', 'ordinal',
                'ordinal', 'ordinal', 'ordinal', 'ordinal'],
        };

        this.state = {
            data: [],
            metadata: this.metadata,
            providerConfig: null,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            query: null,
            isPaginationEnabled: true,
            totalPages: Infinity,
            pageSize: null,
        };

        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.handleUserSelection = this.handleUserSelection.bind(this);
        this.assembleQuery = this.assembleQuery.bind(this);
        this.getData = this.getData.bind(this);
    }

    handleResize() {
        this.setState({ width: this.props.glContainer.width, height: this.props.glContainer.height });
    }

    componentDidMount() {
        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                this.setState({
                    providerConfig: message.data.configs.providerConfig,
                    isPaginationEnabled: message.data.configs.providerConfig.configs.config.isPaginationEnabled,
                    pageSize: message.data.configs.providerConfig.configs.config.pageSize,
                }, () => super.subscribe(this.handleUserSelection));
                this.chartConfig.hideTotalPageCount = message.data.configs.providerConfig.configs.config
                    .isPaginationEnabled;
            });
    }

    componentWillUnmount() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
    }

    handleDataReceived(message) {
        this.setState({
            metadata: message.metadata,
            data: message.data,
        });
        if (this.state.isPaginationEnabled) {
            if (message.data.length <= 1) {
                this.setState({
                    totalPages: 1,
                });
            } else {
                this.setState({
                    totalPages: Infinity,
                });
            }
        }
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
            .replace('{{to}}', this.state.toDate);
        dataProviderConfigs.configs.config.queryData.query = query;
        dataProviderConfigs.configs.config.pageSize = this.state.pageSize;
        this.setState({
            query,
        });
        super.getWidgetChannelManager()
            .subscribeWidget(this.props.id, this.handleDataReceived, dataProviderConfigs);
    }

    getData(pageSize, currentPage) {
        const dataProviderConfigs = _.cloneDeep(this.state.providerConfig);
        if (dataProviderConfigs) {
            dataProviderConfigs.configs.config.queryData.query = this.state.query;
            dataProviderConfigs.configs.config.pageSize = pageSize;
            dataProviderConfigs.configs.config.currentPage = currentPage;
            this.setState({
                pageSize,
            });
            super.getWidgetChannelManager().poll(this.props.id, this.handleDataReceived, dataProviderConfigs);
        }
    }

    render() {
        if (this.state.isPaginationEnabled) {
            return (
                <MuiThemeProvider muiTheme={this.props.muiTheme}>
                    <section style={{ paddingTop: 10 }}>
                        <VizG
                            config={this.chartConfig}
                            metadata={this.state.metadata}
                            data={this.state.data}
                            height={this.state.height}
                            width={this.state.width}
                            theme={this.props.muiTheme.name}
                            manual
                            pages={this.state.totalPages}
                            onFetchData={(state) => {
                                this.getData(state.pageSize, state.page);
                            }}
                        />
                    </section>
                </MuiThemeProvider>
            );
        }
        return (
            <MuiThemeProvider muiTheme={this.props.muiTheme}>
                <section style={{ paddingTop: 10 }}>
                    <VizG
                        config={this.chartConfig}
                        metadata={this.state.metadata}
                        data={this.state.data}
                        height={this.state.height}
                        width={this.state.width}
                        theme={this.props.muiTheme.name}
                    />
                </section>
            </MuiThemeProvider>
        );
    }
}
global.dashboard.registerWidget('IsAnalyticsSessionMessages', IsAnalyticsSessionMessages);
