#!/bin/sh

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep ".tsx?$")

if [[ "$STAGED_FILES" = "" ]]; then
  exit 0
fi

PASS=true
root=$(pwd)

echo "\Linting Typecript:\n"

for FILE in $STAGED_FILES; do
  node "$root/node_modules/.bin/eslint" "$root/$FILE" --fix

  if [[ "$?" == 0 ]]; then
    echo "\t\033[32mESLint Passed: $FILE\033[0m"
    # ensure fixed files are included in the commit
    git add "$root/$FILE"
  else
    echo "\t\033[41mESLint Failed: $FILE\033[0m"
    PASS=false
  fi
done

echo "\nTypecript linting completed!\n"

if ! $PASS; then
  echo "\033[41mCOMMIT FAILED:\033[0m Your commit contains files that should pass ESLint but do not. Please fix the ESLint errors and try again.\n"
  exit 1
else
  echo "\033[42mCOMMIT SUCCEEDED\033[0m\n"
fi

exit $?
