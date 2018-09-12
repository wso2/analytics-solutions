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
import _ from 'lodash';
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

const pieChartMetadata = {
    names: ['attemptType', 'attemptCount'],
    types: ['ordinal', 'linear'],
};

const numChartMetadata = {
    names: [
        'totalLoginAttempts',
    ],
    types: [
        'linear',
    ],
};

const numChartData = [
    [0],
    [0],
];

const pieChartConfig = {
    charts: [
        {
            type: 'arc',
            x: 'attemptCount',
            color: 'attemptType',
            mode: 'donut',
            colorScale: [colorRed, colorGreen],
        },
    ],
    legend: false,
};

const numChartConfig = {
    x: 'totalLoginAttempts',
    title: 'Total Login Attempts',
    charts: [
        {
            type: 'number',
        },
    ],
    showDifference: false,
    showPercentage: false,
    showDecimal: false,

};

class IsAnalyticsCompactSummary extends Widget {
    constructor(props) {
        super(props);

        this.state = {
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,

            pieChartConfig,
            pieChartData: [],
            pieChartMetadata,
            numChartConfig,
            numChartData,
            numChartMetadata,
            dataProviderConf: null,
            isDataProviderConfigFault: false,
            options: this.props.configs.options,
            totalAttempts: 0,
            successPercentage: 0,
            failurePercentage: 0,
        };

        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.assembleQuery = this.assembleQuery.bind(this);
        this.onReceivingMessage = this.onReceivingMessage.bind(this);

        this.props.glContainer.on('resize', () => this.setState({
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
        }));
    }

    componentDidMount() {
        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                this.setState({
                    dataProviderConf: message.data.configs.providerConfig,
                }, () => super.subscribe(this.onReceivingMessage));
            })
            .catch(() => {
                this.setState({
                    isDataProviderConfigFault: true,
                });
            });
    }

    handleDataReceived(message) {
        const totalAttempts = message.data[0][0] + message.data[0][1];

        const successPercentage = parseFloat(parseInt(message.data[0][1], 10) * 100 / totalAttempts)
            .toFixed(2);
        const failurePercentage = parseFloat(parseInt(message.data[0][0], 10) * 100 / totalAttempts)
            .toFixed(2);

        this.setState({
            pieChartData: [
                [
                    'Failure',
                    message.data[0][0],
                ],
                [
                    'Success',
                    message.data[0][1],
                ],
            ],
            numChartData: [
                [
                    message.data[0][1],
                ],
                [
                    message.data[0][0] + message.data[0][1],
                ],
            ],
            totalAttempts,
            successPercentage,
            failurePercentage,
        });
    }

    onReceivingMessage(message) {
        if (message.header === 'additionalFilterConditions') {
            this.setState({
                additionalFilterConditions: message.body === '' ? undefined : message.body,
                numChartData,
                successPercentage: 0,
                failurePercentage: 0,
                totalAttempts: 0,
            }, this.assembleQuery);
        } else {
            this.setState({
                per: message.granularity,
                fromDate: message.from,
                toDate: message.to,
                numChartData,
                successPercentage: 0,
                failurePercentage: 0,
                totalAttempts: 0,
            }, this.assembleQuery);
        }
    }

    assembleQuery() {
        super.getWidgetChannelManager()
            .unsubscribeWidget(this.props.id);
        const dataProviderConfigs = _.cloneDeep(this.state.dataProviderConf);
        let { query } = dataProviderConfigs.configs.config.queryData;
        let filterCondition = ' ';
        let doAdditionalFilter = false;

        if (this.state.additionalFilterConditions !== undefined) {
            const additionalFilterConditionsClone = _.cloneDeep(this.state.additionalFilterConditions);
            for (const key in additionalFilterConditionsClone) {
                if (Object.hasOwnProperty.call(additionalFilterConditionsClone, key)) {
                    if (additionalFilterConditionsClone[key] !== '') {
                        if (key === 'role') {
                            filterCondition = filterCondition
                                + ' and str:contains(rolesCommaSeparated, \''
                                + additionalFilterConditionsClone[key] + '\') ';
                        } else if (key === 'isFirstLogin') {
                            filterCondition = filterCondition
                                + ' and ' + key + '==' + additionalFilterConditionsClone[key] + ' ';
                        } else {
                            filterCondition = filterCondition
                                + ' and ' + key + '==\'' + additionalFilterConditionsClone[key] + '\' ';
                        }
                    }
                }
            }
            doAdditionalFilter = true;
        }

        if (this.state.options.widgetType === 'Local') {
            query = dataProviderConfigs.configs.config.queryData.queryLocal;
        } else if (this.state.options.widgetType === 'Federated') {
            query = dataProviderConfigs.configs.config.queryData.queryFederated;
        } else {
            filterCondition = filterCondition.replace(' and ', ' on ');
        }

        let updatedQuery = query
            .replace('{{per}}', this.state.per)
            .replace('{{from}}', this.state.fromDate)
            .replace('{{to}}', this.state.toDate);

        if (doAdditionalFilter) {
            updatedQuery = updatedQuery.replace('{{filterCondition}}', filterCondition);
        } else {
            updatedQuery = updatedQuery.replace('{{filterCondition}}', '');
        }

        dataProviderConfigs.configs.config.queryData.query = updatedQuery;
        super.getWidgetChannelManager()
            .subscribeWidget(this.props.id, this.handleDataReceived, dataProviderConfigs);
    }

    render() {
        const { height } = this.state;
        const { width } = this.state;
        const divSpacings = {
            paddingLeft: width * 0.05,
            paddingRight: width * 0.05,
            paddingTop: height * 0.05,
            paddingBottom: height * 0.05,
            display: 'flex',
            'flex-direction': 'column',
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
        }
        return (
            <MuiThemeProvider theme={theme}>
                <div style={divSpacings}>
                    <div style={{
                        height: height * 0.45,
                        width: width * 0.9,
                    }}
                    >
                        <VizG
                            config={numChartConfig}
                            metadata={this.state.numChartMetadata}
                            data={this.state.numChartData}
                            theme={this.props.muiTheme.name}
                        />
                    </div>
                    {
                        (this.state.totalAttempts !== 0)
                        && (
                            <div style={{
                                height: height * 0.55,
                                width: width * 0.9,
                            }}
                            >
                                <div style={{
                                    height: height * 0.05,
                                    width: width * 0.9,
                                }}
                                >
                                    <Typography
                                        variant="body1"
                                        gutterBottom
                                        align="center"
                                        style={{ color: colorGreen }}
                                    >
                                        Success:
                                        {this.state.successPercentage}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        gutterBottom
                                        align="center"
                                        style={{ color: colorRed }}
                                    >
                                        Failure:
                                        {this.state.failurePercentage}
                                    </Typography>
                                </div>
                                <div style={{
                                    height: height * 0.5,
                                    width: width * 0.9,
                                }}
                                >
                                    <VizG
                                        config={this.state.pieChartConfig}
                                        metadata={this.state.pieChartMetadata}
                                        data={this.state.pieChartData}
                                        theme={this.props.muiTheme.name}
                                    />
                                </div>
                            </div>
                        )
                    }
                </div>
            </MuiThemeProvider>
        );
    }
}

global.dashboard.registerWidget('IsAnalyticsCompactSummary', IsAnalyticsCompactSummary);
