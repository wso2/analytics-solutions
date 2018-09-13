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

import Widget from "@wso2-dashboards/widget";
import VizG from 'react-vizgrammar';
import {darkBaseTheme, getMuiTheme, MuiThemeProvider} from 'material-ui/styles';
import moment from 'moment';

const TENANT_ID = '-1234';
const MESSAGE_PAGE = "message";

class EIAnalyticsMessageTable extends Widget {
    constructor(props) {
        super(props);

        this.chartConfig = {
            "charts": [
                {
                    "type": "table",
                    "columns": [
                        {
                            "name": "messageFlowId",
                            "title": "Message ID"
                        },
                        {
                            "name": "host",
                            "title": "Host"
                        },
                        {
                            "name": "startTime",
                            "title": "Start Time"
                        },
                        {
                            "name": "faultCount",
                            "title": "Status"
                        }
                    ]
                }
            ],
            "pagination": true,
            "filterable": true,
            "append": false
        };

        this.metadata = {
            "names": [
                "messageFlowId",
                "host",
                "startTime",
                "faultCount"
            ],
            "types": [
                "ordinal",
                "ordinal",
                "time",
                "ordinal"
            ]
        };

        this.state = {
            data: [],
            metadata: this.metadata,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            btnGroupHeight: 100
        };
        this.isDataLoaded = false;
        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.handleStats = this.handleStats.bind(this);
        this.handleGraphUpdate = this.handleGraphUpdate.bind(this);
        this.handlePublisherParameters = this.handlePublisherParameters.bind(this);
        this.handleRowSelect = this.handleRowSelect.bind(this);
        this.getCurrentPage = this.getCurrentPage.bind(this);
        this.getKey = this.getKey.bind(this);
        this.getUrlParameter = this.getUrlParameter.bind(this);
        this.pageName = this.getCurrentPage();
    }

    static getProviderConf(widgetConfiguration) {
        return widgetConfiguration.configs.providerConfig;
    }

    handleRowSelect(event) {
        //get the messageId from the selected row
        let messageId = event.messageFlowId;
        let hashComponent = {};
        hashComponent[this.getKey(MESSAGE_PAGE, "id")] = messageId;
        window.location.href = MESSAGE_PAGE + ('#' + JSON.stringify(hashComponent));
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }

    componentWillMount() {
        super.subscribe(this.handlePublisherParameters);
    }

    handlePublisherParameters(receivedMessage) {
        let message = (typeof receivedMessage === "string") ? JSON.parse(receivedMessage) : receivedMessage;
        if (message.granularity) {
            // Update time parameters and clear existing table
            this.setState({
                timeFromParameter: message.from,
                timeToParameter: message.to,
                timeUnitParameter: message.granularity,
                data: []
            }, this.handleGraphUpdate);
        }
        if (message.selectedComponent) {
            this.setState({
                componentName: message.selectedComponent
            }, this.handleGraphUpdate);
        }
    }

    handleGraphUpdate() {
        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
                // Get data provider sub json string from the widget configuration
                const dataProviderConf = EIAnalyticsMessageTable.getProviderConf(message.data);
                const query = dataProviderConf.configs.config.queryData.query;
                const componentName = this.state.componentName;
                let componentType;
                let componentIdentifier = "componentName";
                let pageName = this.getCurrentPage();
                if (pageName === "api") {
                    componentType = "api";
                } else if (pageName === "proxy") {
                    componentType = "proxy service"
                } else {
                    if (pageName == "mediator") {
                        componentType = "mediator";
                        componentIdentifier = "componentId";
                    } else if (pageName == "endpoint") {
                        componentType = "endpoint";
                    } else if (pageName == "sequence") {
                        componentType = "sequence";
                    } else if (pageName == "inbound") {
                        componentType = "inbound endpoint";
                    }
                }
                // Insert required parameters to the query string
                dataProviderConf.configs.config.queryData.query = query
                    .replace("{{timeFrom}}", this.state.timeFromParameter)
                    .replace("{{timeTo}}", this.state.timeToParameter)
                    .replace("{{metaTenantId}}", TENANT_ID)
                    .replace("{{componentType}}", componentType)
                    .replace("{{componentIdentifier}}", componentIdentifier)
                    .replace("{{componentName}}", componentName);
                // Request datastore with the modified query
                super.getWidgetChannelManager()
                    .subscribeWidget(
                        this.props.id, this.handleStats, dataProviderConf
                    );
            })
            .catch((error) => {
                console.error("Unable to load configurations of " + this.props.widgetID + " widget.", error);
            });
    }

    handleStats(stats) {
        let dataArray = stats.data;
        dataArray.forEach(element => {
            element[2] = moment(element[2]).format("YYYY-MM-DD HH:mm:ss");
        });
        this.setState({
            metadata: stats.metadata,
            data: dataArray
        });
    }

    componentWillUnmount() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
    }

    getCurrentPage() {
        return window.location.pathname.split('/').pop();
    }

    getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    getKey(pageName, parameter) {
        return pageName + "_page_" + parameter;
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
                <section style={{paddingTop: 50}}>
                    <VizG
                        config={this.chartConfig}
                        metadata={this.state.metadata}
                        data={this.state.data}
                        height={this.state.height - this.state.btnGroupHeight}
                        width={this.state.width}
                        theme={this.props.muiTheme.name}
                        onClick={this.handleRowSelect}
                    />
                </section>
            </MuiThemeProvider>
        );
    }
}

global.dashboard.registerWidget("EIAnalyticsMessageTable", EIAnalyticsMessageTable);
