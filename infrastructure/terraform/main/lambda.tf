resource "aws_iam_policy" "dynamodb_default" {
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:BatchWriteItem",
                "dynamodb:GetItem",
                "dynamodb:Query",
                "dynamodb:GetRecords",
                "dynamodb:GetShardIterator",
                "dynamodb:DescribeStream",
                "dynamodb:ListShards",
                "dynamodb:ListStreams"
            ],
            "Resource": [
                "${aws_dynamodb_table.credentials.arn}",
                "${aws_dynamodb_table.server_events.arn}",
                "${aws_dynamodb_table.server_events.arn}/stream/*",
                "${aws_dynamodb_table.server_events_by_key.arn}",
                "${aws_dynamodb_table.server_events_by_key_value.arn}",
                "${aws_dynamodb_table.server_events_by_value.arn}",
                "${aws_dynamodb_table.servers.arn}",
                "${aws_dynamodb_table.users.arn}",
                "${aws_dynamodb_table.webapp_api_keys.arn}"
            ]
        }
    ]
}
EOF
}

data "aws_iam_policy" "AWSLambdaBasicExecutionRole" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}


resource "aws_lambda_function" "rest_api_default" {
  function_name = "rest_api_default"

  s3_bucket = aws_s3_bucket.rest_api_lambdas.bucket
  s3_key    = "default/${var.deployment_number}/rest_api_default.zip"

  handler = "index.handler"
  runtime = "nodejs14.x"

  role = aws_iam_role.lambda_rest_api_default.arn
}

resource "aws_iam_role" "lambda_rest_api_default" {
  name = "lambda_rest_api_default"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

}

resource "aws_iam_role_policy_attachment" "AWSLambdaBasicExecutionRole_to_lambda_rest_api_default" {
  policy_arn = data.aws_iam_policy.AWSLambdaBasicExecutionRole.arn
  role = aws_iam_role.lambda_rest_api_default.name
}

resource "aws_lambda_permission" "rest_api_default" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rest_api_default.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.default.execution_arn}/*/*"
}



resource "aws_iam_role_policy_attachment" "dynamodb_default_to_lambda_rest_api_default" {
  policy_arn = aws_iam_policy.dynamodb_default.arn
  role = aws_iam_role.lambda_rest_api_default.name
}



resource "aws_lambda_function" "dynamodb_workers_json_breakdown" {
  function_name = "dynamodb_workers_json_breakdown"

  s3_bucket = aws_s3_bucket.dynamodb_workers_lambdas.bucket
  s3_key    = "json_breakdown/${var.deployment_number}/dynamodb_workers_json_breakdown.zip"

  handler = "index.handler"
  runtime = "nodejs14.x"

  role = aws_iam_role.lambda_dynamodb_workers_json_breakdown.arn
}

resource "aws_iam_role" "lambda_dynamodb_workers_json_breakdown" {
  name = "lambda_dynamodb_workers_json_breakdown"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

}

resource "aws_iam_role_policy_attachment" "AWSLambdaBasicExecutionRole_to_lambda_dynamodb_workers_json_breakdown" {
  policy_arn = data.aws_iam_policy.AWSLambdaBasicExecutionRole.arn
  role = aws_iam_role.lambda_dynamodb_workers_json_breakdown.name
}

resource "aws_iam_role_policy_attachment" "dynamodb_default_to_lambda_dynamodb_workers_json_breakdown" {
  policy_arn = aws_iam_policy.dynamodb_default.arn
  role = aws_iam_role.lambda_dynamodb_workers_json_breakdown.name
}

resource "aws_lambda_event_source_mapping" "lambda_dynamodb_workers_json_breakdown" {
  event_source_arn  = aws_dynamodb_table.server_events.stream_arn
  function_name     = aws_lambda_function.dynamodb_workers_json_breakdown.arn
  starting_position = "LATEST"
  depends_on = [aws_iam_policy.dynamodb_default]
}
