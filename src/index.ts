import * as core from '@actions/core'
import * as github from '@actions/github'
import fs from 'fs'
import ms from 'ms'

const OWNER = 'jolicode'
const REPO = 'castor'

type Octokit = ReturnType<typeof github.getOctokit>
type Release = Awaited<
  ReturnType<Octokit['rest']['repos']['getLatestRelease']>
>['data']

function parseCooldown(input: string): number {
  const value = input.trim()

  if (value === '' || value === '0') {
    return 0
  }

  // `ms` declares its input as a union of literal durations and its output as
  // `number`, but it accepts any string and returns undefined when it fails.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const duration: unknown = ms(value as ms.StringValue)

  if (
    typeof duration !== 'number' ||
    !Number.isFinite(duration) ||
    duration < 0
  ) {
    throw new Error(
      `Invalid cooldown "${input}", expected a duration such as "12 hours", "3 days" or "1 week"`
    )
  }

  return duration
}

async function getLatestRelease(
  octokit: Octokit,
  cooldown: string
): Promise<Release> {
  const cooldownMs = parseCooldown(cooldown)

  const latest = async (): Promise<Release> =>
    (await octokit.rest.repos.getLatestRelease({ repo: REPO, owner: OWNER }))
      .data

  if (cooldownMs <= 0) {
    return latest()
  }

  const cutoff = Date.now() - cooldownMs
  const releases = await octokit.rest.repos.listReleases({
    repo: REPO,
    owner: OWNER,
    per_page: 100
  })

  const release = releases.data
    .filter(
      item => !item.draft && !item.prerelease && item.published_at !== null
    )
    .sort(
      (a, b) =>
        Date.parse(b.published_at ?? '') - Date.parse(a.published_at ?? '')
    )
    .find(item => Date.parse(item.published_at ?? '') <= cutoff)

  if (release === undefined) {
    core.warning(
      `No release older than ${cooldown} found, falling back to the latest one`
    )

    return latest()
  }

  return release
}

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
    const cooldown = core.getInput('cooldown')

    const octokit = github.getOctokit(token)

    let release

    if (version === 'latest' || version === 'highest') {
      release = await getLatestRelease(octokit, cooldown)
    } else {
      release = (
        await octokit.rest.repos.getReleaseByTag({
          repo: REPO,
          owner: OWNER,
          tag: version
        })
      ).data
    }

    if (release === null) {
      throw new Error(`No release found for version ${version}`)
    }

    core.info(`Installing castor ${release.tag_name}`)

    const asset = release.assets.find(item => {
      return item.name === `castor.${release_suffix}`
    })

    if (asset === undefined) {
      throw new Error(`No asset found for platform ${release_suffix}`)
    }

    // Install asset to /usr/local/bin/castor
    const file = await octokit.rest.repos.getReleaseAsset({
      repo: REPO,
      owner: OWNER,
      asset_id: asset.id,
      headers: {
        Accept: 'application/octet-stream'
      }
    })

    if (file.headers['content-type'] === 'application/octet-stream') {
      // Octokit types `data` from the response schema, but an
      // `application/octet-stream` Accept header yields raw bytes at runtime.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
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

void run()
