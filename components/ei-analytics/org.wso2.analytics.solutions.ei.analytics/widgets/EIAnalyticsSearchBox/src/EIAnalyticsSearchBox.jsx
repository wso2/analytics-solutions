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

import React from 'react';
import PropTypes from 'prop-types';
import Widget from '@wso2-dashboards/widget';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Select from 'react-select';
import JssProvider from 'react-jss/lib/JssProvider';
import {Scrollbars} from 'react-custom-scrollbars';

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark'
    }
});

const lightTheme = createMuiTheme({
    palette: {
        type: 'light'
    }
});

//todo move select to a different component
// Following functions are used by material ui to implement autocomplete using react-select. For more information see
// see https://v1-5-0.material-ui.com/demos/autocomplete/
let openPopper = false;
const popperAnchor = 'popper-anchor-ei-analytics-search-box';
const textInputElement = '#popper-anchor-ei-analytics-search-box div div div input';

const NoOptionsMessage = function (props) {
    return (
        <Typography
            style={{
                padding: 15,
                color: '#7e7e7e'
            }}
            {...props.innerProps}>
            {props.children}
        </Typography>
    );
};

const inputComponent = function ({inputRef, ...props}) {
    return <div
        ref={inputRef}
        {...props}/>;
};

const Control = function (props) {
    openPopper = props.selectProps.menuIsOpen;
    return (
        <TextField
            id='popper-anchor-ei-analytics-search-box'
            fullWidth={true}
            InputProps={{
                inputComponent,
                inputProps: {
                    inputRef: props.innerRef,
                    children: props.children,
                    ...props.innerProps,
                },
            }}
            {...props.selectProps.textFieldProps}/>
    );
};

const Option = function (props) {
    return (
        <MenuItem
            buttonRef={props.innerRef}
            selected={props.isFocused}
            component='div'
            style={{fontWeight: props.isSelected ? 500 : 400}}
            {...props.innerProps}>
            {props.children}
        </MenuItem>
    );
};

const Placeholder = function (props) {
    return (
        <Typography
            style={{
                position: 'absolute',
                left: 2,
                fontSize: '90%',
                color: '#7e7e7e'
            }}
            {...props.innerProps}>
            {props.children}
        </Typography>
    );
};

const SingleValue = function (props) {
    return (
        <Typography
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                color: 'white',
                fontSize: '95%'
            }}
            {...props.innerProps}>
            {props.children}
        </Typography>
    );
};

const ValueContainer = function (props) {
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
                alignItems: 'center',
            }}>
            {props.children}
        </div>);
};

const MultiValue = function (props) {
    return (
        <Chip
            tabIndex={-1}
            label={props.children}
            onDelete={event => {
                props.removeProps.onClick();
                props.removeProps.onMouseDown(event);
            }}
            style={{
                borderRadius: 15,
                display: 'flex',
                flexWrap: 'wrap',
                fontSize: '90%',
                overflow: 'hidden',
                paddingLeft: 6,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: '20',
                margin: 2
            }}/>
    );
};

const Menu = function (props) {
    let popperNode = document.getElementById(popperAnchor);
    return (
        <Popper
            open={openPopper}
            anchorEl={popperNode}>
            <Paper
                square
                style={{width: popperNode ? popperNode.clientWidth : null}}
                {...props.innerProps}>
                {props.children}
            </Paper>
        </Popper>
    );
};

const components = {
    Option,
    Control,
    NoOptionsMessage,
    Placeholder,
    SingleValue,
    MultiValue,
    ValueContainer,
    Menu,
};

const SELECTED_COMPONENT = "id";

class EIAnalyticsSearchBox extends Widget {

    constructor(props) {
        super(props);
        this.state = {
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            options: [],
            availableOptions: [],
            selectedOption: null,
            faultyProviderConf: false
        };

        this.props.glContainer.on('resize', () => {
                this.setState({
                    width: this.props.glContainer.width,
                    height: this.props.glContainer.height
                });
            }
        );

        this.handleChange = this.handleChange.bind(this);
        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.excludeComponets = this.excludeComponets.bind(this);
        this.formatPageName = this.formatPageName.bind(this);
        this.updateStyleColor = this.updateStyleColor.bind(this);
        this.updateTextBoxColor = this.updateTextBoxColor.bind(this);
        this.publishMessage = this.publishMessage.bind(this);
        this.getCurrentPage = this.getCurrentPage.bind(this);
        this.getKey = this.getKey.bind(this);

        this.publishedMsgSet = [];
        this.pageName = this.getCurrentPage();
        this.pgAPI = "api";
        this.pgEndpoint = "endpoint";
        this.pgProxy = "proxy";
        this.pgSequence = "sequence";
        this.pgInbound = "inbound";
    }

    componentDidMount() {
        if (document.getElementById(popperAnchor)) {
            document.getElementById(popperAnchor).style = 'display: flex; padding: 0';
        }

        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {

                let query = message.data.configs.providerConfig.configs.config.queryData.query;
                let componentType = this.pageName;

                //change pageName variable to 'Proxy Service' to query data based on the componentType
                if (this.pageName == this.pgProxy) {
                    componentType = 'proxy service';
                }
                //change pageName variable to 'Inbound EndPoint'to query data based on the componentType
                else if (this.pageName == this.pgInbound) {
                    componentType = 'inbound endpoint';
                }

                message.data.configs.providerConfig.configs.config.queryData.query = query.replace('{{paramComponentType}}', componentType)
                super.getWidgetChannelManager().subscribeWidget(this.props.id,
                    this.handleDataReceived, message.data.configs.providerConfig);

            })
            .catch((error) => {
                this.setState({
                    faultyProviderConf: true
                });
            });
    }

    getCurrentPage() {
        return window.location.pathname.split('/').pop();
    }

    getKey(pageName, parameter) {
        return pageName + "_page_" + parameter;
    }

    //map data into options in the search box
    handleDataReceived(data) {
        let componentNameArr = data.data.map(
            function (nameArr) {
                return nameArr[0];
            });
        // remove endpoints in the excludeEndpoints-array from the options
        if (this.pageName == this.pgEndpoint) {
            let excludeEndpoints = ["AnonymousEndpoint"];
            this.excludeComponets(componentNameArr, excludeEndpoints);
        }

        // remove sequences in the excludeSequences-array from the options
        else if (this.pageName == this.pgSequence) {
            let excludeSequences = ["PROXY_INSEQ", "PROXY_OUTSEQ", "PROXY_FAULTSEQ", "API_OUTSEQ", "API_INSEQ",
                "API_FAULTSEQ", "AnonymousSequence"];
            this.excludeComponets(componentNameArr, excludeSequences);
        }

        let availableOptions = componentNameArr.map(option => ({
            value: option,
            label: option,
            disabled: false
        }));
        let selected = null;
        let queryParam = super.getGlobalState(this.getKey(this.pageName, SELECTED_COMPONENT));
        if (queryParam.length) {
            if (componentNameArr.indexOf(queryParam) > -1) {
                selected = [{
                    value: queryParam,
                    label: queryParam,
                    disabled: false
                }];
            }
        }
        this.setState({
            options: componentNameArr,
            availableOptions: availableOptions,
            selectedOption: selected
        }, this.publishMessage);
    }

    handleChange(event) {
        let options = this.state.options;
        let updatedOptions;
        let selectedValues = [];
        selectedValues[0] = event;

        updatedOptions = options.map(option => ({
            value: option,
            label: option,
            disabled: false
        }));
        this.setState({
            selectedOption: selectedValues,
            availableOptions: updatedOptions
        }, this.publishMessage);
    };

    //remove an array of elements from an array
    excludeComponets(componentNameArr, excludeItems) {
        let item;
        for (item in excludeItems) {
            let exSeq = excludeItems[item];
            let index = componentNameArr.indexOf(exSeq);
            if (index > -1) {
                componentNameArr.splice(index, 1);
            }
        }
    }

    formatPageName(str) {
        if (str) {
            switch (str) {
                case 'api':
                    return 'API';
                case 'proxy':
                    return 'Proxy Services';
                case 'sequence':
                    return 'Sequence';
                case 'endpoint':
                    return 'Endpoint';
                case 'inbound':
                    return 'Inbound Endpoint';
                case 'mediator':
                    return 'Mediator';
                default:
                    return '';
            }
        } else {
            return '';
        }
    }

    updateStyleColor(existingStyles, color) {
        let result = '';
        existingStyles.split(';').forEach((item) => {
            if (item.length > 0) {
                const itemPair = item.split(':');
                if (itemPair[0].trim() !== 'color') {
                    result = result + itemPair[0] + ': ' + itemPair[1] + ';'
                } else {
                    result = result + 'color: ' + color + ';'
                }
            }
        });
        return result;
    }

    updateTextBoxColor() {
        if (document.querySelector(textInputElement)) {
            const inputElm = document.querySelector(textInputElement);
            inputElm.style =
                this.updateStyleColor(inputElm.getAttribute('style'), this.props.muiTheme.palette.textColor);
        }
    }

    componentWillUnmount() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
    }

    publishMessage() {
        let pubMessage = this.state.selectedOption;
        if (pubMessage) {
            pubMessage = pubMessage[0].value;
            this.publishedMsgSet.push({time: new Date(), value: pubMessage});
            super.publish({"selectedComponent": pubMessage});
        }
    }

    render() {
        const {classes} = this.props;
        this.updateTextBoxColor();
        return (
            <JssProvider
                generateClassName={generateClassName}>
                <MuiThemeProvider
                    theme={this.props.muiTheme.name === 'dark' ? darkTheme : lightTheme}>
                    <Scrollbars
                        style={{height: this.state.height}}>
                        <div
                            style={{
                                paddingLeft: 15,
                                paddingRight: 15,
                                paddingTop: 5,
                            }}>
                            <div>
                                Filter by {this.formatPageName(this.pageName)}
                            </div>
                            <div>
                                <Select
                                    classes={classes}
                                    className='autocomplete'
                                    classNamePrefix='autocomplete'
                                    textFieldProps={{
                                        label: '',
                                        InputLabelProps: {
                                            shrink: false,
                                        },
                                    }}
                                    options={this.state.availableOptions}
                                    components={components}
                                    value={this.state.selectedOption}
                                    onChange={this.handleChange}
                                    placeholder='Select option'
                                />
                            </div>
                        </div>
                    </Scrollbars>
                </MuiThemeProvider>
            </JssProvider>
        );
    }
}

//This is the workaround suggested in https://github.com/marmelab/react-admin/issues/1782
const escapeRegex = /([[\].#*$><+~=|^:(),"'`\s])/g;
let classCounter = 0;

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


EIAnalyticsSearchBox.propTypes = {
    classes: PropTypes.object.isRequired,
};

global.dashboard.registerWidget('EIAnalyticsSearchBox', EIAnalyticsSearchBox);
