resource "aws_s3_bucket" "frontend" {
  bucket = "herodot-infra-webapp-${lookup(var.workspace_to_stage, terraform.workspace)}-frontend"
  force_destroy = "false"
  website {
    index_document = "index.html"
    error_document = "error.html"
  }
  acl = "public-read"
}