---
name: GitHub publishing
description: Durable guidance for publishing a repository through the connected GitHub integration.
---

When shell `git push` over HTTPS fails because credentials are not injected, use the connected GitHub integration's authenticated API proxy instead of requesting or handling a token. For large repositories, create blobs, a tree, a commit, and update the branch ref; throttle concurrent blob requests below the proxy's rate limit and retry 429 responses. Collect changed paths with `git -c core.quotePath=false diff --name-only` so Korean and other non-ASCII filenames reach the Git Trees API as real UTF-8 paths instead of escaped Git display strings.

**Why:** The Replit GitHub connection can authenticate API requests while the shell Git client may still have no usable HTTPS credential helper. The proxy also enforces a request-rate limit that can interrupt parallel blob uploads.

**How to apply:** Verify the repository and target branch first, use the remote branch tip as the commit parent, mirror the local tracked tree, and verify the updated ref after the API operation. After an API-created squash commit, confirm its tree matches the local tree before aligning the local branch to the new remote ref.