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
import { Button } from '@material-ui/core';
import TimePicker from './DateTimePicker';
export default class CustomTimeRangeSelector extends React.Component {

  state = {
    invalidDateRange: false,
    customGranularityMode: 'second',
    startTime: Moment().subtract(1, 'days').toDate(),
    endTime: new Date()
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
    console.log('event', mode.current)
    this.props.changeGranularityModeCustomRanges(mode)
    this.setState({
      customGranularityMode: mode,
    })
  }

  render() {
    const customRangeButtons = ['Second', 'Minute', 'Hour', 'Day', 'Month', 'Year']
    const { theme } = this.props;
    const customRangeContainer = {
      marginRight: 5,
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
      height: 260,
      padding: 5,
      color: theme.name === 'dark' ? '#ffffff' : '#000',
      fontSize: 15,
      marginTop: 10,
      marginLeft: 20,
      marginRight: 10,
      borderTopStyle: 'solid',
      borderBottomStyle: 'solid',
      borderBottomWidth: 1,
      borderTopWidth: 1,
      borderTopColor: theme.name === 'dark' ? '#111618' : '#d8d0d0',
      borderBottomColor: theme.name === 'dark' ? '#111618' : '#d8d0d0',


    }
    const footerButtons = {
      ...customButtons,
      padding: 10,
      backgroundColor: '#ef6c00',
      color: 'black',
      marginRight: 7

    }


    return (
      <div style={customRangeContainer} >
        <div style={customRangeButtonContainer} >
          {customRangeButtons.map((customRangeButtons, index) =>
            <Button
              key={index}
              variant="outlined"
              style={{
                ...customButtons,
                borderTopLeftRadius: index === 0 ? 6 : 0,
                borderBottomLeftRadius: index === 0 ? 6 : 0,
                borderTopRightRadius: index === 5 ? 6 : 0,
                borderBottomRightRadius: index === 5 ? 6 : 0,
              }}
              onClick={() => this.changeCustomRangeGranularity(customRangeButtons.toLocaleLowerCase())}
            >
              {customRangeButtons}
            </Button>
          )}
        </div>
        <div style={timePicker}>
          <div style={{ float: 'left', width: '50%' }}>
            From
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
            To
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
          <Button variant='outlined' style={footerButtons}
            onClick={this.publishCustomTimeRange}
          >
            Apply
          </Button>
          <Button
            variant='outlined' style={{ ...footerButtons, backgroundColor: '#999' }}
            onClick={this.props.handleClose}
          >
            Cancel
          </Button>
        </div>
      </div >
    );
  }
}
