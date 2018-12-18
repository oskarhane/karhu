import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import { DirtyPolarBear } from '../src';

describe('polarbear', () => {
  const openWith = (e: KeyboardEvent) => {
    return e.keyCode === 75;
  };
  const closeWith = (e: KeyboardEvent) => {
    return e.keyCode === 27;
  };
  test('renders and opens and closes', () => {
    // When
    const { container } = render(<DirtyPolarBear openWith={openWith} closeWith={closeWith} />);

    // Then
    expect(container.querySelector('.karhu')).toBeNull();

    // When pressing hotkey
    fireEvent.keyDown(container, {
      keyCode: 75,
    });

    // Then
    expect(container.querySelector('.karhu')).not.toBeNull();
    expect(container.querySelector('.karhu input')).not.toBeNull();

    // When
    // Press escape
    fireEvent.keyDown(container, {
      keyCode: 27,
    });

    // Then
    expect(container.querySelector('.karhu')).toBeNull();
  });
});
