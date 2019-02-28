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

import React, {Component} from "react";
import Widget from "@wso2-dashboards/widget";
import vis from "vis";
import Moment from 'moment';
import 'vis/dist/vis.min.css';
import {Scrollbars} from 'react-custom-scrollbars';
import './OpenTracingVisTimeline.css';
import interact from "interactjs";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";

const COOKIE = 'DASHBOARD_USER';
const Classes = {
    VIS_FOREGROUND: "vis-foreground",
    VIS_LABEL: "vis-label",
    VIS_GROUP: "vis-group",
    VIS_ITEM_CONTAINER: "vis-item-container",
    VIS_ITEM_CONTENT: "vis-item-content",
    VIS_ITEM_OVERFLOW: "vis-item-overflow",
    VIS_DESCRIPTION_ITEM: "vis-description-item",
    VIS_ITEM_SPAN: "vis-item-span",
    VIS_ITEM_SPAN_DESCRIPTION: "vis-item-span-description",
    SELECTED_SPAN: "selected-span",
    HIGHLIGHTED_SPAN: "highlighted-span",
    RESIZE_HANDLE: "resize-handle",
    SPAN_LABEL_CONTAINER:"spanLabelContainer"
};

class OpenTracingVisTimeline extends Widget {

    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.state = {
            data: [],
            metadata: null,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            traceId: null
        };
        this.chartUpdated = false;
        this._handleDataReceived = this._handleDataReceived.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.addToTheGrandParentGroup = this.addToTheGrandParentGroup.bind(this);
        this.populateTimeline = this.populateTimeline.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.timeline = null;
        this.tempItems = [];
        this.itemList = [];
        this.descriptionItemList = [];
        this.clickedItemGroupId = -1;
        this.timelineEventListeners = [];
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }

    componentDidMount() {
        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                var urlParams = new URLSearchParams(decodeURI(window.location.search));
                message.data.configs.providerConfig.configs.config.queryData.query
                    = message.data.configs.providerConfig.configs.config.queryData.query
                    .replace("${traceId}", urlParams.get('traceid'));
                super.getWidgetChannelManager().subscribeWidget(
                    this.props.widgetID, this._handleDataReceived, message.data.configs.providerConfig);
            })
            .catch((error) => {
                console.log("error", error);
            });
    }

    static getUserCookie() {
        const arr = document.cookie.split(';');
        for (let i = 0; i < arr.length; i++) {
            let c = arr[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(COOKIE) === 0) {
                return JSON.parse(c.substring(COOKIE.length + 1, c.length));
            }
        }
        return null;
    }

    _handleDataReceived(data) {
        if (!this.chartUpdated) {
            this.populateTimeline(data.data);
            this.chartUpdated = true;
        }
        window.dispatchEvent(new Event('resize'));
    }

    getTimeDetsAppendedTag(tag, startTime, endTime) {
        const format = 'YYYY-MMM-DD hh:mm:ss.SSS A';
        const start = Moment(startTime);
        const end = Moment(endTime);
        let dataArray = JSON.parse(tag);
        dataArray = dataArray.concat(
            {'start.time' : start.format(format)},
            {'end.time' : end.format(format)},
            {'duration' : end.diff(start) + ' ms'}
        );
        return JSON.stringify(dataArray);
    }

    getSpanKind(tag) {
        let dataArray = JSON.parse(tag);
        let spanKind = "";
        dataArray.forEach(function(element) {
            if (typeof(element['span.kind']) !== 'undefined') {
                spanKind = element['span.kind'];
            }
        });
        return spanKind;
    }

    populateTimeline(data) {
        let groupList = [];
        this.tempItems = [];
        let lowestDate = -1;
        let highestDate = -1;
        if (data.length === 0) {
            if (this.timeline) {
                this.timeline.setGroups(new vis.DataSet([]));
                this.timeline.setItems(new vis.DataSet([]));
            }
        } else {
            for (let i = 0; i < data.length; i++) {
                if (lowestDate > data[i][5] || lowestDate === -1) {
                    lowestDate = data[i][5];
                }
                if (highestDate < data[i][6] || highestDate === -1) {
                    highestDate = data[i][6];
                }
            }
            let latestId = -1;
            for (let i = 0; i < data.length; i++) {
                latestId = i;
                let startTime = new Date(data[i][5]);
                let endTime;
                if (-1 !== data[i][6]) {
                    endTime = new Date(data[i][6]);
                } else {
                    endTime = new Date(data[i][5] + 1000);
                }
                let item = {
                    type2: "span",
                    start: startTime,
                    end: endTime,
                    content: data[i][7] + " ms",
                    id: i + 1 + 0.1,
                    group: i + 1,
                    className: Classes.VIS_ITEM_SPAN
                };
                let descriptionItem = {
                    type2: "description",
                    start: new Date(lowestDate),
                    end: new Date(highestDate),
                    tags: this.getTimeDetsAppendedTag(data[i][8], startTime, endTime),
                    baggageItems: data[i][9],
                    id: i + 1,
                    group: i + 1,
                    className: Classes.VIS_DESCRIPTION_ITEM
                };
                let tempItem = {
                    content: data[i][4],
                    group: i + 1,
                    parent: data[i][3],
                    span: data[i][2],
                    id: i + 1,
                    start: startTime.getTime(),
                    end: endTime.getTime()
                };
                this.descriptionItemList.push(descriptionItem);
                this.itemList.push(item);
                this.tempItems.push(tempItem);
                let group = {
                    content: data[i][4],
                    operationName: data[i][0],
                    kind: this.getSpanKind(data[i][8]),
                    value: i + 1,
                    id: i + 1,
                    start: startTime.getTime(),
                    end: endTime.getTime()
                };
                groupList.push(group);
            }
            for (let i = 0; i < this.tempItems.length; i++) {
                for (let j = 0; j < this.tempItems.length; j++) {
                    if (this.tempItems[i]["parent"] === this.tempItems[j]["span"]) {
                        groupList = this.addToTheGrandParentGroup(
                            groupList, this.tempItems, this.tempItems[j], this.tempItems[i]["id"]);
                    }
                }
            }
            let swap_item_1;
            let swap_item_value1;
            let swap_item_2;
            let swap_item_value2;
            for (let i = 0; i < this.tempItems.length; i++) {
                for (let j = i+1; i+1 < this.tempItems.length && j < this.tempItems.length; j++) {
                    if ((this.tempItems[i].start < this.tempItems[j].start) ||
                        (this.tempItems[i].start === this.tempItems[j].start &&
                            this.tempItems[i].end > this.tempItems[j].end)) {
                        for (let k = 0; k < groupList.length; k++) {
                            if (this.tempItems[i].id === groupList[k].id) {
                                swap_item_1 = k;
                                swap_item_value1 = groupList[k].value;
                            }
                        }
                        for (let k = 0; k < groupList.length; k++) {
                            if (this.tempItems[j].id === groupList[k].id) {
                                swap_item_2 = k;
                                swap_item_value2 = groupList[k].value;
                            }
                        }
                        groupList[swap_item_1].value = swap_item_value2;
                        groupList[swap_item_2].value = swap_item_value1;
                    }
                }
            }
            let scale, step, addingLimits;
            if ((highestDate - lowestDate) < 1000) {
                addingLimits = 10;
            } else if ((highestDate - lowestDate) < 60000 && (highestDate - lowestDate) >= 1000) {
                //from 1 second to 1 minute
                addingLimits = 2000;
            } else if ((highestDate - lowestDate) <= 3600000 && (highestDate - lowestDate) >= 60000) {
                //from 1 minute to 1 hour
                addingLimits = 60000;
            } else if ((highestDate - lowestDate) <= 86400000 && (highestDate - lowestDate) >= 3600000) {
                //from 1 hour to 24 hours
                addingLimits = 3600000;
            } else if ((highestDate - lowestDate) <= 604800000 && (highestDate - lowestDate) >= 86400000) {
                //from 24 hours to week
                addingLimits = 86400000;
            } else if ((highestDate - lowestDate) <= 2592000000 && (highestDate - lowestDate) >= 604800000) {
                //from week to month
                addingLimits = 604800000;
            } else if ((highestDate - lowestDate) <= 31104000000 && (highestDate - lowestDate) >= 2592000000) {
                //during a month
                addingLimits = 2592000000;
            }

            const kindsData = {
                client: {
                    name: "Client",
                    color: "#2a81bb"
                },
                server: {
                    name: "Server",
                    color: "#c22937"
                },
                producer: {
                    name: "Producer",
                    color: "#1a906c"
                },
                consumer: {
                    name: "Consumer",
                    color: "#725c9b"
                }
            };

            let options = {
                groupOrder: function (a, b) {
                    return  b.value - a.value;
                },
                groupOrderSwap: function (a, b, groups) {
                    let v = a.value;
                    a.value = b.value;
                    b.value = v;
                },
                groupTemplate: function (group) {
                    let container = document.createElement('div');
                    const kindData = kindsData[group.kind];
                    ReactDOM.render((
                        <div>
                            <div style={{minWidth: '150px'}} className="spanLabelContainer">
                                <span class='serviceName'>{group.content}</span>
                                <span class='operationName'>{group.operationName}</span>
                            </div>
                            {(kindData && <div className="kindBadge" style={{backgroundColor: kindData.color}}>
                                {kindData.name}</div>)}
                        </div>
                    ), container);
                    return container;
                },
                template: function (item, element) {
                    const newElement = document.createElement("div");
                    newElement.className = Classes.VIS_ITEM_CONTAINER;
                    let content = <span>{item.content}</span>;
                    if (item.type2 === "span") {
                        const parent = element.parentElement.parentElement;
                        parent.style.backgroundColor = "#3C529C";
                        return item.content;
                    } else {
                        const tagRows = [];
                        let tagDataArray = JSON.parse(item.tags);
                        if (0 < tagDataArray.length) {
                            for (let i = 0; i < tagDataArray.length; i++){
                                tagRows.push({
                                    key: Object.keys(tagDataArray[i])[0],
                                    value: tagDataArray[i][Object.keys(tagDataArray[i])[0]]
                                });
                            }
                        }
                        const baggageItemRows = [];
                        let baggageItemArray = JSON.parse(item.baggageItems);
                        if (0 < baggageItemArray.length) {
                            for (let i = 0; i < baggageItemArray.length; i++){
                                tagRows.push({
                                    key: Object.keys(baggageItemArray[i])[0],
                                    value: baggageItemArray[i][Object.keys(baggageItemArray[i])[0]]
                                });
                            }
                        }
                        content = (
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>Tags</Typography>
                                    <Table>
                                        <TableBody>
                                            {
                                                tagRows.map((row, index) => (
                                                    <TableRow hover key={index}>
                                                        <TableCell component="th" scope="row">
                                                            <div>{row.key}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>{row.value}</div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                    {(tagRows.length <= 0) && (<p style={{margin: 0}}>No Tags Found</p>)}
                                    <br/>
                                    <Typography color="textSecondary" gutterBottom>Baggage Items</Typography>
                                    <Table>
                                        <TableBody>
                                            {
                                                baggageItemRows.map((row, index) => (
                                                    <TableRow hover key={index}>
                                                        <TableCell component="th" scope="row">
                                                            <div>{row.key}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>{row.value}</div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                    {(baggageItemRows.length <= 0) &&
                                    (<p style={{margin: 0}}>No Baggage Items Found</p>)
                                    }
                                </CardContent>
                            </Card>
                        );
                    }
                    ReactDOM.render(content, newElement);
                    return newElement;
                },
                showTooltips: true,
                orientation: 'both',
                editable: false,
                groupEditable: false,
                min: new Date(lowestDate - addingLimits),
                max: new Date(highestDate + addingLimits),
                start: new Date(lowestDate - addingLimits),
                end: new Date(highestDate + addingLimits)
            };

            const selector = `.${Classes.SPAN_LABEL_CONTAINER}`;

            if (!this.timeline) {
                this.timeline = new vis.Timeline(this.myRef.current);
                this.addTimelineEventListener("changed", () => {
                    // Adjust span description
                    const fitDescriptionToTimelineWindow = (node) => {
                        node.style.left = "0px";
                    };
                    this.myRef.current.querySelectorAll(`div.${Classes.VIS_ITEM_SPAN_DESCRIPTION}`)
                        .forEach(fitDescriptionToTimelineWindow);
                    this.myRef.current.querySelectorAll(`div.${Classes.VIS_ITEM_CONTENT}`)
                        .forEach(fitDescriptionToTimelineWindow);

                    // Adjust span duration labels
                    this.myRef.current.querySelectorAll(`div.${Classes.VIS_ITEM_SPAN}`)
                        .forEach((node) => {
                            node.querySelector(`div.${Classes.VIS_ITEM_OVERFLOW}`).style.transform
                                = `translateX(${node.offsetWidth + 7}px)`;
                        });
                });
            }
            this.clearTimelineEventListeners("click");
            this.timeline.on('select', this.clickHandler);
            this.timeline.setOptions(options);
            this.timeline.setGroups(new vis.DataSet(groupList));
            this.timeline.setItems(new vis.DataSet(this.itemList));

            //Add resizable function
            this.addHorizontalResizability(selector);
        }
    }

    clickHandler(properties) {
        for (let i = 0; i < this.tempItems.length; i++) {
            if (parseInt(properties.items) === this.tempItems[i]["id"]) {
                if (this.clickedItemGroupId === -1) {
                    this.clickedItemGroupId = parseInt(properties.items);
                    for (let i = 0; i < this.descriptionItemList.length; i++) {
                        if (this.descriptionItemList[i].group === this.clickedItemGroupId) {
                            this.itemList.push(this.descriptionItemList[i]);
                            this.timeline.setItems(new vis.DataSet(this.itemList));
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < this.itemList.length; i++) {
                        if (this.itemList[i].id === this.clickedItemGroupId) {
                            this.clickedItemGroupId = -1;
                            this.itemList.splice(i, 1);
                            this.timeline.setItems(new vis.DataSet(this.itemList));
                            break;
                        }
                    }
                }
                break;
            }
        }
    }

    /**
     * Add event listener to the timeline.
     *
     * @param {string} type The name of the event listener that should be added to the timeline
     * @param {function} callBack The callback function to be called when the event fires
     */
    addTimelineEventListener(type, callBack) {
        this.timeline.on(type, callBack);
        this.timelineEventListeners.push({
            type: type,
            callBack: callBack
        });
    };

    /**
     * Clear the event listeners that were added to the timeline.
     * Can be cleared based on a type or all the event listeners.
     *
     * @param {string} type The name of the event for which the event listeners should be cleared (All cleared if null)
     */
    clearTimelineEventListeners(type){
        let timelineEventListeners;
        if (type) {
            timelineEventListeners = this.timelineEventListeners
                .filter((eventListener) => eventListener.type === type);
            this.timelineEventListeners = this.timelineEventListeners
                .filter((eventListener) => eventListener.type !== type);
        } else {
            timelineEventListeners = this.timelineEventListeners;
            this.timelineEventListeners = [];
        }

        for (let i = 0; i < timelineEventListeners.length; i++) {
            const eventListener = timelineEventListeners[i];
            this.timeline.off(eventListener.type, eventListener.callBack);
        }
    };

    /**
     * Add resizability to a set of items in the timeline.
     *
     * @param {string} selector The CSS selector of the items to which the resizability should be added
     */
    addHorizontalResizability(selector){
        const self = this;
        const edges = {right: true};

        // Add the horizontal resize handle
        const newNode = document.createElement("div");
        newNode.classList.add(Classes.RESIZE_HANDLE);
        const parent = this.myRef.current.querySelector(".vis-panel.vis-top");
        parent.insertBefore(newNode, parent.childNodes[0]);

        // Handling the resizing
        interact(selector).resizable({
            manualStart: true,
            edges: edges
        }).on("resizemove", (event) => {
            const targets = event.target;
            targets.forEach((target) => {
                // Update the element's style
                target.style.width = `${event.rect.width}px`;

                // Trigger timeline redraw
                self.timeline.body.emitter.emit("_change");
            });
        });

        // Handling dragging of the resize handle
        interact(`.${Classes.RESIZE_HANDLE}`).on("down", (event) => {
            event.interaction.start(
                {
                    name: "resize",
                    edges: edges
                },
                interact(selector),
                this.myRef.current.querySelectorAll(selector)
            );
        });
    };

    render() {
        return (
            <Scrollbars style={{height: this.state.height}}>
                <h2 style={{marginLeft: 12}}>TimeLine</h2>
                <div className="timeline-wrapper">
                    <div
                        ref={(ref) => {this.myRef.current = ref;}}
                        className="timeline-gadget-wrapper"
                    />
                </div>
            </Scrollbars>
        );
    }

    addToTheGrandParentGroup(groupList, tempItems, parentSpan, addingGroupId) {
        let groupListId = -1;
        for (let i = 0; i < tempItems.length; i++) {
            if (groupList[i]["id"] === parentSpan.id) {
                groupListId = i;
                break;
            }
        }
        if (!groupList[groupListId]["subgroupStack"]) {
            groupList[groupListId]["subgroupStack"] = {};
            groupList[groupListId]["nestedGroups"] = [];
        }
        groupList[groupListId]["subgroupStack"][addingGroupId] = false;
        groupList[groupListId]["nestedGroups"].push(addingGroupId);
        for (let j = 0; j < tempItems.length; j++) {
            if (tempItems[groupListId]["parent"] === tempItems[j]["span"]) {
                this.addToTheGrandParentGroup(groupList, tempItems, tempItems[j], addingGroupId);
            }
        }
        return groupList;
    }
}

global.dashboard.registerWidget('OpenTracingVisTimeline', OpenTracingVisTimeline);
