/*
 *  Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React, { Component } from 'react';
import SelectProperty from '../inputTypes/SelectProperty';
import StreamProperty from '../inputTypes/StreamProperty';
import SwitchProperty from '../inputTypes/SwitchProperty';
import Types from '../utils/Types';
import Constants from '../utils/Constants';

export default class LineAreaBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            configuration: props.configuration,
            checked:false
        };
    }

    handleMainChartPropertyChange(key, value) {
        const state = this.state;
        state.configuration[key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    handleInnerChartPropertyChange(key, value) {
        const state = this.state;
        state.configuration.charts[0][key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    handleSwitchToggle(key,value) {
        const state = this.state;
        if(value){
            state.configuration.charts[0].mode = 'stacked';
            state.checked=true;
        }else{
            state.configuration.charts[0].mode = '';
            state.checked=false;
        }
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    render() {
        return(
            <div>
                <StreamProperty
                    id = 'x'
                    value = {this.state.configuration.x}
                    fieldName = 'X axis field*'
                    onChange = {(id, value) => this.handleMainChartPropertyChange(id, value)}
                    metadata = {this.props.metadata}
                />
              <br/><br/>
                <SelectProperty
                    id = 'type'
                    value = {this.state.configuration.charts[0].type}
                    fieldName = 'Type of the chart*'
                    onChange = {(id, value) => this.handleInnerChartPropertyChange(id, value)}
                    options = {{
                        values: [Types.chart.lineChart, Types.chart.areaChart, Types.chart.barChart],
                        texts: [Constants.CHART_NAMES.LINE_CHART, Constants.CHART_NAMES.AREA_CHART,
                            Constants.CHART_NAMES.BAR_CHART],
                    }}
                />
                <br/><br/>
                <StreamProperty
                    id = 'y'
                    value = {this.props.configuration.charts[0].y}
                    fieldName = 'Y axis field*'
                    filter = {Types.dataset.metadata.linear}
                    onChange = {(id, value) => this.handleInnerChartPropertyChange(id, value)}
                    metadata = {this.props.metadata}
                />
                <br/><br/>
                <StreamProperty
                    id = 'color'
                    value = {this.props.configuration.charts[0].color}
                    fieldName = 'Color Categorization'
                    filter = {Constants.ordinal}
                    metadata = {this.props.metadata}
                    onChange = {(id, value) => this.handleInnerChartPropertyChange(id, value)}
                />
                <br/>
                {((this.state.configuration.charts[0].type === Types.chart.areaChart) ||
                    (this.state.configuration.charts[0].type === Types.chart.barChart)) ?
                    (<div>
                        <br/>
                        <SwitchProperty
                            id = 'stacked'
                            isChecked = {this.state.checked}
                            fieldName = 'Stack this chart'
                            onChange = {(id, value) => this.handleSwitchToggle(id, value)}
                        /></div>) : (null)
                }
            </div>
        );
    }
}
