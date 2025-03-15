# Feature-to-Release Checklist

This checklist outlines the end-to-end process—from feature development to production release—for maintaining a consistent workflow.

---

## 1. Feature Development (Feature-dev)

- [ ] **Create Feature Branch:**
  - Branch off from `develop` (e.g., `feature/your-feature-name`).
- [ ] **Develop & Test Locally:**
  - Implement the feature and run tests.
- [ ] **Commit & Push Changes:**
  - Stage changes, commit with clear messages, and push to remote.
- [ ] **Open a Pull Request (PR):**
  - PR from your feature branch to `develop`.
  - Ensure CI/CD tests run successfully on the PR.

---

## 2. Merge Feature into Develop (Lead)

- [ ] **Review PR:**
  - Lead reviews the code, requests changes if needed.
- [ ] **Approve & Merge PR:**
  - Merge the feature branch into the remote `develop`.
- [ ] **Update Local Develop:**
  - Run:
    ```bash
    git checkout develop
    git pull origin develop
    ```

---

## 3. Prepare for Release & Promote Develop to Main (Lead)

- [ ] **Version Bump:**
  - Update the version in `package.json` (and any related files) for the release.
  - Commit the version bump on `develop`:
    ```bash
    git add package.json
    git commit -m "chore: bump version to vX.Y.Z"
    ```
- [ ] **Push Version Bump to Remote Develop:**
  - Run:
    ```bash
    git push origin develop
    ```
- [ ] **Open PR from Develop to Main:**
  - In GitHub, open a PR with **base:** `main` and **compare:** `develop`.
  - The PR includes all feature changes plus the version bump.
- [ ] **Merge PR into Main:**
  - After final review and tests, merge the PR.
  - This merge triggers CI/CD and deploys to production.
- [ ] **Update Local Main:**
  - Run:
    ```bash
    git checkout main
    git pull origin main
    ```

---

## 4. Tag the Release on Main (Lead)

- [ ] **Create an Annotated Tag:**
  - On your updated local `main`, tag the release commit:
    ```bash
    git tag -a vX.Y.Z -m "Release version vX.Y.Z: [release notes summary]"
    ```
- [ ] **Push the Tag to Remote:**
  - Run:
    ```bash
    git push origin vX.Y.Z
    ```

---

## 5. Create a GitHub Release (Optional, Lead)

- [ ] **Draft a New Release on GitHub:**
  - Navigate to the **Releases** section.
  - Click **"Draft a new release"** and select the tag (e.g., `vX.Y.Z`).
- [ ] **Fill in Release Details:**
  - Provide a title and detailed release notes.
- [ ] **Publish the Release.**

---

## 6. Post-Deployment Housekeeping (Lead)

- [ ] **Monitor Production:**
  - Verify deployment status, check logs, and run smoke tests on the production site.
- [ ] **Sync Branches:**
  - Pull latest from remote `main`:
    ```bash
    git checkout main
    git pull origin main
    ```
  - Merge `main` into `develop` to keep branches in sync:
    ```bash
    git checkout develop
    git merge main
    git push origin develop
    ```
- [ ] **Update Documentation:**
  - Update your changelog and internal documentation with release details.
- [ ] **Plan Next Iteration:**
  - Review feedback, open issues, and plan upcoming features or hotfixes.

---

## 7. Hotfix Process (If Needed)

- [ ] **Create Hotfix Branch:**
  - Branch off from `main` (e.g., `hotfix/issue-description`).
- [ ] **Apply and Test the Fix:**
  - Commit changes and push the hotfix branch.
- [ ] **Merge Hotfix into Main:**
  - Open a PR, review, and merge into `main`.
- [ ] **Sync Develop with Main:**
  - Merge `main` into `develop`:
    ```bash
    git checkout develop
    git merge main
    git push origin develop
    ```
- [ ] **Tag and Update Release (if applicable):**
  - Create a new tag (e.g., `vX.Y.Z+1`) and update the GitHub release if needed.

---
