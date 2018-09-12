/* eslint-disable react/no-access-state-in-setstate,array-callback-return,consistent-return,no-unused-vars */
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
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import _ from 'lodash';
import JssProvider from 'react-jss/lib/JssProvider';

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

const inputFields = [
    {
        name: 'serviceProvider',
        label: 'Service Provider',
        doDisplay: true,
    },
    {
        name: 'userStoreDomain',
        label: 'User Store Domain',
        doDisplay: true,
    },
    {
        name: 'role',
        label: 'Role',
        doDisplay: true,
    },
    {
        name: 'identityProvider',
        label: 'Identity Provider',
        doDisplay: true,
    },
    {
        name: 'username',
        label: 'Username',
        doDisplay: true,
    },
];

const messageHeader = 'additionalFilterConditions';

const filterConditions = {
    serviceProvider: '',
    userStoreDomain: '',
    role: '',
    identityProvider: '',
    username: '',
};

// This is the workaround suggested in https://github.com/marmelab/react-admin/issues/1782

const escapeRegex = /([[\].#*$><+~=|^:(),"'`\s])/g;
let classCounter = 0;

// eslint-disable-next-line import/prefer-default-export
export const userPreferencesStylesClass = (rule, styleSheet) => {
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

class IsAnalyticsUserPreferences extends Widget {
    constructor(props) {
        super(props);

        this.state = {
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,

            faultyProviderConf: false,
            options: this.props.configs.options,
            filterValue: '',
            inputFields,
            filterConditions,
            byFirstLogins: false,
            isPublished: true,
        };

        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
        this.publishFilterConditions = this.publishFilterConditions.bind(this);
        this.clearFilterConditions = this.clearFilterConditions.bind(this);
        this.handleRadioButtonChange = this.handleRadioButtonChange.bind(this);
        this.onReceivingMessage = this.onReceivingMessage.bind(this);

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
                    faultyProviderConf: true,
                });
            });

        const inputFieldsClone = _.cloneDeep(inputFields);

        switch (this.state.options.widgetType) {
            case ('Local'):
                inputFieldsClone[3].doDisplay = false;
                break;
            case ('Federated'):
                inputFieldsClone[1].doDisplay = false;
                inputFieldsClone[2].doDisplay = false;
                break;
            default:
                inputFieldsClone[1].doDisplay = false;
                inputFieldsClone[2].doDisplay = false;
                inputFieldsClone[3].doDisplay = false;
                break;
        }

        this.setState({
            inputFields: inputFieldsClone,
        });
    }

    handleTextFieldChange(event, fieldName) {
        const filterConditionClone = _.cloneDeep(this.state.filterConditions);

        filterConditionClone[fieldName] = event.target.value;
        this.setState({
            filterConditions: filterConditionClone,
            isPublished: false,
        });
    }

    handleRadioButtonChange(event) {
        const filterConditionClone = _.cloneDeep(this.state.filterConditions);

        if (event.target.value === 'byFirstLogins' && !this.state.byFirstLogins) {
            filterConditionClone.isFirstLogin = true;
            this.setState({
                filterConditions: filterConditionClone,
                byFirstLogins: true,
                isPublished: false,
            });
        } else if (event.target.value === 'byAll' && this.state.byFirstLogins) {
            delete filterConditionClone.isFirstLogin;
            this.setState({
                filterConditions: filterConditionClone,
                byFirstLogins: false,
                isPublished: false,
            });
        }
    }

    publishFilterConditions() {
        if (!this.state.isPublished) {
            const message = {
                header: messageHeader,
                body: this.state.filterConditions,
            };
            super.publish(message);

            this.setState({
                isPublished: true,
            });
        }
    }

    clearFilterConditions() {
        const message = {
            header: messageHeader,
            body: '',
        };

        this.setState({
            filterConditions,
            byFirstLogins: false,
        }, super.publish(message));
    }

    onReceivingMessage(message) {
        if (message.header === 'barChartFilter') {
            const filterConditionsClone = _.cloneDeep(this.state.filterConditions);
            filterConditionsClone[message.title] = message.value;
            this.setState({
                filterConditions: filterConditionsClone,
                isPublished: false,
            }, () => this.publishFilterConditions());
        }
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

        return (
            <JssProvider generateClassName={userPreferencesStylesClass}>
                <MuiThemeProvider theme={theme}>
                    <div style={divSpacings}>
                        <div style={{ height: height * 0.6, width: width * 0.9 }}>
                            <tr>
                                {this.state.inputFields.map(function (field, i) {
                                    if (field.doDisplay) {
                                        return (
                                            <td style={{ padding: 10 }}>
                                                <TextField
                                                    value={this.state.filterConditions[field.name]}
                                                    id={field.name}
                                                    label={field.label}
                                                    onChange={event => this.handleTextFieldChange(event, field.name)}
                                                />
                                            </td>
                                        );
                                    }
                                }, this)}
                                {
                                    this.state.options.widgetType === 'Overall'
                                    && (
                                        <div>
                                            <td>
                                                <Radio
                                                    color="primary"
                                                    value="byAll"
                                                    checked={!(this.state.byFirstLogins)}
                                                    onChange={event => this.handleRadioButtonChange(event)}
                                                />
                                            </td>
                                            <td>
                                            By All
                                            </td>
                                            <td>
                                                <Radio
                                                    color="secondary"
                                                    value="byFirstLogins"
                                                    checked={this.state.byFirstLogins}
                                                    onChange={event => this.handleRadioButtonChange(event)}
                                                />
                                            </td>
                                            <td>
                                            By First Logins
                                            </td>
                                        </div>
                                    )
                                }
                            </tr>
                        </div>
                        <div style={{ height: height * 0.2, width: width * 0.9 }}>
                            <table>
                                <tr>
                                    <td style={{ padding: 15 }}>
                                        <Button
                                            color="secondary"
                                            variant="flat"
                                            component="span"
                                            onClick={() => this.clearFilterConditions()}
                                        >
                                            Clear All
                                        </Button>
                                    </td>
                                    <td style={{ padding: 15 }}>
                                        <Button
                                            color="primary"
                                            variant="raised"
                                            component="span"
                                            onClick={() => this.publishFilterConditions()}
                                        >
                                            Filter
                                        </Button>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </MuiThemeProvider>
            </JssProvider>
        );
    }
}

global.dashboard.registerWidget('IsAnalyticsUserPreferences', IsAnalyticsUserPreferences);
