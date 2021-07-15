/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, {Component} from 'react';
import Widget from '@wso2-dashboards/widget';
import VizG from 'react-vizgrammar';
import moment from 'moment';

const PAGE_PROXY = 'proxy';
const PAGE_OVERVIEW = 'overview';
const PAGE_API = 'api';
const PAGE_SEQUENCE = 'sequence';
const PAGE_ENDPOINT = 'endpoint';
const PAGE_INBOUND_ENDPOINT = 'inbound';
const PAGE_MEDIATOR = 'mediator';
const PUBLISHER_DATE_TIME_PICKER = "granularity";
const PUBLISHER_SEARCH_BOX = "selectedComponent";
const GRAPH_MIN_HEIGHT = '300';
const GRAPH_MIN_WIDTH = '300';

class EIAnalyticsStatsChart extends Widget {
    constructor(props) {
        super(props);

        this.state = {
            page: null,
            componentName: null,
            entryPoint: null,
            timeFrom: null,
            timeTo: null,
            timeUnit: null,
            totalCount: null,
            faultCount: null,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height
        };

        this.extractStatsData = this.extractStatsData.bind(this);
        this.handleStats = this.handleStats.bind(this);

        this.successChartConfig = {
            charts: [
                {
                    title: "Success",
                    type: "arc",
                    x: "torque",
                    color: "success",
                    colorScale: [
                        "#5CB85C",
                        "#353B48"
                    ]
                }
            ],
            percentage: true,
            width: 100,
            height: 100,
            "animate": true
        };

        this.faultChartConfig = {
            charts: [
                {
                    type: "arc",
                    x: "torque",
                    color: "success",
                    colorScale: [
                        "#D9534F",
                        "#353B48"
                    ]
                }
            ],
            percentage: true,
            width: 100,
            height: 100,
            "animate": true
        };

        this.metadata = {
            "names": ["rpm", "torque", "horsepower", "EngineType"],
            "types": ["linear", "linear", "ordinal", "ordinal"]
        };

        this.props.glContainer.on('resize', this.handleResize.bind(this));
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }

    componentDidMount() {
        this.setState({
            page: this.getCurrentPage()
        }, this.handleParameterChange);

        let entryPointValue = super.getGlobalState(getKey(this.getCurrentPage(), "entryPoint"));
        let selectedComponent = super.getGlobalState(getKey(this.getCurrentPage(), "id"));
        // If window url contains entryPoint, store it in the state
        if (entryPointValue && JSON.stringify(entryPointValue) !== "{}") {
            this.setState({
                entryPoint: entryPointValue,
                componentName: selectedComponent,
            }, this.handleParameterChange);
        }
        //this.extractStatsData("ALL", "ALL", null, -1234, "ESBStatAgg");
    }

    componentWillMount() {
        super.subscribe(this.handleRecievedMessage.bind(this));
    }

    handleParameterChange() {
        let pageName = this.getCurrentPage();
        if (this.state.timeFrom != null && this.state.timeTo != null && this.state.timeUnit != null) {
            if (pageName === PAGE_OVERVIEW) {
                /*
                componentType, componentName, entryPoint, tenantId, aggregator
                 */
                this.extractStatsData("ALL", "ALL", null, this.props.dashboard.properties.tenantId, "ESBStatAgg", this.state.timeFrom, this.state.timeTo, this.state.timeUnit);
            }
            else if (this.state.componentName != null) {
                switch (pageName) {
                    case PAGE_PROXY:
                        this.extractStatsData(PAGE_PROXY, this.state.componentName, null, this.props.dashboard.properties.tenantId, "ESBStatAgg",
                            this.state.timeFrom, this.state.timeTo, this.state.timeUnit);
                        break;
                    case PAGE_API:
                        this.extractStatsData(PAGE_API, this.state.componentName, null, this.props.dashboard.properties.tenantId, "ESBStatAgg",
                            this.state.timeFrom, this.state.timeTo, this.state.timeUnit);
                        break;
                    case PAGE_SEQUENCE:
                        this.extractStatsData(PAGE_SEQUENCE, this.state.componentName,
                            this.state.entryPoint, this.props.dashboard.properties.tenantId, "MediatorStatAgg", this.state.timeFrom, this.state.timeTo, this.state.timeUnit);
                        break;
                    case PAGE_ENDPOINT:
                        this.extractStatsData(PAGE_ENDPOINT, this.state.componentName,
                            this.state.entryPoint, this.props.dashboard.properties.tenantId, "MediatorStatAgg", this.state.timeFrom, this.state.timeTo, this.state.timeUnit);
                        break;
                    case PAGE_INBOUND_ENDPOINT:
                        this.extractStatsData(PAGE_INBOUND_ENDPOINT, this.state.componentName, null, this.props.dashboard.properties.tenantId, "ESBStatAgg",
                            this.state.timeFrom, this.state.timeTo, this.state.timeUnit);
                        break;
                    case PAGE_MEDIATOR:
                        this.extractStatsData(PAGE_MEDIATOR, this.state.componentName,
                            this.state.entryPoint, this.props.dashboard.properties.tenantId, "MediatorStatAgg", this.state.timeFrom, this.state.timeTo, this.state.timeUnit);
                        break;
                }
            }
        }
    }

    handleRecievedMessage(recievedMessage) {
        let message;
        if (typeof recievedMessage == "string") {
            message = JSON.parse(recievedMessage);
        }
        else {
            message = recievedMessage;
        }

        if (PUBLISHER_DATE_TIME_PICKER in message) {
            this.setState({
                timeFrom: message.from,
                timeTo: message.to,
                timeUnit: message.granularity + 's',
                totalCount: null,
                faultCount: null
            }, this.handleParameterChange);
        }
        if (PUBLISHER_SEARCH_BOX in message) {
            this.setState({
                componentName: message.selectedComponent,
                totalCount: null,
                faultCount: null
            }, this.handleParameterChange);
        }
    }

    /**
     * Get message count details from the DB  and set the state accordingly
     */
    extractStatsData(componentType, componentName, entryPoint, tenantId, aggregator, timeFrom, timeTo, timeUnit) {
        if (componentType == PAGE_MEDIATOR || componentType == "ALL") {
            var componentIdentifier = "componentId";
        } else {
            var componentIdentifier = "componentName";
        }
        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                let dataProviderConf = this.getProviderConf(message.data);
                if (entryPoint == 'undefined' || entryPoint === null) {
                    var query = dataProviderConf.configs.providerConfig.configs.config.queryData.nullEntryPointStatPerQuery;

                    let formattedQuery = query
                        .replace("{{aggregator}}", aggregator)
                        .replace("{{componentIdentifier}}", (componentName == "ALL" ? 'true' : componentIdentifier))
                        .replace("{{componentName}}", ((componentName === "ALL") ? 'true' : "\'" + componentName + "\'"))
                        .replace("{{tenantId}}", tenantId)
                        .replace("{{timeFrom}}", timeFrom)
                        .replace("{{timeTo}}", timeTo)
                        .replace("{{timeUnit}}", "\'" + timeUnit + "\'");
                    dataProviderConf.configs.providerConfig.configs.config.queryData.query = formattedQuery;
                } else {
                    var query = dataProviderConf.configs.providerConfig.configs.config.queryData.notNullEntryPointStatPerQuery;
                    let formattedQuery = query
                        .replace("{{aggregator}}", aggregator)
                        .replace("{{entryPoint}}", "\'" + entryPoint + "\'")
                        .replace("{{componentIdentifier}}", (componentName == "ALL" ? 'true' : componentIdentifier))
                        .replace("{{componentName}}", ((componentName === "ALL") ? 'true' : "\'" + componentName + "\'"))
                        .replace("{{tenantId}}", tenantId)
                        .replace("{{timeFrom}}", timeFrom)
                        .replace("{{timeTo}}", timeTo)
                        .replace("{{timeUnit}}", "\'" + timeUnit + "\'");
                    dataProviderConf.configs.providerConfig.configs.config.queryData.query = formattedQuery;
                }
                // console.log(JSON.stringify(dataProviderConf.configs.providerConfig));
                super.getWidgetChannelManager()
                    .subscribeWidget(this.props.id, "EIAnalyticsStatsChart", this.handleStats, dataProviderConf.configs.providerConfig);
            })
            .catch(() => {
                console.error("Unable to load configurations of " + this.props.widgetID + " widget.");
            });
    }

    /**
     * Process received data and store meaningful values
     *
     * @returns {Function}
     */
    handleStats(stats) {
        if (stats.data.length > 0) {
            let metadata = stats.metadata.names;
            let data = stats.data[0];
            let dataIndex = {};
            metadata.forEach((value, index) => {
                dataIndex[value] = index;
            });
            this.setState({
                totalCount: data[dataIndex["noOfInvocationSum"]],
                faultCount: data[dataIndex["faultCountSum"]]
            });
        }
    }

    getProviderConf(aggregatorDataProviderConf) {
        let stringifiedDataProvideConf = JSON.stringify(aggregatorDataProviderConf);
        return JSON.parse(stringifiedDataProvideConf);
    }

    getCurrentPage() {
        return window.location.pathname.split('/').pop();
    };

    drawCharts() {
        return (
            <div>
                <div id={"overall-count"} style={{
                    float: 'left',
                    display: 'inline-block',
                    width: this.state.width * 0.3,
                    padding: 5,
                    paddingTop: (this.state.width / 18),
                    textAlign: 'center',
                    alignContent: 'center',
                    justifyContent: 'center'
                }}>
                    <h2><b>Total</b> requests</h2>
                    <h4 title={this.state.componentName} style={{overflow: 'hidden', textOverflow: 'ellipsis'}}><span
                        id="title">{this.state.componentName != null ? 'for ' + this.state.componentName : null}</span>
                    </h4>
                    <h1 id="totalCount">{this.state.totalCount}</h1>
                </div>

                <div id={"charts"} style={{display: 'inline-block', padding: 5}}>
                    <div style={{display: 'inline-block', float: 'left', textAlign: 'center'}}>
                        <div style={{width: this.state.width * 0.3, alignContent: 'center', justifyContent: 'center'}}>
                            <VizG
                                config={this.successChartConfig}
                                metadata={this.metadata}
                                data={[[
                                    9000, ((this.state.totalCount - this.state.faultCount) * 100) / this.state.totalCount, 130, "Rotary"
                                ]]}
                                theme={this.props.muiTheme.name}
                            />
                        </div><br/>
                        <div style={{width: this.state.width * 0.3, alignContent: 'center', justifyContent: 'center'}}>
                            <b>Success Rate</b>
                            <br/>
                            <b>{'Success Requests: ' + String(this.state.totalCount - this.state.faultCount)}</b>
                        </div>
                    </div>
                    <div style={{display: 'inline-block', textAlign: 'center'}}>
                        <div style={{width: this.state.width * 0.3, alignContent: 'center', justifyContent: 'center'}}>
                            <VizG
                                config={this.faultChartConfig}
                                metadata={this.metadata}
                                data={[[
                                    9000, ((this.state.faultCount) * 100) / this.state.totalCount, 130, "Rotary"
                                ]]}
                                theme={this.props.muiTheme.name}
                            />
                        </div><br/>
                        <div style={{width: this.state.width * 0.3, alignContent: 'center', justifyContent: 'center'}}>
                            <b>Failure Rate</b>
                            <br/>
                            <b>{'Failure Requests: ' + String(this.state.faultCount)}</b>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    isDataRecieved() {
        return this.state.totalCount != null;
    }

    noParameters() {
        let page = this.getCurrentPage();
        switch (page) {
            case 'api':
                return 'Please select an API and a valid date range to view stats.';
                break;
            case 'proxy':
                return 'Please select a Proxy Service and a valid date range to view stats.';
                break;
            case 'sequences':
                return 'Please select a Sequence and a valid date range to view stats.';
                break;
            case 'endpoint':
                return 'Please select an Endpoint and a valid date range to view stats.';
                break;
            case 'inboundEndpoint':
                return 'Please select an Inbound Endpoint and a valid date range to view stats.';
                break;
            default:
                return 'Please select a valid date range to view stats';
        }
    }

    render() {
        return (
            this.isDataRecieved() ? this.drawCharts() : <h5>{this.noParameters()}</h5>
        )
    }
}

function getKey(pageName, parameter) {
    return pageName + "_page_" + parameter;
}

global.dashboard.registerWidget('EIAnalyticsStatsChart', EIAnalyticsStatsChart);
