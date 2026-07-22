import { verifyAccessToken } from "../utils/jwt.js";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization; // Extract the Authorization header from the incoming request

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  const token = authHeader.split(" ")[1];// Extract the token from the Bearer scheme
  const auth = verifyAccessToken(token);// Verify the token and retrieve the associated user information. 
                                        // If the token is invalid or expired, it will return null or throw an error.

  if (!auth) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }

  req.auth = auth;// Attach the authenticated user information to the request object for use in subsequent middleware or route handlers.
  return next();
}; // Middleware function to protect routes that require authentication.
//  It checks for the presence of a Bearer
