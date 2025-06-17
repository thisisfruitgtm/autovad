#!/bin/bash

echo "🔧 Configurare Watchman și limite de fișiere pentru macOS (React Native / Expo)..."

# 1. Instalează Homebrew dacă nu e deja instalat
if ! command -v brew &> /dev/null; then
    echo "💻 Homebrew nu e instalat. Îl instalăm..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# 2. Instalează Watchman
echo "📦 Instalăm Watchman..."
brew install watchman

# 3. Setări pentru limitele de fișiere
echo "⚙️ Actualizăm limitele de fișiere (max open files)..."

# Adaugă în /etc/sysctl.conf
SYSCTL_CONF="/etc/sysctl.conf"
if [ ! -f "$SYSCTL_CONF" ]; then
    sudo touch $SYSCTL_CONF
fi

sudo bash -c "cat >> $SYSCTL_CONF" <<EOL

# Configurații pentru Metro bundler
kern.maxfiles=10485760
kern.maxfilesperproc=1048576
EOL

# Aplică imediat (parțial)
sudo sysctl -w kern.maxfiles=10485760
sudo sysctl -w kern.maxfilesperproc=1048576

# 4. Setare ulimit în shell (zsh sau bash)
SHELL_PROFILE="$HOME/.zshrc"
if [ -f "$HOME/.bash_profile" ]; then
    SHELL_PROFILE="$HOME/.bash_profile"
fi

echo "ulimit -n 1048576" >> "$SHELL_PROFILE"

echo "✅ Gata! Te rugăm să repornești sistemul pentru a aplica complet limitele."
echo "💡 După restart, rulează proiectul cu: npm run dev"
