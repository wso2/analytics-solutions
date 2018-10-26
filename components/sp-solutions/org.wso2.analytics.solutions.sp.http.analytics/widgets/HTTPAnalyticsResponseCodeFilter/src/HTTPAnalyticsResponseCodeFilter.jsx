/* eslint-disable react/prop-types */
/*
 * Copyright (c) 2018, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import Widget from '@wso2-dashboards/widget';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Select from 'react-select';
import JssProvider from 'react-jss/lib/JssProvider';
import { Scrollbars } from 'react-custom-scrollbars';

// This is the workaround suggested in https://github.com/marmelab/react-admin/issues/1782
const escapeRegex = /([[\].#*$><+~=|^:(),"'`\s])/g;
let classCounter = 0;

const generateClassName = (rule, styleSheet) => {
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
export { generateClassName as default };

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

const popperAnchor = 'popper-anchor-http-response-code-filter';
const textInputElement = '#popper-anchor-http-response-code-filter div div div input';
let openPopper = false;

// the following methods are used to implement autocomplete select using react select.
// for more information : https://v1-5-0.material-ui.com/demos/autocomplete/
const NoOptionsMessage = function (props) {
    const { innerProps, children } = props;
    return (
        <Typography
            style={{
                padding: 15,
                color: '#7e7e7e',
            }}
            {...innerProps}
        >
            {children}
        </Typography>
    );
};

const inputComponent = function ({ inputRef, ...props }) {
    return (
        <div
            ref={inputRef}
            {...props}
        />
    );
};

const Control = function (props) {
    const {
        selectProps, innerRef, children, innerProps,
    } = props;

    openPopper = selectProps.menuIsOpen;
    return (
        <TextField
            id='popper-anchor-http-response-code-filter'
            fullWidth
            InputProps={{
                inputComponent,
                inputProps: {
                    inputRef: innerRef,
                    children,
                    ...innerProps,
                    style: { display: 'flex' },
                },
            }}
            {...selectProps.textFieldProps}
        />
    );
};

const Option = function (props) {
    const {
        innerRef, isFocused, isSelected, children, innerProps,
    } = props;
    return (
        <MenuItem
            buttonRef={innerRef}
            selected={isFocused}
            component='div'
            style={{ fontWeight: isSelected ? 500 : 400 }}
            {...innerProps}
        >
            {children}
        </MenuItem>
    );
};

const Placeholder = function (props) {
    const { children, innerProps } = props;
    return (
        <Typography
            style={{
                position: 'absolute',
                left: 2,
                fontSize: '90%',
                color: '#7e7e7e',
            }}
            {...innerProps}
        >
            {children}
        </Typography>
    );
};

const SingleValue = function (props) {
    const { children, innerProps } = props;
    return (
        <Typography
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                color: 'white',
                fontSize: '95%',
            }}
            {...innerProps}
        >
            {children}
        </Typography>
    );
};

const ValueContainer = function (props) {
    const { children } = props;
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
                alignItems: 'center',
            }}
        >
            {children}
        </div>);
};

const MultiValue = function (props) {
    const { children } = props;

    return (
        <Chip
            tabIndex={-1}
            label={children}
            onDelete={(event) => {
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
                margin: 2,
            }}
        />
    );
};

const Menu = function (props) {
    const popperNode = document.getElementById(popperAnchor);
    const { children, innerProps } = props;
    return (
        <Popper
            open={openPopper}
            anchorEl={popperNode}
        >
            <Paper
                square
                style={{ width: popperNode ? popperNode.clientWidth : null }}
                {...innerProps}
            >
                {children}
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

/**
 * HTTPAnalyticsResponseCodeFilter which renders the perspective and filter in response code analytics page
 */
class HTTPAnalyticsResponseCodeFilter extends Widget {
    constructor(props) {
        super(props);
        this.state = {
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            perspective: 3,
            services: [],
            serviceOptions: [],
            selectedServiceValues: null,
            faultyProviderConf: false,
        };

        this.props.glContainer.on('resize', () => {
            this.setState({
                width: this.props.glContainer.width,
                height: this.props.glContainer.height,
            });
        });
        this.handleChange = this.handleChange.bind(this);
        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.publishUpdate = this.publishUpdate.bind(this);
        this.updateStyleColor = this.updateStyleColor.bind(this);
        this.updateTextBoxColor = this.updateTextBoxColor.bind(this);
        this.initialPublish = this.initialPublish.bind(this);
        this.setQueryParams = this.setQueryParams.bind(this);
    }

    /**
     * Publish user selection to other widgets
     */
    publishUpdate() {
        this.setQueryParams();
        super.publish({
            perspective: this.state.perspective,
            selectedServiceValues: this.state.selectedServiceValues,
        });
    }

    /**
     * Set user selection as query params
     */
    setQueryParams() {
        let selection = [];
        if (this.state.selectedServiceValues
            && !(this.state.selectedServiceValues instanceof Array)) {
            selection = this.state.selectedServiceValues.value;
        }
        super.setGlobalState('httpResCode', { responseCode: selection });
    }

    /**
     * Set the state of the widget after metadata and data is received from SiddhiAppProvider
     * @param data
     */
    handleDataReceived(data) {
        let services = [];
        data.data.forEach((dataUnit) => {
            services.push(dataUnit[1]);
        });
        services = services.filter((v, i, a) => a.indexOf(v) === i);
        services.sort(this.naturalSort);

        const serviceOptions = services.map(service => ({
            value: service,
            label: service,
            disabled: false,
        }));

        this.setState({
            services,
            serviceOptions,
        }, this.initialPublish);
    }

    /**
     * Handle initial selection publish
     */
    initialPublish() {
        const responseCodeSelection = super.getGlobalState('httpResCode');
        if (responseCodeSelection.responseCode
            && !(responseCodeSelection.responseCode instanceof Array)
            && this.state.services.indexOf(responseCodeSelection.responseCode) !== -1) {
            this.handleChange({
                value: responseCodeSelection.responseCode,
                label: responseCodeSelection.responseCode,
                disabled: false,
            });
        } else {
            this.publishUpdate();
        }
    }

    /**
     * Sort in ascending order
     * @param a
     * @param b
     */
    naturalSort(a, b) {
        // sort in asc order
        if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
        } else {
            // used to sort alphanumeric combinations
            const ax = []; const
                bx = [];

            a.replace(/(\d+)|(\D+)/g, (_, $1, $2) => { ax.push([$1 || Infinity, $2 || '']); });
            b.replace(/(\d+)|(\D+)/g, (_, $1, $2) => { bx.push([$1 || Infinity, $2 || '']); });

            while (ax.length && bx.length) {
                const an = ax.shift();
                const bn = bx.shift();
                const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
                if (nn) return nn;
            }
            return ax.length - bx.length;
        }
    }

    /**
     * Publish user selection in filters
     * @param values
     */
    handleChange(values) {
        const { services } = this.state;
        const updatedOptions = services.map(option => ({
            value: option,
            label: option,
            disabled: false,
        }));
        this.setState({
            selectedServiceValues: values,
            serviceOptions: updatedOptions,
        }, this.publishUpdate);
    }

    /**
     * Add given text color to a given style
     * @param existingStyles
     * @param color
     */
    updateStyleColor(existingStyles, color) {
        let result = '';
        existingStyles.split(';').forEach((item) => {
            if (item.length > 0) {
                const itemPair = item.split(':');
                if (itemPair[0].trim() !== 'color') {
                    result = result + itemPair[0] + ': ' + itemPair[1] + ';';
                } else {
                    result = result + 'color: ' + color + ';';
                }
            }
        });
        return result;
    }

    /**
     * Update the text color of the text field in autocomplete
     */
    updateTextBoxColor() {
        if (textInputElement
            && document.querySelector(textInputElement)) {
            const inputElm = document.querySelector(textInputElement);
            inputElm.style = this.updateStyleColor(
                inputElm.getAttribute('style'), this.props.muiTheme.palette.textColor
            );
        }
    }


    componentDidMount() {
        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                super.getWidgetChannelManager()
                    .subscribeWidget(this.props.id, this.handleDataReceived, message.data.configs.providerConfig);
            })
            .catch(() => {
                this.setState({
                    faultyProviderConf: true,
                });
            });
    }

    componentWillUnmount() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
    }

    render() {
        this.updateTextBoxColor();
        return (
            <JssProvider
                generateClassName={generateClassName}
            >
                <MuiThemeProvider
                    theme={this.props.muiTheme.name === 'dark' ? darkTheme : lightTheme}
                >
                    <Scrollbars
                        style={{ height: this.state.height }}
                    >
                        <div
                            style={{
                                paddingLeft: 15,
                                paddingRight: 15,
                            }}
                        >
                            <Tabs
                                value={this.state.perspective}
                            >
                                <Tab value={3} label="Response Code" />
                            </Tabs>
                            <Select
                                className='autocomplete'
                                classNamePrefix='autocomplete'
                                textFieldProps={{
                                    label: '',
                                    InputLabelProps: {
                                        shrink: false,
                                    },
                                }}
                                options={this.state.serviceOptions}
                                components={components}
                                value={this.state.selectedServiceValues}
                                onChange={this.handleChange}
                                placeholder='Filter by Service'
                            />
                        </div>
                    </Scrollbars>
                </MuiThemeProvider>
            </JssProvider>
        );
    }
}

global.dashboard.registerWidget('HTTPAnalyticsResponseCodeFilter', HTTPAnalyticsResponseCodeFilter);
