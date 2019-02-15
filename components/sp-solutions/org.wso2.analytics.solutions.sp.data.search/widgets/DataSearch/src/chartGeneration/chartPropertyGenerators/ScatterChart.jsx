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
import StreamProperty from '../inputTypes/StreamProperty';
import Types from '../utils/Types';

export default class Scatter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            configuration: props.configuration
        };
    }

    handleInnerChartPropertyChange(key, value) {
        const state = this.state;
        state.configuration.charts[0][key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    render() {
        return(
            <div>
                <StreamProperty
                    id = 'x'
                    value = {this.props.configuration.charts[0].x}
                    fieldName = 'X axis field*'
                    onChange = {(id, value) => this.handleInnerChartPropertyChange(id, value)}
                    metadata = {this.props.metadata}
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
                    metadata = {this.props.metadata}
                    onChange = {(id, value) => this.handleInnerChartPropertyChange(id, value)}
                />
                <br/><br/>
                <StreamProperty
                    id = 'size'
                    value = {this.props.configuration.charts[0].size}
                    fieldName = 'Mark Size Categorization'
                    metadata = {this.props.metadata}
                    filter = {Types.dataset.metadata.linear}
                    onChange = {(id, value) => this.handleInnerChartPropertyChange(id, value)}
                />
                <br/>
            </div>
        );
    }
}
