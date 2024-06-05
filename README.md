# Setup Castor Github Action

Setup Castor with static binary for Github Actions.

## :cloud: OS/Platform Support

Both `GitHub-hosted` and `self-hosted` runners are supported by `setup-castor`
on the following OS/Platforms.

### GitHub-Hosted Runners

| Virtual environment | YAML workflow label               | Pre-installed PHP      |
| ------------------- | --------------------------------- | ---------------------- |
| Ubuntu 24.04        | `ubuntu-24.04`                    | `PHP 8.3`              |
| Ubuntu 22.04        | `ubuntu-latest` or `ubuntu-22.04` | `PHP 8.1`              |
| Ubuntu 20.04        | `ubuntu-20.04`                    | `PHP 7.4` to `PHP 8.3` |
| macOS Sonoma 14.x   | `macos-14`                        | -                      |

### Self-Hosted Runners

| Host OS/Virtual environment    | YAML workflow label      |
| ------------------------------ | ------------------------ |
| Ubuntu 24.04                   | `self-hosted` or `Linux` |
| Ubuntu 22.04                   | `self-hosted` or `Linux` |
| Ubuntu 20.04                   | `self-hosted` or `Linux` |
| Debian 11                      | `self-hosted` or `Linux` |
| Debian 10                      | `self-hosted` or `Linux` |
| macOS Sonoma 14.x x86_64/arm64 | `self-hosted` or `macOS` |

## :memo: Usage

### Basic Setup

```yaml
steps:
  - name: Setup Castor
    uses: castor-php/setup-castor@v0.1
```

### Inputs

> Specify using `with` keyword

#### `token` (optional)

- Specify the GitHub token to use for downloading the Castor binary on GitHub.

#### `version` (optional)

- Specify the Castor version you want to set up.
- Accepts a `string`. For example `'0.15'`.
- Accepts `latest` to set up the latest stable PHP version.
- Accepts `nightly` to set up a nightly build from the master branch of Castor.

> Set up a particular Castor version.

```yaml
steps:
  - name: Setup Castor
    uses: castor-php/setup-castor@v0.1
    with:
      version: '0.15'
```
