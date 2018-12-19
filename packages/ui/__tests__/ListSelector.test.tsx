import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import { UnregisteredCommand, Command } from '@karhu/core/lib/types';
import ListSelector from '../src/ListSelector';

const MyComp = (props: any) => {
  const { onExec, commands } = props;
  return (
    <ul>
      <ListSelector commands={commands} onExec={onExec}>
        {({ onSelect, activeCommandId, onExec }) => {
          return (
            <React.Fragment>
              {commands.map((c: Command) => (
                <li
                  className={activeCommandId === c.id ? 'active' : ''}
                  onMouseEnter={() => onSelect(c.id)}
                  onClick={() => onExec(c.id)}
                  key={c.id}
                >
                  {c.render(c)}
                </li>
              ))}
            </React.Fragment>
          );
        }}
      </ListSelector>
    </ul>
  );
};

describe('ListSelector', () => {
  test('lists and interacts with the commands in the list', () => {
    // Given
    const cmd1: UnregisteredCommand = {
      id: 'test1',
      name: 'Test Command 1',
      keywords: ['test'],
      render: jest.fn((c: Command) => {
        return <div>{c.name}</div>;
      }),
      actions: {
        onExec: jest.fn(),
      },
    };
    const cmd2: UnregisteredCommand = {
      id: 'test2',
      name: 'Test Command 2',
      keywords: ['test'],
      render: jest.fn((c: Command) => {
        return <div>{c.name}</div>;
      }),
      actions: {
        onExec: jest.fn(),
      },
    };
    const cmd3: UnregisteredCommand = {
      id: 'test3',
      name: 'Test Command 3',
      keywords: ['test'],
      render: jest.fn((c: Command) => {
        return <div>{c.name}</div>;
      }),
      actions: {
        onExec: jest.fn(),
      },
    };

    const onExec = jest.fn();

    // When
    const { container, rerender } = render(<MyComp commands={[cmd1, cmd2, cmd3]} onExec={onExec} />);

    // Then
    let active = container.querySelector('.active') as HTMLElement;
    expect(active.textContent).toEqual(cmd1.name);

    // Arrow up should move to last
    fireEvent.keyDown(container, {
      keyCode: 38, // ^
    });

    // Then
    active = container.querySelector('.active') as HTMLElement;
    expect(active.textContent).toEqual(cmd3.name);

    // When arrow up again
    fireEvent.keyDown(container, {
      keyCode: 38, // ^
    });

    // Then
    active = container.querySelector('.active') as HTMLElement;
    expect(active.textContent).toEqual(cmd2.name);

    // When
    // Re-order but keep selection
    rerender(<MyComp commands={[cmd1, cmd3, cmd2]} onExec={onExec} />);

    // Enter to execute
    fireEvent.keyDown(container, {
      keyCode: 13, // enter
    });

    // Then
    expect(onExec).toHaveBeenCalledTimes(1);
    expect(onExec).toHaveBeenCalledWith(cmd2.id);
  });
});
