export type UnregisteredCommand = {
  id?: string;
  name: string;
  contexts?: string[];
  keywords: string[];
  actions: ActionsObject;
  render: (c: Command) => JSX.Element | string;
};

export type CommandMetadata = {
  calls: number;
};

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
  NO = 0
}

export type ClassifiedMatch = {
  id: string;
  score: MatchClass;
};

export type ClassifiedMatches = ClassifiedMatch[];

export type EntryGraph = any;
export type EntryGraphRecord = {
  id: string;
  calls: number;
};

export type ActionsObject = {
  onExec: () => void;
  onShow?: (id: string) => void;
};
