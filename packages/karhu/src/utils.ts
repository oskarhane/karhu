import { Command, ClassifiedMatches, MatchClass, ClassifiedMatch, EntryGraph, EntryGraphRecord } from './types';

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

export function updateEntryGraph(initialGraph: EntryGraph, input: string, cmdId: string): EntryGraph {
  const letters: string[] = input.split('');
  const graphClone: EntryGraph = { ...initialGraph };
  let traverseObj = graphClone;
  letters.forEach((letter, i) => {
    if (!traverseObj.hasOwnProperty(letter)) {
      traverseObj[letter] = {};
    }
    traverseObj = traverseObj[letter];
    if (i === letters.length - 1) {
      if (!traverseObj.hasOwnProperty('commands')) {
        traverseObj.commands = [{ id: cmdId, calls: 1 }];
      } else {
        const idMap = traverseObj.commands.map((c: EntryGraphRecord) => c.id);
        const cmdIndex = idMap.indexOf(cmdId);
        if (cmdIndex < 0) {
          traverseObj.commands.push({ id: cmdId, calls: 1 });
        } else {
          traverseObj.commands[cmdIndex].calls += 1;
        }
      }
    }
  });
  return graphClone;
}

export function findCommandsInEntryGraph(graph: EntryGraph, input: string): ClassifiedMatch[] {
  const letters: string[] = input.split('');
  let traverseObj = graph;
  for (let i = 0; i < letters.length; i += 1) {
    if (!traverseObj[letters[i]]) {
      return [];
    }
    traverseObj = traverseObj[letters[i]];
  }
  if (traverseObj.hasOwnProperty('commands')) {
    return traverseObj['commands'].map((cmd: EntryGraphRecord) => {
      return {
        id: cmd.id,
        score: MatchClass.HISTORY + cmd.calls,
      };
    });
  }
  return [];
}
