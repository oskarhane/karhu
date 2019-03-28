import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import { DirtyPolarBear } from '../src';
import { KarhuProvider } from '@karhu/react';
import Karhu from '@karhu/core';
import { AfterExec } from '@karhu/core/lib/types';
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
  test('calls onExec', () => {
    // Given
    const karhu = new Karhu();
    const c1 = Karhu.createCommand({
      id: 'c1',
      name: 'c1',
      keywords: ['c'],
      onExec: () => {
        return AfterExec.CLEAR_INPUT;
      },
      render: () => {
        return <div>c1</div>;
      },
    });
    const d1 = Karhu.createCommand({
      id: 'd1',
      name: 'd1',
      keywords: ['d'],
      onExec: () => {
        return AfterExec.CLEAR_INPUT;
      },
      render: () => {
        return <div>d1</div>;
      },
    });
    karhu.addCommand(c1);
    karhu.addCommand(d1);
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

    // When
    const myInput: any = getByTestId('dpb').querySelector('input');

    myInput.value = 'c';
    fireEvent.change(myInput);

    //debug();
  });
});
