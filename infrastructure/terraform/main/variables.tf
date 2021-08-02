variable "deployment_number" {
  type = string
}

variable "workspace_to_stage" {
  type = map(string)
  default = {
    default = "prod"
    preprod = "preprod"
  }
}

variable "workspace_to_infra_webapp_aws_account_id" {
  type = map(string)
  default = {
    default = "230024871185"
    preprod = "619527075300"
  }
}

variable "workspace_to_root_domain" {
  type = map(string)
  default = {
    default = "app.logbuddy.io"
    preprod = "preprod.app.logbuddy.io"
  }
}

variable "workspace_to_dynamodb_read_capacity" {
  type = map(number)
  default = {
    default = 1
    preprod = 1
  }
}

variable "workspace_to_dynamodb_write_capacity" {
  type = map(number)
  default = {
    default = 1
    preprod = 1
  }
}

variable "workspace_to_apigateway_throttling_burst_limit" {
  type = map(number)
  default = {
    default = 1
    preprod = 1
  }
}

variable "workspace_to_apigateway_throttling_rate_limit" {
  type = map(number)
  default = {
    default = 1
    preprod = 1
  }
}

