import React, { ReactEventHandler } from 'react';
import { KarhuComponent } from '@karhu/react';
import CommandList from './CommandList';
//import './style.css';
import { EntryGraph } from '@karhu/core/lib/types';

interface InputProps {
  onChange: ReactEventHandler;
  value: string;
}

class Input extends React.Component<InputProps> {
  private inputRef = React.createRef<HTMLInputElement>();
  public componentDidMount() {
    if (this.inputRef && this.inputRef.current) {
      this.inputRef.current.select();
      this.inputRef.current.focus();
    }
  }
  public render() {
    return <input type="text" ref={this.inputRef} onChange={this.props.onChange} value={this.props.value} />;
  }
}

interface Props {
  onExec?: (entryGraph: EntryGraph) => {};
  openWith: (e: KeyboardEvent) => boolean;
  closeWith: (e: KeyboardEvent) => boolean;
}
interface State {
  input: string;
  open: boolean;
  activeCommand: number;
}

class DirtyPloarBear extends React.Component<Props, State> {
  public setInputFn: (str: string) => void;
  public ref: any;
  public state: State = {
    activeCommand: 0,
    input: '',
    open: false,
  };
  constructor(props: Props) {
    super(props);
    this.setInputFn = () => {};
  }
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
  public handleKeyPress = (e: any) => {
    if (!this.state.open && this.props.openWith(e)) {
      e.preventDefault();
      this.setState({ open: true });
      return;
    }
    if (this.state.open && this.props.closeWith(e)) {
      e.preventDefault();
      this.close();
      return;
    }
  };
  public handleOutsideClick = (e: any) => {
    if (!this.state.open) {
      return;
    }
    const target = e.target;
    if (target !== this.ref.current && !this.ref.current.contains(target)) {
      this.close();
      return;
    }
  };
  public close = () => {
    this.setState({ open: false, activeCommand: 0 });
  };
  public inputChange = (e: any) => {
    const input = e.target.value;
    this.setState({ input });
  };
  public render() {
    if (!this.state.open) {
      return null;
    }
    return (
      <KarhuComponent input={this.state.input}>
        {({ commandsList, exec }) => {
          const onExec = (id: string) => {
            const entryGraph: EntryGraph = exec(id);
            if (this.props.onExec) {
              this.props.onExec(entryGraph);
            }
            this.close();
          };
          return (
            <div ref={this.ref} className="karhu">
              <div>
                <Input value={this.state.input} onChange={this.inputChange} />
              </div>
              <CommandList onExec={onExec} commands={commandsList} />
            </div>
          );
        }}
      </KarhuComponent>
    );
  }
}

export default DirtyPloarBear;
