const macPattern = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i;

const normalizeBssid = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/-/g, ":");

export const validateWifiBssid = (req, res, next) => {
  const bssid = normalizeBssid(req.body?.bssid);

  if (!bssid) {
    return res.status(400).json({
      message: "bssid is required"
    });
  }

  if (!macPattern.test(bssid)) {
    return res.status(400).json({
      message: "Invalid bssid format"
    });
  }

  req.validatedBody = {
    ...(req.validatedBody || {}),
    bssid
  };

  return next();
};
