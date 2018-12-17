import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import Karhu from '@karhu/core';
// import { UnregisteredCommand, Command } from '@karhu/core/lib/types';
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
});
