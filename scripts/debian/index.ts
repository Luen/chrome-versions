import GithubReleases from '../GithubReleases';
import { getAssetPath } from '../dirUtils';
import { downloadInstaller } from '../downloadInstaller';
import Versions from '../Versions';
import rebundleDeb from './rebundleDeb';

export async function process(
  os: string,
  version: string,
  releases: GithubReleases,
): Promise<void> {
  const assetPath = getAssetPath(os, version);
  const url = Versions.get(version)[os];
  let downloaded: string;
  try {
    downloaded = await downloadInstaller(url, os, version);
  } catch (error) {
    if (String(error) === 'Not found' || error.response?.status === 404) {
      // Only clear the missing OS key (e.g. linux_arm64 for older Chrome majors).
      Versions.set(version, {
        [os]: undefined,
      });
    }
    console.log('Could not download file at %s', url);
    return;
  }
  await rebundleDeb(downloaded, assetPath, version);
  let release = await releases.get(version);
  await releases.uploadAsset(release, assetPath);
}
