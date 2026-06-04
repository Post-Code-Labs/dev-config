#!/usr/bin/env bash
#
# Copy the *non-importable* shared files from @builtbydoug/dev-config into the
# current repo. Configs that support `extends`/`import` (Prettier, tsconfig,
# ESLint, ruff) are NOT copied — wire those up by reference instead. This script
# only handles files that must physically live in each repo.
#
# Run from a consuming repo's root:
#   pnpm dlx @builtbydoug/dev-config sync [--python] [--release-flow] [--from PATH]
#   # or: bash node_modules/@builtbydoug/dev-config/scripts/sync-config.sh
#
# Flags:
#   --python        also sync the polyglot dependabot config (npm + uv + actions)
#   --release-flow  also sync pr-title.yml (repos that gen release notes from PR titles)
#   --from PATH     dev-config source dir (default: ./node_modules/@builtbydoug/dev-config)
#   --force         overwrite existing files (default: skip + warn)

set -euo pipefail

SRC="node_modules/@builtbydoug/dev-config"
WITH_PYTHON=0
WITH_RELEASE=0
FORCE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --python) WITH_PYTHON=1 ;;
    --release-flow) WITH_RELEASE=1 ;;
    --force) FORCE=1 ;;
    --from) SRC="$2"; shift ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

if [[ ! -d "$SRC" ]]; then
  echo "dev-config source not found at '$SRC'. Install @builtbydoug/dev-config or pass --from PATH." >&2
  exit 1
fi

copy() {
  local from="$SRC/$1" to="$2"
  mkdir -p "$(dirname "$to")"
  if [[ -e "$to" && "$FORCE" -ne 1 ]]; then
    echo "skip   $to (exists; pass --force to overwrite)"
    return
  fi
  cp "$from" "$to"
  echo "synced $to"
}

copy github/CODEOWNERS .github/CODEOWNERS
copy scripts/check-action-pins.sh scripts/check-action-pins.sh
chmod +x scripts/check-action-pins.sh 2>/dev/null || true
copy lefthook/lefthook.base.yml lefthook.yml
copy github/workflows/workflow-lint.yml .github/workflows/workflow-lint.yml

if [[ "$WITH_RELEASE" -eq 1 ]]; then
  copy github/workflows/pr-title.yml .github/workflows/pr-title.yml
fi

if [[ "$WITH_PYTHON" -eq 1 ]]; then
  copy github/dependabot-polyglot.yml .github/dependabot.yml
else
  copy github/dependabot-npm.yml .github/dependabot.yml
fi

# .nvmrc from the pinned node version in versions.json (no jq dependency).
NODE_VERSION="$(grep -Eo '"node"[[:space:]]*:[[:space:]]*"[^"]+"' "$SRC/versions.json" | head -1 | sed -E 's/.*"([^"]+)"$/\1/')"
if [[ -n "${NODE_VERSION:-}" ]]; then
  if [[ -e .nvmrc && "$FORCE" -ne 1 ]]; then
    echo "skip   .nvmrc (exists; pass --force to overwrite)"
  else
    printf '%s\n' "$NODE_VERSION" > .nvmrc
    echo "synced .nvmrc ($NODE_VERSION)"
  fi
fi

echo ""
echo "Done. Reminder: wire the importable configs by reference (see dev-config README):"
echo "  - package.json  \"prettier\": \"@builtbydoug/dev-config/prettier\""
echo "  - tsconfig.json \"extends\": \"@builtbydoug/dev-config/typescript/tsconfig.base.json\""
echo "  - eslint.config.mjs  import { baseConfig } from '@builtbydoug/dev-config/eslint/base'"
echo "  - CI: uses: builtbydoug/dev-config/.github/workflows/reusable-node-quality.yml@<tag>"
