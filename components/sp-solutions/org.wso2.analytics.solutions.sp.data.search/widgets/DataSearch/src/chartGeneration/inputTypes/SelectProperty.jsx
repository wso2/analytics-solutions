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
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from "@material-ui/core/FormControl";

class SelectProperty extends React.Component{

    render(){
        return(
            <FormControl className = {this.props.formControl}>
                <InputLabel>{this.props.fieldName}</InputLabel>
                <Select
                    value = {this.props.value}
                    style = {{minWidth:240}}
                    displayEmpty
                    className = {this.props.selectEmpty}
                    onChange = {(event) => {this.props.onChange(this.props.id,event.target.value)}}
                >
                    {this.props.options.values.map((value, index) => (
                        <MenuItem
                            key = {index}
                            value = {value}
                        >
                            {this.props.options.texts[index]}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }
}

export default SelectProperty;
