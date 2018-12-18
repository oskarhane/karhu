import React from 'react';
import ReactDOM from 'react-dom';

type Props = {
  children: JSX.Element;
  element: HTMLElement | null;
};

export default class Portal extends React.Component<Props> {
  render() {
    if (!this.props.element) {
      return this.props.children;
    }
    return ReactDOM.createPortal(this.props.children, this.props.element);
  }
}
