import React, { ReactEventHandler } from 'react';
import { KarhuComponent } from '@karhu/react';
import CommandList from './CommandList';
import { MainElement, MainInput } from './styled';
import { EntryGraph } from '@karhu/core/lib/types';

interface InputProps {
  onChange: ReactEventHandler;
  value: string;
}

class Input extends React.Component<InputProps> {
  inputRef = React.createRef<HTMLInputElement>();
  public componentDidMount() {
    if (this.inputRef && this.inputRef.current) {
      this.inputRef.current.select();
      this.inputRef.current.focus();
    }
  }
  public render() {
    return <MainInput type="text" ref={this.inputRef} onChange={this.props.onChange} value={this.props.value} />;
  }
}

interface Props {
  onExec?: (entryGraph: EntryGraph) => {};
  open: boolean;
}
interface State {
  input: string;
}

class DirtyPolarBear extends React.Component<Props, State> {
  public state: State = {
    input: '',
  };
  public inputChange = (e: any) => {
    const input = e.target.value;
    this.setState({ input });
  };
  public render() {
    if (!this.props.open) {
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
          };
          return (
            <MainElement>
              <div>
                <Input value={this.state.input} onChange={this.inputChange} />
              </div>
              <CommandList onExec={onExec} commands={commandsList} />
            </MainElement>
          );
        }}
      </KarhuComponent>
    );
  }
}

export default DirtyPolarBear;
