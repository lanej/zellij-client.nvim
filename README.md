# zellij-client.nvim

Asynchronous native Zellij actions and the full generated protobuf contract for Neovim. Requests use Unix sockets directly, without per-request subprocesses or automatic replay. Session discovery and navigation policy belong to the consuming integration.

[Documentation](https://lanej.io/zellij-client.nvim/) · [Get started](https://lanej.io/zellij-client.nvim/getting-started/) · [Client API](https://lanej.io/zellij-client.nvim/reference/client/)

## Install

With lazy.nvim, add `{ "lanej/zellij-client.nvim" }`, or declare it as a dependency of your integration. The package installs no mappings and needs no setup call.

Requires Neovim 0.11.5+ with LuaJIT on macOS or Linux. The supported server is [lanej/Zellij 0.46.0 at `6647ab29`](https://github.com/lanej/zellij/tree/6647ab291f68c5154dfc4bcceab07b659a2d0efd), using `contract_version_1`. Compatibility with other revisions is unverified.

## Develop

```sh
uv run scripts/generate.py --check
nvim --headless -u NONE -i NONE -l tests/protobuf.lua
nvim --headless -u NONE -i NONE -l tests/client.lua
stylua --check lua tests
cd website
npm ci
npm run check
npm run build
```

The [development guide](https://lanej.io/zellij-client.nvim/reference/compatibility/) describes the vendored source contract, generation, validation boundaries and documentation publishing. Docs live in `website/src/content/docs/`. The lanej.io repository pins a package revision and publishes this Starlight site in its GitHub Pages bundle.

MIT for the Lua client and tooling. Vendored Zellij protobuf sources retain the upstream MIT license in `protocol/LICENSE.md`.
