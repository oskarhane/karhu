import { classifyMatches, updateEntryGraph, findCommandsInEntryGraph, sumCommandsRecursively } from '../src/utils';
import { Command, MatchClass, EntryGraph, ClassifiedMatch, EntryGraphRecord } from '../src/types';
import Karhu from '../src';

describe('classifyMatches', () => {
  test('classifies matches (including wildcard to match all)', () => {
    // Given
    const input: string = 'yo';
    const noMatch = createCommandWithKeywords(['open door', 'talk loud']);
    const startsMatch = createCommandWithKeywords(['YOLO', 'my man']);
    const containsMatch = createCommandWithKeywords(['LOYO', 'my man']);
    const exactMatch = createCommandWithKeywords(['LOYO', 'yo']);
    const matchAll = createCommandWithKeywords(['*']);

    const commands = [noMatch, startsMatch, containsMatch, exactMatch, matchAll];

    // When
    const res = classifyMatches(commands, input);

    // Then
    expect(res).toHaveLength(5);
    expect(res[0]).toEqual({
      id: noMatch.id,
      score: MatchClass.NO,
    });
    expect(res[1]).toEqual({
      id: startsMatch.id,
      score: MatchClass.STARTS,
    });
    expect(res[2]).toEqual({
      id: containsMatch.id,
      score: MatchClass.CONTAINS,
    });
    expect(res[3]).toEqual({
      id: exactMatch.id,
      score: MatchClass.EXACT,
    });
    expect(res[4]).toEqual({
      id: matchAll.id,
      score: Math.ceil(MatchClass.MATCH_ALL),
    });
  });
  it('returns fast if input is longer than keyword', () => {
    // Given
    const input: string = 'xx';
    const xMatch = createCommandWithKeywords(['x']);

    const commands = [xMatch];

    // When
    const res = classifyMatches(commands, input);

    // Then
    expect(res).toHaveLength(1);
    expect(res[0]).toEqual({
      id: xMatch.id,
      score: MatchClass.NO,
    });
  });
  test('matches all of multiple input words, but separate', () => {
    // Given
    const input: string = 'first command two';

    const partSeparatedMatch = createCommandWithKeywords(['first keyword command two']);
    const partMultiMatch = createCommandWithKeywords(['zero first', 'command keyword', 'two steps']);
    const partNonMatch = createCommandWithKeywords(['zero first', 'command keyword']);

    const commands = [partSeparatedMatch, partMultiMatch, partNonMatch];

    // When
    const res = classifyMatches(commands, input);

    // Then
    expect(res).toHaveLength(3);
    expect(res[0]).toEqual({
      id: partSeparatedMatch.id,
      score: Math.ceil((MatchClass.STARTS + MatchClass.CONTAINS + MatchClass.CONTAINS) / 3),
    });
    expect(res[1]).toEqual({
      id: partMultiMatch.id,
      score: Math.ceil((MatchClass.CONTAINS + MatchClass.STARTS + MatchClass.STARTS) / 3),
    });
    expect(res[2]).toEqual({
      id: partNonMatch.id,
      score: MatchClass.NO,
    });
  });

  let commandNum = 0;
  function createCommandWithKeywords(keywords: string[]): Command {
    return Karhu.createCommand({
      name: `c-${commandNum++}`,
      keywords,
      actions: { onExec: jest.fn() },
      render: () => '',
    });
  }
});

describe('entryGraph', () => {
  test('updateEntryGraph updates the graph in the expected way for an empty graph', () => {
    const initialGraph: EntryGraph = {};
    const word: string = 'bloom';
    const commandId: string = 'test-cmd';

    const graph: EntryGraph = updateEntryGraph(initialGraph, word, commandId);

    expect(graph).toEqual({
      next: {
        b: {
          next: {
            l: {
              next: {
                o: {
                  next: {
                    o: {
                      next: {
                        m: {
                          commands: [{ id: commandId, calls: 1 }],
                        },
                      },
                    },
                  },
                },
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
      next: {
        b: {
          next: {
            l: {
              next: {
                o: {
                  next: {
                    o: {
                      next: {
                        m: {
                          commands: [{ id: commandId, calls: 1 }],
                        },
                      },
                    },
                    s: {
                      next: {
                        s: {
                          next: {
                            o: {
                              next: {
                                m: {
                                  commands: [{ id: initialCmdId1, calls: 1 }],
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          commands: [{ id: initialCmdId2, calls: 1 }],
        },
      },
    };
    expect(graph).toEqual(expectedGraph);

    // When
    // Same command again not not change things
    const graph2: EntryGraph = updateEntryGraph(initialGraph, word, commandId);

    // Then
    expect(graph2).toHaveProperty(
      ['next', 'b', 'next', 'l', 'next', 'o', 'next', 'o', 'next', 'm', 'commands', 0, 'id'],
      commandId,
    );
    expect(graph2).toHaveProperty(
      ['next', 'b', 'next', 'l', 'next', 'o', 'next', 'o', 'next', 'm', 'commands', 0, 'calls'],
      2,
    );

    // When
    // Call bloom on just 'b' input
    const graph3: EntryGraph = updateEntryGraph(graph2, 'b', commandId);

    // Then
    expect(graph3).toHaveProperty(['next', 'b', 'commands', 0, 'id'], initialCmdId2); // Make sure the old one is there
    expect(graph3).toHaveProperty(['next', 'b', 'commands', 1, 'id'], commandId);
    expect(graph3).toHaveProperty(['next', 'b', 'commands', 1, 'calls'], 1);
  });
  test('updateEntryGraph normalizes the calls in history if the limit is reached', () => {
    const word: string = 'b';
    const commandId: string = 'test-cmd';
    const commandId2: string = 'test-cmd2';
    const limit: number = 40;

    const initialGraph: EntryGraph = {
      next: {
        b: {
          commands: [{ id: commandId, calls: 39 }],
          next: {
            l: {
              commands: [{ id: commandId, calls: 12 }, { id: commandId2, calls: 14 }],
            },
          },
        },
      },
    };

    const graph: EntryGraph = updateEntryGraph(initialGraph, word, commandId, limit);

    expect(graph).toEqual({
      next: {
        b: {
          commands: [{ id: commandId, calls: 28 }],
          next: {
            l: {
              commands: [{ id: commandId, calls: 8 }, { id: commandId2, calls: 9 }],
            },
          },
        },
      },
    });
  });
  test('sumCommandsRecursively works', () => {
    // Given
    const testCmds: EntryGraphRecord[] = [{ id: 'test-cmd', calls: 2 }, { id: 'test2-cmd', calls: 1 }];
    const graph: EntryGraph = {
      next: {
        b: {
          next: {
            l: {
              next: {
                o: { commands: testCmds, next: { o: { commands: testCmds, next: { o: { commands: testCmds } } } } },
              },
            },
          },
        },
      },
    };

    // When
    const res = sumCommandsRecursively(graph);

    // Then
    expect(res).toEqual({
      'test-cmd': {
        id: 'test-cmd',
        calls: 6,
      },
      'test2-cmd': {
        id: 'test2-cmd',
        calls: 3,
      },
    });
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
    const graph: EntryGraph = { next: { b: { next: { l: { next: { o: { next: { o: {} } } } } } } } };
    const input = 'blo';

    // When
    const commandIds: ClassifiedMatch[] = findCommandsInEntryGraph(graph, input);

    // Then
    expect(commandIds).toEqual([]);
  });
  test('findCommandsInEntryGraph traverses the graph and return command ids if commands', () => {
    // Given
    const testCmds: EntryGraphRecord[] = [{ id: 'test-tcmd', calls: 1 }, { id: 'test2-cmd', calls: 1 }];
    const graph: EntryGraph = {
      next: { b: { next: { l: { next: { o: { commands: testCmds, next: { o: {} } } } } } } },
    };
    const input = 'blo';

    // When
    const commandIds: ClassifiedMatch[] = findCommandsInEntryGraph(graph, input);

    // Then
    expect(commandIds).toEqual(
      testCmds.map((cmd: EntryGraphRecord) => {
        return {
          id: cmd.id,
          score: MatchClass.HISTORY * cmd.calls,
        };
      }),
    );
  });
  test('findCommandsInEntryGraph traverses the graph deeply and collect scores for commands', () => {
    // Given
    const testCmds: EntryGraphRecord[] = [{ id: 'test-tcmd', calls: 2 }, { id: 'test2-cmd', calls: 1 }];
    const graph: EntryGraph = {
      next: { b: { next: { l: { next: { o: { commands: testCmds, next: { o: { commands: testCmds } } } } } } } },
    };
    const input = 'blo';

    // When
    const commandIds: ClassifiedMatch[] = findCommandsInEntryGraph(graph, input);

    // Then
    expect(commandIds).toEqual(
      testCmds.map((cmd: EntryGraphRecord) => {
        return {
          id: cmd.id,
          score: MatchClass.HISTORY * cmd.calls * 2, // times 2 for deep scores
        };
      }),
    );
  });
});
