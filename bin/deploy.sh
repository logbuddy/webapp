#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

DEPLOYMENT_NUMBER="$(date -u +%FT%TZ)"
STAGE="preprod"
AWS_ACCOUNT_ID="619527075300"

[ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"
[ -x /opt/homebrew/bin/brew ] && [ -s "$(/opt/homebrew/bin/brew --prefix)/opt/nvm/nvm.sh" ] && source "$(/opt/homebrew/bin/brew --prefix)/opt/nvm/nvm.sh"

echo "$DEPLOYMENT_NUMBER" > "$DIR/../deployment_number"

pushd "$DIR/../backend/rest-api/default" || exit
  rm -rf build
  nvm install
  nvm use
  npm i --no-save
  npm run build
  cp -a node_modules build/
  pushd build || exit
    zip -r rest_api_default.zip ./
    source "$DIR/../../infrastructure-bootstrap/bin/assume-role.sh" "$AWS_ACCOUNT_ID"
    aws s3 cp ./rest_api_default.zip "s3://herodot-infra-webapp-$STAGE-rest-api-lambdas/default/$DEPLOYMENT_NUMBER/rest_api_default.zip"
    source "$DIR/../../infrastructure-bootstrap/bin/unassume-role.sh"
  popd || exit
popd || exit

pushd "$DIR/../backend/dynamodb-workers/json-breakdown" || exit
  rm -rf build
  nvm install
  nvm use
  npm i --no-save
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
  terraform-0.15.0 workspace select "$STAGE"
  terraform-0.15.0 apply -var deployment_number="$DEPLOYMENT_NUMBER"
popd || exit

pushd "$DIR/../frontend" || exit
  rm -rf build
  nvm install
  nvm use
  npm i --no-save
  npm run build
  source "$DIR/../../infrastructure-bootstrap/bin/assume-role.sh" "$AWS_ACCOUNT_ID"
  aws s3 cp --recursive --acl public-read build/ "s3://herodot-infra-webapp-$STAGE-frontend/"
  source "$DIR/../../infrastructure-bootstrap/bin/unassume-role.sh"
popd || exit
