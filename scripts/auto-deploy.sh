#!/bin/bash

cd "$(dirname "$BASH_SOURCE")"

declare -r PRIVATE_KEY_FILE_NAME='github_deploy_key'

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# Decrypt the file containing the private key

openssl aes-256-cbc \
    -K  $encrypted_XXXXXXXXXXXX_key \
    -iv $encrypted_XXXXXXXXXXXX_iv \
    -in "${PRIVATE_KEY_FILE_NAME}.enc" \
    -out ~/.ssh/$PRIVATE_KEY_FILE_NAME -d

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# Enable SSH authentication

chmod 600 ~/.ssh/$PRIVATE_KEY_FILE_NAME
echo "Host github.com" >> ~/.ssh/config
echo "  IdentityFile ~/.ssh/$PRIVATE_KEY_FILE_NAME" >> ~/.ssh/config

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

cd ..

$(npm bin)/update-branch --commands "npm run build" \
                         --commit-message "Hey GitHub, this content is for you! [skip ci]" \
                         --directory "out" \
                         --distribution-branch "gh-pages" \
                         --source-branch "master"
