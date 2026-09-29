---
name: Managed preview port conflicts
description: Why a preview can appear reachable while its managed workflow reports a port conflict.
---

An artifact's managed workflow can fail with “port already in use” while an older process of the same app continues serving that port. A successful curl or screenshot alone does not establish that the managed workflow is healthy.

**Why:** The preview router can still reach the old process even as the current managed workflow has failed. This makes the failure look like a frontend or preview issue when it is actually a duplicate listener.

**How to apply:** If a managed workflow reports a port conflict, check its status and identify the current port listener before changing code or restarting again. Retire only the stale process group, then restart the existing managed workflow and confirm both its running status and the routed preview.