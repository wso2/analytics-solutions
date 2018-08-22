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

import React from 'react';
import Widget from '@wso2-dashboards/widget';
import {MuiThemeProvider} from 'material-ui/styles/index';
import {IconButton} from "material-ui";
import RefreshIcon from "material-ui/svg-icons/navigation/refresh";
import Tweet from 'react-tweet-embed'
import './resources/tweet.css';
import {Scrollbars} from 'react-custom-scrollbars';

const MAX_DISPLAYED_TWEET_COUNT = 5;
const MAX_UNREAD_TWEET_COUNT = 15;

class PopularTweets extends Widget {
    constructor(props) {
        super(props);

        this.state = {
            tweetData: [],
            unreadTweets: [],
            width: this.props.glContainer.width,
            height: this.props.glContainer.height
        };

        this._handleDataReceived = this._handleDataReceived.bind(this);
        this.showUnreadTweets = this.showUnreadTweets.bind(this);

        this.props.glContainer.on('resize', () =>
            this.setState({
                width: this.props.glContainer.width,
                height: this.props.glContainer.height
            })
        );
    }

    componentDidMount() {
        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                super.getWidgetChannelManager()
                    .subscribeWidget(this.props.id, this._handleDataReceived, message.data.configs.providerConfig);
            })
    }

    componentWillUnmount() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
    }

    _handleDataReceived(receivedData) {
        let result = [];

        if (this.state.tweetData.length === 0) {
            receivedData.data.map(
                tweet => {
                    result.push({tweetID: tweet[0], id: tweet[1]})
                }
            );
            //select 5 most recent tweets to display and the next 15(or less) tweets as unread tweets.
            let numberOfRemovableTweets = result.length - MAX_DISPLAYED_TWEET_COUNT;
            let removedTweets =
                result.splice(MAX_DISPLAYED_TWEET_COUNT, numberOfRemovableTweets < 0 ? 0 : numberOfRemovableTweets);
            numberOfRemovableTweets = removedTweets.length - MAX_UNREAD_TWEET_COUNT;
            removedTweets.splice(MAX_UNREAD_TWEET_COUNT, numberOfRemovableTweets < 0 ? 0 : numberOfRemovableTweets);

            this.setState({
                tweetData: result,
                unreadTweets: removedTweets
            });
        } else {
            result = this.state.unreadTweets;
            receivedData.data.map(
                tweet => {
                    result.push({tweetID: tweet[0], id: tweet[1]})
                }
            );
            //sort by timestamp descending and select 15(or less) most recent tweets
            result.sort(function (a, b) {
                return b.id - a.id
            });
            let numberOfRemovableTweets = result.length - MAX_UNREAD_TWEET_COUNT;
            result.splice(MAX_UNREAD_TWEET_COUNT, numberOfRemovableTweets < 0 ? 0 : numberOfRemovableTweets);

            this.setState({
                unreadTweets: result
            });
        }
    }


    showUnreadTweets() {
        //refresh only if there are unread tweets
        if (this.state.unreadTweets.length > 0) {
            let result = this.state.unreadTweets;
            let numberOfRemovableTweets = result.length - MAX_DISPLAYED_TWEET_COUNT;
            let remainingUnread =
                result.splice(MAX_DISPLAYED_TWEET_COUNT, numberOfRemovableTweets < 0 ? 0 : numberOfRemovableTweets);

            this.setState({
                tweetData: result,
                unreadTweets: remainingUnread,
            });
        }
    }

    render() {
        return (
            <MuiThemeProvider
                muiTheme={this.props.muiTheme}>
                <section>
                    <div
                        style={{
                            height: 36,
                            textAlign: 'right'
                        }}>
                        <IconButton
                            tooltip='Refresh Popular Tweets'
                            onClick={this.showUnreadTweets}>
                            <RefreshIcon/>
                        </IconButton>
                    </div>
                    <Scrollbars
                        style={{height: this.state.height}}>
                        <div
                            className='tweet-stream'>
                            {
                                this.state.tweetData.map(
                                    (tweet) => {
                                        return <Tweet
                                            id={tweet.tweetID}
                                            options={{
                                                height: '10%',
                                                width: '100%',
                                                cards: 'hidden'
                                            }}/>
                                    }
                                )
                            }
                        </div>
                    </Scrollbars>
                </section>
            </MuiThemeProvider>
        );
    }
}

global.dashboard.registerWidget('PopularTweets', PopularTweets);
