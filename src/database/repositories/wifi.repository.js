import db from "../db.js";
import { FIND_ACTIVE_WIFI_BY_BSSID_QUERY } from "../queries/wifi.queries.js";

export const findActiveWifiByBssid = async (bssid, executor = db) => {
  const [rows] = await executor.execute(FIND_ACTIVE_WIFI_BY_BSSID_QUERY, [bssid]);
  return rows[0] || null;
}; // Function to find an active Wi-Fi network by its BSSID (MAC address). Returns the Wi-Fi record if found, or null if not found.
