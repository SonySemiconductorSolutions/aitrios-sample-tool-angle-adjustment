# ----------------------------------- Terraform Config ---------------------------------------------

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# ------------------------------------- Resources --------------------------------------------------

resource "aws_s3_bucket" "admin_s3_bucket" {
  bucket = "${var.admin_app_name}"
  tags = {
    app = "${var.app_name}"
  }
}

resource "aws_s3_object" "admin_s3_bucket_object" {
  bucket        = aws_s3_bucket.admin_s3_bucket.id
  key           = "index.html"
  source        = "index.html" # Local path to the dummy index.html
  content_type  = "text/html"
}

resource "aws_s3_bucket" "contractor_s3_bucket" {
  bucket = "${var.contractor_app_name}"
  tags = {
    app = "${var.app_name}"
  }
}

resource "aws_s3_object" "contractor_s3_bucket_object" {
  bucket        = aws_s3_bucket.contractor_s3_bucket.id
  key           = "index.html"
  source        = "index.html" # Local path to the dummy index.html
  content_type  = "text/html"
}

resource "aws_cloudfront_distribution" "admin_cloudfront" {
  comment = "Admin App Cloudfront"
  default_root_object = "index.html"
  enabled             = true
  is_ipv6_enabled     = true
  wait_for_deployment = true

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    target_origin_id       = aws_s3_bucket.admin_s3_bucket.bucket
    viewer_protocol_policy = "redirect-to-https"
  }

  origin {
    domain_name              = aws_s3_bucket.admin_s3_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.admin_cloudfront_oac.id
    origin_id                = aws_s3_bucket.admin_s3_bucket.bucket
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }

  tags = {
    app = "${var.app_name}"
  }
}

resource "aws_cloudfront_origin_access_control" "admin_cloudfront_oac" {
  name                              = "oac-admin-s3-cloudfront-${var.app_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_iam_policy_document" "cloudfront_oac_access" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject"
    ]

    resources = ["${aws_s3_bucket.admin_s3_bucket.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.admin_cloudfront.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "admin_s3_policy" {
  bucket = aws_s3_bucket.admin_s3_bucket.id
  policy = data.aws_iam_policy_document.cloudfront_oac_access.json
}

resource "aws_cloudfront_distribution" "contractor_cloudfront" {
  comment = "Contractor App Cloudfront"
  default_root_object = "index.html"
  enabled             = true
  is_ipv6_enabled     = true
  wait_for_deployment = true

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    target_origin_id       = aws_s3_bucket.contractor_s3_bucket.bucket
    viewer_protocol_policy = "redirect-to-https"
  }

  origin {
    domain_name              = aws_s3_bucket.contractor_s3_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.contractor_cloudfront_oac.id
    origin_id                = aws_s3_bucket.contractor_s3_bucket.bucket
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }  

  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = "sni-only"
  }

  tags = {
    app = "${var.app_name}"
  }
}

resource "aws_cloudfront_origin_access_control" "contractor_cloudfront_oac" {
  name                              = "oac-contractor-s3-cloudfront-${var.app_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_iam_policy_document" "contractor_cloudfront_oac_access" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject"
    ]

    resources = ["${aws_s3_bucket.contractor_s3_bucket.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.contractor_cloudfront.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "contractor_s3_policy" {
  bucket = aws_s3_bucket.contractor_s3_bucket.id
  policy = data.aws_iam_policy_document.contractor_cloudfront_oac_access.json
}

resource "aws_lightsail_database" "postgresql_db" {
  relational_database_name  = "lsdb${var.app_name}"
  blueprint_id              = "postgres_13"
  bundle_id                 = "micro_2_0"
  master_database_name      = "aatdb"
  master_username           = "postgresadmin"
  master_password           = "${var.db_password}"

  tags = {
    app = "${var.app_name}"
  }
}

resource "aws_lightsail_container_service" "backend_container" {
  name        = "${var.backend_name}"
  power       = "micro"
  scale       = 1
  is_disabled = false

  tags = {
    app = "${var.app_name}"
  }
}
