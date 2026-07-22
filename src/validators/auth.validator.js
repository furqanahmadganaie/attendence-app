const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendValidationError = (res, errors) =>
  res.status(400).json({
    message: "Validation failed",
    errors
  });

const validateEmail = (value) => {
  if (typeof value !== "string") {
    return {
      error: {
        field: "email",
        message: "Email must be a string"
      }
    };
  }

  const email = value.trim().toLowerCase();

  if (!email) {
    return {
      error: {
        field: "email",
        message: "Email is required"
      }
    };
  }

  if (email.length > 254) {
    return {
      error: {
        field: "email",
        message: "Email must not exceed 254 characters"
      }
    };
  }

  if (!emailPattern.test(email)) {
    return {
      error: {
        field: "email",
        message: "Please provide a valid email address"
      }
    };
  }

  return { value: email };
};

const CENTROXY_EMAIL_DOMAIN = "@centroxy.com";

const validatePassword = (value, isRegistration = false) => {
  if (typeof value !== "string") {
    return {
      error: {
        field: "password",
        message: "Password must be a string"
      }
    };
  }

  if (!value) {
    return {
      error: {
        field: "password",
        message: "Password is required"
      }
    };
  }

  if (isRegistration && value.length < 8) {
    return {
      error: {
        field: "password",
        message: "Password must be at least 8 characters long"
      }
    };
  }

  // bcrypt effectively only uses the first 72 characters.
  if (value.length > 72) {
    return {
      error: {
        field: "password",
        message: "Password must not exceed 72 characters"
      }
    };
  }

  return { value };
};

const validateOtp = (value) => {
  if (typeof value !== "string" && typeof value !== "number") {
    return {
      error: {
        field: "otp",
        message: "OTP must be a string"
      }
    };
  }

  const otp = String(value).trim();

  if (!otp) {
    return {
      error: {
        field: "otp",
        message: "OTP is required"
      }
    };
  }

  if (!/^\d{6}$/.test(otp)) {
    return {
      error: {
        field: "otp",
        message: "OTP must be exactly 6 digits"
      }
    };
  }

  return { value: otp };
};


const validateName = (value) => {
  if (typeof value !== "string") {
    return {
      error: {
        field: "name",
        message: "Name must be a string"
      }
    };
  }

  const name = value.trim();

  if (!name) {
    return {
      error: {
        field: "name",
        message: "Name is required"
      }
    };
  }

  if (name.length > 100) {
    return {
      error: {
        field: "name",
        message: "Name must not exceed 100 characters"
      }
    };
  }

  return { value: name };
};

export const validateLogin = (req, res, next) => {
  const errors = [];
  const emailResult = validateEmail(req.body?.email);// Validate the email field using the validateEmail function
  const passwordResult = validatePassword(req.body?.password);

  if (emailResult.error) {
    errors.push(emailResult.error);
  }

  if (passwordResult.error) {
    errors.push(passwordResult.error);
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  req.validatedBody = {
    email: emailResult.value,
    password: passwordResult.value
  };

  return next();
};  // Middleware function to validate the login request body. 
// It checks the email and password fields and returns a 400 response if there are validation errors.
//  If validation passes, it attaches the validated values to req.validatedBody and calls next() to proceed to the controller.

export const validateRegistrationRequest = (req, res, next) => {
  const errors = [];
  const nameResult = validateName(req.body?.name);
  const emailResult = validateEmail(req.body?.email);
  const passwordResult = validatePassword(req.body?.password, true);

  if (nameResult.error) {
    errors.push(nameResult.error);
  }

  if (emailResult.error) {
    errors.push(emailResult.error);
  } else if (!emailResult.value.endsWith(CENTROXY_EMAIL_DOMAIN)) {
    errors.push({
      field: "email",
      message: `Only ${CENTROXY_EMAIL_DOMAIN} emails are allowed`
    });
  }

  if (passwordResult.error) {
    errors.push(passwordResult.error);
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  req.validatedBody = {
    name: nameResult.value,
    email: emailResult.value,
    password: passwordResult.value
  };

  return next();
};

export const validateForgotPassword = (req, res, next) => {
  const errors = [];
  const emailResult = validateEmail(req.body?.email);

  if (emailResult.error) {
    errors.push(emailResult.error);
  } else if (!emailResult.value.endsWith(CENTROXY_EMAIL_DOMAIN)) {
    errors.push({
      field: "email",
      message: `Only ${CENTROXY_EMAIL_DOMAIN} emails are allowed`
    });
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  req.validatedBody = {
    email: emailResult.value
  };

  return next();
};

export const validateResetPassword = (req, res, next) => {
  const errors = [];
  const emailResult = validateEmail(req.body?.email);
  const otpResult = validateOtp(req.body?.otp);
  const passwordResult = validatePassword(req.body?.newPassword, true);

  if (emailResult.error) {
    errors.push(emailResult.error);
  } else if (!emailResult.value.endsWith(CENTROXY_EMAIL_DOMAIN)) {
    errors.push({
      field: "email",
      message: `Only ${CENTROXY_EMAIL_DOMAIN} emails are allowed`
    });
  }

  if (otpResult.error) {
    errors.push(otpResult.error);
  }

  if (passwordResult.error) {
    errors.push(passwordResult.error);
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  req.validatedBody = {
    email: emailResult.value,
    otp: otpResult.value,
    newPassword: passwordResult.value
  };

  return next();
};
