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
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Types from './utils/Types';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from "@material-ui/core/FormControl";
import Button from '@material-ui/core/Button';
import PieChart from './chartPropertyGenerators/PieChart';
import LineAreaBarChart from './chartPropertyGenerators/LineAreaBarChart';
import ScatterChart from './chartPropertyGenerators/ScatterChart';
import GeographicalChart from './chartPropertyGenerators/GeographicalChart';
import Configurations from './utils/Configurations';
import UtilFunctions from './utils/UtilFunctions';
import Constants from './utils/Constants';

export default class ChartView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chartType:'',
            chartConfig:{},
            errorMessage:''
        };
        this.handleChartTypeChange = this.handleChartTypeChange.bind(this);
        this.generateBtnClicked = this.generateBtnClicked.bind(this);
        this.getValidatedConfiguration = this.getValidatedConfiguration.bind(this);
    }

    handleChartTypeChange(event) {
        const state = this.state;
        state.chartType = event.target.value;
        state.chartConfig = Configurations.charts[event.target.value];
        this.setState(state);
    }

    generateBtnClicked() {
        if (this.getValidatedConfiguration()) {
            this.setState({errorMessage:''});
            this.props.onChartGeneration(this.state.chartConfig);
        } else {
            this.setState({errorMessage: '*Please fill in required values'});
        }
    }

    displayChartProperties() {
        if (this.state.chartType !== '') {
            switch(this.state.chartType) {
                case (Types.chart.pieChart):
                    return(
                        <PieChart
                            metadata = {this.props.metadata}
                            configuration = {this.state.chartConfig}
                            onConfigurationChange = {configuration => this.setState({chartConfig:configuration})}
                        />
                    );
                case (Types.chart.lineAreaBarChart):
                    return(
                        <LineAreaBarChart
                            metadata = {this.props.metadata}
                            configuration = {this.state.chartConfig}
                            onConfigurationChange = {configuration => this.setState({chartConfig:configuration})}
                        />
                    );
                case (Types.chart.scatterChart):
                    return(
                        <ScatterChart
                            metadata = {this.props.metadata}
                            configuration = {this.state.chartConfig}
                            onConfigurationChange = {configuration => this.setState({chartConfig:configuration})}
                        />
                    );
                case (Types.chart.geographicalChart):
                    return(
                        <GeographicalChart
                            metadata = {this.props.metadata}
                            configuration = {this.state.chartConfig}
                            onConfigurationChange = {configuration => this.setState({chartConfig:configuration})}
                        />
                    );
                default:
                    return(<div/>);
            }
        }
        return(<div/>);
    }

    displayChartView() {
        return(
            <FormControl className = {this.props.formControl}>
                <InputLabel>Chart Type</InputLabel>
                <Select
                    value = {this.state.chartType}
                    style = {{minWidth:250}}
                    onChange = {this.handleChartTypeChange}
                    displayEmpty
                    className = {this.props.selectEmpty}
                    inputProps = {{
                        name: 'chartType',
                        id: 'chartTypeSelect',
                    }}
                >
                    <MenuItem value = {Types.chart.pieChart}>{Constants.CHART_NAMES.PIE_CHART}</MenuItem>
                    <MenuItem value = {Types.chart.lineAreaBarChart}>{Constants.CHART_NAMES.LINE_AREA_BAR_CHART}</MenuItem>
                    <MenuItem value = {Types.chart.scatterChart}>{Constants.CHART_NAMES.SCATTER_CHART}</MenuItem>
                    <MenuItem value = {Types.chart.geographicalChart}>{Constants.CHART_NAMES.GEOGRAPHICAL_CHART}</MenuItem>
                </Select>
                <br/>
            </FormControl>
        );
    }

    getValidatedConfiguration() {
        let configuration = this.state.chartConfig;
        let isChartConfigurationValid = false;
        switch (this.state.chartType) {
            case (Types.chart.lineAreaBarChart):
                if (UtilFunctions.validateLineChartConfiguration(configuration)) {
                    isChartConfigurationValid = true;
                }
                break;
            case (Types.chart.pieChart):
                if (UtilFunctions.validatePieChartConfiguration(configuration)) {
                    isChartConfigurationValid = true;
                }
                break;
            case (Types.chart.scatterChart):
                if (UtilFunctions.validateScatterChartConfiguration(configuration)) {
                    isChartConfigurationValid = true;
                }
                break;
            case (Types.chart.geographicalChart):
                if (UtilFunctions.validateGeographicalChartConfiguration(configuration)) {
                    isChartConfigurationValid = true;
                }
                break;
        }
        return isChartConfigurationValid;
    }

    render() {
        return (
            <div>
                <div>
                    {this.displayChartView()}
                </div>

                {this.displayChartProperties()}
                <h4 style={{color: '#ff2e00', marginTop: 0, marginBottom: 0}}>{this.state.errorMessage}</h4>
                <br/>

                {(this.state.chartType !== '') &&
                    (<Button
                        style = {{color: '#ffffff' ,border: 0, borderRadius: 3, background: '#fc5800', height: 33}}
                        onClick = {(this.generateBtnClicked)}>
                        APPLY CHANGES
                    </Button>)}
            </div>
        );
    }
}
