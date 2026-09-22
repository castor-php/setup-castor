# Setup Castor GitHub Action

Setup Castor with static binary for GitHub Actions.

## :memo: Usage

### Basic Setup

```yaml
steps:
  - name: Setup Castor
    uses: castor-php/setup-castor@v1
```

### Inputs

> Specify using `with` keyword

#### `cooldown` (optional)

- Only used when `version` is `latest` (or `highest`).
- Minimum age of a release before it is picked, as a duration string such as
  `'12 hours'`, `'3 days'` or `'1 week'` — the same format as Renovate's
  `minimumReleaseAge`.
- Defaults to `'3 days'`, which leaves time for a broken release or a
  compromised publish to be spotted and yanked.
- Set to `'0'` to always install the very last release.

```yaml
steps:
  - name: Setup Castor
    uses: castor-php/setup-castor@v1
    with:
      cooldown: '12 hours'
```

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
    uses: castor-php/setup-castor@v1
    with:
      version: 'v0.18.0'
```
