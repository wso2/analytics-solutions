# Analytics Solutions
---
|  Branch | Build Status |
| :------------ |:-------------
| master      | [![Build Status](https://wso2.org/jenkins/view/analytics/job/analytics-products/job/analytics-solutions/badge/icon)](https://wso2.org/jenkins/view/analytics/job/analytics-products/job/analytics-solutions/) |
---

This project contains components which implement solutions implemented on WSO2 Stream Processor.

#### Analytics Solutions repository contains the following solutions:

* Twitter Analytics
* HTTP Analytics
* Distributed Message Tracing

## How to build from the source
### Prerequisites
* Java 8 or above
* [Apache Maven](https://maven.apache.org/download.cgi#) 3.x.x
* [Node.js](https://nodejs.org/en/) 8.x.x or above

### Steps
1. Install above prerequisites if they have not been already installed
2. Get a clone from [this](https://github.com/wso2/analytics-solutions.git) repository
3. Run one of the following Maven commands from the analytics-solutions directory
   * To build with the tests
        ```bash
         mvn clean install 
        ```
   * To build without running any unit/integration test
        ```bash
         mvn clean install -Dmaven.test.skip=true
        ```
## How to Contribute
* Please report issues [here](https://github.com/wso2/analytics-solutions/issues)
* Send your bug fixes pull requests to the [master branch](https://github.com/wso2/analytics-solutions/tree/master)

## Contact us
WSO2 Carbon developers can be contacted via the mailing lists:

* Carbon Developers List: dev@wso2.org
* Carbon Architecture List: architecture@wso2.org
