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
import Widget from '@wso2-dashboards/widget';
import VizG from 'react-vizgrammar';
import {Scrollbars} from 'react-custom-scrollbars'
import DashboardSiddhiAppAPIS from './apis/DashboardSiddhiAppAPIs';
import ReportConfigs from './reportGeneration/ReportConfigs';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from "@material-ui/core/FormControl";
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import deepOrange from '@material-ui/core/colors/deepOrange';
import ChartView from './chartGeneration/ChartView';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HelpIcon from '@material-ui/icons/Help';
import Tooltip from '@material-ui/core/Tooltip';

let tableConfig = {
    'charts': [
        {'type': 'table', 'columns' : [{name: 'column 1'}, {name: 'column 2'}, {name: 'column 3'}]}
    ], 'pagination': true, 'filterable': true, 'sortable': false, 'append': false};

const defaultFontColor = '#fc5800';
const titleStyle = {color: defaultFontColor, marginTop: 0, marginBottom: 0};
const defaultPageSize = 5;

const queryHint = <div style = {{fontSize: 13}}>
    <h3>Table/Window</h3>
    from &lt;table/window><br />
    &lt;on condition>?<br />
    select &lt;attribute name>, &lt;attribute name>, ...<br />
    &lt;group by>?<br />
    &lt;having>?<br />
    &lt;order by>?<br />
    &lt;limit>?<br />
    <h3>Aggregation</h3>
    &lt;from aggregation><br/>
    &lt;on condition>?<br />
    within &lt;time range><br/>
    per &lt;time granularity><br/>
    select &lt;attribute name>, &lt;attribute name>, ...<br />
    &lt;group by>?<br />
    &lt;having>?<br />
    &lt;order by>?<br />
    &lt;limit>?<br />
</div>;

class DataSearch extends Widget {
    constructor(props){
        super(props);
        this.state = {
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            siddhiAppName: '',
            storeElement: '',
            siddhiAppList: [],
            storeElementList: [],
            data: [],
            metadata: {'names':['column 1', 'column 2', 'column 3'], 'types':['ORDINAL','ORDINAL','LINEAR']},
            siddhiAppText: '',
            query: '',
            attributes: '',
            chartConfig: {},
            displayChart: false,
            chartViewExpanded: false,
            tblReportGenExpanded: false,
            chrtReportGenExpanded: false,
            totalPages: Infinity,
        };
        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.getData = this.getData.bind(this);
        this.initializeDataProvider = this.initializeDataProvider.bind(this);
        this.excecuteQuery = this.excecuteQuery.bind(this);
        this.handleChartViewExpand = this.handleChartViewExpand.bind(this);
        this.handleTblReportGenExpand = this.handleTblReportGenExpand.bind(this);
        this.handleChrtReportGenExpand = this.handleChrtReportGenExpand.bind(this);
        this.updateQuery = this.updateQuery.bind(this);
        this.handleChangeSiddhiAppName = this.handleChangeSiddhiAppName.bind(this);
        this.handleChangeStoreElement = this.handleChangeStoreElement.bind(this);
        this.handleChartGeneration=this.handleChartGeneration.bind(this);
        this.props.glContainer.on('resize', () => {
            this.setState({
                width: this.props.glContainer.width,
                height: this.props.glContainer.height
            });
        });
    }

    componentDidMount() {
        DashboardSiddhiAppAPIS.getAllSiddhiApps()
            .then((response) => {
                this.setState({siddhiAppList:response.data});
                this.forceUpdate();
            })
            .catch(error => {
                console.log(error.response);
            });
    }

    handleChartViewExpand() {
        this.setState({chartViewExpanded: !this.state.chartViewExpanded});
    }

    handleTblReportGenExpand() {
        this.setState({tblReportGenExpanded: !this.state.tblReportGenExpanded});
    }

    handleChrtReportGenExpand() {
        this.setState({chrtReportGenExpanded: !this.state.chrtReportGenExpanded});
    }

    handleDataReceived(setData) {
        let titles = setData.metadata.names;
        let tableCols = [];
        for (let i=0; i<titles.length; i++) {
            tableCols[i] = [];
            tableCols[i].name = titles[i];
        }

        tableConfig.charts[0].columns = tableCols;

        if (setData.data.length === 0) {
            this.setState({
                data: setData.data,
                metadata:setData.metadata,
                totalPages: 1
            });
        } else {
            this.setState({
                data: setData.data,
                metadata:setData.metadata,
                totalPages: Infinity
            });
        }
        const table = <VizG config = {tableConfig}
                            metadata = {this.state.metadata}
                            data = {this.state.data}
                            width = {this.state.width}
                            height = {this.state.height}
                            theme = {this.props.muiTheme.name}
                            manual
                            pages = {this.state.totalPages}
                            onFetchData = {(state) => {
                                if(this.state.query !== '') {
                                    this.getData(state.pageSize, state.page);
                                }
                            }}
        />;
        ReactDOM.render(table, document.getElementById('tableResultDiv'));
    }

    updateQuery(event) {
        this.setState({query: event.target.value});
    }

    handleChangeSiddhiAppName(event) {
        DashboardSiddhiAppAPIS.getSiddhiAppStoreElements(event.target.value)
            .then((response) => {
                this.setState({storeElementList:response.data});
            });

        this.setState({siddhiAppName: event.target.value, storeElement: '', siddhiAppText: '', query: '',
            attributes: ''});
    }

    handleChangeStoreElement(event) {
        const loadingText =  <h2>Loading...</h2>;
        ReactDOM.render(loadingText, document.getElementById('tableResultDiv'));

        this.setState({storeElement:event.target.value});
        for(let i=0; i<this.state.storeElementList.length; i++){
            if(this.state.storeElementList[i].name === event.target.value){
                let attributeList = '';
                for(let j=0; j<this.state.storeElementList[i].attributes.length; j++){
                    attributeList += this.state.storeElementList[i].attributes[j].name + ' '
                        + this.state.storeElementList[i].attributes[j].type + ', ';
                }
                attributeList = attributeList.slice(0,attributeList.length - 2);
                this.setState({attributes: attributeList,
                    siddhiAppText: this.state.storeElementList[i].definition,
                    query: 'from ' + this.state.storeElementList[i].name + ' select *'}, ()=> {
                    this.initializeDataProvider(defaultPageSize, 0);
                });
                break;
            }
        }
    }

    excecuteQuery() {
        if (this.state.query !== '' && this.state.storeElement !== '') {
            const loadingText = <h2>Excecuting Query...</h2>
            ReactDOM.render(loadingText, document.getElementById('tableResultDiv'));
            this.initializeDataProvider(defaultPageSize, 0);
        }
    }

    initializeDataProvider(pageSize, currentPage) {
        this.setState({displayChart: false, chartViewExpanded: false, resultExpanded: true});
        var siddhiApp = this.state.siddhiAppText;
        var query = this.state.query;
        var providerConfig = {
            'configs': {
                'type': 'SiddhiStoreDataProvider',
                'config': {siddhiApp,
                    'queryData': {query},
                    'currentPage': currentPage,
                    'pageSize': pageSize,
                    'isPaginationEnabled': true
                }
            }
        };
        super.getWidgetConfiguration(this.props.widgetID).then((message) => {
                super.getWidgetChannelManager().subscribeWidget(this.props.id, this.handleDataReceived, providerConfig);
            })
    }

    getData(pageSize, currentPage) {
        this.setState({displayChart: false, chartViewExpanded: false, resultExpanded: true});
        var siddhiApp = this.state.siddhiAppText;
        var query = this.state.query;
        var providerConfig = {
            'configs': {
                'type': 'SiddhiStoreDataProvider',
                'config': {siddhiApp,
                    'queryData': {query},
                    'currentPage': currentPage,
                    'pageSize': pageSize,
                    'isPaginationEnabled': true
                }
            }
        };
        super.getWidgetConfiguration(this.props.widgetID).then((message) => {
                super.getWidgetChannelManager().poll(this.props.id, this.handleDataReceived, providerConfig);
            })
    }

    handleChartGeneration(chartConfig) {
        //display chart view when generate btn is clicked
        this.setState({chartConfig: chartConfig, displayChart: true});
    }

    render() {
        const theme = createMuiTheme({
            palette: {
                type: this.props.muiTheme.name,
                primary: deepOrange
            },
            typography: {
                fontFamily: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'Roboto',
                    '"Helvetica Neue"',
                    'Arial',
                    'sans-serif',
                    '"Apple Color Emoji"',
                    '"Segoe UI Emoji"',
                    '"Segoe UI Symbol"',
                ]
            },
        });

        return(
            <div style = {{
                width: this.state.width-30,
                height: this.state.height,
                paddingLeft: 15
            }}
            >
                <Scrollbars style = {{
                    width: this.state.width-30,
                    height: this.state.height}}
                >
                    <MuiThemeProvider theme = {theme}>
                        <Card style = {{width: '98%',marginBottom: 15}}>
                            <CardContent>
                                <div style = {{width:500, display: 'inline-block', float: 'left'}}>
                                    <h3 style = {{marginBottom: 15, marginTop: 0, color: defaultFontColor}}>SOURCE</h3>
                                    <FormControl className = {this.props.formControl}>
                                        <InputLabel>Siddhi App</InputLabel>
                                        <Select
                                            value = {this.state.siddhiAppName}
                                            onChange = {this.handleChangeSiddhiAppName}
                                            style = {{minWidth:350}}
                                            displayEmpty
                                            className = {this.props.selectEmpty}
                                            inputProps = {{
                                                name: 'siddhiAppName',
                                                id: 'siddhiAppNameSelect',
                                            }}
                                        >
                                            {this.state.siddhiAppList.map(appName => (
                                                <MenuItem key = {appName} value = {appName}>
                                                    {appName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <br/><br/>

                                    <FormControl className = {this.props.formControl}>
                                        <InputLabel>Aggregation/Table/Window</InputLabel>
                                        <Select
                                            value = {this.state.storeElement}
                                            onChange = {this.handleChangeStoreElement}
                                            style = {{minWidth: 350}}
                                            displayEmpty
                                            className = {this.props.selectEmpty}
                                            inputProps = {{
                                                name: 'storeElement',
                                                id: 'storeElementSelect',
                                            }}
                                        >
                                            {this.state.storeElementList.map(element => (
                                                <MenuItem key = {element.name} value = {element.name}>
                                                    {element.name} ({element.type})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <br/><br/>
                                </div>
                                <div style = {{display:'inline-block', width:650}}>
                                    <h3 style = {titleStyle}>QUERY</h3>
                                    <TextField
                                        label = 'Attributes'
                                        value = {this.state.attributes}
                                        multiline
                                        rowsMax = '4'
                                        margin = 'normal'
                                        variant = 'outlined'
                                        InputProps = {{
                                            readOnly: true,
                                        }}
                                        style = {{minWidth: 600, color: defaultFontColor}}
                                    />
                                    <TextField
                                        id = 'outlined-multiline-flexible'
                                        multiline
                                        rowsMax = '8'
                                        label = 'Enter your query'
                                        value = {this.state.query}
                                        onChange = {this.updateQuery}
                                        margin = 'normal'
                                        style = {{minWidth: 600, color: defaultFontColor}}
                                    />
                                    <Tooltip title = {queryHint}>
                                        <IconButton aria-label = 'Delete' style = {{marginTop: 25}}>
                                            <HelpIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    <br/><br/>

                                    <Button
                                        style = {{color: '#ffffff', border: 0, borderRadius: 3,
                                            background: defaultFontColor, height: 35}}
                                        onClick = {() => {this.excecuteQuery();}}>
                                        EXECUTE
                                    </Button>
                                    <br/>
                                </div>
                            </CardContent>
                        </Card>

                        <Card style = {{width: '98%'}}>
                            <CardActions>
                                <h3 style = {{color: defaultFontColor, paddingLeft: 10, marginTop: 10}}>RESULT</h3>
                            </CardActions>
                                <CardContent style = {{paddingTop: 0}}>
                                    <div style = {{marginBottom: 15}}>
                                        <div id = 'tableResultDiv'>
                                            <VizG config = {tableConfig}
                                                  metadata = {this.state.metadata}
                                                  data = {this.state.data}
                                                  width = {this.state.width}
                                                  height = {this.state.height}
                                                  theme = {this.props.muiTheme.name}
                                            />
                                        </div>
                                    </div>
                                    <Card>
                                        <CardActions>
                                            <h4 style = {titleStyle}>Export Table</h4>
                                            <IconButton
                                                onClick = {this.handleTblReportGenExpand}
                                            >
                                                <ExpandMoreIcon />
                                            </IconButton>
                                        </CardActions>

                                        <Collapse in = {this.state.tblReportGenExpanded} timeout = 'auto' unmountOnExit>
                                            <CardContent style = {{paddingTop: 0}}>
                                                <ReportConfigs
                                                    element = {document.getElementById('tableResultDiv')}
                                                    theme = {this.props.muiTheme.name}
                                                    type = 'table'
                                                />
                                            </CardContent>
                                        </Collapse>
                                    </Card>
                                </CardContent>
                        </Card>

                        <Card style = {{width: '98%', marginTop: 15, marginBottom: 15}}>
                            <CardActions>
                                <h3 style = {{color: defaultFontColor, paddingLeft: 10}}>CHART VIEW</h3>
                                <IconButton
                                    onClick = {this.handleChartViewExpand}
                                >
                                    <ExpandMoreIcon />
                                </IconButton>
                            </CardActions>
                            <Collapse in = {this.state.chartViewExpanded} timeout = 'auto' unmountOnExit>
                                <CardContent>
                                    <div style = {{width: 350, display: 'inline-block', float: 'left'}}>
                                        <ChartView
                                            data = {this.state.data}
                                            metadata = {this.state.metadata}
                                            onChartGeneration = {configuration => this.handleChartGeneration(configuration)}
                                            displayChart = {this.state.displayChart}
                                        />
                                    </div>
                                    <div style = {{display: 'inline-block'}}>
                                        {(this.state.displayChart === true) ?
                                            (<div id = 'generatedChartDiv'>
                                                    <VizG config = {this.state.chartConfig}
                                                          metadata = {this.state.metadata}
                                                          data = {this.state.data}
                                                          theme = {this.props.muiTheme.name}/>
                                                </div>
                                            )
                                            :(<div></div>)}
                                    </div>
                                    <Card style = {{width: '100%'}}>
                                        <CardActions>
                                            <h4 style = {titleStyle}>Export Chart</h4>
                                            <IconButton
                                                onClick = {this.handleChrtReportGenExpand}
                                            >
                                                <ExpandMoreIcon />
                                            </IconButton>
                                        </CardActions>
                                        <Collapse in = {this.state.chrtReportGenExpanded} timeout = 'auto' unmountOnExit>
                                            <CardContent style={{paddingTop: 0}}>
                                                <ReportConfigs
                                                    element = {document.getElementById('generatedChartDiv')}
                                                    theme = {this.props.muiTheme.name}
                                                    type = 'chart'
                                                />
                                            </CardContent>
                                        </Collapse>
                                    </Card>
                                </CardContent>
                            </Collapse>
                        </Card>
                    </MuiThemeProvider>
                </Scrollbars>
            </div>
        );
    }
}
global.dashboard.registerWidget('DataSearch', DataSearch);
