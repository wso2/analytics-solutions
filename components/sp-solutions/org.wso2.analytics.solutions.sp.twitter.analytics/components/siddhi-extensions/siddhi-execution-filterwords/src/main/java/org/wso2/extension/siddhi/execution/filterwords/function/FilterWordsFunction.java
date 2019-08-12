/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
package org.wso2.extension.siddhi.execution.filterwords.function;

import io.siddhi.annotation.Example;
import io.siddhi.annotation.Extension;
import io.siddhi.annotation.Parameter;
import io.siddhi.annotation.ReturnAttribute;
import io.siddhi.annotation.util.DataType;
import io.siddhi.core.config.SiddhiQueryContext;
import io.siddhi.core.exception.SiddhiAppRuntimeException;
import io.siddhi.core.executor.ExpressionExecutor;
import io.siddhi.core.executor.function.FunctionExecutor;
import io.siddhi.core.util.config.ConfigReader;
import io.siddhi.core.util.snapshot.state.State;
import io.siddhi.core.util.snapshot.state.StateFactory;
import io.siddhi.query.api.definition.Attribute;
import io.siddhi.query.api.exception.SiddhiAppValidationException;
import org.apache.log4j.Logger;


import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.StringTokenizer;

/**
 * country(string)
 * Returns word if the given word is meaningful.
 * Accept Type(s): STRING
 * Return Type(s): STRING
 */

@Extension(
        name = "filterwords",
        namespace = "text",
        description = "Returns the word if the given word is meaningful, otherwise returns null",
        parameters = {
                @Parameter(name = "input.string",
                        description = "The input string to isMeaningful whether given word is meaningful.",
                        type = {DataType.STRING})
        },
        returnAttributes = @ReturnAttribute(
                description = "Outputs the given word if it is meaningful.",
                type = {DataType.STRING}),
        examples = @Example(description = "This outputs the given words if it is meaningful. In this scenario, the " +
                "output is 'shopping is super @Amazon' .", syntax = "filterwords(\"shopping,super\")")
)

public class FilterWordsFunction extends FunctionExecutor {

    private static final Logger log = Logger.getLogger(FilterWordsFunction.class);
    private Attribute.Type returnType = Attribute.Type.STRING;


    /**
     * The initialization method for {@link FunctionExecutor}, which will be called before other methods and validate
     * the all configuration and getting the initial values.
     *
     * @param attributeExpressionExecutors are the executors of each attributes in the Function
     * @param configReader                 this hold the {@link FunctionExecutor} extensions configuration reader.
     * @param siddhiQueryContext           Siddhi query context
     */
    @Override
    protected StateFactory init(ExpressionExecutor[] attributeExpressionExecutors, ConfigReader configReader,
                                SiddhiQueryContext siddhiQueryContext) {
        if (attributeExpressionExecutors.length != 1) {
            throw new SiddhiAppValidationException("Invalid no of arguments passed to str:filterwords() function. " +
                    "Required 1. Found " + attributeExpressionExecutors.length);
        } else if (attributeExpressionExecutors[0].getReturnType() != Attribute.Type.STRING) {
            throw new SiddhiAppValidationException(
                    "Invalid parameter type found for find:country() function, required " + Attribute.Type.STRING +
                            ", " + "but found " + attributeExpressionExecutors[0].getReturnType());
        }
        return null;

    }

    /**
     * The main execution method which will be called upon event arrival
     * when there are more than one Function parameter
     *
     * @param data the runtime values of Function parameters
     * @param state current query state
     * @return the Function result
     */
    @Override
    protected Object execute(Object[] data, State state) {
        return null; //Since the length function takes in only 1 parameter, this method does not get called.
        // Hence, not implemented.
    }

    /**
     * The main execution method which will be called upon event arrival
     * when there are zero or one Function parameter
     *
     * @param data null if the Function parameter count is zero or
     *             runtime data value of the Function parameter
     * @param state current query state
     * @return the Function result
     */
    @Override
    protected Object execute(Object data, State state) {
        StringBuilder tokens = new StringBuilder();
        String token;
        String words = null;
        if (data == null) {
            throw new SiddhiAppRuntimeException("Invalid input given to str:filterwords() function. " +
                    "The argument cannot be null");
        }
        StringTokenizer text = new StringTokenizer(data.toString(), " ':/.,*");
        while (text.hasMoreTokens()) {
            token = text.nextToken();
            if (!token.matches("#(.*)") && !token.matches("@(.*)") && isMeaningful(token)) {
                tokens.append(token + ",");
            }
        }
        if (!tokens.toString().isEmpty()) {
           words = tokens.toString().substring(0, tokens.toString().length() - 1);
        }
        return words;
    }

    /**
     * return a Class object that represents the formal return type of the method represented by this Method object.
     *
     * @return the return type for the method this object represents
     */
    @Override
    public Attribute.Type getReturnType() {
        return returnType;
    }

    /**
     * To check whether the given word is meaningful or not
     *
     * @param word - given word
     * @return - true if the given word is meaningful
     */

    private boolean isMeaningful(String word) {
        String line;
        InputStream inputStream = FilterWordsFunction.class.getResourceAsStream("/words.csv");
        try (BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream,
                StandardCharsets.UTF_8))) {
            while ((line = bufferedReader.readLine()) != null) {
                if (word.equalsIgnoreCase(line)) {
                    return false;
                }
            }
        } catch (FileNotFoundException e) {
            log.error("File is not found : " + e.getMessage());
        } catch (IOException e) {
            log.error("Error occurred while reading file : " + e.getMessage());
        }
        return true;
    }
}
