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
  test('lists and interacts with the commands', () => {
    const cmd1: UnregisteredCommand = {
      id: 'test',
      name: 'Test Command 1',
      keywords: ['test'],
      render: jest.fn((c: Command) => {
        <div>{c.name}</div>;
      }),
      actions: {
        onExec: jest.fn(),
      },
    };
    karhu.addCommand(cmd1);
    const cmd2: UnregisteredCommand = {
      id: 'test',
      name: 'Test Command 2',
      keywords: ['test'],
      render: jest.fn((c: Command) => {
        <div>{c.name}</div>;
      }),
      actions: {
        onExec: jest.fn(),
      },
    };
    karhu.addCommand(cmd2);
    const cmd3: UnregisteredCommand = {
      id: 'test',
      name: 'Test Command 3',
      keywords: ['test'],
      render: jest.fn((c: Command) => {
        <div>{c.name}</div>;
      }),
      actions: {
        onExec: jest.fn(),
      },
    };
    karhu.addCommand(cmd3);

    // When
    const { debug } = render(
      <KarhuProvider value={karhu}>
        <DirtyPolarBear openWith={openWith} closeWith={closeWith} element={portalRoot} />
      </KarhuProvider>,
    );
    debug();
  });
});
