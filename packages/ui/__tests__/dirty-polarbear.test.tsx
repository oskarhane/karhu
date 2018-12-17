import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import Karhu from '@karhu/core';
import { UnregisteredCommand, Command } from '@karhu/core/lib/types';
//import { KarhuComponent, KarhuProvider, AddCommand } from '@karhu/react';

import { DirtyPolarBear } from '../src';

let portalRoot = document.getElementById('portal');
if (!portalRoot) {
  portalRoot = document.createElement('div');
  portalRoot.setAttribute('id', 'portal');
  document.body.appendChild(portalRoot);
}

describe('polarbear', () => {
  let karhu: Karhu;
  beforeEach(() => {
    karhu = new Karhu({});
  });
  afterEach(() => {
    karhu.reset();
  });
  test('renders', () => {
    const cmd1: UnregisteredCommand = {
      id: 'test',
      name: 'Test Command',
      keywords: ['test'],
      render: jest.fn((c: Command) => {
        <div>{c.name}</div>;
      }),
      actions: {
        onExec: jest.fn(),
      },
    };
    karhu.addCommand(cmd1);

    // When
    const { baseElement } = render(<DirtyPolarBear element={portalRoot} />);

    // Then
    expect(baseElement.querySelector('.karhu')).toBeNull();

    // When pressing hotkey
    fireEvent.keyDown(document.body, {
      altKey: true,
      keyCode: 32,
    });

    // Then
    expect(baseElement.querySelector('.karhu')).not.toBeNull();
    expect(baseElement.querySelector('.karhu input')).not.toBeNull();
  });
});
