# Git Branching Strategy

## Branch Types

### Main Branches

- **`main`**: Production-ready code. Always stable and deployable.
- **`develop`**: Integration branch for features. Pre-production code.

### Supporting Branches

- **`feature/*`**: New features or enhancements
  - Branch from: `develop`
  - Merge to: `develop`
  - Examples: `feature/authentication`, `feature/work-assignment`

- **`hotfix/*`**: Critical production fixes
  - Branch from: `main`
  - Merge to: `main` and `develop`
  - Examples: `hotfix/login-bug`, `hotfix/payment-calculation`

- **`release/*`**: Release preparation
  - Branch from: `develop`
  - Merge to: `main` and `develop`
  - Examples: `release/v1.0.0`, `release/v1.1.0`

## Workflow

### Feature Development
1. Create feature branch: `git checkout -b feature/feature-name develop`
2. Work on feature with frequent commits
3. Push feature branch: `git push -u origin feature/feature-name`
4. Create Pull Request to `develop`
5. Code review and testing
6. Merge to `develop`
7. Delete feature branch

### Release Process
1. Create release branch: `git checkout -b release/v1.0.0 develop`
2. Final testing and bug fixes
3. Update version numbers
4. Create Pull Request to `main`
5. Merge to `main` and tag release
6. Merge back to `develop`

### Hotfix Process
1. Create hotfix branch: `git checkout -b hotfix/issue-description main`
2. Fix the issue
3. Test thoroughly
4. Create Pull Request to `main`
5. Merge to `main` and create tag
6. Merge back to `develop`

## Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Examples
```
feat(auth): add JWT token validation
fix(payment): correct earnings calculation logic
docs(readme): update installation instructions
```

## Protection Rules

### Main Branch
- Require pull request reviews (minimum 1)
- Require status checks to pass
- Require branches to be up to date before merging
- Restrict pushes to admins only

### Develop Branch  
- Require pull request reviews
- Require status checks to pass
- Allow force pushes by admins