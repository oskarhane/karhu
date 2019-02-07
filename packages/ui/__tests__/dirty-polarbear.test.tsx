import React from 'react';
import { render } from 'react-testing-library';
import { DirtyPolarBear } from '../src';
import { KarhuProvider } from '@karhu/react';
import Karhu from '@karhu/core';
require('react-testing-library/cleanup-after-each');

describe('polarbear', () => {
  test('renders and opens and closes', () => {
    // Given
    const karhu = new Karhu();
    // When
    const { queryByTestId, getByTestId, rerender } = render(
      <KarhuProvider value={{ karhu }}>
        <DirtyPolarBear open={false} />
      </KarhuProvider>,
    );

    // Then
    expect(queryByTestId('dpb')).toBeNull();

    // When
    rerender(
      <KarhuProvider value={{ karhu }}>
        <DirtyPolarBear open={true} />
      </KarhuProvider>,
    );

    // Then
    expect(getByTestId('dpb')).not.toBeNull();
    expect(getByTestId('dpb').querySelector('input')).not.toBeNull();
  });
});
