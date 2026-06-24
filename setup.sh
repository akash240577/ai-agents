#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
COPILOT_LINK="$HOME/.copilot"

echo "==> ambs-toolkit setup"

# 1. Create .env if missing
if [ ! -f "$DIR/.env" ]; then
  cp "$DIR/.env.template" "$DIR/.env"
  echo "    created .env from template -- fill in your credentials before using scripts"
else
  echo "    .env already exists, skipping"
fi

# 2. npm install
echo "==> Installing dependencies..."
cd "$DIR" && npm install

# 3. Create ~/.copilot directory and sub-symlinks (agents, skills)
mkdir -p "$COPILOT_LINK"
echo "    ~/.copilot directory ready"

for subdir in agents skills; do
  LINK="$COPILOT_LINK/$subdir"
  TARGET="$DIR/$subdir"
  if [ ! -e "$LINK" ]; then
    ln -s "$TARGET" "$LINK"
    echo "    created ~/.copilot/$subdir -> $TARGET"
  elif [ -L "$LINK" ]; then
    echo "    ~/.copilot/$subdir symlink already exists, skipping"
  else
    # Existing real directory — back it up before replacing with a symlink
    BACKUP="${LINK}.bak-$(date +%Y%m%d%H%M%S)"
    echo "    ~/.copilot/$subdir is a real directory (not a symlink)"
    echo "    backing up to $BACKUP ..."
    mv "$LINK" "$BACKUP"
    echo "    backup created: $BACKUP"
    ln -s "$TARGET" "$LINK"
    echo "    created ~/.copilot/$subdir -> $TARGET"
    echo "    NOTE: your previous $subdir are in $BACKUP -- review and remove when done"
  fi
done

# Write TOOLKIT_ROOT into ambs-toolkit/.env (auto-refreshed on every setup run)
if grep -q "^TOOLKIT_ROOT=" "$DIR/.env" 2>/dev/null; then
  sed -i.bak "s|TOOLKIT_ROOT=.*|TOOLKIT_ROOT=$DIR|" "$DIR/.env" && rm -f "$DIR/.env.bak"
  echo "    updated TOOLKIT_ROOT in .env"
else
  echo "TOOLKIT_ROOT=$DIR" >> "$DIR/.env"
  echo "    wrote TOOLKIT_ROOT to .env"
fi

# 4. Prompt for investigations folder
echo ""
echo "  The investigations folder is a central workspace for ticket investigation files"
echo "  (notes, queries, dev notes, error logs). It lives outside any project repo so"
echo "  cross-repo tickets share one place and it is never accidentally committed."
echo ""
read -rp "  Where should the investigations folder live? [~/workspace/ambs-investigations]: " INV_ROOT
INV_ROOT="${INV_ROOT:-~/workspace/ambs-investigations}"
INV_ROOT="${INV_ROOT/#\~/$HOME}"

if [ -d "$INV_ROOT" ]; then
  echo "    $INV_ROOT already exists, skipping creation"
else
  mkdir -p "$INV_ROOT"
  echo "    created $INV_ROOT"
fi

if grep -q "^INVESTIGATIONS_ROOT=" "$DIR/.env" 2>/dev/null; then
  sed -i.bak "s|INVESTIGATIONS_ROOT=.*|INVESTIGATIONS_ROOT=$INV_ROOT|" "$DIR/.env" && rm -f "$DIR/.env.bak"
  echo "    updated INVESTIGATIONS_ROOT in .env"
else
  echo "INVESTIGATIONS_ROOT=$INV_ROOT" >> "$DIR/.env"
  echo "    wrote INVESTIGATIONS_ROOT to .env"
fi

# 5. Configure Copilot permissions for investigations folder
echo "==> Configuring Copilot permissions for investigations folder..."
node "$DIR/scripts/setup-permissions.js" "$INV_ROOT"

echo ""
echo ""
echo "Done. Next steps:"
echo "  1. Open ambs-toolkit/.env and fill in your credentials:"
echo "     JIRA_USER_EMAIL -> your.email@ascendlearning.com"
echo "     JIRA_API_TOKEN  -> Jira > Profile > Security > API Token"
echo "     GITLAB_TOKEN    -> GitLab > User > Preferences > Access Tokens"
echo "  2. Open GitHub Copilot — skills are ready to use"
