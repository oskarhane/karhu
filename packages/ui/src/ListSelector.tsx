import React from 'react';
import { Command } from '@karhu/core/lib/types';

type ChildrenRenderProps = {
  activeCommandId?: string;
  onSelect: (commandId: string) => void;
  onExec: (id: string) => void;
};

type Props = {
  commands: Command[];
  onExec: (id: string) => void;
  children: (props: ChildrenRenderProps) => JSX.Element;
};
type State = {
  activeCommand?: string;
  hadManualSelection: boolean;
};

export default class ListSelector extends React.Component<Props, State> {
  state = {
    activeCommand: undefined,
    hadManualSelection: false,
  };
  componentDidMount() {
    this.updateActiveCommand();
    window.addEventListener('keydown', this.handleKeyPress);
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
  }
  componentDidUpdate() {
    this.updateActiveCommand();
  }
  updateActiveCommand() {
    // Nothing selected and no list => Do nothing
    // Reset hadManualSelection to start selecting first result on new results
    if (!this.props.commands.length && this.state.activeCommand === undefined) {
      // Reset manual selection
      if (this.state.hadManualSelection) {
        this.setState({ hadManualSelection: false });
      }
      return;
    }
    // No commands in list
    if (!this.props.commands.length) {
      this.setState({ activeCommand: undefined });
      return;
    }
    // Nothing selected, but we have result => preselect first
    if (this.state.activeCommand === undefined) {
      this.setState({ activeCommand: this.props.commands[0].id });
      return;
    }

    // No manual selection done => Keep first selected
    if (this.state.hadManualSelection === false && this.state.activeCommand !== this.props.commands[0].id) {
      this.setState({ activeCommand: this.props.commands[0].id });
      return;
    }

    // Selected item not in list anymore
    if (this.props.commands.map(c => c.id).indexOf(this.state.activeCommand || '') < 0) {
      this.setState({ activeCommand: undefined });
    }
  }
  handleKeyPress = (e: any) => {
    const { keyCode } = e;
    // Arrows up and down
    if ([38, 40].indexOf(keyCode) >= 0) {
      e.preventDefault();
      const commandIds: string[] = this.props.commands.map(c => c.id);
      const currentIndex: number = commandIds.indexOf(this.state.activeCommand || '');
      let nextActiveCommand: string = commandIds[0];

      if (currentIndex <= 0 && keyCode === 38) {
        // Nothing (or first item) selected and go up = start form bottom
        nextActiveCommand = commandIds[commandIds.length - 1];
      } else if (currentIndex < 0 && keyCode === 40) {
        // Nothing selected and go down = start form top
        nextActiveCommand = commandIds[0];
      } else if (currentIndex > 0 && keyCode === 38) {
        // Anything but the first selected and go up = go up
        nextActiveCommand = commandIds[currentIndex - 1];
      } else if (currentIndex < commandIds.length - 1 && keyCode === 40) {
        // Anything but the last selected and go down = go down
        nextActiveCommand = commandIds[currentIndex + 1];
      } else if (currentIndex >= commandIds.length - 1 && keyCode === 40) {
        // Last item selected and go down = start from start
        nextActiveCommand = commandIds[0];
      }
      this.setState({ activeCommand: nextActiveCommand, hadManualSelection: true });
      return;
    }
    // Enter
    if (keyCode === 13) {
      e.preventDefault();
      if (this.state.activeCommand === undefined) {
        return;
      }
      this.props.onExec(this.state.activeCommand || '');
    }
  };
  setActiveCommand = (id: string) => {
    this.setState({ activeCommand: id, hadManualSelection: true });
  };
  render() {
    const { onExec } = this.props;
    const activeCommandId = this.state.activeCommand;
    const onSelect = (commandId: string) => this.setActiveCommand(commandId);
    return this.props.children({
      activeCommandId,
      onExec,
      onSelect,
    });
  }
}
