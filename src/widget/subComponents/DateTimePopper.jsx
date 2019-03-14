import React, { Component } from 'react'
import { Popover, Grid, Button, Typography } from '@material-ui/core';
import { black } from 'material-ui/styles/colors';
import CustomTimeRangeSelector from './CustomTimeRangeSelector';

export class DateTimePopper extends Component {

  state = {
    granularityModeValue: 'none',
    calendarMode: 'date',
    timeGranularityMode: 'second',
  }

  render() {
    const quickRangeButtons = ['1 Min', '15 Min', '1 Hour', '1 Day', '7 Days', '1 Month', '3 Months', '6 Months', '1 Year']
    const { options, onChangeCustom, theme, onClose, changeGranularityModeCustomRanges } = this.props;
    const quickRanges = {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-evenly',
      marginTop: 8,
      marginRight: 25,
      marginBottom: 1,
      marginLeft: 5,
      backgroundColor: theme.name === 'dark' ? ' #333435' : '#ffffff',
      height: 397,
    }
    const customRanges = {
      marginTop: 8,
      marginRight: 6,
      marginLeft: -21,
      height: 397,
      backgroundColor: theme.name === 'dark' ? '#333435' : '#fffff'
    }
    const RangeHeader = {
      fontSize: 14,
      padding: 0.5,
      margin: 4,
      color: theme.name === 'dark' ? '#ffffff' : '#000'
    }
    return (
      <Popover
        id={"popper"}
        open={this.props.open}
        anchorEl={this.props.anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transitionDuration='auto'
        style={{ height: 550 }}
      >
        <Grid container
          style={{ maxWidth: 520, height: 410 }}
        >
          <Grid item xs={3}>
            <div style={quickRanges}>
              <Typography style={RangeHeader}>Quick Ranges</Typography>
              {quickRangeButtons.map((quickRangeButtons, index) =>
                <Button
                  size="small"
                  key={index}
                  variant="outlined"
                  onClick={() => this.props.changeQuickRangeGranularities(quickRangeButtons)}
                  style={{
                    border: 'none',
                    fontSize: 10,
                    margin: 2.5,
                  }}
                >
                  {quickRangeButtons}
                </Button>
              )}
            </div>
          </Grid>
          <Grid item xs={9}>
            <div style={customRanges}>
              <Typography style={{ ...RangeHeader, alignContent: 'center' }}>Custom Ranges</Typography>
              <Typography style={{ ...RangeHeader, fontSize: 10 }}>Granularity Modes</Typography>
              <CustomTimeRangeSelector
                options={options}
                handleClose={onClose}
                onChangeCustom={onChangeCustom}
                theme={theme}
                changeGranularityModeCustomRanges={changeGranularityModeCustomRanges}
              />
            </div>
          </Grid>
        </Grid>
      </Popover >
    )
  }
}
export default DateTimePopper
