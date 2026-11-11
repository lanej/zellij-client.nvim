---
title: Get started
description: Install the client and send a bounded asynchronous action.
---

## Install

With lazy.nvim, add the package:

```lua
{ "lanej/zellij-client.nvim" }
```

Or declare it as a dependency of the integration that uses it:

```lua
{
    "your/integration",
    dependencies = { "lanej/zellij-client.nvim" },
}
```

Use your plugin manager's lockfile to pin a tested commit. There is no setup function, external Lua package, key mapping, or Navigator dependency.

## Bind a client to a socket

Your integration supplies the intended session's resolved socket identity. Take the device and inode from `fs_lstat`, and reject paths that are not sockets:

```lua
local stat = assert(vim.uv.fs_lstat(path))
assert(stat.type == "socket")
local client = require("zellij").new({ path, stat.dev, stat.ino })
```

The client checks that identity before each request. If the server replaces its socket, reconnect through your session resolver. See [session discovery](../guides/session-discovery/).

## Request output

```lua
local cancel = client:request({ list_tabs = { output_json = true } }, {
    expect_output = true,
    timeout_ms = 2000,
}, function(error, output, response)
    if error then
        vim.notify(error, vim.log.levels.WARN)
        return
    end
    vim.print(vim.json.decode(output))
end)
```

Set `expect_output` for queries: a generic input acknowledgement may arrive before the actual output. The callback also receives the decoded server message when one is available.

Call `cancel()` to cancel that request. Call `client:close()` when your integration shuts down; it cancels outstanding requests and prevents new ones. A cancelled request may already have run on the server. [Handle outcomes explicitly](../reference/client/#outcomes).
