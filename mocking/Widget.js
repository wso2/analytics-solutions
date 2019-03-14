/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { Component } from "react";
import moment from "moment";
import ChannelManager from "./ChannelManager";

/**
 * Acting as a mocking component to the @wso2/Dashboard-widget
 * All the calls of subscribing and publishing activities are carried out
 */

export default class Widget extends Component {
  /**
   * Checking for the subscriber model for active the simulation
   * @param {JSON} nextProps
   * @param {JSON} nextState
   */
  componentWillUpdate(nextProps, nextState) {
    this.state.theme = nextProps.muiTheme.name;
    const { publisherSimulation } = nextProps.simulation;
    const { randomPublisherRunningStatus, subscribeCallBack } = this.state;
    this.state.publishModel = publisherSimulation.simulationModel;
    if (publisherSimulation.simulationModel === "Custom values") {
      clearInterval(this.intervalFunction);
      this.state.randomPublisherRunningStatus = false;
    }
    if (
      randomPublisherRunningStatus === false &&
      publisherSimulation.simulationModel === "Dummy publisher"
    ) {
      this.publishEventsWithInterval(subscribeCallBack);
      this.state.randomPublisherRunningStatus = true;
    }
  }

  /**
   * Calling the Channel Manager
   * @returns {} ChannelManager
   */
  getWidgetChannelManager() {
    return ChannelManager;
  }

  /**
   * Publishing an event from the widget to the Golden Layout
   * @param {JSON} message
   */
  publish(message) {
    const { simulation } = this.props;
    const { publisherSimulation } = simulation;

    const granularity = message.granularity;

    const eventStack = publisherSimulation.eventStack;
    eventStack.push({ from: message.from, to: message.to, granularity });
    simulation.updateEventStack(eventStack);
  }

  /**
   * Subscribing for events from a simulation model
   * @param {Function} callBackFunction
   */
  subscribe(callBackFunction) {
    // Registering the callback function globally
    global.callBackFunction = callBackFunction;

    const { simulationModel } = this.props.simulation.publisherSimulation;
    this.setState({
      subscribeCallBack: callBackFunction,
      randomPublisherRunningStatus: true,
      publishModel: simulationModel
    });

    if (simulationModel === "Dummy publisher") {
      this.publishEventsWithInterval(callBackFunction);
    }
  }

  /**
   * Publishing date events periodically default delay is 5 seconds
   * @param {Function} callBackFunction
   */
  publishEventsWithInterval(callBackFunction) {
    this.intervalFunction = setInterval(() => {
      const { simulation } = this.props;
      const { publisherSimulation } = simulation;

      let randomStart = this.randomDate(
        new Date("2018", "01", "01"),
        new Date()
      );
      const randomEnd = moment(this.randomDate(randomStart, new Date())).format(
        "x"
      );
      randomStart = moment(randomStart).format("x");
      const granularity = this.randomGranularity();
      const eventStack = publisherSimulation.eventStack;
      eventStack.push({ from: randomStart, to: randomEnd, granularity });
      simulation.updateEventStack(eventStack);
      callBackFunction({ from: randomStart, to: randomEnd, granularity });
    }, 5000);
  }

  /**
   * Generating Random date event
   * @param {*} start - Starting Date
   * @param {*} end - Ending Date
   *
   * @returns {Date}
   */
  randomDate(start, end) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  /**
   * Getting a Random granularity import * as alias from
   * @returns {string} granularity
   */
  randomGranularity() {
    const granularities = [
      "years",
      "months",
      "days",
      "hours",
      "minutes",
      "seconds"
    ];
    return granularities[Math.floor(Math.random() * granularities.length)];
  }

  /**
   * Getting global state
   * @param {JSON} state
   */
  getGlobalState(state) {
    return "state";
  }

  /**
   * Setting global state
   * @param {JSON} state
   */
  setGlobalState(state) {}
}
