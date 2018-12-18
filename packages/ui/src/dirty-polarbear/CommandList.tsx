import React from 'react';
import { Command } from '@karhu/core/lib/types';
import ListSelector from '../ListSelector';

type Props = {
  commands: Command[];
  onExec: (id: string) => void;
};
type State = {
  activeCommand?: string;
  hadManualSelection: boolean;
};

export default class CommandList extends React.Component<Props, State> {
  render() {
    const { commands, onExec } = this.props;
    return (
      <ul>
        <ListSelector commands={commands} onExec={onExec}>
          {({ onSelect, activeCommandId, onExec }) => {
            return (
              <React.Fragment>
                {commands.map((c: Command) => (
                  <li
                    className={activeCommandId === c.id ? 'active' : ''}
                    onMouseEnter={() => onSelect(c.id)}
                    onClick={() => onExec(c.id)}
                    key={c.id}
                  >
                    {c.render(c)}
                  </li>
                ))}
              </React.Fragment>
            );
          }}
        </ListSelector>
      </ul>
    );
  }
}
