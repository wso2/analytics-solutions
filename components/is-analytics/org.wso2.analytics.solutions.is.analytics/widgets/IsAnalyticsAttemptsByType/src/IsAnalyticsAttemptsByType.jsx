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
import Widget from '@wso2-dashboards/widget';
import VizG from 'react-vizgrammar';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { MuiThemeProvider as V0MuiThemeProvider } from 'material-ui';
import _ from 'lodash';
import Pagination from 'material-ui-pagination';
import Typography from '@material-ui/core/Typography';

const colorGreen = '#6ED460';
const colorRed = '#EC5D40';

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
});

const lightTheme = createMuiTheme({
    palette: {
        type: 'light',
    },
});

const messageHeading = 'barChartFilter';
const dataPerPage = 10;
const noOfPagesInPaginationNavigation = 5;

const successMetadata = {
    names: ['username', 'authStepSuccessCount'],
    types: ['ordinal', 'linear'],
};

const failureMetadata = {
    names: ['username', 'authFailureCount'],
    types: ['ordinal', 'linear'],
};

const chartConfigSuccess = {
    x: 'username',
    charts: [
        {
            type: 'bar',
            orientation: 'left',
            y: 'authStepSuccessCount',
            fill: colorGreen,
        },
    ],
    yAxisLabel: 'Successful Attempts',
    xAxisLabel: 'Username',
    yAxisTickCount: 10,
    linearSeriesStep: 1,
    append: false,
};

const chartConfigFailure = {
    x: 'username',
    charts: [
        {
            type: 'bar',
            orientation: 'left',
            y: 'authFailureCount',
            fill: colorRed,
        },
    ],
    yAxisLabel: 'Failure Attempts',
    xAxisLabel: 'Username',
    yAxisTickCount: 10,
    linearSeriesStep: 1,
    append: false,
};

class IsAnalyticsAttemptsByType extends Widget {
    constructor(props) {
        super(props);

        this.state = {
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,

            chartConfigSuccess,
            chartConfigFailure,
            successData: [],
            failureData: [],
            currentSuccessDataSet: [],
            currentFailureDataSet: [],
            successMetadata,
            failureMetadata,
            options: this.props.configs.options,
            currentSuccessPageNumber: 1,
            currentFailurePageNumber: 1,
            dataProviderConf: null,
            isDataProviderConfigFault: false,
        };

        this.handleReceivedSuccessData = this.handleReceivedSuccessData.bind(this);
        this.handleReceivedFailureData = this.handleReceivedFailureData.bind(this);
        this.assembleQuery = this.assembleQuery.bind(this);
        this.onReceivingMessage = this.onReceivingMessage.bind(this);
        this.updateTable = this.updateTable.bind(this);

        this.props.glContainer.on('resize', () => this.setState({
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
        }));
    }

    componentDidMount() {
        const successMetadataClone = _.cloneDeep(successMetadata);
        const failureMetadataClone = _.cloneDeep(failureMetadata);
        const chartConfigSuccessClone = _.cloneDeep(chartConfigSuccess);
        const chartConfigFailureClone = _.cloneDeep(chartConfigFailure);

        let xAxisLabel = '';
        let xAxisValue = '';

        switch (this.state.options.xAxis) {
            case 'Service Provider':
                xAxisLabel = 'Service Provider';
                xAxisValue = 'serviceProvider';
                break;
            case 'User Store Domain':
                xAxisLabel = 'User Store Domain';
                xAxisValue = 'userStoreDomain';
                break;
            case 'Role':
                xAxisLabel = 'Role';
                xAxisValue = 'role';
                break;
            case 'Identity Provider':
                xAxisLabel = 'Identity Provider';
                xAxisValue = 'identityProvider';
                break;
            default:
                xAxisLabel = 'Username';
                xAxisValue = 'username';
        }

        const widgetPseudoId = this.state.options.widgetType + xAxisValue + '_failure';

        chartConfigSuccessClone.x = xAxisValue;
        chartConfigSuccessClone.xAxisLabel = xAxisLabel;
        chartConfigFailureClone.x = xAxisValue;
        chartConfigFailureClone.xAxisLabel = xAxisLabel;

        successMetadataClone.names[0] = xAxisValue;
        failureMetadataClone.names[0] = xAxisValue;

        if (this.state.options.widgetType === 'Local') {
            const value = 'authSuccessCount';
            successMetadataClone.names[1] = value;
            chartConfigSuccessClone.charts[0].y = value;
        } else {
            const value = 'authStepSuccessCount';
            successMetadataClone.names[1] = value;
            chartConfigSuccessClone.charts[0].y = value;
        }

        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                this.setState({
                    dataProviderConf: message.data.configs.providerConfig,
                    successMetadata: successMetadataClone,
                    failureMetadata: failureMetadataClone,
                    chartConfigSuccess: chartConfigSuccessClone,
                    chartConfigFailure: chartConfigFailureClone,
                    widgetPseudoId,
                }, () => super.subscribe(this.onReceivingMessage));
            })
            .catch(() => {
                this.setState({
                    isDataProviderConfigFault: true,
                });
            });
    }

    handleReceivedSuccessData(message) {
        this.updateTable(message.data, this.state.currentSuccessPageNumber, true);
    }

    handleReceivedFailureData(message) {
        this.updateTable(message.data, this.state.currentFailurePageNumber, false);
    }

    /*
     * Data is also passed into update table function to reduce the number of this.setState() calls.
     * Otherwise the resulting chart will get more cycles to update, which will left user in ambiguity.
     */
    updateTable(data, pageNumber, isSuccess) {
        const internalPageNumber = pageNumber - 1; // Internally pages are counted from 0.

        const startPoint = internalPageNumber * dataPerPage;
        let endPoint = startPoint + dataPerPage;
        const totalPageCount = Math.ceil(data.length / dataPerPage);

        if (isSuccess) {
            const dataLength = data.length;

            if (endPoint > dataLength) {
                endPoint = dataLength;
            }
            const dataSet = data.slice(startPoint, endPoint);

            this.setState({
                successData: data,
                currentSuccessDataSet: dataSet,
                currentSuccessPageNumber: pageNumber,
                successPageCount: totalPageCount,
            });
        } else {
            const dataLength = data.length;

            if (endPoint > dataLength) {
                endPoint = dataLength;
            }
            const dataSet = data.slice(startPoint, endPoint);

            this.setState({
                failureData: data,
                currentFailureDataSet: dataSet,
                currentFailurePageNumber: pageNumber,
                failurePageCount: totalPageCount,
            });
        }
    }

    onReceivingMessage(message) {
        if (message.header === 'additionalFilterConditions') {
            if (message.body === '') {
                this.setState({
                    additionalFilterConditions: undefined,
                }, this.assembleQuery);
            } else {
                this.setState({
                    additionalFilterConditions: message.body,
                }, this.assembleQuery);
            }
        } else {
            this.setState({
                per: message.granularity,
                fromDate: message.from,
                toDate: message.to,
            }, () => {
                this.assembleQuery();
            });
        }
    }

    assembleQuery() {
        super.getWidgetChannelManager()
            .unsubscribeWidget(this.props.id);
        const dataProviderConfigsSuccess = _.cloneDeep(this.state.dataProviderConf);
        let { query } = dataProviderConfigsSuccess.configs.config.queryData;
        let countType = 'authStepSuccessCount';
        let filterCondition = ' on ';
        let idpFilter = ' identityProviderType==\'{{idpType}}\' ';
        let additionalFilters = '';
        let doIdpFilter = false;
        let xAxisValue = '';
        let aggregationName = 'AuthenticationStatAggregation';
        let doAdditionalFilter = false;

        switch (this.state.options.xAxis) {
            case 'Service Provider':
                xAxisValue = 'serviceProvider';
                break;
            case 'User Store Domain':
                xAxisValue = 'userStoreDomain';
                break;
            case 'Role':
                aggregationName = 'RoleAggregation';
                xAxisValue = 'role';
                break;
            case 'Identity Provider':
                xAxisValue = 'identityProvider';
                break;
            default:
                xAxisValue = 'username';
        }

        if (this.state.additionalFilterConditions !== undefined) {
            const additionalFilterConditionsClone = _.cloneDeep(this.state.additionalFilterConditions);

            for (const key in additionalFilterConditionsClone) {
                if (Object.hasOwnProperty.call(additionalFilterConditionsClone, key)) {
                    if (additionalFilterConditionsClone[key] !== '') {
                        if (key === 'role') {
                            if (this.state.options.xAxis === 'Role') {
                                additionalFilters = additionalFilters
                                    + ' and ' + key + '== \'' + additionalFilterConditionsClone[key] + '\'';
                            } else {
                                additionalFilters = additionalFilters
                                    + ' and str:contains(rolesCommaSeparated, \''
                                    + additionalFilterConditionsClone[key]
                                    + '\')';
                            }
                        } else if (key === 'isFirstLogin') {
                            additionalFilters = additionalFilters
                                + ' and ' + key + '==' + additionalFilterConditionsClone[key] + ' ';
                        } else {
                            additionalFilters = additionalFilters
                                + ' and ' + key + '==\'' + additionalFilterConditionsClone[key] + '\' ';
                        }
                    }
                }
            }
            doAdditionalFilter = true;
        }

        if (this.state.options.widgetType === 'Local') {
            countType = 'authSuccessCount';
        } else {
            countType = 'authStepSuccessCount';
        }

        if (this.state.options.widgetType === 'Local') {
            idpFilter = idpFilter.replace('{{idpType}}', 'LOCAL');
            doIdpFilter = true;
        } else if (this.state.options.widgetType === 'Federated') {
            idpFilter = idpFilter.replace('{{idpType}}', 'FEDERATED');
            doIdpFilter = true;
        }

        if (doIdpFilter) {
            filterCondition += idpFilter;
        }

        if (doAdditionalFilter) {
            filterCondition += additionalFilters;
        }

        if (doIdpFilter && doAdditionalFilter) {
            query = query.replace('{{filterCondition}}', filterCondition);
        } else if (doIdpFilter) {
            query = query.replace('{{filterCondition}}', filterCondition);
        } else if (doAdditionalFilter) {
            filterCondition = additionalFilters.replace(' and ', ' on ');
            query = query.replace('{{filterCondition}}', filterCondition);
        } else {
            query = query.replace('{{filterCondition}}', '');
        }

        query = query
            .replace('{{per}}', this.state.per)
            .replace('{{from}}', this.state.fromDate)
            .replace('{{to}}', this.state.toDate)
            .replace('{{AggregationName}}', aggregationName)
            .replace(/{{xAxisValue}}/g, xAxisValue);

        const querySuccess = query.replace(/{{yAxisValue}}/g, countType);
        dataProviderConfigsSuccess.configs.config.queryData.query = querySuccess;

        super.getWidgetChannelManager()
            .subscribeWidget(this.props.id,
                this.handleReceivedSuccessData, dataProviderConfigsSuccess);

        super.getWidgetChannelManager()
            .unsubscribeWidget(this.state.widgetPseudoId);

        const dataProviderConfigsFailure = _.cloneDeep(this.state.dataProviderConf);
        const queryFailure = query
            .replace()
            .replace(/{{yAxisValue}}/g, 'authFailureCount');
        dataProviderConfigsFailure.configs.config.queryData.query = queryFailure;
        super.getWidgetChannelManager()
            .subscribeWidget(this.state.widgetPseudoId,
                this.handleReceivedFailureData, dataProviderConfigsFailure);
    }

    onChartClick(data) {
        const message = {
            header: messageHeading,
            title: this.state.chartConfigFailure.x,
            value: data[this.state.chartConfigFailure.x],
        };
        super.publish(message);
    }

    render() {
        const { width } = this.state;
        const { height } = this.state;
        const divSpacings = {
            paddingLeft: width * 0.05,
            paddingRight: width * 0.05,
            paddingTop: height * 0.05,
            paddingBottom: height * 0.05,
            height,
            width,
        };

        let theme = darkTheme;

        if (this.props.muiTheme.name === 'light') {
            theme = lightTheme;
        }

        if (this.state.isDataProviderConfigFault) {
            return (
                <MuiThemeProvider theme={theme}>
                    <div style={divSpacings}>
                        <Typography variant="body1" gutterBottom align="center">
                            Unable to fetch data from Siddhi data provider,
                            Please check the data provider configurations.
                        </Typography>
                    </div>
                </MuiThemeProvider>
            );
        } else if (this.state.currentSuccessDataSet.length === 0 && this.state.currentFailureDataSet.length > 0) {
            return (
                <MuiThemeProvider theme={theme}>
                    <div style={divSpacings}>
                        <div style={{ height: height * 0.8, width: width * 0.9 }}>
                            <VizG
                                config={this.state.chartConfigFailure}
                                metadata={this.state.failureMetadata}
                                data={this.state.currentFailureDataSet}
                                onClick={data => this.onChartClick(data)}
                            />
                        </div>
                        <div style={{ height: height * 0.1, width: width * 0.9 }}>
                            <V0MuiThemeProvider muiTheme={this.props.muiTheme}>
                                {
                                    this.state.failureData.length > dataPerPage
                                    && (
                                        <Pagination
                                            total={this.state.failurePageCount}
                                            current={this.state.currentFailurePageNumber}
                                            display={noOfPagesInPaginationNavigation}
                                            onChange={
                                                number => this.updateTable(this.state.failureData, number, false)
                                            }
                                            style={{ float: 'center' }}
                                        />
                                    )
                                }
                            </V0MuiThemeProvider>
                        </div>
                    </div>
                </MuiThemeProvider>
            );
        } else if (this.state.currentFailureDataSet.length === 0 && this.state.currentSuccessDataSet.length > 0) {
            return (
                <MuiThemeProvider theme={theme}>
                    <div style={divSpacings}>
                        <div style={{ height: height * 0.8, width: width * 0.9 }}>
                            <VizG
                                config={this.state.chartConfigSuccess}
                                metadata={this.state.successMetadata}
                                data={this.state.currentSuccessDataSet}
                                onClick={data => this.onChartClick(data)}
                            />
                        </div>
                        <div style={{ height: height * 0.1, width: width * 0.9 }}>
                            <V0MuiThemeProvider muiTheme={this.props.muiTheme}>
                                {
                                    this.state.successData.length > dataPerPage
                                    && (
                                        <Pagination
                                            total={this.state.successPageCount}
                                            current={this.state.currentSuccessPageNumber}
                                            display={noOfPagesInPaginationNavigation}
                                            onChange={
                                                number => this.updateTable(this.state.successData, number, true)
                                            }
                                            style={{ float: 'center' }}
                                        />
                                    )
                                }
                            </V0MuiThemeProvider>
                        </div>
                    </div>
                </MuiThemeProvider>
            );
        } else {
            return (
                <MuiThemeProvider theme={theme}>
                    <div style={divSpacings}>
                        <div style={{ height: height * 0.5, width: width * 0.9 }}>
                            <div style={{ height: height * 0.4, width: width * 0.9 }}>
                                <VizG
                                    config={this.state.chartConfigSuccess}
                                    metadata={this.state.successMetadata}
                                    data={this.state.currentSuccessDataSet}
                                    onClick={data => this.onChartClick(data)}
                                />
                            </div>
                            <div style={{ height: height * 0.1, width: width * 0.9 }}>
                                <V0MuiThemeProvider muiTheme={this.props.muiTheme}>
                                    {
                                        this.state.successData.length > dataPerPage
                                        && (
                                            <Pagination
                                                total={this.state.successPageCount}
                                                current={this.state.currentSuccessPageNumber}
                                                display={noOfPagesInPaginationNavigation}
                                                onChange={
                                                    number => this.updateTable(this.state.successData, number, true)
                                                }
                                                style={{ float: 'center' }}
                                            />
                                        )
                                    }
                                </V0MuiThemeProvider>
                            </div>
                        </div>
                        <div style={{ height: height * 0.5, width: width * 0.9 }}>
                            <div style={{ height: height * 0.4, width: width * 0.9 }}>
                                <VizG
                                    config={this.state.chartConfigFailure}
                                    metadata={this.state.failureMetadata}
                                    data={this.state.currentFailureDataSet}
                                    onClick={data => this.onChartClick(data)}
                                />
                            </div>
                            <div style={{ height: height * 0.1, width: width * 0.9 }}>
                                <V0MuiThemeProvider muiTheme={this.props.muiTheme}>
                                    {
                                        this.state.failureData.length > dataPerPage
                                        && (
                                            <Pagination
                                                total={this.state.failurePageCount}
                                                current={this.state.currentFailurePageNumber}
                                                display={noOfPagesInPaginationNavigation}
                                                onChange={
                                                    number => this.updateTable(this.state.failureData, number, false)
                                                }
                                                style={{ float: 'center' }}
                                            />
                                        )
                                    }
                                </V0MuiThemeProvider>
                            </div>
                        </div>
                    </div>
                </MuiThemeProvider>
            );
        }
    }
}

global.dashboard.registerWidget('IsAnalyticsAttemptsByType', IsAnalyticsAttemptsByType);
