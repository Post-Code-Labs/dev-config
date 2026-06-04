#!/usr/bin/env bash
#
# Enforce the action-pinning rule: every third-party `uses:` reference in a
# workflow must be pinned to a full 40-character commit SHA with a trailing
# `# vX` comment for human readability.
#
# Local actions (`uses: ./...`) and reusable workflows in this repo are exempt.
#
# Run locally with: pnpm run lint:actions

set -euo pipefail

WORKFLOW_DIR=".github/workflows"
status=0

# Match `uses:` lines (any indentation), ignoring blank/comment-only lines.
while IFS= read -r match; do
  file="${match%%:*}"
  rest="${match#*:}"
  lineno="${rest%%:*}"
  content="${rest#*:}"

  # Extract the reference token after `uses:`.
  ref="$(printf '%s' "$content" | sed -E 's/^[[:space:]]*uses:[[:space:]]*//')"

  # Exempt local composite actions / reusable workflows in this repo.
  if [[ "$ref" == ./* ]]; then
    continue
  fi

  # Must be pinned to a full 40-char commit SHA.
  if ! printf '%s' "$ref" | grep -Eq '@[0-9a-f]{40}([[:space:]]|$)'; then
    echo "::error file=${file},line=${lineno}::Action is not pinned to a full 40-char commit SHA: ${ref}"
    status=1
    continue
  fi

  # Must carry a trailing `# vX` comment for readability.
  if ! printf '%s' "$ref" | grep -Eq '@[0-9a-f]{40}[[:space:]]+#[[:space:]]*v'; then
    echo "::error file=${file},line=${lineno}::Pinned action is missing a trailing '# vX' version comment: ${ref}"
    status=1
  fi
done < <(grep -rnE '^[[:space:]]*uses:' "$WORKFLOW_DIR" --include='*.yml' --include='*.yaml' || true)

if [[ "$status" -eq 0 ]]; then
  echo "All workflow actions are pinned to full commit SHAs with version comments."
else
  echo ""
  echo "Resolve a tag to its SHA with: gh api repos/<owner>/<action>/commits/<tag> --jq .sha"
fi

exit "$status"
