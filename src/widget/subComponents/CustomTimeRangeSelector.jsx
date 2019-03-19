/* eslint-disable react/prop-types */
/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import Moment from "moment";
import { Button, Typography } from '@material-ui/core';
import TimePicker from './DateTimePicker';
export default class CustomTimeRangeSelector extends React.Component {

  state = {
    invalidDateRange: false,
    customGranularityMode: 'second',
    startTime: Moment().subtract(1, 'days').toDate(),
    endTime: new Date(),
    customRangeButtonBackgroundColor: ['#403d3f', '#403d3f', '#403d3f', '#403d3f', '#403d3f', '#403d3f'],
  };

  getSelectedGranularities = () => {
    const { options } = this.props;
    let granularities = [];
    const minGranularity = options.availableGranularities || 'From Second';
    switch (minGranularity) {
      case 'From Second': this.state.monthRange[0], this.state.monthRange[1]
        granularities = ['Second', 'Minute', 'Hour', 'Day', 'Month', 'Year'];
        break;
      case 'From Minute':
        granularities = ['Minute', 'Hour', 'Day', 'Month', 'Year'];
        break;
      case 'From Hour':
        granularities = ['Hour', 'Day', 'Month', 'Year'];
        break;
      case 'From Day':
        granularities = ['Day', 'Month', 'Year'];
        break;
      case 'From Month':
        granularities = ['Month', 'Year'];
        break;
      case 'From Year':
        granularities = ['Year'];
        break;
      default:
      // do nothing
    }
    return granularities;
  }

  handleStartTimeChange = (date) => {
    const { endTime } = this.state
    const startTime = date
    if (
      Moment(startTime, 'YYYY-MM-DD HH:mm:ss.000').unix()
      >= Moment(endTime, 'YYYY-MM-DD HH:mm:ss.000').unix()
    ) {
      this.setState({ invalidDateRange: true });
    } else {
      this.setState({
        invalidDateRange: false,
        startTime: date
      });
    }
  }

  handleEndTimeChange = (date) => {
    const { startTime } = this.state
    const endTime = date
    if (
      Moment(startTime, 'YYYY-MM-DD HH:mm:ss.000').unix()
      >= Moment(endTime, 'YYYY-MM-DD HH:mm:ss.000').unix()
    ) {
      this.setState({ invalidDateRange: true });
    } else {
      this.setState({
        invalidDateRange: false,
        endTime: date
      });
    }
  }

  /*Publishing the custom time range
  onChangeCustom()=>handleGranularityChangeForCustom(mode, startTime, endTime, granularity)
  mode:custom
  granularity:second,minute,hour,day,month,year
  */
  publishCustomTimeRange = () => {
    const { handleClose, onChangeCustom, } = this.props;
    const { customGranularityMode, startTime, endTime } = this.state;
    console.log('startTime', startTime)
    handleClose()
    onChangeCustom('custom', startTime, endTime, customGranularityMode);
  }

  changeCustomRangeGranularity = (mode) => {
    this.props.changeGranularityModeCustomRanges(mode)
    this.setState({
      customGranularityMode: mode,
    })
  }

  render() {
    const customRangeButtons = ['second', 'minute', 'hour', 'day', 'month', 'year']
    const { customGranularityMode } = this.state
    const { theme } = this.props;
    const customRangeContainer = {
      marginLeft: 1,
      height: 330,
      display: 'flex',
      flexDirection: 'column'
    }
    const customRangeButtonContainer = {
      marginLeft: 15,
    }
    const customButtons = {
      fontSize: 10,
      padding: 0.3,
    }
    const timePicker = {
      flexWrap: 'wrap',
      display: 'flex',
      height: 220,
      padding: 5,
      color: theme.name === 'dark' ? '#ffffff' : '#000',
      marginTop: 10,
      marginLeft: 20,
      marginRight: 10,
      borderBottomStyle: 'solid',
      borderBottomWidth: 1,
      borderBottomColor: theme.name === 'dark' ? '#111618' : '#d8d0d0',
    }
    const footerButtons = {
      ...customButtons,
      padding: 10,
      color: '#000',
      marginRight: 7,
      '&:hover': {
        backgroundColor: 'red !important'
      }
    }
    const typographyLabel = {
      fontSize: 12,
      color: theme.name === 'dark' ? '#ffffff' : '#000',
      align: 'center'
    }


    return (
      <div style={customRangeContainer} >
        <div style={customRangeButtonContainer} >
          {customRangeButtons.map((customRangeButton, index) =>
            <Button
              key={index}
              variant="outlined"
              style={{
                ...customButtons,
                borderTopLeftRadius: index === 0 ? 6 : 0,
                borderBottomLeftRadius: index === 0 ? 6 : 0,
                borderTopRightRadius: index === 5 ? 6 : 0,
                borderBottomRightRadius: index === 5 ? 6 : 0,
                backgroundColor: theme.name === 'dark' ?
                  (customGranularityMode === customRangeButton ? '#756e71' : '#494547') :
                  (customGranularityMode === customRangeButton ? '#e9e8e8' : '#ffffff')
              }}
              onClick={() => this.changeCustomRangeGranularity(customRangeButton, index)}
            >
              {customRangeButton}
            </Button>
          )}
        </div>
        <div style={timePicker}>
          <div style={{ float: 'left', width: '50%' }}>
            <Typography style={typographyLabel}>From</Typography>
            <TimePicker
              onChange={this.handleStartTimeChange}
              inputType={this.state.customGranularityMode}
              initTime={Moment().subtract(1, 'days')}
              inputName="startTime"
              theme={this.props.theme}
              initTime={Moment().subtract(1, 'days')}
            />
          </div>
          <div style={{ float: 'right', width: '50%' }}>
            <Typography style={typographyLabel}>To</Typography>
            <TimePicker
              onChange={this.handleEndTimeChange}
              inputType={this.state.customGranularityMode}
              initTime={Moment()}
              inputName="endTime"
              startTime={this.state.startTime}
              theme={this.props.theme}
              initTime={Moment().subtract(1, 'days')}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 15 }}>
          <Button
            size='small'
            variant='outlined' style={{ ...footerButtons, backgroundColor: '#999' }}
            onClick={this.props.handleClose}
          >
            Cancel
          </Button>
          <Button
            size='small'
            variant='outlined'
            style={{ ...footerButtons, backgroundColor: '#ef6c00', }}
            onClick={this.publishCustomTimeRange}
          >
            Apply
          </Button>
        </div>
      </div >
    );
  }
}
