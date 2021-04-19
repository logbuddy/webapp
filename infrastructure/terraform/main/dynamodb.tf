resource "aws_dynamodb_table" "credentials" {
  name           = "credentials"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "email"

  attribute {
    name = "email"
    type = "S"
  }
}

resource "aws_dynamodb_table" "server_events" {
  name           = "server_events"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "servers_id"
  range_key      = "sort_value"

  attribute {
    name = "servers_id"
    type = "S"
  }

  attribute {
    name = "sort_value"
    type = "S"
  }

  stream_enabled = true
  stream_view_type = "NEW_IMAGE"
}

resource "aws_dynamodb_table" "server_events_by_key" {
  name           = "server_events_by_key"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "servers_id_key"
  range_key      = "sort_value"

  attribute {
    name = "servers_id_key"
    type = "S"
  }

  attribute {
    name = "sort_value"
    type = "S"
  }
}

resource "aws_dynamodb_table" "server_events_by_value" {
  name           = "server_events_by_value"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "servers_id_value"
  range_key      = "sort_value"

  attribute {
    name = "servers_id_value"
    type = "S"
  }

  attribute {
    name = "sort_value"
    type = "S"
  }
}

resource "aws_dynamodb_table" "server_events_by_key_value" {
  name           = "server_events_by_key_value"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "servers_id_key_value"
  range_key      = "sort_value"

  attribute {
    name = "servers_id_key_value"
    type = "S"
  }

  attribute {
    name = "sort_value"
    type = "S"
  }
}

resource "aws_dynamodb_table" "servers" {
  name           = "servers"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "users_id"
  range_key      = "id"

  attribute {
    name = "users_id"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "users" {
  name           = "users"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "webapp_api_keys" {
  name           = "webapp_api_keys"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }
}
