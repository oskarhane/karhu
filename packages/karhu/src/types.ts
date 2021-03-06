export interface UnregisteredCommand {
  id?: string;
  name: string;
  contexts?: string[];
  keywords: string[];
  onExec: (execProps: ExecProps) => AfterExec | void;
  render: (c: Command, renderProps: RenderProps) => JSX.Element | string;
}

export interface CommandMetadata {
  calls: number;
}

export interface Command extends UnregisteredCommand {
  id: string;
  meta: CommandMetadata;
  boundRender: (...args: any) => JSX.Element | string;
}

export enum MatchClass {
  HISTORY = 1,
  EXACT = 10,
  STARTS = 3,
  CONTAINS = 2,
  ACRONYM = 1,
  MATCH_ALL = 0.5,
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

export interface RenderProps {
  userInput: string;
  userArgs?: string[];
}

export interface ExecProps {
  enterContext: (id: string) => void;
  userInput: string;
  userArgs?: string[];
}

export enum AfterExec {
  CLOSE = 'CLOSE',
  CLEAR_INPUT = 'CLEAR_INPUT',
  KEEP = 'KEEP',
  NOOP = 'NOOP',
}

export interface KarhuContext {
  id: string;
  title: string;
  description: string;
}

export interface CommandRunResult {
  entryGraph: EntryGraph;
  open: boolean;
  input: string;
}
