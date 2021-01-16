#!/usr/bin/env bash

root=$(pwd)

# Symlink git hooks
cd './scripts/hooks' || exit

for filename in ./*; do
	filename=$(basename ${filename})
	# file should be a relative path to target path
	ln -sf "../../scripts/hooks/${filename}" "$root/.git/hooks/${filename%.*}"
	# allow the file to be executed
	chmod +x "$root/.git/hooks/${filename%.*}"
	echo "Symlinked ${filename%.*} git hook."
done

cd ${root} || exit

npm install
