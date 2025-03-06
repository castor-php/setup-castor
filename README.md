# Setup Castor GitHub Action

Setup Castor with static binary for GitHub Actions.

## :memo: Usage

### Basic Setup

```yaml
steps:
  - name: Setup Castor
    uses: castor-php/setup-castor@v0.1.0
```

### Inputs

> Specify using `with` keyword

#### `token` (optional)

- Specify the GitHub token to use for downloading the Castor binary on GitHub.

#### `version` (optional)

- Specify the Castor version you want to set up.
- Accepts a `string` corresponding to a
  [Castor release tag](https://github.com/jolicode/castor/tags). For example
  `'v0.18.0'`.
- Accepts `latest` to set up the latest stable PHP version.
- Accepts `nightly` to set up a nightly build from the master branch of Castor.

> Set up a particular Castor version.

```yaml
steps:
  - name: Setup Castor
    uses: castor-php/setup-castor@v0.1.0
    with:
      version: 'v0.18.0'
```
