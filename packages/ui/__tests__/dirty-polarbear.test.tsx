import React from 'react';
import { render } from 'react-testing-library';
import { DirtyPolarBear } from '../src';

describe('polarbear', () => {
  test('renders and opens and closes', () => {
    // When
    const { container, rerender } = render(<DirtyPolarBear open={false} />);

    // Then
    expect(container.querySelector('.karhu')).toBeNull();

    // When
    rerender(<DirtyPolarBear open={true} />);

    // Then
    expect(container.querySelector('.karhu')).not.toBeNull();
    expect(container.querySelector('.karhu input')).not.toBeNull();
  });
});
