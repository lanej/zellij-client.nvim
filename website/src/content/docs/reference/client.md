---
title: Client API
description: Socket identity, request options, callbacks and lifecycle.
---

## `new(identity)`

```lua
local client = require("zellij").new({ path, device, inode })
```

Create a client bound to a resolved Unix socket. `path` is an absolute socket filename; `device` and `inode` come from `vim.uv.fs_lstat(path)`. Construction does not send a request. Session discovery belongs to the caller.

## `client:request(action, options, callback)`

Send one generated `Action` table, returning a cancellation function. Each request owns its connection and deadline; it is never replayed automatically.

| Option | Meaning |
| --- | --- |
| `terminal_id` | Optional terminal pane context. Zero is a valid ID. |
| `client_id` | Optional client context; does not replace the runtime's focus ownership rules. |
| `expect_output` | Wait for output instead of completing on a generic input acknowledgement. Use for queries. |
| `timeout_ms` | Positive request timeout, default `2000`. |

The callback runs once on Neovim's main loop:

```lua
function(error, output, response)
    -- error: string or nil
    -- output: text from the server on success
    -- response: original decoded server message, when available
end
```

A `Log` response returns its joined text. `LogError` preserves the server error text and raw response. An `Exit` is reported as an error with the decoded message retained. For a mutation without `expect_output`, `UnblockInputThread` completes with an empty output string.

## Outcomes

A timeout, cancellation, write failure, or lost connection can leave the action's outcome unknown. An error is not evidence that a mutation failed to run. The caller must decide whether and how to reconcile state; retrying a mutation can apply it twice.

A closed client and a changed socket are rejected before sending. Encoding errors are reported through the callback. Invalid callback and timeout arguments are programmer errors and raise an assertion.

Messages use the pinned runtime's four-byte frame header. Encoded and received frames are bounded to **4 MiB**.

## Cancellation and close

```lua
local cancel = client:request(action, options, callback)
cancel()
client:close()
```

Cancellation closes the request's timer and connection and schedules its callback with an uncertainty error. `close()` cancels outstanding requests, prevents new ones and is idempotent. These calls do not roll back actions on the server.

## Transport scope

The transport sends Action requests. The generated codec also exposes application-control, pane-mirror and plugin-pipe messages, but this package does not implement their streaming or pipe-release lifecycles.
