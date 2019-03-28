import {
  Command,
  UnregisteredCommand,
  CommandMetadata,
  ClassifiedMatches,
  ClassifiedMatch,
  MatchClass,
  EntryGraph,
  KarhuContext,
  AfterExec,
  CommandRunResult,
} from './types';
import {
  classifyMatches,
  updateEntryGraph,
  findCommandsInEntryGraph,
  matchesContext,
  extractCmdAndArgsFromInput,
} from './utils';

export default class Karhu {
  static currentId: number = 0;
  open: boolean = false;
  input: string = '';
  commands: Command[] = [];
  entryGraph: EntryGraph = {};
  historyCallLimit: number = 30;
  currentContext: undefined | string;
  contexts: KarhuContext[] = [];

  constructor(entryGraph?: EntryGraph, historyCallLimit?: number) {
    this.reset();
    if (entryGraph) {
      this.entryGraph = entryGraph;
    }
    if (historyCallLimit !== undefined) {
      this.historyCallLimit = historyCallLimit;
    }
  }

  reset(): void {
    Karhu.currentId = 0;
    this.commands = [];
    this.entryGraph = {};
    this.currentContext = undefined;
    this.open = false;
    this.input = '';
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

  registerContext(ctx: KarhuContext): void {
    this.unregisterContext(ctx.id);
    this.contexts.push(ctx);
  }

  unregisterContext(id: string) {
    this.contexts = this.contexts.filter(context => context.id !== id);
  }

  getContext(id: string): KarhuContext | undefined {
    const found = this.contexts.find(ctx => ctx.id === id);
    return found;
  }

  enterContext(newContext: string): void {
    this.currentContext = newContext;
  }

  resetContext(): void {
    this.currentContext = undefined;
  }

  setInput(str: string) {
    this.input = str;
  }

  findMatchingCommands(): Command[] {
    let classifiedMatches: ClassifiedMatches = classifyMatches(this.commands, this.input);
    classifiedMatches = classifiedMatches.filter(m => m.score !== MatchClass.NO);

    const historyCommands: ClassifiedMatch[] = findCommandsInEntryGraph(this.entryGraph, this.input);
    if (historyCommands.length) {
      classifiedMatches.unshift(...historyCommands);
    }

    classifiedMatches.sort((a, b) => b.score - a.score);
    let sortedIds: string[] = classifiedMatches.map(m => m.id);
    sortedIds = sortedIds.filter((id, i) => sortedIds.indexOf(id) === i); // Remove duplicates
    // Get the actual commands and filter with context
    const commands = sortedIds
      .map(id => this.commands.filter(c => c.id === id)[0])
      .filter(c => !!c && matchesContext(c.contexts, this.currentContext))
      .map(c => {
        //@ts-ignore
        c.boundRender = (...args) => {
          const [cmd, inputArgs] = extractCmdAndArgsFromInput(this.input);
          let allArgs: any[] | undefined = undefined;
          if (inputArgs || args.length) {
            allArgs = [];
            allArgs = inputArgs ? [inputArgs] : allArgs;
            allArgs = args.length ? allArgs.concat(args) : allArgs;
          }
          //@ts-ignore
          return c.render(c, cmd, allArgs);
        };
        return c;
      });
    return commands;
  }

  runCommand(id: string): CommandRunResult {
    const command = this._getCommandById(id);
    if (!command) {
      return { entryGraph: this.entryGraph, open: true, input: this.input };
    }
    const [userInput, userArgs] = extractCmdAndArgsFromInput(this.input);
    const execResult = command.onExec({ enterContext: this.enterContext.bind(this), userInput, userArgs });
    this.entryGraph = updateEntryGraph(this.entryGraph, this.input, id, this.historyCallLimit);
    this._recordRunCommand(id);
    this._handleExecResult(execResult);
    return { entryGraph: this.entryGraph, open: this.open, input: this.input };
  }

  _handleExecResult(execResult: AfterExec | undefined): void {
    if (!execResult || execResult === AfterExec.CLEAR_INPUT) {
      this.input = '';
    }
    this.open = this._shouldStayOpen(execResult);
  }

  _shouldStayOpen(execResult: AfterExec | undefined): boolean {
    if (!execResult || execResult === AfterExec.CLOSE) {
      return false;
    }
    return true;
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
