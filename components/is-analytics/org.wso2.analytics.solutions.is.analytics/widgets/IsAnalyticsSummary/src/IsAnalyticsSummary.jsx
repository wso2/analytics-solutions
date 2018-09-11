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
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const bodyTexts = {
    Overall: 'Analyze overall login attempts made via WSO2 Identity Server. '
        + 'This includes information about overall flows of authentication took place through Identity Server.'
        + 'A collection of authentication steps is considered as an overall attempt',
    Local: 'Analyze local login attempts made via WSO2 Identity Server. '
        + 'Local login attempts include all login attempts which are done through resident IDP.'
        + 'These statistics will give an idea on the involvement of resident IDP in an authentication flow.',
    Federated: 'Analyze federated login attempts made via WSO2 Identity Server.'
        + 'This will give an idea about the authentication steps took place via federated identity providers.',
};

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
    names: ['totalLoginAttempts'],
    types: ['linear'],
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

class IsAnalyticsSummary extends Widget {
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
            isProviderConfigFault: false,
            totalAttempts: 0,
        };

        this.handleReceivedData = this.handleReceivedData.bind(this);
        this.assembleQuery = this.assembleQuery.bind(this);
        this.onReceivingMessage = this.onReceivingMessage.bind(this);
        this.getSeeMoreLink = this.getSeeMoreLink.bind(this);

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
                    isProviderConfigFault: true,
                });
            });
    }

    componentWillUnmount() {
        super.getWidgetChannelManager()
            .unsubscribeWidget(this.props.id);
    }

    getSeeMoreLink() {
        let { pathname } = window.location;
        let seeMoreLink = '';

        const pathnameArray = pathname.split('/');
        pathnameArray.pop();
        pathname = pathnameArray.join('/');
        if (this.props.configs.options.widgetType === 'Local') {
            seeMoreLink = pathname + '/local';
        } else if (this.props.configs.options.widgetType === 'Federated') {
            seeMoreLink = pathname + '/federated';
        } else {
            seeMoreLink = pathname + '/overall';
        }

        return seeMoreLink;
    }

    handleReceivedData(message) {
        if (message.data.length > 0) {
            const totalAttempts = parseInt(message.data[0][0], 10) + parseInt(message.data[0][1]);
            const successPercentage = parseFloat(parseInt(message.data[0][1], 10) * 100 / totalAttempts)
                .toFixed(2);
            const failurePercentage = parseFloat(parseInt(message.data[0][0], 10) * 100 / totalAttempts)
                .toFixed(2);

            this.setState({
                successPercentage,
                failurePercentage,
                totalAttempts,
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

            });
        }
    }

    onReceivingMessage(message) {
        this.setState({
            per: message.granularity,
            fromDate: message.from,
            toDate: message.to,
            numChartData,
            totalAttempts: 0,
            successPercentage: 0,
            failurePercentage: 0,
        }, this.assembleQuery);
    }

    assembleQuery() {
        super.getWidgetChannelManager()
            .unsubscribeWidget(this.props.id);
        const dataProviderConfigs = _.cloneDeep(this.state.dataProviderConf);
        let { query } = dataProviderConfigs.configs.config.queryData;

        if (this.props.configs.options.widgetType === 'Local') {
            query = dataProviderConfigs.configs.config.queryData.queryLocal;
        } else if (this.props.configs.options.widgetType === 'Federated') {
            query = dataProviderConfigs.configs.config.queryData.queryFederated;
        }
        query = query
            .replace('{{per}}', this.state.per)
            .replace('{{from}}', this.state.fromDate)
            .replace('{{to}}', this.state.toDate);

        dataProviderConfigs.configs.config.queryData.query = query;
        super.getWidgetChannelManager()
            .subscribeWidget(this.props.id, this.handleReceivedData, dataProviderConfigs);
    }

    render() {
        const { height } = this.state;
        const { width } = this.state;
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

        if (this.state.isProviderConfigFault) {
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
                        height: height * 0.15,
                        width: width * 0.9,
                    }}
                    >
                        <Typography variant="body1" gutterBottom align="center">
                            {bodyTexts[this.props.configs.options.widgetType]}
                        </Typography>
                    </div>
                    <div style={{
                        height: height * 0.3,
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
                    <div style={{
                        height: height * 0.3,
                        width: width * 0.9,
                    }}
                    >
                        {
                            this.state.totalAttempts > 0
                            && (
                                <div>
                                    <div style={{
                                        height: height * 0.1,
                                        width: width * 0.9,
                                        'text-align': 'center',
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
                                    <div
                                        style={{
                                            height: height * 0.2,
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
                    <div style={{
                        height: height * 0.1,
                        width: width * 0.9,
                    }}
                    >
                        <a href={this.getSeeMoreLink()}>
                            <Button color="primary" variant="outlined" component="span" style={{ float: 'right' }}>
                                <Typography
                                    variant="button"
                                    gutterBottom
                                >
                                    See More >>
                                </Typography>
                            </Button>
                        </a>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}

global.dashboard.registerWidget('IsAnalyticsSummary', IsAnalyticsSummary);
