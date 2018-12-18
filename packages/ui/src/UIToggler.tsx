import React from 'react';
import { EntryGraph } from '@karhu/core/lib/types';

export const ESCAPE_PRESS = 'ESCAPE_PRESS';
export const OUTSIDE_CLICK = 'OUTSIDE_CLICK';
export const COMMAND_EXECUTION = 'COMMAND_EXECUTION';

type ESCAPE_PRESS = 'ESCAPE_PRESS';
type OUTSIDE_CLICK = 'OUTSIDE_CLICK';
type COMMAND_EXECUTION = 'COMMAND_EXECUTION';
type CloseTypes = ESCAPE_PRESS | OUTSIDE_CLICK | COMMAND_EXECUTION;

type Props = {
  shouldOpen: (e: KeyboardEvent) => boolean;
  shouldClose?: (type: CloseTypes) => boolean;
  children: (props: RenderProps) => JSX.Element;
};

type State = {
  open: boolean;
};

export type RenderProps = {
  open: boolean;
  onExec: (entryGraph: EntryGraph) => void;
};

export default class Toggler extends React.Component<Props, State> {
  public ref: any;
  state = {
    open: false,
  };
  public componentDidMount() {
    this.ref = React.createRef();
    window.addEventListener('keydown', this.handleKeyPress);
  }
  public componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
  }
  componentDidUpdate(_: Props, prevState: State) {
    if (prevState.open === this.state.open) {
      return;
    }
    if (this.state.open) {
      document.addEventListener('click', this.handleOutsideClick);
    } else {
      document.removeEventListener('click', this.handleOutsideClick);
    }
  }
  public handleOutsideClick = (e: any) => {
    if (!this.state.open) {
      return;
    }
    const target = e.target;
    if (target !== this.ref.current && !this.ref.current.contains(target)) {
      this.close(OUTSIDE_CLICK);
      return;
    }
  };
  public handleKeyPress = (e: KeyboardEvent) => {
    const { metaKey, ctrlKey, altKey, keyCode } = e;
    // Esc = close
    if (this.state.open && keyCode === 27) {
      e.preventDefault();
      this.close(ESCAPE_PRESS);
      return;
    }

    // Require at least one meta key
    if (!metaKey && !ctrlKey && !altKey) {
      return;
    }

    if (!this.state.open && this.props.shouldOpen(e)) {
      e.preventDefault();
      this.setState({ open: true });
      return;
    }
  };
  public close = (type: CloseTypes) => {
    if (!this.props.shouldClose || this.props.shouldClose(type)) {
      this.setState({ open: false });
    }
  };
  render() {
    if (!this.state.open) {
      return null;
    }
    const renderProps: RenderProps = { open: this.state.open, onExec: () => this.close(COMMAND_EXECUTION) };
    return <div ref={this.ref}>{this.props.children(renderProps)}</div>;
  }
}
