# zellij-client.nvim

Asynchronous Zellij actions and the full generated protobuf contract for Neovim. Requests use Unix sockets directly, without per-request subprocesses, automatic replay, Navigator, or a dotfiles dependency.

Requires Neovim 0.11.5+ with LuaJIT on macOS or Linux. The supported server is [lanej/Zellij 0.46.0 at `744c99f5`](https://github.com/lanej/zellij/tree/744c99f5a3a51682553897411d1a891dac04d886), using `contract_version_1`. Compatibility with other runtime revisions is unverified; this internal protocol can change independently of Zellij's version string.

## Install

With lazy.nvim, add `{ "lanej/zellij-client.nvim" }`, or declare it as a dependency of your integration. The package installs no navigation mappings and needs no setup call.

## Send an action

The caller resolves the socket path for the intended session. `new({path, device, inode})` binds a client to that socket incarnation; it checks the identity again before every request. Session-name discovery, permissions and focus ownership belong to the integration.

```lua
local path = "/absolute/path/to/the/session/socket"
local stat = assert(vim.uv.fs_lstat(path))
assert(stat.type == "socket")
local client = require("zellij").new({ path, stat.dev, stat.ino })
local cancel = client:request({ list_tabs = { output_json = true } }, {
    expect_output = true,
    timeout_ms = 2000,
}, function(error, output, response)
    if error then
        vim.notify(error, vim.log.levels.WARN)
        return
    end
    local tabs = vim.json.decode(output)
    vim.print(tabs, response)
end)
-- cancel() cancels this request; client:close() cancels all requests and closes the client.
```

`request(action, options, callback)` accepts generated Action tables. Options are `terminal_id`, `client_id`, `expect_output` and `timeout_ms` (default 2000). Each request owns its connection and timer; callbacks run once on Neovim's main loop with `(error, output, decoded_response)`. Queries should set `expect_output = true` so a generic acknowledgement cannot replace their response. The raw response preserves server errors and exits. Timeout, cancellation or disconnect does not establish whether an action ran: requests are never replayed automatically. `close()` is idempotent and prevents new requests.

The runtime chooses the last active client for CLI actions; `client_id` does not override a live last-active client. Integrations that change focus must establish their own ownership conditions. This client supports Action requests; streaming pane mirrors and plugin pipe lifecycles are exposed by the protobuf codec but have no transport API here.

## Protobuf API

`require("zellij.protobuf")` exposes every message and enum from the pinned runtime’s five protobuf files, including application-control and pane-mirror messages. It uses Neovim’s built-in LuaJIT FFI and requires no installed Lua package.

```lua
local pb = require("zellij.protobuf")
local Direction = pb.enum("Direction")
local bytes = pb.encode("ClientToServerMsg", {
    action = {
        is_cli_client = true,
        action = { move_focus = { direction = Direction.DIRECTION_LEFT } },
    },
})
local message = pb.decode("ClientToServerMsg", bytes)
```

Message and enum names accept either their fully qualified protobuf names or names relative to `client_server_contract`. Lua tables use original protobuf field names. Enum inputs accept names or numbers, and decoding returns numbers. Byte fields use binary Lua strings. Unsigned 64-bit integers decode as decimal strings; encoding also accepts numbers within Lua’s exact integer range. Maps decode with string keys. Absent scalar fields remain absent, and unknown wire fields are skipped. Nested messages, oneofs, packed and unpacked repeated fields, and maps retain protobuf semantics. `messages` and `enums` expose generated descriptors; `frame(bytes)` and `frame_size(header)` implement Zellij’s bounded four-byte IPC framing.

## Contract generation and checks

`protocol/source.json` pins the upstream repository, revision and contract namespace. `protocol/*.proto` and `protocol/LICENSE.md` are copied from that revision. Regeneration uses these local sources, so checking generated output needs no runtime checkout or network access after the pinned Python dependencies have been cached.

```sh
uv run scripts/generate.py --check
nvim --headless -u NONE -i NONE -l tests/protobuf.lua
nvim --headless -u NONE -i NONE -l tests/client.lua
stylua --check lua tests
```

Run `uv run scripts/generate.py` after deliberately updating the upstream pin and replacing all five source protobuf files. It regenerates `lua/zellij/schema.lua` and independent Python protobuf reference messages in `tests/protobuf.json`. Do not edit generated files directly. Update the supported runtime and exercise a real integration before claiming compatibility with another revision.

The socket tests start private local servers; they cover fragmented replies, acknowledgement-before-query output, raw errors, malformed frames, cancellation, close and uncertain timeouts without replay. They do not establish compatibility with a different Zellij runtime. The consuming dotfiles repository retains the live editor-to-pane navigation acceptance test.

## License

MIT for the Lua client and tooling. Vendored Zellij protobuf sources retain the upstream MIT license in `protocol/LICENSE.md`.
