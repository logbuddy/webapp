provider "aws" {
  assume_role {
    role_arn = "arn:aws:iam::${lookup(var.workspace_to_infra_webapp_aws_account_id, terraform.workspace)}:role/AccountManager"
  }
  region = "us-west-1"
}

provider "aws" {
  alias = "us_east_1"
  assume_role {
    role_arn = "arn:aws:iam::${lookup(var.workspace_to_infra_webapp_aws_account_id, terraform.workspace)}:role/AccountManager"
  }
  region = "us-west-1"
}
