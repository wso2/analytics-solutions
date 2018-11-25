/*
 *  Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.extension.siddhi.execution.geovelocity.internal.impl;

import org.wso2.extension.siddhi.execution.geovelocity.api.GeoVelocityData;
import org.wso2.extension.siddhi.execution.geovelocity.api.GeoVelocityDataResolver;
import org.wso2.extension.siddhi.execution.geovelocity.internal.exception.GeoVelocityException;
import org.wso2.siddhi.core.util.config.ConfigReader;

/**
 * The default implementation of the GeoVelocityResolver interface. This is implemented based on RDBMS.
 */
public class DefaultDBBasedGeoVelocityDataResolver implements GeoVelocityDataResolver {

    @Override
    public void init(ConfigReader configReader) throws GeoVelocityException {
        RDBMSGeoVelocityDataResolver.getInstance().init(configReader);
    }

    @Override
    public GeoVelocityData getGeoVelocityInfo(String username, String city) {
        GeoVelocityData geoVelocityData;
        geoVelocityData = RDBMSGeoVelocityDataResolver.getInstance().getGeoVelocityData
                (username, city);
        return geoVelocityData != null ? geoVelocityData : new GeoVelocityData(0L, 0);
    }

    @Override
    public GeoVelocityData checkLoginLocationValidity(String currentCity, String previousCity,
                                                      String currentCountry, String previousCountry) {
        GeoVelocityData geoVelocityData;
        geoVelocityData = RDBMSGeoVelocityDataResolver.getInstance().getRestrictedLocations(currentCity, previousCity,
                currentCountry, previousCountry);
        return geoVelocityData != null ? geoVelocityData : new GeoVelocityData(0L, 0);
    }
}
