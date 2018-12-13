import {
  Command,
  ClassifiedMatches,
  MatchClass,
  ClassifiedMatch,
  EntryGraph,
  EntryGraphRecord,
  EntryGraphCommandsSummary,
} from './types';

export function classifyMatches(commands: Command[], input: string): ClassifiedMatches {
  const normInputWords = input.toLowerCase().split(' ');
  const out: ClassifiedMatches = commands.map(c => {
    let bestMatches: ClassifiedMatch[] = [];
    normInputWords.forEach(inputWord => {
      let bestMatch: ClassifiedMatch = noMatch(c.id);
      c.keywords.forEach(rawKw => {
        const kw = rawKw.toLowerCase();

        let currentMatch: ClassifiedMatch = noMatch(c.id);
        // Too long, no match
        if (inputWord.length > kw.length) {
          currentMatch = noMatch(c.id);
        }
        // Exact
        else if (inputWord === kw) {
          currentMatch = exactMatch(c.id);
        }
        // Starts with
        else if (kw.indexOf(inputWord) === 0) {
          currentMatch = startsMatch(c.id);
        }
        // Contains
        else if (kw.indexOf(inputWord) >= 0) {
          currentMatch = containsMatch(c.id);
        }

        // Better match for this keyword?
        if (currentMatch.score > bestMatch.score) {
          bestMatch = currentMatch;
        }
      });
      bestMatches.push(bestMatch);
    });

    let totalScore: number = MatchClass.NO;
    for (let bestMatch of bestMatches) {
      if (bestMatch.score === MatchClass.NO) {
        totalScore = MatchClass.NO;
        break;
      }
      totalScore += bestMatch.score;
    }
    const meanScore: number = Math.floor(totalScore / bestMatches.length);
    return customMatch(c.id, meanScore);
  });
  return out;
}

function noMatch(id: string): ClassifiedMatch {
  return {
    id,
    score: MatchClass.NO,
  };
}
function exactMatch(id: string): ClassifiedMatch {
  return {
    id,
    score: MatchClass.EXACT,
  };
}
function startsMatch(id: string): ClassifiedMatch {
  return {
    id,
    score: MatchClass.STARTS,
  };
}
function containsMatch(id: string): ClassifiedMatch {
  return {
    id,
    score: MatchClass.CONTAINS,
  };
}
function customMatch(id: string, score: number): ClassifiedMatch {
  return {
    id,
    score,
  };
}

export function updateEntryGraph(
  initialGraph: EntryGraph,
  input: string,
  cmdId: string,
  callLimit: number = 0,
): EntryGraph {
  const letters: string[] = input.split('');
  const graphClone: EntryGraph = { ...initialGraph };
  let traverseObj = graphClone;
  letters.forEach((letter, i) => {
    if (!traverseObj.next) {
      traverseObj['next'] = {};
    }
    if (!traverseObj.next.hasOwnProperty(letter)) {
      traverseObj.next[letter] = {};
    }
    traverseObj = traverseObj.next[letter];
    if (i === letters.length - 1) {
      if (!traverseObj.commands) {
        traverseObj.commands = [{ id: cmdId, calls: 1 }];
      } else {
        const idMap = traverseObj.commands.map((c: EntryGraphRecord) => c.id);
        const cmdIndex = idMap.indexOf(cmdId);
        if (cmdIndex < 0) {
          traverseObj.commands.push({ id: cmdId, calls: 1 });
        } else {
          traverseObj.commands[cmdIndex].calls += 1;
          if (callLimit > 0 && traverseObj.commands[cmdIndex].calls >= callLimit) {
            traverseObj = normalizeEntryGraphCommandsCalls(traverseObj);
          }
        }
      }
    }
  });
  return graphClone;
}

export function normalizeEntryGraphCommandsCalls(graph: EntryGraph) {
  const factor: number = 0.7;
  if (graph.commands) {
    graph.commands = graph.commands.map(c => {
      c.calls = Math.floor(c.calls * factor);
      return c;
    });
  }
  if (graph.next) {
    const ids = Object.keys(graph.next);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      graph.next[id] = normalizeEntryGraphCommandsCalls(graph.next[id]);
    }
  }
  return graph;
}

export function findCommandsInEntryGraph(graph: EntryGraph, input: string): ClassifiedMatch[] {
  const letters: string[] = input.split('');
  let traverseObj: EntryGraph = graph;
  for (let i = 0; i < letters.length; i += 1) {
    if (!traverseObj.next || !traverseObj.next[letters[i]]) {
      return [];
    }
    traverseObj = traverseObj.next[letters[i]] as EntryGraph;
  }
  const commandsSummary = sumCommandsRecursively(traverseObj);
  return Object.keys(commandsSummary).map(c => {
    const cmd = commandsSummary[c];
    const m: ClassifiedMatch = {
      id: cmd.id,
      score: MatchClass.HISTORY * cmd.calls,
    };
    return m;
  });
}

export const sumCommandsRecursively = (graph: EntryGraph): EntryGraphCommandsSummary => {
  let foundCommands: EntryGraphCommandsSummary = {};
  const { commands = [], next = {} } = graph;
  const { commands: noop, ...chars } = next;
  commands.forEach((c: EntryGraphRecord) => {
    if (!foundCommands.hasOwnProperty(c.id)) {
      foundCommands[c.id] = {
        id: c.id,
        calls: 0,
      } as EntryGraphRecord;
    }
    foundCommands[c.id].calls += c.calls;
  });
  foundCommands = Object.keys(chars).reduce((allCommands, curr: string) => {
    const newCommands = sumCommandsRecursively(chars[curr]);
    if (!newCommands || !Object.keys(newCommands).length) {
      return allCommands;
    }
    Object.keys(newCommands).forEach(id => {
      const cmd = newCommands[id];
      if (allCommands.hasOwnProperty(cmd.id)) {
        allCommands[cmd.id].calls += cmd.calls;
      } else {
        allCommands[cmd.id] = cmd;
      }
    });
    return allCommands;
  }, foundCommands);
  return foundCommands;
};
