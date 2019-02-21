<h1 align="center">
  🐻 Karhu 🐻
</h1>

<p align="center" style="font-size: 1.2rem;">
* Simple API * Learns over time * Familiar concept for users *
</p>

---

[![Build Status][build-badge]][build]

## Productivity tool for web applications

Karhu is a productivity tool for rich web applications. Think of it as macOS's Spotlight or [Alfred App](https://www.alfredapp.com) for your web applications.

Your applicaiton registers commands and Karhu takes care of listing them for user searches and executes them when the user wants to.

Karhu also **learns** the **users habits over time** and ranks commonly executed
commands higher for the user inputs.

## What's in this repo

In this repository are two packages:

- `@karhu/core` - The main functionality. No UI.
- `@karhu/react` - Bindings for [React](https://reactjs.org)
- `@karhu/ui` - Example user interfaces

Please see their respictive README's under the `packages` dir in the source code above.

## How to use the example UI

First, let's create a new component that uses the example UI.  
It's very easy to create your own UI, please have a look in the playground folder or how
the example UI is implemented.

```js
// MyKarhu.tsx
import React from 'react';
import { AddCommand } from '@karhu/react';
import { EntryGraph } from '@karhu/core/lib/types';
import { DirtyPolarBear, useToggler } from '@karhu/ui';

function shouldOpen(e: KeyboardEvent): boolean {
  return (e.metaKey || e.ctrlKey) && e.keyCode === 75; // Open with cmd/ctrl + k
}

function MyKarhu() {
  const togglerProps = useToggler({ shouldOpen });
  const onExec = (entryGraph: EntryGraph) => {
    console.log('entryGraph: ', entryGraph);
    togglerProps.onExec();
  };
  return (
    <React.Fragment>
      {commands.map(command => (
        <AddCommand key={command.name} command={command} />
      ))}
      <DirtyPolarBear open={togglerProps.open} setUIRef={togglerProps.setUIRef} onExec={onExec} />
    </React.Fragment>
  );
}

export default MyKarhu;
```

Then add it to your app

```js
// App.tsx

const karhu: Karhu = new Karhu({}, 100);

function App() {
  return (
    <KarhuProvider value={{ karhu }}>
      <div className="App">
        <h2>Press cmd+k to open Karhu</h2>
        <MyKarhu />
      </div>
    </KarhuProvider>
  );
}
```

## In action with example UI

Example UI with a cosy bear on top of a default React app.

![bear](https://oskarhane-dropshare-eu.s3-eu-central-1.amazonaws.com/karhu-readme-LHFpVDuniH/karhu-readme.gif)

[build-badge]: https://img.shields.io/travis/oskarhane/karhu.svg?style=flat-square
[build]: https://travis-ci.org/oskarhane/karhu

# Development

To successfully run this with the playground and eveything, all packages needs to have the same
version of all dependencies and they need to be hoised to the root when bootstrapping with lerna.

To clean, hoist and bootstrap:

```
npx lerna clean -y && npx lerna bootstrap --hoist
```

That is usually only needed to be done once.
After that, just executing `npx lerna bootstrap --hoist` should be enough.
