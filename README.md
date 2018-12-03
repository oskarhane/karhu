<h1 align="center">
  🐻 Karhu 🐻
</h1>

<p align="center" style="font-size: 1.2rem;">
* Fast searches * Learns over time * Familiar concept *
</p>

---

## Productivity tool for web applications

Karhu is a productivity tool for rich web applications. Think of it as macOS's Spotlight or [Alfred App](https://www.alfredapp.com) for your web applications.

Your applicaiton registers commands and Karhu takes care of listing them for user searches and executes them when the user wants to.

Karhu also learns the users habit over time and lists commonly executed
commands higher for the user inputs.

Example implementations will be added to this repo in the future.

## What's in this repo

In this repository are two packages:

- `@karhu/core` - The main functionality. No UI.
- `@karhu/react` - Bindings for [React](https://reactjs.org)

Please see their respictive README's under the `packages` dir in the source code above.

## What's NOT in this repo

There's **NO** UI provided at this point. The way the React bindings are made it's super easy for developers to add their own UI to it.

There's also no default commands added to Karhu. Application developers
must add their own commands for Karhu to be useful.

## In action with example UI

Example UI with a cosy bear on top of a default React app.

![bear](https://oskarhane-dropshare-eu.s3-eu-central-1.amazonaws.com/k2-Eh1xwaA1JP/k2.gif)
