export interface UnregisteredCommand {
  id?: string;
  name: string;
  contexts?: string[];
  keywords: string[];
  actions: ActionsObject;
  render: (c: Command) => JSX.Element | string;
}

export interface CommandMetadata {
  calls: number;
}

export interface Command extends UnregisteredCommand {
  id: string;
  meta: CommandMetadata;
}

export enum MatchClass {
  HISTORY = 1,
  EXACT = 10,
  STARTS = 3,
  CONTAINS = 2,
  ACRONYM = 1,
  NO = 0,
}

export interface ClassifiedMatch {
  id: string;
  score: MatchClass;
}

export type ClassifiedMatches = ClassifiedMatch[];

export interface EntryGraph {
  next?: { [key: string]: EntryGraph };
  commands?: EntryGraphRecord[];
}

export interface EntryGraphRecord {
  id: string;
  calls: number;
}
export type EntryGraphCommandsSummary = {
  [key: string]: EntryGraphRecord;
};

export interface ActionsObject {
  onExec: () => void;
  onShow?: (id: string) => void;
}
