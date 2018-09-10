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
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import _ from 'lodash';
import JssProvider from 'react-jss/lib/JssProvider';
import Typography from '@material-ui/core/Typography';

const colorWhite = '#FFFFFF';
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

const colorScaleSuccess = [
    colorWhite,
    colorGreen,
];

const colorScaleFailure = [
    colorWhite,
    colorRed,
];

const metadata = {
    names: ['region', 'Count'],
    types: ['ordinal', 'linear'],
};

const chartConfig = {
    type: 'map',
    x: 'region',
    charts: [
        {
            type: 'map',
            y: 'Count',
            mapType: 'world',
            colorScale: colorScaleSuccess,
        },
    ],
    chloropethRangeLowerbound: [0],
};

// This is the workaround suggested in https://github.com/marmelab/react-admin/issues/1782

const escapeRegex = /([[\].#*$><+~=|^:(),"'`\s])/g;
let classCounter = 0;


// This is not the default export
// eslint-disable-next-line import/prefer-default-export
export const generateClassName = (rule, styleSheet) => {
    classCounter += 1;

    if (process.env.NODE_ENV === 'production') {
        return `c${classCounter}`;
    }

    if (styleSheet && styleSheet.options.classNamePrefix) {
        let prefix = styleSheet.options.classNamePrefix;
        // Sanitize the string as will be used to prefix the generated class name.
        prefix = prefix.replace(escapeRegex, '-');

        if (prefix.match(/^Mui/)) {
            return `${prefix}-${rule.key}`;
        }

        return `${prefix}-${rule.key}-${classCounter}`;
    }

    return `${rule.key}-${classCounter}`;
};

class IsAnalyticsLoginAttemptsMap extends Widget {
    constructor(props) {
        super(props);

        this.state = {
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,

            chartConfig,
            data: [],
            metadata,
            dataProviderConf: null,
            isDataProviderConfigFault: false,
            options: this.props.configs.options,
            isFailureMap: false,
            switchLabel: 'Success',
        };

        this.handleReceivedData = this.handleReceivedData.bind(this);
        this.onReceivingMessage = this.onReceivingMessage.bind(this);
        this.assembleQuery = this.assembleQuery.bind(this);

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
                }, super.subscribe(this.onReceivingMessage));
            })
            .catch(() => {
                this.setState({
                    isDataProviderConfigFault: true,
                });
            });
    }

    componentWillUnmount() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
    }

    onReceivingMessage(message) {
        if (message.header === 'additionalFilterConditions') {
            if (message.body === '') {
                this.setState({
                    additionalFilterConditions: undefined,
                }, () => this.assembleQuery());
            } else {
                this.setState({
                    additionalFilterConditions: message.body,
                }, () => this.assembleQuery());
            }
        } else {
            this.setState({
                per: message.granularity,
                fromDate: message.from,
                toDate: message.to,
            }, () => this.assembleQuery());
        }
    }

    assembleQuery() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);

        const dataProviderConfig = _.cloneDeep(this.state.dataProviderConf);
        const { query } = dataProviderConfig.configs.config.queryData;
        let filterCondition = " on identityProviderType=='{{idpType}}' ";
        let additionalFilters = '';
        let countType = '';
        let doFilter = false;
        let doAdditionalFilter = false;

        if (this.state.additionalFilterConditions !== undefined) {
            const additionalFilterConditionsClone = _.cloneDeep(this.state.additionalFilterConditions);

            for (const key in additionalFilterConditionsClone) {
                if (additionalFilterConditionsClone[key] !== '') {
                    if (key === 'role') {
                        additionalFilters = additionalFilters
                            + " and str:contains(rolesCommaSeparated, '" + additionalFilterConditionsClone[key] + "') ";
                    } else if (key === 'isFirstLogin') {
                        additionalFilters = additionalFilters
                            + ' and ' + key + '==' + additionalFilterConditionsClone[key] + ' ';
                    } else {
                        additionalFilters = additionalFilters
                            + ' and ' + key + "=='" + additionalFilterConditionsClone[key] + "' ";
                    }
                }
            }
            doAdditionalFilter = true;
        }

        if (this.state.isFailureMap) {
            countType = 'authFailureCount';
        } else if (this.state.options.widgetType === 'Local') {
            countType = 'authSuccessCount';
        } else {
            countType = 'authStepSuccessCount';
        }

        if (this.state.options.widgetType === 'Local') {
            filterCondition = filterCondition.replace('{{idpType}}', 'LOCAL');
            doFilter = true;
        } else if (this.state.options.widgetType === 'Federated') {
            filterCondition = filterCondition.replace('{{idpType}}', 'FEDERATED');
            doFilter = true;
        }

        let updatedQuery = query
            .replace('{{per}}', this.state.per)
            .replace('{{from}}', this.state.fromDate)
            .replace('{{to}}', this.state.toDate)
            .replace(/{{countType}}/g, countType);

        if (doFilter && doAdditionalFilter) {
            filterCondition += additionalFilters;
            updatedQuery = updatedQuery.replace('{{filterCondition}}', filterCondition);
        } else if (doFilter) {
            updatedQuery = updatedQuery.replace('{{filterCondition}}', filterCondition);
        } else if (doAdditionalFilter) {
            filterCondition = additionalFilters.replace(' and ', ' on ');
            updatedQuery = updatedQuery.replace('{{filterCondition}}', filterCondition);
        } else {
            updatedQuery = updatedQuery.replace('{{filterCondition}}', '');
        }

        dataProviderConfig.configs.config.queryData.query = updatedQuery;
        super.getWidgetChannelManager().subscribeWidget(this.props.id, this.handleReceivedData, dataProviderConfig);
    }

    handleReceivedData(message) {
        this.setState({
            data: message.data,
        });
    }

    onMapTypeChange(event) {
        // eslint-disable-next-line react/no-access-state-in-setstate
        const chartConfigClone = _.cloneDeep(this.state.chartConfig);
        let switchLabel = '';
        let isFailureMap = false;

        if (event.target.checked) {
            chartConfigClone.charts[0].colorScale = colorScaleFailure;
            switchLabel = 'Failure';
            isFailureMap = true;
        } else {
            chartConfigClone.charts[0].colorScale = colorScaleSuccess;
            switchLabel = 'Success';
        }

        this.setState({
            isFailureMap,
            chartConfig: chartConfigClone,
            switchLabel,
        }, () => this.assembleQuery());
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
                <JssProvider generateClassName={generateClassName}>
                    <MuiThemeProvider theme={theme}>
                        <div style={divSpacings}>
                            <div style={{ height: height * 0.1, width: width * 0.9 }}>
                                <Typography
                                    variant="title"
                                    gutterBottom
                                    align="center"
                                >
                                    Login Attempts Map
                                </Typography>
                            </div>
                            <Typography variant="body1" gutterBottom align="center">
                                Unable to fetch data, please check the data provider configurations.
                            </Typography>
                        </div>
                    </MuiThemeProvider>
                </JssProvider>
            );
        }
        return (
            <JssProvider generateClassName={generateClassName}>
                <MuiThemeProvider theme={theme}>
                    <div style={divSpacings}>
                        <div style={{ height: height * 0.1, width: width * 0.9 }}>
                            <Typography
                                variant="title"
                                gutterBottom
                                align="center"
                            >
                                Login Attempts Map
                            </Typography>
                        </div>
                        <div style={{ height: height * 0.6, width: width * 0.9 }}>
                            <VizG
                                config={this.state.chartConfig}
                                metadata={this.state.metadata}
                                data={this.state.data}
                            />
                        </div>
                        <div style={{ height: height * 0.2, width: width * 0.9 }}>
                            <FormControlLabel
                                control={(
                                    <Switch
                                        checked={this.state.isFailureMap}
                                        onChange={event => this.onMapTypeChange(event)}
                                    />
                                )}
                                label={this.state.switchLabel}
                            />
                        </div>
                    </div>
                </MuiThemeProvider>
            </JssProvider>
        );
    }
}

global.dashboard.registerWidget('IsAnalyticsLoginAttemptsMap', IsAnalyticsLoginAttemptsMap);
