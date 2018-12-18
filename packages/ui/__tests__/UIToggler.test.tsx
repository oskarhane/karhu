import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import { UIToggler } from '../src';
import { ESCAPE_PRESS, OUTSIDE_CLICK, COMMAND_EXECUTION, RenderProps } from '../src/UIToggler';

describe('UIToggler', () => {
  const shouldOpen = (e: KeyboardEvent) => {
    return e.metaKey && e.keyCode === 75;
  };
  const shouldClose = jest.fn(() => true);
  test('changes open state on hotkeys', () => {
    const My = ({ open } = { open: false }) => {
      if (open) {
        return <div>hello</div>;
      }
      return null;
    };

    const { container, queryByText, getByText } = render(
      <UIToggler shouldOpen={shouldOpen} shouldClose={shouldClose}>
        {props => <My open={props.open} />}
      </UIToggler>,
    );

    // Then
    expect(queryByText('hello')).toBeNull();

    // When
    // When pressing hotkey
    fireEvent.keyDown(container, {
      metaKey: true,
      keyCode: 75,
    });

    // Then
    expect(getByText('hello')).not.toBeNull();

    // When
    // Press escape
    fireEvent.keyDown(container, {
      keyCode: 27,
    });
    // Then
    expect(shouldClose).toHaveBeenCalledWith(ESCAPE_PRESS);
    expect(queryByText('hello')).toBeNull();
  });
  test('calls shouldClose on clicks outside', () => {
    shouldClose.mockClear();
    const My = ({ open } = { open: false }) => {
      if (open) {
        return <div>hello</div>;
      }
      return null;
    };

    const { container, queryByText, getByText } = render(
      <UIToggler shouldOpen={shouldOpen} shouldClose={shouldClose}>
        {props => <My open={props.open} />}
      </UIToggler>,
    );

    // Then
    expect(queryByText('hello')).toBeNull();

    // When
    // When pressing hotkey
    fireEvent.keyDown(container, {
      metaKey: true,
      keyCode: 75,
    });

    // Then
    expect(getByText('hello')).not.toBeNull();

    // When
    // Click on the inside
    fireEvent.click(getByText('hello'));

    // Then
    // No change
    expect(getByText('hello')).not.toBeNull();

    // When
    // Click on the outise
    fireEvent.click(document.body);

    expect(shouldClose).toHaveBeenCalledWith(OUTSIDE_CLICK);
    expect(queryByText('hello')).toBeNull();
  });
  test('calls shouldClose whan calling onExec', () => {
    shouldClose.mockClear();
    let innerExecFn: any = null;
    const My = (props: RenderProps) => {
      if (props.open) {
        innerExecFn = props.onExec;
        return <div>hello</div>;
      }
      return null;
    };

    const { container, queryByText, getByText } = render(
      <UIToggler shouldOpen={shouldOpen} shouldClose={shouldClose}>
        {props => <My open={props.open} onExec={props.onExec} />}
      </UIToggler>,
    );

    // Then
    expect(queryByText('hello')).toBeNull();
    expect(innerExecFn).toBeNull();

    // When
    // When pressing hotkey
    fireEvent.keyDown(container, {
      metaKey: true,
      keyCode: 75,
    });

    // Then
    expect(getByText('hello')).not.toBeNull();
    expect(innerExecFn).not.toBeNull();

    // When
    // Call onExecFn
    innerExecFn();

    // Then
    expect(shouldClose).toHaveBeenCalledWith(COMMAND_EXECUTION);
    expect(queryByText('hello')).toBeNull();
  });
});
