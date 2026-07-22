import {
  getAuthenticatedUser,
  loginUser,
  logoutUser,
  registerUser
} from "../services/auth.service.js";
import {
  requestPasswordResetOtp,
  resetPasswordWithOtp
} from "../services/password-reset.service.js";
import { env } from "../config/env.js";

const sendErrorResponse = (res, error) => {
  const statusCode = error?.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message:
      statusCode >= 500 && env.nodeEnv === "production"
        ? "Internal server error"
        : error.message
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.validatedBody;
    const result = await registerUser({ name, email, password }); // calls service registerUser to create a new user and generate an access token

    res.status(201).json({
      message: "Registration successful",
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.validatedBody;
    const result = await loginUser({ email, password });// calls service loginUser to authenticate the user and generate an access token

    if (!result) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};  // Controller function to handle user login. It validates the request body, calls the loginUser service, 
// and returns the user data and access token if successful. If login fails, it returns a 401 response.
//  If there's an error, it sends an appropriate error response.

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.validatedBody;
    const result = await requestPasswordResetOtp({ email });

    return res.status(200).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.validatedBody;
    const result = await resetPasswordWithOtp({ email, otp, newPassword });

    return res.status(200).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req.auth.sub);

    return res.status(200).json({
      user
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const logout = async (req, res) => {
  try {
    const result = await logoutUser(req.auth);

    return res.status(200).json(result);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
