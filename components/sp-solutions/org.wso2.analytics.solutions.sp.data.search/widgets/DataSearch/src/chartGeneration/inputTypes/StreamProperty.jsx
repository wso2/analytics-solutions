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
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from "@material-ui/core/FormControl";

class StreamProperty extends React.Component{
    render(){
        // Filter out ordinal / linear stream fields
        const filteredFields = [];
        if (this.props.filter) {
            if (typeof(this.props.filter) === 'object') {
                // Multiple filters given as array
                for (let i = 0; i < this.props.metadata.names.length; i++) {
                    if (this.props.filter.indexOf(this.props.metadata.types[i]) > -1) {
                        filteredFields.push(this.props.metadata.names[i]);
                    }
                }
            } else {
                // Single filter
                for (let i = 0; i < this.props.metadata.names.length; i++) {
                    if (this.props.metadata.types[i] === this.props.filter) {
                        filteredFields.push(this.props.metadata.names[i]);
                    }
                }
            }
        } else {
            // No filter
            for (let i = 0; i < this.props.metadata.names.length; i++) {
                filteredFields.push(this.props.metadata.names[i]);
            }
        }

        return(
            <FormControl className = {this.props.formControl}>
                <InputLabel>{this.props.fieldName}</InputLabel>
                <Select
                    value = {this.props.value}
                    onChange = {(event) => this.props.onChange(this.props.id, event.target.value)}
                    style = {{minWidth:240}}
                    displayEmpty
                    className = {this.props.selectEmpty}
                >
                    {filteredFields.map(field => (
                        <MenuItem
                            key = {field}
                            value = {field}
                        >
                            {field}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }
}

export default StreamProperty;
