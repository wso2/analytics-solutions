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
package org.wso2.extension.siddhi.execution.geovelocity;

import org.wso2.extension.siddhi.execution.geovelocity.api.GeoVelocityData;
import org.wso2.extension.siddhi.execution.geovelocity.api.GeoVelocityDataResolver;
import org.wso2.extension.siddhi.execution.geovelocity.internal.exception.GeoVelocityException;
import org.wso2.siddhi.annotation.Example;
import org.wso2.siddhi.annotation.Extension;
import org.wso2.siddhi.annotation.Parameter;
import org.wso2.siddhi.annotation.ReturnAttribute;
import org.wso2.siddhi.annotation.util.DataType;
import org.wso2.siddhi.core.config.SiddhiAppContext;
import org.wso2.siddhi.core.executor.ExpressionExecutor;
import org.wso2.siddhi.core.executor.function.FunctionExecutor;
import org.wso2.siddhi.core.util.config.ConfigReader;
import org.wso2.siddhi.query.api.definition.Attribute;
import org.wso2.siddhi.query.api.exception.SiddhiAppValidationException;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * This class is to get the risk of login based on
 * the user's login behaviour.
 */
@Extension(
        name = "loginbehaviourbasedrisk",
        namespace = "geovelocity",
        description = "Returns the login behaviour based calculated risk" +
                "considering the location and the time of the login",
        parameters = {
                @Parameter(
                        name = "username",
                        description = "current login location",
                        type = {DataType.STRING}),
                @Parameter(
                        name = "city",
                        description = "User's current login city",
                        type = {DataType.STRING}),
                @Parameter(
                        name = "currentlogintime",
                        description = "timestamp of current login",
                        type = {DataType.LONG})
        },
        returnAttributes =
        @ReturnAttribute(
                description = "Returns the login behaviour based calculated risk" +
                        "considering the location and the time of the login",
                type = {DataType.DOUBLE}),
        examples = @Example(
                description = "This will return the login behaviour based risk " +
                        "considering the location and the time of the login",
                syntax = "define stream GeovelocityStream(username string, city string," +
                        "currentlogintime string);\n" +
                        "from GeovelocityStream\n" +
                        "select geo:loginbehaviourrisk(username, city," +
                        "currentlogintime) as loginbehaviourbasedrisk \n" +
                        "insert into outputStream;")
)

public class GetLoginBehaviourRisk extends FunctionExecutor {

    private static GeoVelocityDataResolver geoVelocityDataResolverImpl;
    private static final String DEFAULT_GEOVELOCITY_RESOLVER_CLASSNAME =
            "org.wso2.extension.siddhi.execution.geovelocity.internal.impl.DefaultDBBasedGeoVelocityDataResolver";
    private static AtomicBoolean isExtensionConfigInitialized = new AtomicBoolean(false);

    /**
     * The initialization method for {@link FunctionExecutor},
     * which will be called before other methods and validate
     * the all configuration and getting the initial values.
     *
     * @param attributeExpressionExecutors are the executors of each attributes in the Function
     * @param configReader                 this hold the {@link FunctionExecutor} extensions configuration reader.
     * @param siddhiAppContext             Siddhi app runtime context
     */
    @Override
    protected void init(ExpressionExecutor[] attributeExpressionExecutors, ConfigReader configReader,
                        SiddhiAppContext siddhiAppContext) {
        if (attributeExpressionExecutors.length != 3) {
            throw new SiddhiAppValidationException("Invalid no of arguments passed to geo:loginbehaviourrisk" +
                    " function, required 3, but found " + attributeExpressionExecutors.length);
        }

        if (!isExtensionConfigInitialized.get()) {
            initializeExtensionConfigs(configReader);
        }
    }

    /**
     * The main execution method which will be called upon event arrival
     * when there are more than one Function parameter
     *
     * @param data the runtime values of Function parameters
     * @return the Function result
     */
    @Override
    protected Object execute(Object[] data) {
        GeoVelocityData geoVelocityData;
        String username = data[0].toString();
        String city = data[1].toString();
        Long currentLoginTime = Long.parseLong(data[2].toString());
        geoVelocityData = geoVelocityDataResolverImpl.getGeoVelocityInfo(username, city);
        Long lastLoginTime = geoVelocityData.getLoginBehaviourBasedRisk();
        double risk;
        // Time difference is convert to days by deviding miliseconds by 1000*60*60*24.
        if (lastLoginTime != 0L) {
            double timeDifference = (currentLoginTime - lastLoginTime) / 86400000.00;
            risk = 1 - Math.pow(Math.E, -timeDifference);
        } else {
            risk = 0.5;
        }
        return risk;
    }

    /**
     * The main execution method which will be called upon event arrival
     * when there are zero or one Function parameter
     *
     * @param data null if the Function parameter count is zero or
     *             runtime data value of the Function parameter
     * @return the Function result
     */
    @Override
    protected Object execute(Object data) {
        return null;
    }

    /**
     * return a Class object that represents the formal return type of the method represented by this Method object.
     *
     * @return the return type for the method this object represents
     */
    @Override
    public Attribute.Type getReturnType() {
        return Attribute.Type.DOUBLE;
    }

    /**
     * Used to collect the serializable state of the processing element, that need to be
     * persisted for reconstructing the element to the same state on a different point of time
     *
     * @return stateful objects of the processing element as an map
     */
    @Override
    public Map<String, Object> currentState() {
        return Collections.emptyMap();
    }

    /**
     * Used to restore serialized state of the processing element, for reconstructing
     * the element to the same state as if was on a previous point of time.
     *
     * @param state the stateful objects of the processing element as a map.
     *              This is the same map that is created upon calling currentState() method.
     */
    @Override
    public void restoreState(Map<String, Object> state) {

    }

    private void initializeExtensionConfigs(ConfigReader configReader) throws SiddhiAppValidationException {
        String geovelocityResolverImplClassName = configReader.readConfig("geoVelocityResolverClass",
                DEFAULT_GEOVELOCITY_RESOLVER_CLASSNAME);
        try {
            geoVelocityDataResolverImpl = (GeoVelocityDataResolver) Class.forName(
                    geovelocityResolverImplClassName).newInstance();
            geoVelocityDataResolverImpl.init(configReader);
            isExtensionConfigInitialized.set(true);
        } catch (InstantiationException e) {
            throw new SiddhiAppValidationException("Cannot instantiate " +
                    "GeoVelocityDataResolver implementation class '"
                    + geovelocityResolverImplClassName + "' given in the configuration", e);
        } catch (IllegalAccessException e) {
            throw new SiddhiAppValidationException("Cannot access " +
                    "GeoVelocityDataResolver implementation class '"
                    + geovelocityResolverImplClassName + "' given in the configuration", e);
        } catch (ClassNotFoundException e) {
            throw new SiddhiAppValidationException("Cannot find " +
                    "GeoVelocityDataResolver implementation class '"
                    + geovelocityResolverImplClassName + "' given in the configuration", e);
        } catch (ClassCastException e) {
            throw new SiddhiAppValidationException("Cannot cast " +
                    "GeoVelocityDataResolver implementation class '"
                    + geovelocityResolverImplClassName + "' to 'GeoVelocityDataResolver'", e);
        } catch (GeoVelocityException e) {
            throw new SiddhiAppValidationException("Cannot initialize " +
                    "GeoVelocityDataResolver implementation class '"
                    + geovelocityResolverImplClassName + "' given in the configuration", e);
        }
    }
}