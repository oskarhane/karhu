import Karhu from '../src';
import { UnregisteredCommand, Command, EntryGraph, AfterExec } from '../src/types';
import { MATCH_ALL } from '../src/utils';

describe('Karhu', () => {
  const karhu: Karhu = new Karhu();
  beforeEach(() => {
    karhu.reset();
  });
  test('instance is defined', () => {
    expect(karhu).toBeDefined();
  });
  test('createCommand generates id if not provided', () => {
    // When
    let myCommand: Command = Karhu.createCommand({
      name: 'test',
      keywords: ['test'],
      onExec: jest.fn(),
      render: () => '',
    });

    // Then
    expect(myCommand.id).toMatch(/^command-[0-9]+$/);
  });
  test('can add and remove commands', () => {
    // Given
    const id: string = 'my-id';
    const command: UnregisteredCommand = {
      id,
      onExec: jest.fn(),
      name: 'hello',
      keywords: ['test word'],
      render: () => '',
    };

    // When
    karhu.addCommand(command);

    // Then
    expect(karhu.getCommands()).toHaveLength(1);

    // When
    karhu.removeCommand(id);

    // Then
    expect(karhu.getCommands()).toHaveLength(0);
  });
  test('addCommand overwrites commands if the id exists', () => {
    // Given
    const id: string = 'my-id';
    const otherCommand: UnregisteredCommand = {
      id: 'otherID',
      onExec: jest.fn(),
      name: 'hello',
      keywords: ['test word'],
      render: () => '',
    };
    const command: UnregisteredCommand = {
      id,
      onExec: jest.fn(),
      name: 'hello',
      keywords: ['test word'],
      render: () => '',
    };
    const command2: UnregisteredCommand = {
      id,
      onExec: jest.fn(),
      name: 'hello2',
      keywords: ['test word'],
      render: () => '',
    };

    // When
    karhu.addCommand(otherCommand);
    karhu.addCommand(command);

    // Then
    let commands = karhu.getCommands();
    expect(commands).toHaveLength(2);
    expect(commands[1].name).toEqual('hello');

    // When
    karhu.addCommand(command2);

    // Then
    commands = karhu.getCommands();
    expect(commands).toHaveLength(2);
    expect(commands[1].name).toEqual('hello2');
  });
  test('findMatchingCommands doesnt crash if no input', () => {
    // Given

    // When
    const res: Command[] = karhu.findMatchingCommands();

    // Then
    expect(res).toEqual([]);
  });
  test('findMatchingCommands finds and initially sorts matching commands', () => {
    // Given
    const input: string = 'yo';
    const noMatch: Command = Karhu.createCommand({
      id: 'no',
      name: 'hello',
      keywords: ['open door', 'talk loud'],
      onExec: jest.fn(),
      render: () => '',
    });
    const startsMatch: Command = Karhu.createCommand({
      id: 'starts',
      name: 'hello',
      keywords: ['YOLO', 'my man'],
      onExec: jest.fn(),
      render: () => '',
    });
    const containsMatch: Command = Karhu.createCommand({
      id: 'contains',
      name: 'hello',
      keywords: ['LOYO', 'my man'],
      onExec: jest.fn(),
      render: () => '',
    });
    const exactMatch: Command = Karhu.createCommand({
      id: 'exact',
      name: 'hello',
      keywords: ['LOYO', 'yo'],
      onExec: jest.fn(),
      render: () => '',
    });

    // When
    karhu.addCommand(noMatch);
    karhu.addCommand(startsMatch);
    karhu.addCommand(containsMatch);
    karhu.addCommand(exactMatch);
    karhu.setInput(input);
    const res: Command[] = karhu.findMatchingCommands();

    // Then
    expect(res).toHaveLength(3); // Filters out unmatched ones
    expect(res[0].id).toEqual(exactMatch.id);
    expect(res[1].id).toEqual(startsMatch.id);
    expect(res[2].id).toEqual(containsMatch.id);
  });
  test('findMatchingCommands only lists existing commands', () => {
    // Given
    const input: string = 'open';
    const c1: Command = Karhu.createCommand({
      id: 'c1',
      name: 'hello',
      keywords: ['open'],
      onExec: jest.fn(),
      render: () => '',
    });
    const c2: Command = Karhu.createCommand({
      id: 'c2',
      name: 'hello',
      keywords: ['open'],
      onExec: jest.fn(),
      render: () => '',
    });

    // When
    // Add commands
    karhu.addCommand(c1);
    karhu.addCommand(c2);

    // Run command so it's in the entry graph
    karhu.setInput(input);
    karhu.runCommand(c2.id);
    karhu.setInput(input);

    // Remove the command
    karhu.removeCommand(c2.id);

    // Find matches
    const res2: Command[] = karhu.findMatchingCommands();

    // Then
    expect(res2).toHaveLength(1);
  });
  test('findMatchingCommands is context aware', () => {
    // Given
    const input: string = 'open';
    const context = 'deep-context';
    const c1: Command = Karhu.createCommand({
      id: 'c1',
      name: 'hello',
      contexts: [context], // only avaiable in certain context
      keywords: ['open'],
      onExec: jest.fn(),
      render: () => '',
    });
    const c2: Command = Karhu.createCommand({
      id: 'c2',
      name: 'hello',
      keywords: ['open'],
      onExec: k => {
        k.enterContext(context);
        return AfterExec.NOOP;
      }, // enter context on exec
      render: () => '',
    });
    const always: Command = Karhu.createCommand({
      id: 'always',
      name: 'hello',
      contexts: [MATCH_ALL], // Available in all contexts
      keywords: ['just open'],
      onExec: jest.fn(),
      render: () => '',
    });

    // When
    // Add commands
    karhu.addCommand(c1);
    karhu.addCommand(c2);
    karhu.addCommand(always);

    // Find matches
    karhu.setInput(input);
    let res = karhu.findMatchingCommands();

    // Then
    expect(res).toHaveLength(2);
    expect(res[0].id).toBe(c2.id);

    // When enter context (see onExec above)
    karhu.runCommand(res[0].id);

    // Then find matches again
    res = karhu.findMatchingCommands();

    // Then
    expect(res).toHaveLength(2);
    expect(res[0].id).toBe(c1.id);

    // When reset context
    karhu.resetContext();

    // Then find matches again
    res = karhu.findMatchingCommands();

    // Then
    expect(res).toHaveLength(2);
    expect(res[0].id).toBe(c2.id);
  });
  test('runCommand returns if command not found', () => {
    const id: string = 'non-existent';
    const input: string = 'test';

    // When
    karhu.setInput(input);
    const { entryGraph: res } = karhu.runCommand(id);

    // Then
    expect(res).toEqual({});
  });
  test('runCommand run the command and return the entryGraph', () => {
    // Given
    const input: string = 'yo';
    let noMatch: Command = Karhu.createCommand({
      id: 'no',
      name: 'hello',
      keywords: ['open door', 'talk loud'],
      onExec: jest.fn(),
      render: () => '',
    });
    let startsMatch: Command = Karhu.createCommand({
      id: 'starts',
      name: 'hello',
      keywords: ['YOLO', 'my man'],
      onExec: jest.fn(),
      render: () => '',
    });

    // When
    noMatch = karhu.addCommand(noMatch);
    startsMatch = karhu.addCommand(startsMatch);
    karhu.setInput(input);
    const { entryGraph: res } = karhu.runCommand(startsMatch.id);

    // Then
    expect(startsMatch.onExec).toHaveBeenCalledTimes(1);
    expect(startsMatch.onExec).toHaveBeenCalledWith(
      expect.objectContaining({ userInput: input, userArgs: undefined, enterContext: expect.any(Function) }),
    );
    expect(startsMatch.meta.calls).toEqual(1);

    expect(res).toEqual({
      next: {
        y: {
          next: {
            o: {
              commands: [{ id: startsMatch.id, calls: 1 }],
            },
          },
        },
      },
    });
  });
  test('moves ran commands to top of list', () => {
    // Given
    const input: string = 'yo';
    let containsMatch: Command = Karhu.createCommand({
      id: 'contains',
      name: 'hello',
      keywords: ['LOYO', 'my man'],
      onExec: jest.fn(),
      render: () => '',
    });
    let startsMatch: Command = Karhu.createCommand({
      id: 'starts',
      name: 'hello',
      keywords: ['YOLO', 'my man'],
      onExec: jest.fn(),
      render: () => '',
    });

    // When
    containsMatch = karhu.addCommand(containsMatch);
    startsMatch = karhu.addCommand(startsMatch);
    karhu.setInput(input);
    let list = karhu.findMatchingCommands();

    // Then
    expect(list.map(item => item.id)).toEqual([startsMatch.id, containsMatch.id]);

    // When
    karhu.runCommand(containsMatch.id);
    karhu.setInput(input);
    list = karhu.findMatchingCommands();

    // Then
    expect(list.map(item => item.id)).toEqual([startsMatch.id, containsMatch.id]);

    // When
    // This time the score for history will pass starts
    karhu.runCommand(containsMatch.id);
    karhu.setInput(input);
    karhu.runCommand(containsMatch.id);
    karhu.setInput(input);
    list = karhu.findMatchingCommands();

    // Then
    expect(list.map(item => item.id)).toEqual([containsMatch.id, startsMatch.id]);
  });
  test('provided entry graph is used', () => {
    // Given
    const initialEntryGraph: EntryGraph = {
      next: {
        s: {
          commands: [{ id: 'test-id', calls: 1 }],
        },
      },
    };

    // When
    const hasInitial: Karhu = new Karhu(initialEntryGraph, 0);
    const noInitial: Karhu = new Karhu();

    // Then
    expect(hasInitial.getEntryGraph()).toEqual(initialEntryGraph);
    expect(noInitial.getEntryGraph()).toEqual({});
  });
  test('entry graph can be replaced', () => {
    // Given
    const newEntryGraph: EntryGraph = {
      next: {
        s: {
          commands: [{ id: 'test-id', calls: 3 }],
        },
      },
    };

    // Then
    expect(karhu.getEntryGraph()).toEqual({});

    // When
    karhu.replaceEntryGraph(newEntryGraph);

    // Then
    expect(karhu.getEntryGraph()).toEqual(newEntryGraph);
  });
});
describe('Commands render function', () => {
  test('boundRender function passes command + input', () => {
    // Given
    const karhu = new Karhu();
    const input: string = 'c';
    const c1Render = jest.fn(() => 'c1');
    const c2Render = jest.fn(() => 'c2');
    const extraArgsRender = jest.fn(() => 'extraArgs');
    const extraArg = 'yo';
    let c1: Command = Karhu.createCommand({
      id: 'c1',
      name: 'c1',
      keywords: ['c1'],
      onExec: jest.fn(),
      render: c1Render,
    });
    let c2: Command = Karhu.createCommand({
      id: 'c2',
      name: 'c2',
      keywords: ['c2'],
      onExec: jest.fn(),
      render: c2Render,
    });
    let extraArgs: Command = Karhu.createCommand({
      id: 'extraArgs',
      name: 'extraArgs',
      keywords: ['c3'],
      onExec: jest.fn(),
      render: extraArgsRender,
    });

    // When
    c1 = karhu.addCommand(c1);
    c2 = karhu.addCommand(c2);
    extraArgs = karhu.addCommand(extraArgs);

    karhu.setInput(input);
    const matches = karhu.findMatchingCommands();
    const c1Match = matches.find(c => c.id === c1.id);
    c1Match && c1Match.boundRender && c1Match.boundRender();
    const c2Match = matches.find(c => c.id === c2.id);
    c2Match && c2Match.boundRender && c2Match.boundRender();
    const extraArgsMatch = matches.find(c => c.id === extraArgs.id);
    extraArgsMatch && extraArgsMatch.boundRender && extraArgsMatch.boundRender(extraArg);

    // Then
    expect(c1Render).toHaveBeenCalledTimes(1);
    expect(c1Render).toHaveBeenCalledWith(c1, input, undefined);
    expect(c2Render).toHaveBeenCalledTimes(1);
    expect(c2Render).toHaveBeenCalledWith(c2, input, undefined);
    expect(extraArgsRender).toHaveBeenCalledTimes(1);
    expect(extraArgsRender).toHaveBeenCalledWith(extraArgs, input, [extraArg]);
  });
});

describe('input arguments using < operator', () => {
  it("parses arguments from input, don't match on them and pass them to boundRender and onExec functions", () => {
    // Given
    const karhu = new Karhu();
    const cmd = 'c';
    const args = 'my args';
    const input: string = `${cmd} < ${args}`; // Adding args using the < operator
    const c1Render = jest.fn(() => 'c1');
    const c2Render = jest.fn(() => 'c2');
    const extraArgsRender = jest.fn(() => 'extraArgs');
    const extraArg = 'yo';
    let c1: Command = Karhu.createCommand({
      id: 'c1',
      name: 'c1',
      keywords: ['c1'],
      onExec: jest.fn(),
      render: c1Render,
    });
    let c2: Command = Karhu.createCommand({
      id: 'c2',
      name: 'c2',
      keywords: ['c2'],
      onExec: jest.fn(),
      render: c2Render,
    });
    let extraArgs: Command = Karhu.createCommand({
      id: 'extraArgs',
      name: 'extraArgs',
      keywords: ['c3'],
      onExec: jest.fn(),
      render: extraArgsRender,
    });

    // When
    c1 = karhu.addCommand(c1);
    c2 = karhu.addCommand(c2);
    extraArgs = karhu.addCommand(extraArgs);

    karhu.setInput(input);
    const matches = karhu.findMatchingCommands();

    const c1Match = matches.find(c => c.id === c1.id);
    c1Match && c1Match.boundRender && c1Match.boundRender();
    const c2Match = matches.find(c => c.id === c2.id);
    c2Match && c2Match.boundRender && c2Match.boundRender();
    const extraArgsMatch = matches.find(c => c.id === extraArgs.id);
    extraArgsMatch && extraArgsMatch.boundRender && extraArgsMatch.boundRender(extraArg);

    // Then
    expect(c1Render).toHaveBeenCalledTimes(1);
    expect(c1Render).toHaveBeenCalledWith(c1, cmd, [args]);
    expect(c2Render).toHaveBeenCalledTimes(1);
    expect(c2Render).toHaveBeenCalledWith(c2, cmd, [args]);
    expect(extraArgsRender).toHaveBeenCalledTimes(1);
    expect(extraArgsRender).toHaveBeenCalledWith(extraArgs, cmd, [args, extraArg]);

    // When executing commands
    karhu.runCommand(c1.id);
    karhu.setInput(input);
    karhu.runCommand(c2.id);
    karhu.setInput(input);
    karhu.runCommand(extraArgs.id);
    karhu.setInput(input);

    // Then
    expect(c1.onExec).toHaveBeenCalledTimes(1);
    expect(c1.onExec).toHaveBeenCalledWith(
      expect.objectContaining({ userInput: cmd, userArgs: args, enterContext: expect.any(Function) }),
    );
    expect(c2.onExec).toHaveBeenCalledTimes(1);
    expect(c2.onExec).toHaveBeenCalledWith(
      expect.objectContaining({ userInput: cmd, userArgs: args, enterContext: expect.any(Function) }),
    );
    expect(extraArgs.onExec).toHaveBeenCalledTimes(1);
    expect(extraArgs.onExec).toHaveBeenCalledWith(
      expect.objectContaining({ userInput: cmd, userArgs: args, enterContext: expect.any(Function) }),
    );
  });
});
