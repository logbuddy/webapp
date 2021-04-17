#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

DEPLOYMENT_NUMBER="$(date -u --iso-8601=seconds)"
STAGE="preprod"

source "$DIR/../../infrastructure-bootstrap/bin/assume-role.sh" 619527075300

[ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"

pushd "$DIR/../backend/rest-api/default"
  rm -rf build
  nvm use
  npm run build
  cp -a node_modules build/
  pushd build
    zip -r rest_api_default.zip ./
    aws s3 cp ./rest_api_default.zip "s3://herodot-infra-webapp-$STAGE-rest-api-lambdas/default/$DEPLOYMENT_NUMBER/rest_api_default.zip"
  popd
popd

pushd "$DIR/../infrastructure/terraform/main"
  terraform-0.15.0 workspace select "$STAGE"
  terraform-0.15.0 apply -var deployment_number="$DEPLOYMENT_NUMBER"
popd

pushd "$DIR/../frontend"
  rm -rf build
  nvm use
  npm run build
  aws s3 cp --recursive --acl public-read build/ "s3://herodot-infra-webapp-$STAGE-frontend/"
popd
