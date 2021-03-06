import { exec } from 'teen_process';
import log from './logger';


async function getConnectedDevices () {
  try {
    let {stdout} = await exec('idevice_id', ['-l']);
    return stdout.trim().split('\n');
  } catch (err) {
    if (err.message.indexOf(`Command 'idevice_id' not found`) === -1) {
      throw err;
    }
    let msg = `The 'idevice_id' program is not installed. If you are running ` +
              `a real device test it is necessary. Install with 'brew install ` +
              `libimobiledevice --HEAD'`;
    log.warn(msg);
    return [];
  }
}

async function resetRealDevice (device, opts) {
  if (!opts.bundleId || !opts.fullReset) return;

  let bundleId = opts.bundleId;
  log.debug(`Reset: fullReset requested. Will try to uninstall the app '${bundleId}'.`);
  if (!await device.isInstalled(bundleId)) {
    log.debug('Reset: app not installed. No need to uninstall');
    return;
  }
  try {
    await device.remove(bundleId);
  } catch (err) {
    log.error(`Reset: could not remove '${bundleId}' from device: ${err.message}`);
    throw err;
  }
  log.debug(`Reset: removed '${bundleId}'`);
}

async function runRealDeviceReset (device, opts) {
  if (!opts.noReset || opts.fullReset) {
    log.debug('Reset: running ios real device reset flow');
    if (!opts.noReset) {
      await resetRealDevice(device, opts);
    }
  } else {
    log.debug('Reset: fullReset not set. Leaving as is');
  }
}

export { getConnectedDevices, runRealDeviceReset };
