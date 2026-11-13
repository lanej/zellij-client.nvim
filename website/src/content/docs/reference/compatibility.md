---
title: Compatibility and development
description: Runtime pinning, contract generation and validation boundaries.
---

## Supported environment

Use Neovim 0.11.5 or newer with LuaJIT, on macOS or Linux. The client has passed protocol and socket checks on Neovim 0.11.5, and live dotfiles navigation on 0.12.6.

The supported server is [lanej/Zellij 0.46.0 at `84874c1b`](https://github.com/lanej/zellij/tree/84874c1b91c279ad2b91f25c8af9c9d1ea7c94cd), using `contract_version_1`. Compatibility with other revisions is unverified. The internal socket protocol can change independently of the version string.

This generated contract requires the updated runtime. In the previous `744c99f5` contract, `Options` field 88 encoded a boolean; it now encodes `stacked_pane_list_orientation` as a string, and the boolean moved to field 89. Those encodings are incompatible. Update the client and server together; sharing version `0.46.0` and namespace `contract_version_1` does not make the older runtime compatible.

## Regenerate the contract

`protocol/source.json` pins the upstream repository and revision. The five `protocol/*.proto` files and `protocol/LICENSE.md` are copied from that revision. Generation reads those local sources, so it needs no runtime checkout or network after the pinned Python dependencies have been cached.

```sh
uv run scripts/generate.py
uv run scripts/generate.py --check
```

The generator writes `lua/zellij/schema.lua` and independent Python protobuf reference messages in `tests/protobuf.json`. Edit the generator or source contract, not the generated files. When changing the runtime pin, deliberately replace all five source files, update the metadata and compatibility statement, and exercise a real integration.

## Run checks

```sh
nvim --headless -u NONE -i NONE -l tests/protobuf.lua
nvim --headless -u NONE -i NONE -l tests/client.lua
stylua --check lua tests
```

The socket checks use private local servers. They cover fragmented replies, acknowledgement-before-query output, server errors, malformed frames, cancellation, close and uncertain timeouts without replay. They do not establish compatibility with another Zellij revision. The consuming dotfiles repository retains the live editor-to-pane acceptance test.

## Build this documentation

```sh
cd website
npm ci
npm run check
npm run build
```

The static site uses `/zellij-client.nvim/` as its base path. The [lanej.io website](https://github.com/lanej/lanej.github.com) pins a reviewed package commit, builds this directory and assembles the output into its single GitHub Pages bundle. Update the website's `.zellij-client-version` pin to publish a documentation revision.

MIT covers the Lua client and tooling; vendored Zellij definitions retain the upstream MIT license in `protocol/LICENSE.md`.
