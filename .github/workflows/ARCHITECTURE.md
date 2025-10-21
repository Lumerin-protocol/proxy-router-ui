# Marketplace Deployment Architecture

## Overview

This document describes the architecture for deploying the marketplace UI using GitHub Actions with zero-transcription deployment configuration.

## Design Principles

1. **Zero Transcription Errors**: AWS resource identifiers are never manually copied to GitHub
2. **Single Source of Truth**: Terraform manages all AWS resources and configuration
3. **Least Privilege**: IAM roles have minimal permissions needed
4. **Shared Infrastructure**: One IAM role for all futures services
5. **Secure Authentication**: OIDC for temporary credentials (no static keys)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         TERRAFORM                               │
│                                                                 │
│  Creates & Configures:                                          │
│  • IAM Role (github-actions-futures-{env})                      │
│  • S3 Bucket (s3marketplace.{env}.lumerin.io)                   │
│  • CloudFront Distribution                                      │
│  • AWS Secrets Manager                                          │
│    └─ Stores deployment config automatically                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ terraform apply
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS SECRETS MANAGER                          │
│                                                                 │
│  Secret: futures-marketplace-secrets-{env}                      │
│  {                                                              │
│    "deployment": {                                              │
│      "s3_bucket": "s3marketplace.dev.lumerin.io",              │
│      "cloudfront_distribution_id": "E1ABC...",                  │
│      "marketplace_url": "https://marketplace.dev.lumerin.io",   │
│      "aws_region": "us-east-1",                                 │
│      "environment": "dev"                                       │
│    },                                                           │
│    "telegram_bot_token": "...",                                 │
│    "ethereum_rpc_url": "..."                                    │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ read (during deployment)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GITHUB ACTIONS                             │
│                                                                 │
│  1. Authenticate with AWS (OIDC)                                │
│     └─ Uses: AWS_ROLE_ARN_FUTURES_{ENV}                         │
│        (only manual config needed!)                             │
│                                                                 │
│  2. Read Secrets Manager                                        │
│     └─ Gets: S3, CloudFront, URL, Region                        │
│        (zero manual transcription!)                             │
│                                                                 │
│  3. Build React App                                             │
│     └─ yarn build                                               │
│                                                                 │
│  4. Deploy to S3                                                │
│     └─ aws s3 sync build/ s3://{bucket}/                        │
│                                                                 │
│  5. Invalidate CloudFront                                       │
│     └─ aws cloudfront create-invalidation                       │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Terraform Infrastructure

**File:** `proxy-ui-foundation/.terragrunt/`

**Resources Created:**
- **IAM OIDC Provider** (`09_github_actions_iam.tf`)
  - Allows GitHub Actions to authenticate
  - Trust policy for both repos:
    - `Lumerin-protocol/proxy-smart-contracts`
    - `Lumerin-protocol/proxy-router-ui`

- **IAM Role** (`github-actions-futures-{env}`)
  - Shared across all futures services
  - Permissions:
    - Secrets Manager read
    - S3 sync (marketplace)
    - CloudFront invalidation (marketplace)
    - ECS update (notifications)
    - Lambda update (margin-call)

- **S3 Bucket** (`04_market_s3_static.tf`)
  - Versioning enabled
  - CloudFront access only
  - Bucket: `s3marketplace.{env}.lumerin.io`

- **CloudFront Distribution** (`04_market_cloudfront.tf`)
  - HTTPS enabled
  - WAF protection
  - Origin: S3 bucket

- **Secrets Manager** (`01_secrets_manager.tf`)
  - Auto-populated with deployment config
  - Read by GitHub Actions
  - Updated on every `terraform apply`

### 2. GitHub Actions Workflow

**File:** `proxy-router-ui/.github/workflows/deploy-marketplace.yml`

**Jobs:**
1. **generate-tag**: Create version tag (v2.0.x-{env})
2. **create-release**: Create GitHub Release
3. **build**: Build React app
   - Authenticates with AWS (OIDC)
   - Reads deployment config from Secrets Manager
   - Builds static files
4. **deploy**: Deploy to AWS
   - Upload to S3
   - Invalidate CloudFront
5. **verify**: Health check
6. **summary**: Deployment summary

### 3. GitHub Secrets Configuration

**Required (Manual):**
- `AWS_ROLE_ARN_FUTURES_DEV`
- `AWS_ROLE_ARN_FUTURES_STG`
- `AWS_ROLE_ARN_FUTURES_LMN`
- `REACT_APP_*` environment variables

**Auto-Retrieved from AWS:**
- S3 bucket name
- CloudFront distribution ID
- Marketplace URL
- AWS region

## Security Model

### Authentication Flow

```
1. GitHub Actions initiates workflow
   ↓
2. Request temporary credentials from AWS STS
   • Provide: GitHub repo, branch, commit SHA
   • Verify: OIDC token signature
   ↓
3. AWS validates trust policy
   • Check: Repository matches allowed list
   • Check: Branch matches allowed patterns
   ↓
4. AWS issues temporary credentials (1 hour)
   • No static credentials stored
   • Automatically expires
   ↓
5. GitHub Actions uses credentials
   • Read Secrets Manager
   • Deploy to S3
   • Invalidate CloudFront
```

### IAM Role Trust Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::{account}:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": [
          "repo:Lumerin-protocol/proxy-smart-contracts:ref:refs/heads/{branch}",
          "repo:Lumerin-protocol/proxy-router-ui:ref:refs/heads/{branch}"
        ]
      }
    }
  }]
}
```

### Permissions Model

**Least Privilege Approach:**
- Each service has its own policy
- Policies are scoped to specific resources
- No wildcard permissions
- Cross-account access prevented

## Benefits

### 1. Zero Transcription Errors
- AWS resource IDs never manually copied
- Terraform → Secrets Manager → GitHub Actions
- Reduces deployment failures

### 2. Infrastructure as Code
- All configuration in version control
- Reproducible across environments
- Easy to review and audit

### 3. Secure by Default
- No static AWS credentials
- Temporary credentials only
- Automatic expiration

### 4. Simplified Management
- One IAM role for all services
- Shared trust policy
- Consolidated permissions

### 5. Environment Isolation
- Separate secrets per environment
- Branch-based deployment (dev/stg/main)
- No cross-environment access

## Workflow Variables

### Environment Mapping

| GitHub Branch | Environment | Secret Name | S3 Bucket |
|--------------|-------------|-------------|-----------|
| `dev` | DEV | `futures-marketplace-secrets-dev` | `s3marketplace.dev.lumerin.io` |
| `stg` | STG | `futures-marketplace-secrets-stg` | `s3marketplace.stg.lumerin.io` |
| `main` | LMN/PROD | `futures-marketplace-secrets-lmn` | `s3marketplace.lumerin.io` |
| `cicd/*` | DEV | `futures-marketplace-secrets-dev` | `s3marketplace.dev.lumerin.io` |

### Branch Filters (Auto-Generated)

Defined in `00_variables_local.tf`:

```hcl
github_branch_filter = var.account_lifecycle == "dev" ? [
  "ref:refs/heads/dev",
  "ref:refs/heads/cicd/*"
] : (
  var.account_lifecycle == "stg" ? ["ref:refs/heads/test"] : ["ref:refs/heads/main"]
)
```

## Monitoring & Debugging

### View Deployment Logs
- GitHub Actions: https://github.com/Lumerin-protocol/proxy-router-ui/actions

### Check AWS Resources
```bash
# Get deployment config
aws secretsmanager get-secret-value \
  --secret-id futures-marketplace-secrets-dev \
  --query SecretString --output text | jq '.deployment'

# Check S3 sync
aws s3 ls s3://s3marketplace.dev.lumerin.io/

# Check CloudFront
aws cloudfront get-distribution --id E1ABC...
```

### Troubleshoot OIDC
```bash
# List OIDC providers
aws iam list-open-id-connect-providers

# Check role trust policy
aws iam get-role --role-name github-actions-futures-dev
```

## Maintenance

### Adding New Environment Variables
1. Update Terraform: Add to `01_secrets_manager.tf`
2. Apply Terraform: `terragrunt apply`
3. Update workflow: Read new value in `deploy-marketplace.yml`

### Updating IAM Permissions
1. Update Terraform: Modify policy in `09_github_actions_iam.tf`
2. Apply Terraform: `terragrunt apply`
3. Test deployment: Push to test branch

### Rotating Credentials
- OIDC tokens: Auto-rotated by GitHub (1 hour expiry)
- AWS credentials: No static credentials to rotate!
- GitHub Secrets: Update manually if needed

## Future Enhancements

Potential improvements:
- [ ] Cache npm/yarn dependencies in GitHub Actions
- [ ] Add deployment approval for production
- [ ] Implement blue/green deployments
- [ ] Add performance budgets in CI
- [ ] Implement automated rollback on errors

