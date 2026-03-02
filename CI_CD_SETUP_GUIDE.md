# 🚀 CI/CD Setup Guide - GitHub Actions

## 📋 Tổng Quan

3 workflows đã được tạo:

| Workflow | Trigger | Mục đích |
|----------|---------|---------|
| `deploy-backend.yml` | Push to main (backend changes) | Deploy SAM backend tự động |
| `deploy-frontend.yml` | Push to main (frontend changes) | Deploy frontend to GitHub Pages |
| `ci-build-test.yml` | Pull requests, feature branches | Build & test validation |

---

## ⚙️ Setup GitHub Secrets

### 1. Mở Repository trên GitHub
```
https://github.com/kokororay/OrchaWeb
```

### 2. Vào Settings → Secrets and variables → Actions

Click **"New repository secret"** cho mỗi secret sau:

---

### 🔐 AWS Backend Secrets

| Secret Name | Giá trị | Cần thiết cho |
|------------|---------|--------------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID | Backend deploy |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | Backend deploy |
| `ADMIN_EMAIL` | admin@orcha.com | Backend parameter |
| `CLOUDINARY_URL` | cloudinary://key:secret@cloud | Backend parameter |
| `COGNITO_USER_POOL_ID` | ap-southeast-1_xxx | Backend parameter |
| `COGNITO_USER_POOL_ARN` | arn:aws:cognito... | Backend parameter |

**Cách lấy AWS credentials:**
```bash
# 1. Tạo IAM user mới cho CI/CD
# AWS Console → IAM → Users → Add User
# Username: github-actions-deploy
# Access type: Programmatic access

# 2. Attach policies:
# - AWSCloudFormationFullAccess
# - AWSLambda_FullAccess
# - IAMFullAccess
# - AmazonAPIGatewayAdministrator
# - AmazonDynamoDBFullAccess
# - AmazonS3FullAccess

# 3. Copy Access Key ID và Secret Access Key
```

---

### 🌐 Frontend Secrets

| Secret Name | Giá trị | Ví dụ |
|------------|---------|-------|
| `VITE_API_BASE_URL` | Backend API Gateway URL | https://xxx.execute-api.ap-southeast-1.amazonaws.com/prod |
| `COGNITO_CLIENT_ID` | Cognito App Client ID | 1a2b3c4d5e6f... |
| `COGNITO_DOMAIN` | Cognito Domain | orcha-auth.auth.ap-southeast-1... |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | orcha-cloud |
| `CLOUDINARY_UPLOAD_PRESET` | Upload Preset Name | orcha-products |
| `PAYOS_CLIENT_ID` | PayOS Client ID (optional) | xxx-yyy-zzz |
| `PAYOS_API_KEY` | PayOS API Key (optional) | ... |
| `PAYOS_CHECKSUM_KEY` | PayOS Checksum Key (optional) | ... |

---

## 🎯 Enable GitHub Pages

### 1. Repository Settings
```
Settings → Pages → Source
```

### 2. Chọn:
- **Source:** GitHub Actions
- **Branch:** Không cần chọn (workflow sẽ deploy)

### 3. Custom Domain (Optional)
Nếu có domain riêng:
- Điền domain vào "Custom domain"
- Add CNAME record ở DNS provider

---

## 🚀 Cách Sử Dụng

### Automatic Deploy

**Backend (tự động):**
```bash
# 1. Thay đổi code trong orcha-backend/
git add orcha-backend/
git commit -m "Update backend Lambda"
git push origin main

# 2. GitHub Actions tự động:
# ✓ Build SAM
# ✓ Deploy to AWS
# ✓ Configure CORS
# ⏱️ ~5-10 phút
```

**Frontend (tự động):**
```bash
# 1. Thay đổi code trong src/
git add src/
git commit -m "Update UI"
git push origin main

# 2. GitHub Actions tự động:
# ✓ Build với Vite
# ✓ Deploy to GitHub Pages
# ⏱️ ~2-3 phút
```

---

### Manual Deploy

**Trigger thủ công:**
1. Vào GitHub → Actions
2. Chọn workflow: "Deploy Backend to AWS" hoặc "Deploy Frontend"
3. Click **"Run workflow"** dropdown
4. Click **"Run workflow"** button

---

### CI Checks on PRs

**Tự động chạy khi tạo Pull Request:**
```bash
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "Add new feature"
git push origin feature/new-feature

# Tạo PR trên GitHub
# → CI workflow tự động chạy:
# ✓ Frontend TypeScript check
# ✓ Backend Go build
# ✓ Linter (nếu có)
```

---

## 📊 Monitoring Deployments

### Check Workflow Status

1. **GitHub Actions Tab**
   ```
   https://github.com/kokororay/OrchaWeb/actions
   ```

2. **View Logs**
   - Click vào workflow run
   - Expand steps để xem chi tiết
   - Download logs nếu cần debug

3. **Notifications**
   - GitHub sẽ email khi deploy fail
   - Có thể setup Slack/Discord webhooks

---

## 🔧 Troubleshooting

### Backend Deploy Failed

**Error:** `AWS credentials not configured`
```bash
# Fix: Kiểm tra secrets
# Verify AWS_ACCESS_KEY_ID và AWS_SECRET_ACCESS_KEY đã thêm
```

**Error:** `Stack already exists`
```bash
# Fix: Stack name conflict
# Edit deploy-backend.yml line 53:
--stack-name orcha-backend-v2
```

**Error:** `IAM permissions issue`
```bash
# Fix: Add missing IAM policies
# AWS Console → IAM → Users → github-actions-deploy
# Attach: CloudFormationFullAccess, LambdaFullAccess
```

---

### Frontend Deploy Failed

**Error:** `VITE_API_BASE_URL not set`
```bash
# Fix: Add secret to GitHub
# Settings → Secrets → New secret
# Name: VITE_API_BASE_URL
# Value: https://xxx.execute-api.ap-southeast-1.amazonaws.com/prod
```

**Error:** `Page build failed`
```bash
# Fix: Check GitHub Pages source
# Settings → Pages → Source: GitHub Actions
```

**Error:** `404 after deploy`
```bash
# Fix: Base URL for HashRouter
# vite.config.ts → base: '/OrchaWeb/'
```

---

## 🎨 Customize Workflows

### Deploy to Staging First

Edit `deploy-backend.yml`:

```yaml
jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      # ... deployment steps ...
      - name: Deploy to staging
        run: sam deploy --stack-name orcha-backend-staging

  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      # ... deployment steps ...
      - name: Deploy to production
        run: sam deploy --stack-name orcha-backend-prod
```

---

### Add Slack Notifications

Add to workflow:

```yaml
    - name: Notify Slack on success
      if: success()
      uses: slackapi/slack-github-action@v1
      with:
        webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
        payload: |
          {
            "text": "✅ Deployment successful!"
          }
```

---

### Run Tests Before Deploy

Edit workflows to add:

```yaml
    - name: Run unit tests
      run: npm test
      
    - name: Run E2E tests
      run: npm run test:e2e
```

---

## 📝 Workflow Files Location

```
.github/
  workflows/
    ├── deploy-backend.yml      # Backend SAM deploy
    ├── deploy-frontend.yml     # Frontend GitHub Pages
    └── ci-build-test.yml       # PR validation
```

---

## ✅ Setup Checklist

- [ ] GitHub repository created/pushed
- [ ] AWS credentials generated (IAM user)
- [ ] All secrets added to GitHub (15 secrets total)
- [ ] GitHub Pages enabled (Actions source)
- [ ] First manual workflow run successful
- [ ] Backend API URL updated in frontend secrets
- [ ] CORS verified working
- [ ] CI checks passing on PRs

---

## 🎯 Next Steps

1. **Commit workflow files:**
   ```bash
   git add .github/
   git commit -m "Add CI/CD workflows"
   git push origin main
   ```

2. **Trigger first deploy:**
   - GitHub → Actions → "Deploy Backend to AWS"
   - Click "Run workflow"

3. **Verify deployment:**
   - Check API Gateway URL in logs
   - Update `VITE_API_BASE_URL` secret
   - Trigger frontend deploy

4. **Test full flow:**
   - Browse to https://kokororay.github.io/OrchaWeb
   - Check admin page loads data
   - No CORS errors ✅

---

## 📞 Support Resources

- **GitHub Actions Docs:** https://docs.github.com/actions
- **AWS SAM CLI:** https://docs.aws.amazon.com/serverless-application-model/
- **Vite Deploy Guide:** https://vitejs.dev/guide/static-deploy.html

---

**Created:** March 2, 2026  
**Version:** 1.0 - Full CI/CD with GitHub Actions
