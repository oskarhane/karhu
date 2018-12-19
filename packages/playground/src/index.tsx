import React from 'react';
import ReactDOM from 'react-dom';
import Karhu from '@karhu/core';
import { KarhuProvider } from '@karhu/react';
import { UIToggler, DirtyPolarBear } from '@karhu/ui';

const karhu = new Karhu();
karhu.addCommand({
  name: 'hello',
  keywords: ['hello'],
  render: c => {
    return (
      <div>
        <div>{c.name}</div>
        <span className="subtitle">This is hello</span>
      </div>
    );
  },
  actions: {
    onExec: () => {
      console.log('executed hello');
    },
  },
});
karhu.addCommand({
  name: 'hello again',
  keywords: ['hello'],
  render: c => {
    return (
      <div>
        <div>{c.name}</div>
        <span className="subtitle">This is hello again</span>
      </div>
    );
  },
  actions: {
    onExec: () => {
      console.log('executed hello again');
    },
  },
});
karhu.addCommand({
  name: 'hello again again',
  keywords: ['hello'],
  render: c => {
    return (
      <div>
        <div>{c.name}</div>
        <span className="subtitle">This is hello again again</span>
      </div>
    );
  },
  actions: {
    onExec: () => {
      console.log('executed hello again again');
    },
  },
});

const shouldOpen = (e: KeyboardEvent) => {
  return (e.metaKey || e.ctrlKey) && e.keyCode === 75; // cmd+k
};

ReactDOM.render(
  <KarhuProvider value={karhu}>
    <h1>press (cmd or ctrl) and k to open</h1>
    <UIToggler shouldOpen={shouldOpen}>
      {props => <DirtyPolarBear open={props.open} setUIRef={props.setUIRef} onExec={props.onExec} />}
    </UIToggler>
  </KarhuProvider>,
  document.getElementById('root'),
);
