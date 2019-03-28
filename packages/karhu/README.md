# `@karhu/core`

Karhu is a productivity tool for web applications. This package has the core functionality
as the command register and entry graph to adapt command listing to users habits and learn over time.

## Install

```bash
npm install @karhu/core
```

## Usage

```js
import Karhu from '@karhu/core';

const karhu = new Karhu();
```

## API

### `Karhu`

#### `karhu.addCommand`

Adds a command to the current Karhu instance.

```ts
karhu.addCommand(command: UnregisteredCommand): Command
```

#### `karhu.removeCommand`

Removes a command from teh current Karhu instance.

```ts
karhu.removeCommand(commandId: string): void
```

#### `karhu.findMatchingCommands`

Searches through the existing commands keywords and the current entry graph to
find commands that matches the provided input, and returns them.

```ts
karhu.findMatchingCommands(): Command[]
```

#### `karhu.runCommand`

Call the command with the provided id's `.actions.onExec()` function.  
Returns the updated entry graph.  
The input is needed to better sort the commands next time `karhu.findMatchingCommands()` is called.

```ts
karhu.runCommand(id: string): CommandRunResult
```

#### `karhu.getCommands`

Returns a list of all registered commands for the Karhu instance.

```ts
karhu.getCommands(): Command[]
```

#### `karhu.getEntryGraph`

Returns the current Entry Graph for the Karhu instance.

```ts
karhu.getEntryGraph(): EntryGraph
```

#### `karhu.replaceEntryGraph`

Overwrites the the current Entry Graph for the Karhu instance with the new one.

```ts
karhu.replaceEntryGraph(entryGraph: EntryGraph): void
```

#### Static `Karhu.createCommand`

Makes an `UnregisteredCommand` -> `Command`. Mostly used internally but can be useful in
some situations.

```ts
Karhu.createCommand (command: UnregisteredCommand): Command
```
