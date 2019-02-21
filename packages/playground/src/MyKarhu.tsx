import React from 'react';
import { AddCommand } from '@karhu/react';
import { EntryGraph, UnregisteredCommand } from '@karhu/core/lib/types';
import { DirtyPolarBear, useToggler } from '@karhu/ui';

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
  {
    name: 'alert',
    keywords: ['alert me', 'interrupt'],
    actions: {
      onExec: () => {
        alert('Interrupted!');
      },
    },
    render: () => {
      return <div style={{ textAlign: 'left' }}>Interrupt me plz</div>;
    },
  },
];

function MyKarhu() {
  const togglerProps = useToggler({ shouldOpen });
  const onExec = (entryGraph: EntryGraph) => {
    console.log('entryGraph: ', entryGraph);
    togglerProps.onExec();
  };
  return (
    <React.Fragment>
      {commands.map(command => (
        <AddCommand key={command.name} command={command} />
      ))}
      <DirtyPolarBear open={togglerProps.open} setUIRef={togglerProps.setUIRef} onExec={onExec} />
    </React.Fragment>
  );
}

export default MyKarhu;
