# Frontend Deployment Setup Guide

## Overview

This document describes the complete setup process for deploying the Microblog Frontend application using Kamal. It includes troubleshooting steps for common issues encountered during initial deployment and provides a step-by-step guide for setting up the project from scratch.

## Prerequisites

Before deploying, ensure you have:

1. **Docker Hub Account**: Create an account at https://hub.docker.com
2. **Docker Hub Access Token**: Generate a token with read/write permissions
3. **Server Access**: SSH access to your deployment server (IP address or domain)
4. **Kamal Installed**: `gem install kamal` (or via bundler)
5. **Docker Installed Locally**: For building images

## Initial Setup Issues and Solutions

### Issue 1: Docker Image Push Authorization Failed

**Error:**
```
ERROR: failed to push docker.io/microblog-frontend:... push access denied, repository does not exist or may require authorization
```

**Root Cause:** The image name in `config/deploy.yml` was missing the Docker Hub username prefix.

**Solution:** Updated `config/deploy.yml`:
```yaml
# Before (incorrect)
image: microblog-frontend

# After (correct)
image: davidslvuk/microblog-frontend
```

**Note:** Replace `davidslvuk` with your Docker Hub username.

---

### Issue 2: Configuration Error - `symbolize_keys` Method

**Error:**
```
ERROR (NoMethodError): undefined method 'symbolize_keys' for an instance of String
```

**Root Cause:** The `registry.password` field was using ERB template syntax instead of the secrets reference format that Kamal expects.

**Solution:** Changed the registry configuration in `config/deploy.yml`:
```yaml
# Before (incorrect)
registry:
  username: <%= ENV.fetch("DOCKER_USERNAME", "") %>
  password: <%= ENV.fetch("DOCKER_PASSWORD", "") %>
  server: <%= ENV.fetch("DOCKER_REGISTRY", "docker.io") %>

# After (correct)
registry:
  username: <%= ENV.fetch("DOCKER_USERNAME", "davidslvuk") %>
  password:
    - KAMAL_REGISTRY_PASSWORD
  server: <%= ENV.fetch("DOCKER_REGISTRY", "docker.io") %>
```

**Note:** The password now references a secret from `.kamal/secrets` file.

---

### Issue 3: Missing Secrets File

**Error:** Kamal couldn't find the registry password.

**Solution:** Created `.kamal/secrets` file:
```bash
# Create the directory
mkdir -p .kamal

# Create the secrets file
cat > .kamal/secrets <<EOF
# Secrets defined here are available for reference under registry/password in config/deploy.yml.
# All secrets should be pulled from either password manager, ENV, or a file.
# DO NOT ENTER RAW CREDENTIALS HERE! This file needs to be safe for git.

# Grab the registry password from ENV
KAMAL_REGISTRY_PASSWORD=\$DOCKER_HUB_TOKEN
EOF

# Make it executable
chmod +x .kamal/secrets
```

**Important:**
- Never commit this file to git (it should be in `.gitignore`)
- The file references `$DOCKER_HUB_TOKEN` environment variable
- Make sure to set this variable before running `kamal deploy`

---

### Issue 4: SSH Connection Timeout

**Error:**
```
ERROR (Net::SSH::ConnectionTimeout): Exception while executing on host microblog.yourdomain.com
```

**Root Cause:** The `FRONTEND_HOST` environment variable was set to a placeholder domain (`microblog.yourdomain.com`) that doesn't resolve.

**Solution:** Set `FRONTEND_HOST` to the actual server IP address or a valid domain name:
```bash
export FRONTEND_HOST=46.101.40.110  # Use your actual server IP
```

---

### Issue 5: Docker Not Installed on Server

**Error:**
```
ERROR: docker exit status: 127
docker stderr: bash: line 1: docker: command not found
```

**Root Cause:** Docker was not installed on the deployment server.

**Solution:** Use Kamal's built-in setup command:
```bash
export FRONTEND_HOST=46.101.40.110
kamal setup
```

This command automatically:
- Detects if Docker is missing
- Installs Docker on the server
- Sets up necessary dependencies
- Configures the server for Kamal deployments

**Note:** You don't need to manually install Docker - `kamal setup` handles it!

---

## Complete Setup Instructions

### Step 1: Configure Deployment Settings

Edit `config/deploy.yml` and ensure:

1. **Image name includes your Docker Hub username:**
   ```yaml
   image: your-dockerhub-username/microblog-frontend
   ```

2. **Registry configuration uses secrets:**
   ```yaml
   registry:
     username: <%= ENV.fetch("DOCKER_USERNAME", "your-dockerhub-username") %>
     password:
       - KAMAL_REGISTRY_PASSWORD
     server: <%= ENV.fetch("DOCKER_REGISTRY", "docker.io") %>
   ```

3. **Server host is configured:**
   ```yaml
   servers:
     web:
       hosts:
         - <%= ENV.fetch("FRONTEND_HOST", "your-server-ip") %>
   ```

4. **Proxy host matches your domain (if using SSL):**
   ```yaml
   proxy:
     ssl: true
     host: <%= ENV.fetch("FRONTEND_HOST", "your-domain.com") %>
   ```

---

### Step 2: Create Secrets File

Create `.kamal/secrets`:

```bash
mkdir -p .kamal

cat > .kamal/secrets <<'EOF'
# Secrets defined here are available for reference under registry/password in config/deploy.yml.
# All secrets should be pulled from either password manager, ENV, or a file.
# DO NOT ENTER RAW CREDENTIALS HERE! This file needs to be safe for git.

# Grab the registry password from ENV
KAMAL_REGISTRY_PASSWORD=$DOCKER_HUB_TOKEN
EOF

chmod +x .kamal/secrets
```

**Important:** Add `.kamal/secrets` to `.gitignore`:
```bash
echo ".kamal/secrets" >> .gitignore
```

---

### Step 3: Set Environment Variables

Before deploying, set these environment variables:

```bash
# Server IP or domain name
export FRONTEND_HOST=your-server-ip-or-domain.com

# Backend API URL (used during build)
export VITE_API_URL=https://your-backend-api.com/api/v1

# Docker Hub credentials
export DOCKER_USERNAME=your-dockerhub-username
export DOCKER_HUB_TOKEN=your-docker-hub-access-token
```

**Note:**
- `VITE_API_URL` is embedded at build time (not runtime)
- `DOCKER_HUB_TOKEN` should be a Docker Hub access token, not your password
- You can create a token at: https://hub.docker.com/settings/security

---

### Step 4: Setup Server (First Time Only)

Run Kamal setup to install Docker and configure the server:

```bash
export FRONTEND_HOST=your-server-ip-or-domain.com
kamal setup
```

This will:
- ✅ Create `.kamal` directory on the server
- ✅ Install Docker if missing
- ✅ Configure necessary dependencies
- ✅ Set up the deployment environment

**Expected Output:**
```
Acquiring the deploy lock...
Ensure Docker is installed...
Missing Docker on [server]. Installing…
[Installation progress...]
```

---

### Step 5: Deploy the Application

Once setup is complete, deploy:

```bash
export FRONTEND_HOST=your-server-ip-or-domain.com
export VITE_API_URL=https://your-backend-api.com/api/v1
export DOCKER_USERNAME=your-dockerhub-username
export DOCKER_HUB_TOKEN=your-docker-hub-access-token

kamal deploy
```

**What happens during deployment:**
1. ✅ Builds Docker image locally
2. ✅ Pushes image to Docker Hub
3. ✅ Pulls image on server
4. ✅ Starts container with Nginx
5. ✅ Configures Kamal proxy for SSL/HTTPS
6. ✅ Health checks and verification

**Expected Output:**
```
Build and push app image...
Building with uncommitted changes...
[Build progress...]
Finished in X seconds (successful).
First web container is healthy on [server], booting any other roles
Finished all in X seconds
```

---

## Verification

After deployment, verify the application is running:

1. **Check container status:**
   ```bash
   kamal app details
   ```

2. **View logs:**
   ```bash
   kamal app logs
   ```

3. **Access the application:**
   - HTTP: `http://your-server-ip`
   - HTTPS: `https://your-domain.com` (if SSL configured)

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
kamal app logs
```

**Check container status:**
```bash
ssh root@your-server-ip
docker ps -a | grep microblog-frontend
```

### Image Pull Fails

**Verify Docker Hub credentials:**
```bash
# Test login manually
docker login docker.io -u your-username -p your-token
```

**Check image exists:**
Visit: `https://hub.docker.com/r/your-username/microblog-frontend`

### SSL Certificate Issues

If using SSL with Let's Encrypt:
- Ensure domain DNS points to server IP
- Ports 80 and 443 must be open
- Wait a few minutes for certificate generation

### Build Args Not Working

Remember that `VITE_API_URL` is a **build-time** variable, not runtime:
- It's embedded during `npm run build`
- Changing it requires rebuilding the image
- Set it before running `kamal deploy`

---

## Quick Reference

### Essential Commands

```bash
# Setup server (first time)
kamal setup

# Deploy application
kamal deploy

# View application details
kamal app details

# View logs
kamal app logs

# Access Rails console (if needed)
kamal app exec "bash"

# Remove deployment
kamal app remove
```

### Required Environment Variables

```bash
FRONTEND_HOST          # Server IP or domain
VITE_API_URL          # Backend API URL (build-time)
DOCKER_USERNAME       # Docker Hub username
DOCKER_HUB_TOKEN      # Docker Hub access token
```

### File Structure

```
microblog-frontend/
├── config/
│   └── deploy.yml          # Kamal deployment config
├── .kamal/
│   └── secrets             # Secrets file (gitignored)
├── Dockerfile              # Docker build instructions
└── nginx.conf              # Nginx configuration
```

---

## Security Best Practices

1. **Never commit secrets:**
   - `.kamal/secrets` should be in `.gitignore`
   - Use environment variables for sensitive data

2. **Use Docker Hub tokens:**
   - Don't use your Docker Hub password
   - Create access tokens with limited scope
   - Rotate tokens regularly

3. **Secure SSH access:**
   - Use SSH keys instead of passwords
   - Restrict SSH access by IP if possible
   - Keep server updated

4. **Environment variables:**
   - Don't hardcode credentials in `deploy.yml`
   - Use ERB templates with `ENV.fetch()` and defaults
   - Set variables in your shell or CI/CD system

---

## CI/CD Integration

For automated deployments, set environment variables in your CI/CD system:

**GitHub Actions Example:**
```yaml
env:
  FRONTEND_HOST: ${{ secrets.FRONTEND_HOST }}
  VITE_API_URL: ${{ secrets.VITE_API_URL }}
  DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
  DOCKER_HUB_TOKEN: ${{ secrets.DOCKER_HUB_TOKEN }}

steps:
  - name: Deploy
    run: kamal deploy
```

**GitLab CI Example:**
```yaml
variables:
  FRONTEND_HOST: $FRONTEND_HOST
  VITE_API_URL: $VITE_API_URL
  DOCKER_USERNAME: $DOCKER_USERNAME
  DOCKER_HUB_TOKEN: $DOCKER_HUB_TOKEN

deploy:
  script:
    - kamal deploy
```

---

## Summary

The deployment process involves:

1. ✅ **Configuration**: Set up `deploy.yml` with correct image name and registry settings
2. ✅ **Secrets**: Create `.kamal/secrets` file referencing environment variables
3. ✅ **Environment**: Set required environment variables
4. ✅ **Setup**: Run `kamal setup` to install Docker on server (first time only)
5. ✅ **Deploy**: Run `kamal deploy` to build, push, and deploy the application

**Key Takeaways:**
- Kamal handles Docker installation automatically via `kamal setup`
- Always use Docker Hub username prefix in image names
- Use secrets file for sensitive credentials
- Set `FRONTEND_HOST` to actual server IP/domain
- `VITE_API_URL` is embedded at build time, not runtime

---

## Additional Resources

- [Kamal Documentation](https://kamal-deploy.org/)
- [Docker Hub Access Tokens](https://docs.docker.com/docker-hub/access-tokens/)
- [Kamal GitHub Repository](https://github.com/basecamp/kamal)

