---
name: GitHub publishing
description: Durable guidance for publishing a repository through the connected GitHub integration.
---

When shell `git push` over HTTPS fails because credentials are not injected, use the connected GitHub integration's authenticated API proxy instead of requesting or handling a token. For large repositories, create blobs, a tree, a commit, and update the branch ref; throttle concurrent blob requests below the proxy's rate limit and retry 429 responses. Collect changed paths with `git -c core.quotePath=false diff --name-only` so Korean and other non-ASCII filenames reach the Git Trees API as real UTF-8 paths instead of escaped Git display strings.

**Why:** The Replit GitHub connection can authenticate API requests while the shell Git client may still have no usable HTTPS credential helper. The proxy also enforces a request-rate limit that can interrupt parallel blob uploads.

**How to apply:** Verify the repository and target branch first, use the remote branch tip as the commit parent, mirror the local tracked tree, and verify the updated ref after the API operation. When building a complete tree, read `git ls-tree` with both `core.quotePath=false` and `-z`; otherwise quoted non-ASCII paths can become literal backslash filenames in the GitHub tree. After an API-created squash commit, confirm its tree matches the local tree before aligning the local branch to the new remote ref; do not align to a commit object unavailable locally.

If a ref update returns “Object does not exist,” GitHub has not received the target commit object. Upload the necessary blobs and tree, create a commit parented to the current remote head, then update the ref. Confirm the resulting tree matches the local tree before moving the ref.

**Why:** GitHub’s ref API cannot point to a commit that exists only in the local repository, and protected workspace Git objects may not be safely recreated through shell commands.

**How to apply:** Use the GitHub API object endpoints for a snapshot commit when shell push credentials are unavailable; leave local refs unchanged if the commit cannot be safely materialized locally.

For Git metadata passed through CodeExecution's `shellExec`, do not parse raw `-z` output: its control characters can be stripped, collapsing status/path records. Encode diff and tree records as JSON in a temporary file using Python, then read that JSON with `readFile`.

**Why:** Parsing the collapsed output as NUL-delimited records loses file boundaries and can produce an invalid Git tree.

**How to apply:** Keep `-z` inside the shell subprocess, decode the bytes into structured JSON there, and only pass JSON across the tool boundary.