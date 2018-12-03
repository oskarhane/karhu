import Karhu from '../src';
import { UnregisteredCommand, Command, EntryGraph, ActionsObject } from '../src/types';

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
      actions: { onExec: jest.fn() },
      render: () => '',
    });

    // Then
    expect(myCommand.id).toMatch(/^command-[0-9]+$/);
  });
  test('can add and remove commands', () => {
    // Given
    const id: string = 'my-id';
    const actions: ActionsObject = { onExec: jest.fn() };
    const command: UnregisteredCommand = {
      id,
      actions,
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
      actions: { onExec: jest.fn(), onShow: jest.fn() },
      render: () => '',
    });
    const startsMatch: Command = Karhu.createCommand({
      id: 'starts',
      name: 'hello',
      keywords: ['YOLO', 'my man'],
      actions: { onExec: jest.fn() },
      render: () => '',
    });
    const containsMatch: Command = Karhu.createCommand({
      id: 'contains',
      name: 'hello',
      keywords: ['LOYO', 'my man'],
      actions: { onExec: jest.fn() },
      render: () => '',
    });
    const exactMatch: Command = Karhu.createCommand({
      id: 'exact',
      name: 'hello',
      keywords: ['LOYO', 'yo'],
      actions: { onExec: jest.fn() },
      render: () => '',
    });

    // When
    karhu.addCommand(noMatch);
    karhu.addCommand(startsMatch);
    karhu.addCommand(containsMatch);
    karhu.addCommand(exactMatch);
    const res: Command[] = karhu.findMatchingCommands(input);

    // Then
    expect(res).toHaveLength(3); // Filters out unmatched ones
    expect(res[0].id).toEqual(exactMatch.id);
    expect(res[1].id).toEqual(startsMatch.id);
    expect(res[2].id).toEqual(containsMatch.id);
  });
  test('runCommand returns if command not found', () => {
    const id: string = 'non-existent';
    const input: string = 'test';

    // When
    const res: EntryGraph = karhu.runCommand(id, input);

    // Then
    expect(res).toEqual({});
  });
  test('runCommand run the command and return the entryGraph', () => {
    // Given
    jest.useFakeTimers(); // because we execute the action async
    const input: string = 'yo';
    let noMatch: Command = Karhu.createCommand({
      id: 'no',
      name: 'hello',
      keywords: ['open door', 'talk loud'],
      actions: { onExec: jest.fn(), onShow: jest.fn() },
      render: () => '',
    });
    let startsMatch: Command = Karhu.createCommand({
      id: 'starts',
      name: 'hello',
      keywords: ['YOLO', 'my man'],
      actions: { onExec: jest.fn() },
      render: () => '',
    });

    // When
    noMatch = karhu.addCommand(noMatch);
    startsMatch = karhu.addCommand(startsMatch);
    const res: EntryGraph = karhu.runCommand(startsMatch.id, input);
    jest.runOnlyPendingTimers();

    // Then
    expect(startsMatch.actions.onExec).toHaveBeenCalledTimes(1);
    expect(startsMatch.meta.calls).toEqual(1);

    expect(res).toEqual({
      y: {
        o: {
          commands: [{ id: startsMatch.id, calls: 1 }],
        },
      },
    });
  });
  test('moves ran commands to top of list', () => {
    // Given
    jest.useFakeTimers(); // because we execute the action async
    const input: string = 'yo';
    let containsMatch: Command = Karhu.createCommand({
      id: 'contains',
      name: 'hello',
      keywords: ['LOYO', 'my man'],
      actions: { onExec: jest.fn() },
      render: () => '',
    });
    let startsMatch: Command = Karhu.createCommand({
      id: 'starts',
      name: 'hello',
      keywords: ['YOLO', 'my man'],
      actions: { onExec: jest.fn() },
      render: () => '',
    });

    // When
    containsMatch = karhu.addCommand(containsMatch);
    startsMatch = karhu.addCommand(startsMatch);
    let list = karhu.findMatchingCommands(input);

    // Then
    expect(list.map(item => item.id)).toEqual([startsMatch.id, containsMatch.id]);

    // When
    karhu.runCommand(containsMatch.id, input);
    jest.runOnlyPendingTimers();
    list = karhu.findMatchingCommands(input);

    // Then
    expect(list.map(item => item.id)).toEqual([startsMatch.id, containsMatch.id]);

    // When
    // This time the score for history will pass starts
    karhu.runCommand(containsMatch.id, input);
    jest.runOnlyPendingTimers();
    list = karhu.findMatchingCommands(input);

    // Then
    expect(list.map(item => item.id)).toEqual([containsMatch.id, startsMatch.id]);
  });
  test('onShow is called when a command is listed', () => {
    // Given
    jest.useFakeTimers(); // because we execute the action async
    const input: string = 'yo';
    let noMatch: Command = Karhu.createCommand({
      id: 'no',
      name: 'hello',
      keywords: ['open door', 'talk loud'],
      actions: { onExec: jest.fn(), onShow: jest.fn() },
      render: () => '',
    });
    let startsMatch: Command = Karhu.createCommand({
      id: 'starts',
      name: 'hello',
      keywords: ['YOLO', 'my man'],
      actions: { onExec: jest.fn(), onShow: jest.fn() },
      render: () => '',
    });

    // When
    noMatch = karhu.addCommand(noMatch);
    startsMatch = karhu.addCommand(startsMatch);
    karhu.findMatchingCommands(input);

    // Then
    expect(noMatch.actions.onShow).toHaveBeenCalledTimes(0);
    expect(startsMatch.actions.onShow).toHaveBeenCalledTimes(1);
    expect(startsMatch.actions.onShow).toHaveBeenCalledWith(startsMatch.id);
    expect(startsMatch.actions.onExec).toHaveBeenCalledTimes(0);
    expect(startsMatch.meta.calls).toEqual(0);
  });
});
