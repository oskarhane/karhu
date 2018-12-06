import React from 'react';
import Karhu from '@karhu/core';
import { Command, UnregisteredCommand, EntryGraph } from '@karhu/core/lib/types';

const karhu = new Karhu();

const KarhuContext = React.createContext(karhu);

type ChildrenProviderObject = {
  commandsList: Command[];
  exec: (id: string) => EntryGraph;
};

type AddCommandProps = {
  command: UnregisteredCommand;
};

export const AddCommand = (props: AddCommandProps) => {
  return (
    <Consumer>
      {karhu => {
        karhu.addCommand(props.command);
        return null;
      }}
    </Consumer>
  );
};

type Props = {
  children: (obj: ChildrenProviderObject) => {};
  input: string;
};
export class KarhuComponent extends React.Component<Props> {
  karhu?: Karhu;
  exec = (id: string): EntryGraph => {
    if (!this.karhu) {
      throw new Error('Karhu not found');
    }
    const tree: EntryGraph = this.karhu.runCommand(id, this.props.input);
    return tree;
  };
  render() {
    const { children } = this.props;
    const { exec } = this;
    return (
      <Consumer>
        {(karhu: Karhu) => {
          this.karhu = karhu;
          const commandsList = this.karhu.findMatchingCommands(this.props.input);
          return children({ commandsList, exec });
        }}
      </Consumer>
    );
  }
}

const { Provider, Consumer } = KarhuContext;
export { Provider as KarhuProvider, Consumer as KarhuConsumer };
