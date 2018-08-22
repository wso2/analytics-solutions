
import Widget from "@wso2-dashboards/widget";
import VizG from 'react-vizgrammar';
import {MuiThemeProvider, darkBaseTheme, getMuiTheme} from 'material-ui/styles';
import RaisedButton from 'material-ui/RaisedButton';

class Messages extends Widget{
    constructor(props){
        super(props);

        this.ChartConfig ={
            charts: [
                {
                    type: "table",
                    columns: [
                    {
                        name: "USERNAME",
                        title: "Username"
                    },
                    {
                        name: "STARTTIME",
                        title: "Start Time"
                    },
                    {
                        name: "TERMINATETIME",
                        title: "Termination Time"
                    },
                    {
                        name: "ENDTIME",
                        title: "End Time"
                    },
                    {
                        name: "DURATION",
                        title: "Duration (ms)"
                    },
                    {
                        name: "ISACTIVE",
                        title: "Is Active"
                    },
                    {
                        name: "USERSTOREDOMAIN",
                        title: "User Store Domain"
                    },
                    {
                        name: "TENANTDOMAIN",
                        title: "Tenant Domain"
                    },
                    {
                        name: "REMOTEIP",
                        title: "Ip"
                    },
                    {
                        name: "REMEMBERMEFLAG",
                        title: "Remember Me Flag"
                    },
                    {
                        name: "CURRENTTIME",
                        title: "Timestamp"
                    }

                    ]
                }
            ],
            "pagination": true,
            "filterable": true,
            "append": false
        };

        this.metadata = {
            names: ['USERNAME', 'STARTTIME', 'TERMINATETIME', 'ENDTIME', 'DURATION', 'ISACTIVE', 'USERSTOREDOMAIN', 'TENANTDOMAIN', 'REMOTEIP', 'REMEMBERMEFLAG', 'CURRENTTIME'],
            types: ['ordinal', 'ordinal', 'ordinal', 'ordinal', 'time', 'ordinal', 'ordinal', 'ordinal', 'ordinal', 'ordinal', 'ordinal']
        };

        this.state ={
                    data: [],
                    metadata: this.metadata,
                    width: this.props.glContainer.width,
                    height: this.props.glContainer.height,
                    btnGroupHeight: 100
                };
        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.setReceivedMsg = this.setReceivedMsg.bind(this);
        this.assembleQuery = this.assembleQuery.bind(this);
    }
    handleResize(){
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }
    componentDidMount(){
        console.log("Configs: ", super.getWidgetConfiguration(this.props.widgetID));

        super.subscribe(this.setReceivedMsg);
        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                this.setState({
                    providerConfig: message.data.configs.providerConfig
                });
            })
    }
    componentWillUnmount(){
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
    }
    handleDataReceived(message){
        message.data.map((number) =>
        {
        
        for(let j=0;j<message.data.length;j++)
        { for(let i=0;i<10;i++){
            if (i==5){
            switch(message.data[j][i]){
                case 0: 
                message.data[j][i]='False';break;
                case 1: 
                message.data[j][i]='True';break;
            }
            }

            if (i==3){
               if(message.data[j][i]=='January 1,1970 05:29:59 IST')
               message.data[j][i]='Live';
                }
            if(i==9)
            {
            switch(message.data[j][i]){
                case 0: 
                message.data[j][i]='False';break;
                case 1: 
                message.data[j][i]='True';break;
            }
            }
        }
        }
        }
)
        this.setState({
            metadata: message.metadata,
            data: message.data
        });

        
    }
    setReceivedMsg(message){
        this.setState({
            fromDate: message.from,
            toDate: message.to
        }, this.assembleQuery);
    }
    assembleQuery(){
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
        let dataProviderConfigs = _.cloneDeep(this.state.providerConfig);
        let query = dataProviderConfigs.configs.config.queryData.query;
        query = query
            .replace('begin', this.state.fromDate)
            .replace('finish', this.state.toDate);
        dataProviderConfigs.configs.config.queryData.query = query;
        super.getWidgetChannelManager()
            .subscribeWidget(this.props.id, this.handleDataReceived, dataProviderConfigs);
    }
    render(){
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
                <section style={{paddingTop: 50}}>
                    <VizG
                        config={this.ChartConfig}
                        metadata={this.state.metadata}
                        data={this.state.data}
                        height={this.state.height - this.state.btnGroupHeight}
                        width={this.state.width}
                        theme={this.props.muiTheme.name}
                    />
                </section>
            </MuiThemeProvider>
        );
    }
}
global.dashboard.registerWidget("Messages", Messages);