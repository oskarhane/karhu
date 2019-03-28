import React from 'react';
import { AddCommand } from '@karhu/react';
import { EntryGraph, UnregisteredCommand, CommandRunResult } from '@karhu/core/lib/types';
import { DirtyPolarBear, useToggler } from '@karhu/ui';

function shouldOpen(e: KeyboardEvent): boolean {
  return (e.metaKey || e.ctrlKey) && e.keyCode === 75; // Open with cmd/ctrl + k
}

const commands: UnregisteredCommand[] = [
  {
    name: 'log',
    keywords: ['console log'],
    onExec: () => {
      console.log('Executed log command');
    },
    render: () => {
      return <div style={{ textAlign: 'left' }}>Log something to console</div>;
    },
  },
  {
    name: 'log2',
    keywords: ['console log again'],
    onExec: () => {
      console.log('Executed second log command');
    },
    render: () => {
      return <div style={{ textAlign: 'left' }}>Second command to log to console</div>;
    },
  },
  {
    name: 'alert',
    keywords: ['alert me', 'interrupt'],
    onExec: () => {
      alert('Interrupted!');
    },
    render: () => {
      return <div style={{ textAlign: 'left' }}>Interrupt me plz</div>;
    },
  },
  {
    name: 'log-custom',
    keywords: ['custom log'],
    onExec: ({ userArgs }) => {
      if (userArgs) {
        console.log('You provided args:', userArgs);
      } else {
        console.log('No args provided');
      }
    },
    render: (c, { userArgs }) => {
      console.log('userArgs: ', userArgs);
      return (
        <div style={{ textAlign: 'left' }}>
          Log "{userArgs}"{' '}
          <div style={{ fontSize: '10px', marginTop: '4px' }}>Using &lt; to pipe args into command</div>
        </div>
      );
    },
  },
];

function MyKarhu() {
  const togglerProps = useToggler({ shouldOpen });
  const onExec = (result: CommandRunResult) => {
    const entryGraph: EntryGraph = result.entryGraph;
    console.log('entryGraph: ', entryGraph);
    togglerProps.onExec(result);
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
