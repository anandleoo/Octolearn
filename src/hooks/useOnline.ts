import { getNetworkStateAsync, useNetworkState } from 'expo-network';

/** "Unknown" counts as online: we only show the offline page when the phone clearly says there is no connection. */
const isOnline = (state: { isConnected?: boolean; isInternetReachable?: boolean }) =>
  state.isConnected !== false && state.isInternetReachable !== false;

/** True while the phone has an internet connection. Updates by itself when the connection drops or returns. */
export function useOnline(): boolean {
  return isOnline(useNetworkState());
}

/** One fresh check, for the "check again" button. If the check itself fails we assume online and let the real request decide. */
export async function checkOnline(): Promise<boolean> {
  try {
    return isOnline(await getNetworkStateAsync());
  } catch {
    return true;
  }
}
