# GitHub Setup Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the "+" icon in the top right
3. Select "New repository"
4. Fill in:
   - **Repository name**: `adb-web-portal`
   - **Description**: `Web-based portal for managing multiple Android devices via ADB`
   - **Visibility**: Public (so interviewer can see it)
   - **DO NOT** initialize with README (we already have one)
5. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, run these commands:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/adb-web-portal.git

# Rename branch to main (optional, if you prefer main over master)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify Upload

1. Go to your repository URL: `https://github.com/YOUR_USERNAME/adb-web-portal`
2. You should see all files uploaded
3. The README.md will be displayed on the main page

## Step 4: Share with Interviewer

Send the interviewer:
- Repository URL: `https://github.com/YOUR_USERNAME/adb-web-portal`
- They can clone and run it using the instructions in README.md

## Optional: Add Repository Description

On your GitHub repository page:
1. Click the gear icon next to "About"
2. Add description: "Web-based multi-device Android management tool using ADB"
3. Add topics: `android`, `adb`, `device-management`, `react`, `nodejs`, `typescript`
4. Save changes

## Making Updates

After making changes:

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add feature: XYZ"

# Push to GitHub
git push
```

## Common Git Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Merge branch
git merge feature-name
```

## Repository Structure for Interviewer

Your repository will show:
- ✅ Clean project structure
- ✅ Comprehensive README
- ✅ Setup instructions
- ✅ TypeScript throughout
- ✅ Professional code organization
- ✅ Git history showing development process

## Tips for Interview

1. **Commit History**: Your commits show development process
2. **Code Quality**: Clean, well-organized code
3. **Documentation**: README and SETUP_GUIDE show professionalism
4. **Tech Stack**: Modern stack (React, TypeScript, Node.js)
5. **Features**: Working multi-device management demonstrates skills

## Example Repository URL

After setup, your repository will be at:
```
https://github.com/YOUR_USERNAME/adb-web-portal
```

Share this URL with your interviewer!
