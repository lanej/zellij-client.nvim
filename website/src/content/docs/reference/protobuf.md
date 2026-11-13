---
title: Protobuf API
description: Encode and decode the full pinned Zellij contract with Lua tables.
---

`require("zellij.protobuf")` exposes messages and enums from all five protobuf files in the pinned runtime. It uses Neovim's LuaJIT FFI and requires no installed Lua package.

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

| API | Result |
| --- | --- |
| `encode(name, value)` | Binary protobuf string for a generated message. |
| `decode(name, bytes)` | Lua table retaining known protobuf fields. |
| `enum(name)` | Table mapping enum names to numbers. |
| `messages`, `enums` | Full generated descriptor tables. |
| `frame(bytes)` | Four-byte IPC header followed by the payload. |
| `frame_size(header)` | Payload length from the bounded IPC header. |

Message and enum names accept fully qualified protobuf names or names relative to `client_server_contract`. Tables use the original protobuf field names. Enum inputs accept names or numbers; decoding returns numbers.

## Data representation

Byte fields are binary Lua strings. Unsigned 64-bit integers decode as decimal strings; encoding also accepts numbers within Lua's exact integer range. Maps decode with string keys. Absent scalar fields remain absent. Unknown wire fields are skipped.

Nested messages, oneofs, packed and unpacked repeated fields, and maps retain protobuf semantics. Encoding validates protobuf values, and decoding rejects malformed wire data. The `frame()` and `frame_size()` helpers enforce the IPC framing bounds.

## Source contract

The package vendors `common_types.proto`, `client_to_server.proto`, `server_to_client.proto`, `app_control.proto` and `pane_mirror.proto` from the [pinned runtime revision](https://github.com/lanej/zellij/tree/84874c1b91c279ad2b91f25c8af9c9d1ea7c94cd/zellij-utils/src/client_server_contract).

[`protocol/source.json`](https://github.com/lanej/zellij-client.nvim/blob/main/protocol/source.json) records the repository, revision, runtime version and contract namespace. The generated descriptors are not an independent compatibility guarantee. [Regenerate and verify them](../compatibility/#regenerate-the-contract) when updating the pin.
