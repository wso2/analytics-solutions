/*
 *  Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
export default class UtilFunctions {
    static validateLineChartConfiguration(configuration) {
        if (configuration.charts[0].color === '') {
            delete configuration.charts[0].color;
        }
        if (configuration.x === '' || configuration.charts[0].y === '') {
            return false;
        }
        return true;
    }

    static validateScatterChartConfiguration(configuration) {
        if (configuration.charts[0].color === '') {
            delete configuration.charts[0].color;
        }
        if (configuration.charts[0].size === '') {
            delete configuration.charts[0].size;
        }
        if (configuration.charts[0].x === '' || configuration.charts[0].y === '') {
            return false;
        }
        return true;
    }

    static validatePieChartConfiguration(configuration) {
        return (!(configuration.charts[0].x === '' || configuration.charts[0].color === ''));
    }

    static validateGeographicalChartConfiguration(configuration) {
      if (configuration.x === '' || configuration.charts[0].y === '' || configuration.charts[0].mapType === '') {
          return false;
      }
        return true;
    }
}
