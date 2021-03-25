data "aws_route53_zone" "root" {
  name = lookup(var.workspace_to_root_domain, terraform.workspace)
}

resource "aws_route53_record" "root_cloudfront_alias" {
  name = ""
  type = "A"
  zone_id = data.aws_route53_zone.root.id
  alias {
    evaluate_target_health = false
    name = aws_cloudfront_distribution.frontend.domain_name
    zone_id = aws_cloudfront_distribution.frontend.hosted_zone_id
  }
}
