resource "aws_apigatewayv2_api" "default" {
  name = "default-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "default_api" {
  api_id = aws_apigatewayv2_api.default.id
  name   = "api"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "xkcd" {
  api_id           = aws_apigatewayv2_api.default.id
  integration_type = "HTTP_PROXY"

  integration_method = "ANY"
  integration_uri    = "https://xkcd.com/info.0.json"
}

resource "aws_apigatewayv2_route" "example" {
  api_id    = aws_apigatewayv2_api.default
  route_key = "GET /{proxy+}"

  target = "integrations/${aws_apigatewayv2_integration.xkcd.id}"
}
