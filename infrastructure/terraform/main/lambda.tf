resource "aws_lambda_function" "rest_api_default" {
  function_name = "RestApiDefault"

  # The bucket name as created earlier with "aws s3api create-bucket"
  s3_bucket = aws_s3_bucket.rest_api_lambdas.bucket
  s3_key    = "v1.0.1/rest_api_default.zip"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
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

resource "aws_lambda_permission" "rest_api_default" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rest_api_default.function_name
  principal     = "apigateway.amazonaws.com"

  # The "/*/*" portion grants access from any method on any resource
  # within the API Gateway REST API.
  source_arn = "${aws_apigatewayv2_api.default.execution_arn}/*/*"
}
