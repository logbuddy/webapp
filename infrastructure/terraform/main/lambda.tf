resource "aws_lambda_function" "rest_api_default" {
  function_name = "RestApiDefault"

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

data "aws_iam_policy" "AWSLambdaBasicExecutionRole" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "AWSLambdaBasicExecutionRole_to_lambda_rest_api_default" {
  policy_arn = data.aws_iam_policy.AWSLambdaBasicExecutionRole.arn
  role = aws_iam_role.lambda_rest_api_default.name
}


data "aws_iam_policy" "AmazonDynamoDBFullAccess" {
  arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_iam_role_policy_attachment" "AmazonDynamoDBFullAccess_to_lambda_rest_api_default" {
  policy_arn = data.aws_iam_policy.AmazonDynamoDBFullAccess.arn
  role = aws_iam_role.lambda_rest_api_default.name
}


resource "aws_lambda_permission" "rest_api_default" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rest_api_default.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.default.execution_arn}/*/*"
}
