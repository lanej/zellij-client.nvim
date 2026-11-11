# zellij-client.nvim

Asynchronous native Zellij actions and the full generated protobuf contract for Neovim. Requests use Unix sockets directly, without per-request subprocesses or automatic replay. Session discovery and navigation policy belong to the consuming integration.

[Documentation](https://lanej.io/zellij-client.nvim/) · [Get started](https://lanej.io/zellij-client.nvim/getting-started/) · [Client API](https://lanej.io/zellij-client.nvim/reference/client/)

## Install

With lazy.nvim, add `{ "lanej/zellij-client.nvim" }`, or declare it as a dependency of your integration. The package installs no mappings and needs no setup call.

Requires Neovim 0.11.5+ with LuaJIT on macOS or Linux. The supported server is [lanej/Zellij 0.46.0 at `744c99f5`](https://github.com/lanej/zellij/tree/744c99f5a3a51682553897411d1a891dac04d886), using `contract_version_1`. Compatibility with other revisions is unverified.

## Develop

```sh
uv run scripts/generate.py --check
nvim --headless -u NONE -i NONE -l tests/protobuf.lua
nvim --headless -u NONE -i NONE -l tests/client.lua
stylua --check lua tests
npm ci --prefix website
npm run check --prefix website
npm run build --prefix website
```

The [development guide](https://lanej.io/zellij-client.nvim/reference/compatibility/) describes the vendored source contract, generation, validation boundaries and documentation publishing. Docs live in `website/src/content/docs/`. The lanej.io repository pins a package revision and publishes this Starlight site in its GitHub Pages bundle.

MIT for the Lua client and tooling. Vendored Zellij protobuf sources retain the upstream MIT license in `protocol/LICENSE.md`.
