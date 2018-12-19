import React from 'react';
import { render } from 'react-testing-library';
import { DirtyPolarBear } from '../src';

describe('polarbear', () => {
  test('renders and opens and closes', () => {
    // When
    const { queryByTestId, getByTestId, rerender } = render(<DirtyPolarBear open={false} />);

    // Then
    expect(queryByTestId('dpb')).toBeNull();

    // When
    rerender(<DirtyPolarBear open={true} />);

    // Then
    expect(getByTestId('dpb')).not.toBeNull();
    expect(getByTestId('dpb').querySelector('input')).not.toBeNull();
  });
});
