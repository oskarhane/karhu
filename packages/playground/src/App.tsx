import React, { Component } from 'react';
import { KarhuProvider } from '@karhu/react';
import Karhu from '@karhu/core';

import './App.css';
import MyKarhu from './MyKarhu';

const karhu: Karhu = new Karhu({}, 100);

function App() {
  return (
    <KarhuProvider value={{ karhu }}>
      <div className="App">
        <h2>Press cmd+k to open Karhu</h2>
        <MyKarhu />
      </div>
    </KarhuProvider>
  );
}

export default App;
