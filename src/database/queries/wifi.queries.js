export const FIND_ACTIVE_WIFI_BY_BSSID_QUERY = `
  SELECT id, ssid, macid
  FROM office_wifi
  WHERE is_active = 1 AND LOWER(macid) = LOWER(?)
  LIMIT 1
`;
// SQL query to find an active Wi-Fi network by its BSSID (MAC address).
//  The query checks for active Wi-Fi networks and performs a case-insensitive match on the MAC address.
