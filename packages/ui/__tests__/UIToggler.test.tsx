import React from 'react';
import { render, fireEvent, act } from 'react-testing-library';
import { UIToggler } from '../src';
import { ESCAPE_PRESS, OUTSIDE_CLICK, COMMAND_EXECUTION } from '../src/UIToggler';
require('react-testing-library/cleanup-after-each');

describe('UIToggler', () => {
  const shouldOpen = (e: KeyboardEvent) => {
    return e.metaKey && e.keyCode === 75;
  };

  test('changes open state on hotkeys', () => {
    const shouldClose = jest.fn(() => true);
    const My = ({ open } = { open: false }) => {
      if (open) {
        return <div>hello</div>;
      }
      return null;
    };

    const { rerender, container, queryByText, getByText } = render(
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

    rerender(
      <UIToggler shouldOpen={shouldOpen} shouldClose={shouldClose}>
        {props => <My open={props.open} />}
      </UIToggler>,
    );
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
    const shouldClose = jest.fn(() => true);
    class My extends React.Component<any> {
      render() {
        if (this.props.open) {
          return (
            <div>
              outer<div ref={this.props.setUIRef}>inner</div>
            </div>
          );
        }
        return null;
      }
    }

    const { container, queryByText, getByText } = render(
      <UIToggler shouldOpen={shouldOpen} shouldClose={shouldClose}>
        {props => <My open={props.open} setUIRef={props.setUIRef} />}
      </UIToggler>,
    );

    // Then
    expect(queryByText('inner')).toBeNull();

    // When
    // When pressing hotkey
    fireEvent.keyDown(container, {
      metaKey: true,
      keyCode: 75,
    });

    // Then
    expect(getByText('inner')).not.toBeNull();

    // When
    // Click on the inside
    fireEvent.click(getByText('inner'));

    // Then
    // No change
    expect(getByText('inner')).not.toBeNull();

    // When
    // Click on the outise
    fireEvent.click(getByText('outer'));

    expect(shouldClose).toHaveBeenCalledWith(OUTSIDE_CLICK);
    expect(queryByText('inner')).toBeNull();
  });
  test('calls shouldClose when calling onExec', () => {
    const shouldClose = jest.fn(() => true);
    let innerExecFn: any = null;
    const My = (props: any) => {
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
    act(() => innerExecFn());

    // Then
    expect(shouldClose).toHaveBeenCalledWith(COMMAND_EXECUTION);
    expect(queryByText('hello')).toBeNull();
  });
});
