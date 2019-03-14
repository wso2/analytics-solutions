import React, { Component } from "react";
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Button,
  Tabs,
  Tab,
  AppBar,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio
} from "@material-ui/core";
import "react-datepicker/dist/react-datepicker.css";
import widgetConf from "../../resources/widgetConf.json";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import DatePicker from "react-date-picker";
import PublisherEventStack from "./PublisherEventStack";

export class SettingsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openExpansion: false,
      tabIndex: false,
      subscriberModel: "Dummy publisher",
      startDate: "",
      endDate: "",
      simulationEventCount: 0
    };
  }

  syncTheEventStacks = eventStack => {
    this.setState({ eventStack });
  };

  changeTheme = theme => {
    this.setState({ theme });
    this.props.changeTheme(theme);
  };

  renderThemeConfigs = () => {
    return (
      <div style={{ width: "100%" }}>
        <p>
          Select the theme applied for the widget you can default theme
          configurations are dark and light{" "}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            style={{
              backgroundColor: "#18242a",
              color: "white",
              marginLeft: "30px"
            }}
            size={"small"}
            onClick={() => this.changeTheme("dark")}
          >
            Dark Theme
          </Button>
          <Button
            size={"small"}
            style={{
              borderColor: "#18242a",
              borderWidth: "1px",
              borderStyle: "solid",
              color: "#18242a",
              marginLeft: "30px"
            }}
            onClick={() => this.changeTheme("light")}
          >
            Light Theme
          </Button>
        </div>
      </div>
    );
  };

  renderPublisherConfigs = eventStack => {
    return (
      <div>
        <ExpansionPanel>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%"
              }}
            >
              <Typography style={{ fontWeight: "bold" }}>
                Event Stack
              </Typography>
              <Typography>{eventStack ? eventStack.length : 0}</Typography>
            </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <PublisherEventStack eventStack={eventStack} />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  };

  renderSubscriberConfigs = eventStack => {
    const { setSimulationModel } = this.props;
    const { updateEventStack } = this.props;
    return (
      <div>
        <Typography style={{ fontWeight: "bold" }}>Simulation Model</Typography>
        <FormControl component="fieldset" style={{ marginLeft: "20px" }}>
          <RadioGroup
            style={{ display: "inline", justifyContent: "space-between" }}
            value={this.state.subscriberModel}
            onChange={event => {
              const value = event.target.value;
              updateEventStack(new Array());
              this.setState({ subscriberModel: value }, () => {
                setSimulationModel(value);
              });
            }}
          >
            <FormControlLabel
              value="Dummy publisher"
              control={<Radio />}
              label="Dummy publisher"
            />
            <FormControlLabel
              value="Custom values"
              control={<Radio />}
              label="Custom values"
            />
          </RadioGroup>
        </FormControl>
        {this.state.subscriberModel === "Custom values" &&
          this.renderCustomPublisher(eventStack)}
        <ExpansionPanel>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%"
              }}
            >
              <Typography style={{ fontWeight: "bold" }}>
                Event Stack
              </Typography>
              <Typography>{eventStack ? eventStack.length : 0}</Typography>
            </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <PublisherEventStack eventStack={eventStack} />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  };

  renderCustomPublisher = eventStack => {
    const { startDate, endDate } = this.state;
    return (
      <div>
        <Typography>You can publish your own name value pair</Typography>
        <div
          style={{
            padding: "10px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span>
            <span>From : </span>
            <DatePicker
              onChange={date => {
                this.setState({ startDate: date });
              }}
              value={startDate}
            />
          </span>
          <span>
            <span>To : </span>
            <DatePicker
              onChange={date => {
                this.setState({ endDate: date });
              }}
              value={endDate}
            />
          </span>

          <span style={{ float: "right" }}>
            <Button
              size={"small"}
              color={"primary"}
              onClick={() => this.handleCustomDateEventPublish(eventStack)}
              style={{
                backgroundColor: "#333333",
                color: "white"
              }}
            >
              Publish
            </Button>
          </span>
        </div>
      </div>
    );
  };

  handleCustomDateEventPublish = eventStack => {
    const { startDate, endDate } = this.state;
    const { updateEventStack } = this.props;
    const dateRange = {
      from: startDate,
      to: endDate
    };
    global.callBackFunction(dateRange);
    console.log("event stack custom", eventStack);
    if (!eventStack) {
      eventStack = [];
    }
    eventStack.push(dateRange);
    updateEventStack(eventStack);
  };

  render() {
    const { publisherSimulation } = this.props;
    const { tabIndex, openExpansion } = this.state;
    const pubSubTypes = widgetConf.configs.pubsub.types;
    return (
      <div>
        <ExpansionPanel
          style={{ marginBottom: "5px" }}
          expanded={this.state.openExpansion}
        >
          <ExpansionPanelSummary style={{ padding: "0px", margin: "0px" }}>
            <AppBar
              position="static"
              style={{
                backgroundColor: "#222425",
                margin: "0px",
                padding: "0px"
              }}
            >
              <Tabs
                style={{
                  margin: "0px",
                  padding: "0px"
                }}
                value={tabIndex}
                onChange={(value, event) => {
                  console.log("value in tab", value.target.value);
                  if (tabIndex === event && openExpansion) {
                    this.setState({
                      openExpansion: false
                    });
                  } else {
                    this.setState({ tabIndex: event, openExpansion: "true" });
                  }
                }}
                fullWidth
              >
                <Tab label="Theme" style={{ color: "#ffffff" }} />
                {pubSubTypes.includes("publisher") && (
                  <Tab label="Publisher" style={{ color: "#ffffff" }} />
                )}

                {pubSubTypes.includes("subscriber") && (
                  <Tab
                    label="Publisher Simulations"
                    style={{ color: "#ffffff" }}
                  />
                )}
              </Tabs>
            </AppBar>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails
            style={{
              border: "1px solid #222425",
              padding: "15px",
              display: "block"
            }}
          >
            {tabIndex === 0 && this.renderThemeConfigs()}

            {tabIndex === 1 &&
              this.renderPublisherConfigs(publisherSimulation.eventStack)}
            {tabIndex === 2 &&
              this.renderSubscriberConfigs(publisherSimulation.eventStack)}
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }
}

export default SettingsPanel;
