import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import Karhu from '@karhu/core';
import { UnregisteredCommand, Command } from '@karhu/core/lib/types';
import { KarhuProvider } from '@karhu/react';

import { DirtyPolarBear } from '../src';

let portalRoot = document.getElementById('portal');
if (!portalRoot) {
  portalRoot = document.createElement('div');
  portalRoot.setAttribute('id', 'portal');
  document.body.appendChild(portalRoot);
}

describe('polarbear', () => {
  let karhu: Karhu = new Karhu();
  const openWith = (e: KeyboardEvent) => {
    return e.keyCode === 75;
  };
  const closeWith = (e: KeyboardEvent) => {
    return e.keyCode === 27;
  };
  beforeEach(() => {
    karhu = new Karhu({});
  });
  afterEach(() => {
    karhu.reset();
  });
  test('renders and opens and closes', () => {
    // When
    const { baseElement } = render(<DirtyPolarBear openWith={openWith} closeWith={closeWith} element={portalRoot} />);

    // Then
    expect(baseElement.querySelector('.karhu')).toBeNull();

    // When pressing hotkey
    fireEvent.keyDown(document.body, {
      keyCode: 75,
    });

    // Then
    expect(baseElement.querySelector('.karhu')).not.toBeNull();
    expect(baseElement.querySelector('.karhu input')).not.toBeNull();

    // When
    // Press escape
    fireEvent.keyDown(document.body, {
      keyCode: 27,
    });

    // Then
    expect(baseElement.querySelector('.karhu')).toBeNull();
  });
  test('lists and interacts with the commands in the list', () => {
    jest.useFakeTimers();

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
    karhu.addCommand(cmd1);
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
    karhu.addCommand(cmd2);
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
    karhu.addCommand(cmd3);

    const resultEntryGraph = jest.fn();

    // When
    const { baseElement, getByText } = render(
      <KarhuProvider value={karhu}>
        <DirtyPolarBear openWith={openWith} closeWith={closeWith} element={portalRoot} onExec={resultEntryGraph} />
      </KarhuProvider>,
    );

    // When activating the bar
    fireEvent.keyDown(document.body, {
      keyCode: 75, // k
    });

    const input = baseElement.querySelector('input') as HTMLInputElement;

    // Typing a character
    fireEvent.change(input, {
      target: {
        value: 't', // t
      },
    });

    // Then
    expect(getByText(cmd1.name)).not.toBeNull();
    expect(getByText(cmd2.name)).not.toBeNull();
    expect(getByText(cmd3.name)).not.toBeNull();
    let active = baseElement.querySelector('.active') as HTMLElement;
    expect(active.textContent).toEqual(cmd1.name);

    // Arrow up should move to last
    fireEvent.keyDown(document.body, {
      keyCode: 38, // ^
    });

    // Then
    active = baseElement.querySelector('.active') as HTMLElement;
    expect(active.textContent).toEqual(cmd3.name);

    // When arrow up again
    fireEvent.keyDown(document.body, {
      keyCode: 38, // ^
    });

    // Then
    active = baseElement.querySelector('.active') as HTMLElement;
    expect(active.textContent).toEqual(cmd2.name);

    // Enter to execute
    fireEvent.keyDown(document.body, {
      keyCode: 13, // enter
    });

    // Then
    jest.runOnlyPendingTimers();

    expect(baseElement.querySelector('.karhu')).toBeNull();
    expect(cmd1.actions.onExec).not.toHaveBeenCalled();
    expect(cmd2.actions.onExec).toHaveBeenCalled();
    expect(cmd3.actions.onExec).not.toHaveBeenCalled();
    expect(resultEntryGraph).toHaveBeenCalledTimes(1);
    expect(resultEntryGraph).toHaveBeenCalledWith({ next: { t: { commands: [{ calls: 1, id: 'test2' }] } } });
  });
});
