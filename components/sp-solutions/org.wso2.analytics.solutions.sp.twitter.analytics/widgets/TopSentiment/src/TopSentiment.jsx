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
import {MuiThemeProvider} from 'material-ui/styles';
import {IconButton} from 'material-ui';
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import Tweet from 'react-tweet-embed'
import './resources/tweet.css';
import {Scrollbars} from 'react-custom-scrollbars';

const MAX_TWEET_COUNT = 5;

class TopSentiment extends Widget {
    constructor(props) {
        super(props);

        this.state = {
            positiveTweets: [],
            negativeTweets: [],
            unreadPositiveTweets: [],
            unreadNegativeTweets: [],
            width: this.props.glContainer.width,
            height: this.props.glContainer.height
        };

        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this._handleDataReceived = this._handleDataReceived.bind(this);
        this.showUnreadPositiveTweets = this.showUnreadPositiveTweets.bind(this);
        this.showUnreadNegativeTweets = this.showUnreadNegativeTweets.bind(this);
    }

    handleResize() {
        this.setState({
            width: this.props.glContainer.width,
            height: this.props.glContainer.height
        });
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

    _handleDataReceived(setData) {
        let positiveTweets = [];
        let negativeTweets = [];

        if (this.state.positiveTweets.length === 0 && this.state.negativeTweets.length === 0) {
            setData.data.map((tweet) => {
                if (tweet[3] === 'positive') {
                    positiveTweets.push({
                        id: tweet[0],
                        tweetID: tweet[1],
                        value: tweet[2]
                    })
                } else if (tweet[3] === 'negative') {
                    negativeTweets.push({
                        id: tweet[0],
                        tweetID: tweet[1],
                        value: tweet[2]
                    })
                }
            });
            //select 5 to display
            let numberOfRemovableTweets = positiveTweets.length - MAX_TWEET_COUNT;
            let removedPositive =
                positiveTweets.splice(MAX_TWEET_COUNT, numberOfRemovableTweets < 0 ? 0 : numberOfRemovableTweets);
            numberOfRemovableTweets = negativeTweets.length - MAX_TWEET_COUNT;
            let removedNegative =
                negativeTweets.splice(MAX_TWEET_COUNT, numberOfRemovableTweets < 0 ? 0 : numberOfRemovableTweets);

            this.setState({
                positiveTweets: positiveTweets,
                negativeTweets: negativeTweets,
                unreadPositiveTweets: removedPositive,
                unreadNegativeTweets: removedNegative
            });
        } else {
            positiveTweets = this.state.unreadPositiveTweets;
            negativeTweets = this.state.unreadNegativeTweets;
            setData.data.map((tweet) => {
                if (tweet[3] === 'positive') {
                    positiveTweets.push({
                        id: tweet[0],
                        tweetID: tweet[1],
                        value: tweet[2]
                    })
                } else if (tweet[3] === 'negative') {
                    negativeTweets.push({
                        id: tweet[0],
                        tweetID: tweet[1],
                        value: tweet[2]
                    })
                }
            });
            positiveTweets.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
            negativeTweets.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

            let numberOfRemovableTweets = positiveTweets.length - MAX_TWEET_COUNT;
            positiveTweets.splice(MAX_TWEET_COUNT, numberOfRemovableTweets < 0 ? 0 : numberOfRemovableTweets);
            numberOfRemovableTweets = negativeTweets.length - MAX_TWEET_COUNT;
            negativeTweets.splice(MAX_TWEET_COUNT, numberOfRemovableTweets < 0 ? 0 : numberOfRemovableTweets);

            this.setState({
                unreadPositiveTweets: positiveTweets,
                unreadNegativeTweets: negativeTweets
            });
        }
    }

    showUnreadPositiveTweets() {
        if(this.state.unreadPositiveTweets.length > 0) {
            this.setState({
                positiveTweets: this.state.unreadPositiveTweets.slice(),
                unreadPositiveTweets: [],
            });
        }
    }

    showUnreadNegativeTweets() {
        if(this.state.unreadNegativeTweets.length > 0) {
            this.setState({
                negativeTweets: this.state.unreadNegativeTweets.slice(),
                unreadNegativeTweets: [],
            });
        }
    }

    render() {

        return (
            <MuiThemeProvider muiTheme={this.props.muiTheme}>
                <div
                    style={{
                        height: this.state.height,
                        width: this.state.width,
                        paddingBottom: 10
                    }}>
                    <section>
                        <div
                            style={{ height: (this.state.height * 0.95)/2 }}>
                            <div
                                style={{
                                    paddingTop: 15,
                                    paddingLeft: 10,
                                    height: ((this.state.height * 0.95)/2)*0.1
                                }}>
                                Positive Sentiment Tweets
                                <div
                                    style={{
                                        textAlign: 'right'
                                    }}>
                                    <IconButton
                                        tooltip="Refresh Positive Sentiment Tweets"
                                        onClick={this.showUnreadPositiveTweets}>
                                        <RefreshIcon/>
                                    </IconButton>
                                </div>
                            </div>
                            <Scrollbars
                                style={{ height: ((this.state.height * 0.95)/2)*0.9 }}>
                                <div
                                    className='tweet-stream'>
                                    {
                                        this.state.positiveTweets.map(
                                            (tweet) => {
                                                return <Tweet
                                                    id={tweet.tweetID}
                                                    options={{
                                                        height: "10%",
                                                        width: '100%',
                                                        cards: 'hidden'
                                                    }}/>
                                            }
                                        )
                                    }
                                </div>
                            </Scrollbars>
                        </div>
                        <div style={{ height: (this.state.height * 0.05) }}/>
                        <div
                            style={{ height: (this.state.height * 0.95)/2 }}>
                            <div
                                style={{
                                    paddingTop: 15,
                                    paddingLeft: 10,
                                    height: ((this.state.height * 0.95)/2)*0.1
                                }}>
                                Negative Sentiment Tweets
                                <div
                                    style={{
                                        textAlign: 'right'
                                    }}>
                                    <IconButton
                                        tooltip="Refresh Negative Sentiment Tweets"
                                        onClick={this.showUnreadNegativeTweets}>
                                        <RefreshIcon/>
                                    </IconButton>
                                </div>
                            </div>
                            <Scrollbars
                                style={{ height: ((this.state.height * 0.95)/2)*0.9 }}>
                                <div
                                    className='tweet-stream'>
                                    {
                                        this.state.negativeTweets.map(
                                            (tweet) => {
                                                return <Tweet
                                                    id={tweet.tweetID}
                                                    options={{
                                                        height: "10%",
                                                        width: '100%',
                                                        cards: 'hidden'
                                                    }}/>
                                            }
                                        )
                                    }
                                </div>
                            </Scrollbars>
                        </div>
                    </section>
                </div>
            </MuiThemeProvider>
        );
    }
}

global.dashboard.registerWidget("TopSentiment", TopSentiment);
