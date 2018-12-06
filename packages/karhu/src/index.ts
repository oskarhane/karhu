import {
  Command,
  UnregisteredCommand,
  CommandMetadata,
  ClassifiedMatches,
  ClassifiedMatch,
  MatchClass,
  EntryGraph,
} from './types';
import { classifyMatches, updateEntryGraph, findCommandsInEntryGraph } from './utils';

export default class Karhu {
  static currentId: number = 0;
  commands: Command[] = [];
  contexts: string[] = ['default'];
  entryGraph: EntryGraph = {};
  constructor(entryGraph?: EntryGraph) {
    this.reset();
    if (entryGraph) {
      this.entryGraph = entryGraph;
    }
  }

  reset(): void {
    Karhu.currentId = 0;
    this.commands = [];
    this.contexts = ['default'];
    this.entryGraph = {};
  }

  addCommand(command: UnregisteredCommand): Command {
    const preparedCommand: Command = this._prepareCommand(command);
    const idExists: boolean = this.commands.filter(c => c.id === preparedCommand.id).length > 0;
    if (!idExists) {
      this.commands.push(preparedCommand);
    } else {
      this.commands = this.commands.map(c => {
        if (c.id === preparedCommand.id) {
          return preparedCommand;
        }
        return c;
      });
    }
    return preparedCommand;
  }

  removeCommand(commandId: string) {
    this.commands = this.commands.filter(c => c.id !== commandId);
  }

  getCommands(): Command[] {
    return this.commands;
  }

  replaceEntryGraph(entryGraph: EntryGraph): void {
    this.entryGraph = entryGraph;
  }

  getEntryGraph(): EntryGraph {
    return this.entryGraph;
  }

  findMatchingCommands(input?: string): Command[] {
    if (!input) {
      return [];
    }
    let classifiedMatches: ClassifiedMatches = classifyMatches(this.commands, input);

    classifiedMatches = classifiedMatches.filter(m => m.score !== MatchClass.NO);

    const historyCommands: ClassifiedMatch[] = findCommandsInEntryGraph(this.entryGraph, input);
    if (historyCommands.length) {
      classifiedMatches.unshift(...historyCommands);
    }

    classifiedMatches.sort((a, b) => b.score - a.score);
    let sortedIds: string[] = classifiedMatches.map(m => m.id);
    sortedIds = sortedIds.filter((id, i) => sortedIds.indexOf(id) === i); // Remove duplicates
    const commands = sortedIds.map(id => this.commands.filter(c => c.id === id)[0]).filter(c => !!c);
    commands.forEach(c => {
      if (c.actions.onShow) {
        c.actions.onShow(c.id);
      }
    });
    return commands;
  }

  runCommand(id: string, input: string): EntryGraph {
    const command = this._getCommandById(id);
    if (!command) {
      return this.entryGraph;
    }
    this.entryGraph = updateEntryGraph(this.entryGraph, input, id);
    setTimeout(() => command.actions.onExec(), 0);
    this._recordRunCommand(id);
    return this.entryGraph;
  }

  _getCommandById(id: string): Command | undefined {
    return this.commands.filter(c => c.id === id).pop();
  }

  _recordRunCommand(id: string): void {
    for (let i = 0; i < this.commands.length; i += 1) {
      const cmd: Command = this.commands[i];
      if (cmd.id === id) {
        cmd.meta.calls += 1;
        break;
      }
    }
  }

  _prepareCommand(command: UnregisteredCommand): Command {
    const newCommand: Command = Karhu.createCommand(command);
    return newCommand;
  }

  static createCommand = (command: UnregisteredCommand): Command => {
    if (!command.id) {
      Karhu.currentId += 1;
    }
    const id: string = command.id ? command.id : `command-${Karhu.currentId}`;
    const meta: CommandMetadata = {
      calls: 0,
    };
    return {
      id,
      ...command,
      meta,
    };
  };
}
