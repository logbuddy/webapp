update-frontend:
	pushd frontend && npm run build && source ../../infrastructure-bootstrap/bin/assume-role.sh 230024871185 && aws s3 cp --recursive --acl public-read build/ s3://herodot-infra-webapp-prod-frontend/ && source ../../infrastructure-bootstrap/bin/unassume-role.sh && popd
