#!/usr/bin/env bash

if [ ! -s "$HOME/.nvm/nvm.sh" ]
then
  if [ ! -x /opt/homebrew/bin/brew ] || [ ! -s "$(/opt/homebrew/bin/brew --prefix)/opt/nvm/nvm.sh" ]
  then
    echo "This script requires a working NVM installation."
    exit 1
  fi
fi

if [ ! -x "$(which terraform-1.1.9)" ]
then
    echo "This script requires an installation of Terraform 1.1.9 available as terraform-1.1.9 on the path."
    exit 1
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

DEPLOYMENT_NUMBER="$(date -u +%FT%TZ)"
STAGE="$1"
TFWORKSPACE="$2"
AWS_ACCOUNT_ID="$3"

[ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"
[ -x /opt/homebrew/bin/brew ] && [ -s "$(/opt/homebrew/bin/brew --prefix)/opt/nvm/nvm.sh" ] && source "$(/opt/homebrew/bin/brew --prefix)/opt/nvm/nvm.sh"

echo "$DEPLOYMENT_NUMBER" > "$DIR/../deployment_number.$STAGE"

pushd "$DIR/../backend/rest-apis/default" || exit
  rm -rf build
  rm -rf node_modules
  nvm install
  nvm use
  npm i --target_arch=x64 --target_platform=linux --target_libc=glibc --no-save
  npm run build
  cp -a node_modules build/
  pushd build || exit
    zip -r rest_apis_default.zip ./
    source "$DIR/../../infrastructure-bootstrap/bin/assume-role.sh" "$AWS_ACCOUNT_ID"
    aws s3 cp ./rest_apis_default.zip "s3://herodot-infra-webapp-$STAGE-rest-apis-lambdas/default/$DEPLOYMENT_NUMBER/rest_apis_default.zip"
    source "$DIR/../../infrastructure-bootstrap/bin/unassume-role.sh"
  popd || exit
popd || exit

pushd "$DIR/../backend/dynamodb-workers/json-breakdown" || exit
  rm -rf build
  rm -rf node_modules
  nvm install
  nvm use
  npm i --target_arch=x64 --target_platform=linux --target_libc=glibc --no-save
  npm run build
  cp -a node_modules build/
  pushd build || exit
    zip -r dynamodb_workers_json_breakdown.zip ./
    source "$DIR/../../infrastructure-bootstrap/bin/assume-role.sh" "$AWS_ACCOUNT_ID"
    aws s3 cp ./dynamodb_workers_json_breakdown.zip "s3://herodot-infra-webapp-$STAGE-dynamodb-workers-lambdas/json_breakdown/$DEPLOYMENT_NUMBER/dynamodb_workers_json_breakdown.zip"
    source "$DIR/../../infrastructure-bootstrap/bin/unassume-role.sh"
  popd || exit
popd || exit

pushd "$DIR/../infrastructure/terraform/main" || exit
  terraform-1.1.9 workspace select "$TFWORKSPACE"
  terraform-1.1.9 apply -var deployment_number="$DEPLOYMENT_NUMBER"
popd || exit

pushd "$DIR/../frontend" || exit
  rm -rf build
  rm -rf node_modules
  nvm install
  nvm use
  npm i --no-save
  npm run build
  source "$DIR/../../infrastructure-bootstrap/bin/assume-role.sh" "$AWS_ACCOUNT_ID"
  aws s3 cp --recursive --acl public-read build/ "s3://herodot-infra-webapp-$STAGE-frontend/"
  source "$DIR/../../infrastructure-bootstrap/bin/unassume-role.sh"
popd || exit
