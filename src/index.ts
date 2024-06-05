import * as core from '@actions/core'
import * as github from '@actions/github'
import fs from 'fs'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const os = process.platform
    const arch = process.arch
    let release_suffix = ''

    switch (os) {
      case 'linux':
        if (arch === 'x64') {
          release_suffix = 'linux-amd64'
        }
        break
      case 'darwin':
        if (arch === 'arm64' || arch === 'arm') {
          release_suffix = 'darwin-arm64'
        } else if (arch === 'x64') {
          release_suffix = 'darwin-amd64'
        }
        break
      default:
    }

    if (release_suffix === '') {
      throw new Error(`Unsupported platform ${os} ${arch}`)
    }

    const version = core.getInput('version')
    const token = core.getInput('token')

    const octokit = github.getOctokit(token)

    let release

    if (version === 'latest' || version === 'highest') {
      release = await octokit.rest.repos.getLatestRelease({
        repo: 'castor',
        owner: 'jolicode'
      })
    } else {
      release = await octokit.rest.repos.getReleaseByTag({
        repo: 'castor',
        owner: 'jolicode',
        tag: version
      })
    }

    if (release === null) {
      throw new Error(`No release found for version ${version}`)
    }

    const asset = release.data.assets.find(item => {
      return item.name === `castor.${release_suffix}`
    })

    if (asset === undefined) {
      throw new Error(`No asset found for platform ${release_suffix}`)
    }

    // Install asset to /usr/local/bin/castor
    const file = await octokit.rest.repos.getReleaseAsset({
      repo: 'castor',
      owner: 'jolicode',
      asset_id: asset.id,
      headers: {
        Accept: 'application/octet-stream'
      }
    })

    if (file.headers['content-type'] === 'application/octet-stream') {
      const data = file.data as unknown as ArrayBuffer
      const path = '/usr/local/bin/castor'

      fs.writeFileSync(path, Buffer.from(data))
      fs.chmodSync(path, 0o755)
    } else {
      throw new Error('Invalid content type')
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
