# `@karhu/react`

React bindings and components for Karhu. Expects `@karhu/core` to be there.

## Install

```bash
npm install @karhu/core @karhu/react
```

## Usage

```js
import { KarhuProvider, KarhuComponent, AddCommand } from '@karhu/react';
```

## Components

### `<KarhuProvider>`

Provide a Karhu instance in React context.

Props:

```tsx
type Props = {
  value: Karhu;
};
```

Usage:

```tsx
const karhu = new Karhu()

<KarhuProvider value={karhu}>
{
  // application
}
</KarhuProvider>
```

### `<KarhuComponent>`

A combined React context Consumer and Karhu adapter.
Expects to find a `Karhu` instance in application context.

On every property `input` change the children get re-rendered
and the `commandsList` is updated.

Call `exec` with a command id to execute the command and get the entry
graph back.

Types:

```tsx
type Props = {
  children: (obj: ChildrenProviderObject) => {};
  input: string;
};

type ChildrenProviderObject = {
  commandsList: Command[];
  exec: (id: string) => EntryGraph;
};
```

Usage:

```tsx
const karhu = new Karhu()

<KarhuProvider value={karhu}>
  <KarhuComponent input="">
    {({ commandsList, exec }) => {
      // what to render
    }}
  </KarhuComponent>
</KarhuProvider>
```

### `<AddCommand>`

Component to add a command to a Karhu instance.
Expects to find a `Karhu` instance in application context.

Props:

```tsx
type AddCommandProps = {
  command: UnregisteredCommand;
};
```

Usage:

```tsx
const karhu = new Karhu();
const command = Karhu.createCommand({
  name: 'command',
  keywords: ['command'],
  actions: { onExec: () => {} },
  render: () => {},
});

<KarhuProvider value={karhu}>
  <AddCommand command={command} />
</KarhuProvider>;
```
