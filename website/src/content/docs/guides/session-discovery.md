---
title: Session discovery
description: Keep session selection and focus ownership in the consuming integration.
---

The library accepts a resolved identity: `{ path, device, inode }`. It does not inspect processes, query the session index, or choose which session should receive an action.

Resolve the socket once when attaching your integration. Bind its identity with `require("zellij").new(identity)`, then reuse that client. Each request validates that the same socket incarnation still exists before sending bytes.

## A socket directory is not a session identity

The pinned runtime maps session names through its session index. Do not assume the session name is the socket filename, and do not choose the first socket in a directory. Your resolver must identify the intended session and retain its socket identity.

If you use a custom socket directory, retain that configuration when resolving the session. Falling back to an unrelated default directory cannot establish ownership of the custom server.

## Dotfiles integration

[My dotfiles](https://github.com/lanej/dotfiles) use `zellij-context socket` once during editor setup. The helper reads the session index and validates the owned Unix socket. `zellij-session.lua` passes the resulting identity to the library; `pane-navigation.lua` owns editor split navigation, pane focus, tab and zoom checks.

The helper is an integration choice, not a package dependency. Other consumers can provide their own session resolver and call `new(identity)` directly.

## Focus is caller-owned policy

The runtime chooses the last active client for CLI actions. Sending `client_id` does not override a live last-active client. An integration that changes focus must establish its own ownership conditions and recheck relevant pane, tab, and zoom state.

Socket identity validation prevents silently inheriting a replaced socket. It does not make a sequence of separate server requests atomic. If a reply is lost after a mutation, report uncertainty and inspect state before deciding what to do next.
