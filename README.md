# webapp

## How to create a new stage

The following assumes we want to create a new webapp stage "preprod".

It is further assumed that all groundwork regarding a dedicated herodot-infra-webapp-preprod AWS account has already been done in repo "infrastructure-bootstrap".

In order to avoid a hen-and-egg problem with Route53, we first need to create the new zone "preprod.app.logbuddy.io" in webapp Terraform subproject "bootstrap" (using workspace "preprod"), then we can extend the Terraform setup of project "company" to add the NS records for this new subdomain to the "logbuddy.io" zone (using workspace "default"), and only THEN we can deploy the actual preprod infrastructure using the webapp Terraform subproject "main" (again, using workspace "preprod").
