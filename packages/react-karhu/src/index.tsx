import React, { useContext, useEffect, useState } from 'react';
import Karhu from '@karhu/core';
import { Command, UnregisteredCommand, EntryGraph } from '@karhu/core/lib/types';

type KarhuContextProps = { karhu: Karhu };
const KarhuContext = React.createContext<Partial<KarhuContextProps>>({});

type ChildrenProviderObject = {
  commandsList: Command[];
  exec: (id: string) => EntryGraph;
};

type AddCommandProps = {
  command: UnregisteredCommand;
};

export const AddCommand = (props: AddCommandProps) => {
  const karhuContext: Partial<KarhuContextProps> = useContext(KarhuContext);
  const { karhu } = karhuContext;

  useEffect(() => {
    if (karhu) {
      karhu.addCommand(props.command);
    }
  }, []);

  return null;
};

type Props = {
  children: (obj: ChildrenProviderObject) => JSX.Element;
  input: string;
};

export function useKarhu(props: Props) {
  const karhuContext: Partial<KarhuContextProps> = useContext(KarhuContext);
  const { karhu } = karhuContext;
  const [commandsList, setCommandsList] = useState<Command[]>([]);

  useEffect(
    () => {
      if (!karhu) {
        throw new Error('Karhu not found');
      }
      const list = karhu.findMatchingCommands(props.input);
      setCommandsList(list);
    },
    [props.input],
  );

  const exec = (id: string): EntryGraph => {
    if (!karhu) {
      throw new Error('Karhu not found');
    }
    return karhu.runCommand(id, props.input);
  };

  return { commandsList, exec };
}

export function KarhuComponent(props: Props) {
  const { children } = props;
  const { exec, commandsList } = useKarhu(props);
  return children({ commandsList, exec });
}

const { Provider, Consumer } = KarhuContext;
export { Provider as KarhuProvider, Consumer as KarhuConsumer };
