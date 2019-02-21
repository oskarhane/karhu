import React, { Component } from 'react';
import Karhu from '@karhu/core';
import { KarhuProvider, AddCommand } from '@karhu/react';
import { EntryGraph, UnregisteredCommand } from '@karhu/core/lib/types';
import { DirtyPolarBear, UIToggler } from '@karhu/ui';
import './App.css';

function shouldOpen(e: KeyboardEvent): boolean {
  return (e.metaKey || e.ctrlKey) && e.keyCode === 75; // Open with cmd/ctrl + k
}

const commands: UnregisteredCommand[] = [
  {
    name: 'log',
    keywords: ['console log'],
    actions: {
      onExec: () => {
        console.log('Executed log command');
      },
    },
    render: () => {
      return <div style={{ textAlign: 'left' }}>Log something to console</div>;
    },
  },
  {
    name: 'log2',
    keywords: ['console log again'],
    actions: {
      onExec: () => {
        console.log('Executed second log command');
      },
    },
    render: () => {
      return <div style={{ textAlign: 'left' }}>Second command to log to console</div>;
    },
  },
];

const karhu: Karhu = new Karhu({}, 100);

const C = () => {
  return (
    <KarhuProvider value={{ karhu }}>
      {commands.map(command => (
        <AddCommand key={command.name} command={command} />
      ))}

      <UIToggler shouldOpen={shouldOpen}>
        {props => {
          const onExec = (entryGraph: EntryGraph) => {
            props.onExec(entryGraph);
          };
          return <DirtyPolarBear open={props.open} setUIRef={props.setUIRef} onExec={onExec} />;
        }}
      </UIToggler>
    </KarhuProvider>
  );
};

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="App">
          <h2>Press cmd+k to open Karhu</h2>
          <header className="App-header" />
          <C />
        </div>
      </React.Fragment>
    );
  }
}

export default App;
