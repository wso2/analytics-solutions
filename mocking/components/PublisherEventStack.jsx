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

import React from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from '@material-ui/core';

import moment from 'moment';

/**
 * Construct the preview of the existing eventStack
 * @param {Object} eventStack
 * @returns {JSX} elmenent
 */
const PublisherEventStack = ({ eventStack }) => {
  const styles = {
    tableCell: { fontSize: '0.8rem', padding: '0px' },
  };

  let eventTable;

  if (eventStack) {
    eventTable = eventStack
      .map((event, index) => {
        const e = JSON.parse(JSON.stringify(event));
        return (
          <TableRow key={index}>
            <TableCell align="right" style={styles.tableCell}>
              {e.granularity}
            </TableCell>
            <TableCell align="right" style={styles.tableCell}>
              {moment(e.from, 'x').format('YYYY-MM-DD HH:mm:ss')}
            </TableCell>
            <TableCell align="right" style={styles.tableCell}>
              {moment(e.to, 'x').format('YYYY-MM-DD HH:mm:ss')}
            </TableCell>
          </TableRow>
        );
      })
      .reverse();
  }
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell align="center">Granularity </TableCell>
          <TableCell align="center">Start DateTime </TableCell>
          <TableCell align="center">End DateTime</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {eventTable || (
          <Typography>Currently no events in the stack</Typography>
        )}
      </TableBody>
    </Table>
  );
};

export default PublisherEventStack;
