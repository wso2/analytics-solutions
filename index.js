import React from 'react';
import { render } from 'react-dom';
import DateTimePicker from './src/widget/DateTimePicker';
import Frame from './mocking/components/Frame';


render(
  <Frame><DateTimePicker /></Frame>,
  document.getElementById('root'),
);
