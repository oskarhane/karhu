import { classifyMatches, updateEntryGraph, findCommandsInEntryGraph } from '../src/utils';
import { Command, ClassifiedMatches, MatchClass, EntryGraph, ClassifiedMatch, EntryGraphRecord } from '../src/types';
import Karhu from '../src';

describe('classifyMatches', () => {
  test('classifies matches', () => {
    // Given
    const input: string = 'yo';
    const noMatch: Command = Karhu.createCommand({
      id: 'no',
      name: 'hello',
      keywords: ['open door', 'talk loud'],
      actions: { onExec: jest.fn() },
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

    const commands: Command[] = [noMatch, startsMatch, containsMatch, exactMatch];

    // When
    const res: ClassifiedMatches = classifyMatches(commands, input);

    // Then
    expect(res).toHaveLength(4);
    expect(res[0]).toEqual({
      id: 'no',
      score: MatchClass.NO,
    });
    expect(res[1]).toEqual({
      id: 'starts',
      score: MatchClass.STARTS,
    });
    expect(res[2]).toEqual({
      id: 'contains',
      score: MatchClass.CONTAINS,
    });
    expect(res[3]).toEqual({
      id: 'exact',
      score: MatchClass.EXACT,
    });
  });
  it('returns fast if input is longer than keyword', () => {
    // Given
    const input: string = 'xx';
    const xMatch: Command = Karhu.createCommand({
      id: 'no',
      name: 'hello',
      keywords: ['x'],
      actions: { onExec: jest.fn() },
      render: () => '',
    });

    const commands: Command[] = [xMatch];

    // When
    const res: ClassifiedMatches = classifyMatches(commands, input);

    // Then
    expect(res).toHaveLength(1);
    expect(res[0]).toEqual({
      id: 'no',
      score: MatchClass.NO,
    });
  });
});

describe('entryGraph', () => {
  test('updateEntryGraph updates the graph in the expected way for an empty graph', () => {
    const initialGraph: EntryGraph = {};
    const word: string = 'bloom';
    const commandId: string = 'test-cmd';

    const graph: EntryGraph = updateEntryGraph(initialGraph, word, commandId);

    expect(graph).toEqual({
      b: {
        l: {
          o: {
            o: {
              m: {
                commands: [{ id: commandId, calls: 1 }],
              },
            },
          },
        },
      },
    });
  });
  test('updateEntryGraph updates the graph in the expected way for an existing graph', () => {
    // Given
    const initialCmdId1: string = 'flower-cmd';
    const initialCmdId2: string = 'break-out-cmd';
    let initialGraph: EntryGraph = updateEntryGraph({}, 'blossom', initialCmdId1);
    initialGraph = updateEntryGraph(initialGraph, 'b', initialCmdId2);
    const word: string = 'bloom';
    const commandId: string = 'test-cmd';

    // When
    const graph: EntryGraph = updateEntryGraph(initialGraph, word, commandId);

    // Then
    const expectedGraph = {
      b: {
        l: {
          o: {
            o: {
              m: {
                commands: [{ id: commandId, calls: 1 }],
              },
            },
            s: {
              s: {
                o: {
                  m: {
                    commands: [{ id: initialCmdId1, calls: 1 }],
                  },
                },
              },
            },
          },
        },
        commands: [{ id: initialCmdId2, calls: 1 }],
      },
    };
    expect(graph).toEqual(expectedGraph);

    // When
    // Same command again not not change things
    const graph2: EntryGraph = updateEntryGraph(initialGraph, word, commandId);

    // Then
    expect(graph2).toHaveProperty(['b', 'l', 'o', 'o', 'm', 'commands', 0, 'id'], commandId);
    expect(graph2).toHaveProperty(['b', 'l', 'o', 'o', 'm', 'commands', 0, 'calls'], 2);

    // When
    // Call bloom on just 'b' input
    const graph3: EntryGraph = updateEntryGraph(graph2, 'b', commandId);

    // Then
    expect(graph3).toHaveProperty(['b', 'commands', 0, 'id'], initialCmdId2); // Make sure the old one is there
    expect(graph3).toHaveProperty(['b', 'commands', 1, 'id'], commandId);
    expect(graph3).toHaveProperty(['b', 'commands', 1, 'calls'], 1);
  });
  test('findCommandsInEntryGraph traverses the graph and return empty if no commands', () => {
    // Given
    const graph: EntryGraph = {};
    const input = 'blo';

    // When
    const commandIds: ClassifiedMatch[] = findCommandsInEntryGraph(graph, input);

    // Then
    expect(commandIds).toEqual([]);
  });
  test('findCommandsInEntryGraph traverses the graph and return empty if no commands', () => {
    // Given
    const graph: EntryGraph = { b: { l: { o: { o: {} } } } };
    const input = 'blo';

    // When
    const commandIds: ClassifiedMatch[] = findCommandsInEntryGraph(graph, input);

    // Then
    expect(commandIds).toEqual([]);
  });
  test('findCommandsInEntryGraph traverses the graph and return command ids if commands', () => {
    // Given
    const testCmds: EntryGraphRecord[] = [{ id: 'test-tcmd', calls: 1 }, { id: 'test2-cmd', calls: 1 }];
    const graph: EntryGraph = { b: { l: { o: { commands: testCmds, o: {} } } } };
    const input = 'blo';

    // When
    const commandIds: ClassifiedMatch[] = findCommandsInEntryGraph(graph, input);

    // Then
    expect(commandIds).toEqual(
      testCmds.map((cmd: EntryGraphRecord) => {
        return {
          id: cmd.id,
          score: MatchClass.HISTORY + cmd.calls,
        };
      }),
    );
  });
});
