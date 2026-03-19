# Herd PHP tools
php() { /c/Users/Lukas/.config/herd/bin/php85/php.exe "$@"; }
composer() { php /c/Users/Lukas/.config/herd/bin/composer.phar "$@"; }
NODE_DIR="/c/Users/Lukas/.config/herd/bin/nvm/v25.2.0"
node() { "$NODE_DIR/node.exe" "$@"; }
npm() { "$NODE_DIR/node.exe" "$NODE_DIR/node_modules/npm/bin/npm-cli.js" "$@"; }
npx() { "$NODE_DIR/node.exe" "$NODE_DIR/node_modules/npm/bin/npx-cli.js" "$@"; }
export -f php composer node npm npx