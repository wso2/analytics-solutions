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
import PdfReportGenerator from './PdfReportGenerator';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const textFieldStyle = {minWidth: 400,color: '#fc5800', marginTop: 0, marginBottom: 0};

class ReportConfigs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            description: '',
            type: this.props.type
        };
        this.handleTitleInput = this.handleTitleInput.bind(this);
        this.handleDescriptionInput = this.handleDescriptionInput.bind(this);
        this.saveBtnClicked = this.saveBtnClicked.bind(this);
    }

    handleTitleInput(event) {
        this.setState({title:event.target.value});
    }

    handleDescriptionInput(event) {
        this.setState({description:event.target.value});
    }

    saveBtnClicked() {
        if (this.state.type === 'table') {
            PdfReportGenerator.createTablePdf(this.props.element, this.props.theme, this.state.title,
                this.state.description);
        } else {
            PdfReportGenerator.createChartPdf(this.props.element, this.state.title, this.state.description);
        }
    }

    render() {
        return (
            <div style = {{marginTop: 0, marginBottom: 0}}>
                <TextField
                    label = 'Title'
                    value = {this.state.title}
                    onChange = {this.handleTitleInput}
                    style = {textFieldStyle}
                /><br/><br/>

                <TextField
                    label = 'Description'
                    value = {this.state.description}
                    onChange = {this.handleDescriptionInput}
                    style = {textFieldStyle}
                /><br/><br/>

                <Button
                    style = {{color: '#ffffff', border: 0, borderRadius: 3, background: '#fc5800', height: 33}}
                    onClick = {(this.saveBtnClicked)}>
                    SAVE AS PDF
                </Button>
            </div>
        );
    }
}
export default ReportConfigs;
