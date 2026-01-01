const appName = process.env.APP_NAME;
const appSupportEmail = process.env.EMAIL_FROM;
const appUrl = process.env.FRONTEND_URL;

// Modern email wrapper with gradient design
export const emailWrapper = (title, body, iconEmoji = "🎉") => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            
            <!-- Header with Gradient -->
            <tr>
              <td style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #ff4757 100%); padding: 40px 30px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">${iconEmoji}</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${appName}</h1>
              </td>
            </tr>
            
            <!-- Content Area -->
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">${title}</h2>
                <div style="font-size: 15px; color: #4a5568; line-height: 1.7;">
                  ${body}
                </div>
              </td>
            </tr>
            
            <!-- Divider -->
            <tr>
              <td style="padding: 0 30px;">
                <div style="height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent);"></div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f7fafc; padding: 30px;">
                <p style="font-size: 13px; color: #718096; margin: 0 0 10px 0; text-align: center; line-height: 1.6;">
                  If you didn't request this, please ignore this email or contact our support team.
                </p>
                <p style="font-size: 13px; color: #a0aec0; margin: 0; text-align: center;">
                  <a href="mailto:${appSupportEmail}" style="color: #ff4757; text-decoration: none; font-weight: 500;">${appSupportEmail}</a>
                </p>
                <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                  <p style="font-size: 12px; color: #a0aec0; margin: 0;">
                    © ${new Date().getFullYear()} ${appName}. All rights reserved.
                  </p>
                </div>
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

// Button component
const createButton = (url, text, isPrimary = true) => {
  const bgColor = isPrimary
    ? "linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)"
    : "#718096";
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" 
         style="background: ${bgColor}; 
                color: #ffffff; 
                padding: 14px 40px; 
                text-decoration: none; 
                border-radius: 8px; 
                display: inline-block; 
                font-weight: 600; 
                font-size: 15px;
                box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
                transition: all 0.3s ease;">
        ${text}
      </a>
    </div>
  `;
};

// Info box component
const createInfoBox = (content, type = "info") => {
  const colors = {
    info: { bg: "#ebf8ff", border: "#4299e1", icon: "ℹ️" },
    warning: { bg: "#fffaf0", border: "#ed8936", icon: "⚠️" },
    success: { bg: "#f0fff4", border: "#48bb78", icon: "✅" },
  };
  const style = colors[type];

  return `
    <div style="background-color: ${style.bg}; 
                border-left: 4px solid ${style.border}; 
                padding: 16px 20px; 
                border-radius: 8px; 
                margin: 20px 0;">
      <p style="margin: 0; color: #2d3748; font-size: 14px;">
        <span style="font-size: 18px; margin-right: 8px;">${style.icon}</span>
        ${content}
      </p>
    </div>
  `;
};

// OTP display component
const createOTPDisplay = (otp) => `
  <div style="text-align: center; margin: 30px 0;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                padding: 20px; 
                border-radius: 12px; 
                display: inline-block;
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);">
      <p style="color: #e2e8f0; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Your OTP Code</p>
      <h1 style="color: #ffffff; 
                  font-size: 36px; 
                  letter-spacing: 12px; 
                  margin: 0; 
                  font-weight: 700;
                  text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
        ${otp}
      </h1>
    </div>
  </div>
`;

export const registeredUserEmail = ({ name }) =>
  emailWrapper(
    `Welcome to ${appName}! 🎉`,
    `
      <p style="font-size: 16px; margin-bottom: 10px;">Hi <strong style="color: #2d3748;">${name}</strong>,</p>
      <p style="margin-bottom: 20px;">We're absolutely thrilled to have you join our community! 🚀</p>
      <p style="margin-bottom: 20px;">Get ready to discover amazing food experiences, seamless ordering, and exclusive deals tailored just for you.</p>
      
      ${createInfoBox(
        "Your account has been created successfully. You can now explore all our features!",
        "success"
      )}
      
      ${createButton(appUrl, "Start Exploring Now")}
      
      <p style="color: #718096; font-size: 14px; margin-top: 30px;">
        Need help getting started? Check out our <a href="${appUrl}/help" style="color: #ff4757; text-decoration: none; font-weight: 500;">Help Center</a>
      </p>
    `,
    "🎉"
  );

export const forgotPasswordEmail = ({ resetUrl }) =>
  emailWrapper(
    "Reset Your Password 🔐",
    `
      <p style="margin-bottom: 20px;">We received a request to reset your password. Don't worry, we've got you covered!</p>
      
      ${createInfoBox(
        "This link will expire in <strong>15 minutes</strong> for security reasons.",
        "warning"
      )}
      
      <p style="margin-bottom: 10px;">Click the button below to create a new password:</p>
      
      ${createButton(resetUrl, "Reset My Password")}
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin-top: 25px;">
        <p style="color: #718096; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">Link not working?</p>
        <p style="color: #a0aec0; font-size: 12px; margin: 0; word-break: break-all; font-family: monospace;">${resetUrl}</p>
      </div>
      
      <p style="color: #718096; font-size: 14px; margin-top: 25px;">
        If you didn't request this password reset, please ignore this email or contact support if you're concerned.
      </p>
    `,
    "🔐"
  );

export const resetPasswordSuccessEmail = () =>
  emailWrapper(
    "Password Reset Successful! ✅",
    `
      <p style="margin-bottom: 20px;">Great news! Your password has been successfully updated.</p>
      
      ${createInfoBox("You can now log in with your new password.", "success")}
      
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                  padding: 20px; 
                  border-radius: 12px; 
                  text-align: center; 
                  margin: 25px 0;">
        <p style="color: #ffffff; font-size: 16px; margin: 0; font-weight: 600;">
          🔒 Your account is now secure
        </p>
      </div>
      
      ${createButton(appUrl, "Log In Now")}
      
      ${createInfoBox(
        "If you did not make this change, please contact our support team immediately.",
        "warning"
      )}
    `,
    "✅"
  );

export const sendOtpEmail = ({ otp }) =>
  emailWrapper(
    "Your Verification Code 🔢",
    `
      <p style="margin-bottom: 20px;">We received a request to verify your account. Please use the code below:</p>
      
      ${createOTPDisplay(otp)}
      
      ${createInfoBox(
        "This code will expire in <strong>5 minutes</strong>.",
        "warning"
      )}
      
      <div style="text-align: center; margin: 25px 0;">
        <p style="color: #718096; font-size: 14px; margin: 0;">
          Enter this code in the verification page to continue.
        </p>
      </div>
      
      <div style="background-color: #fff5f5; 
                  border-left: 4px solid #fc8181; 
                  padding: 16px 20px; 
                  border-radius: 8px; 
                  margin-top: 25px;">
        <p style="margin: 0; color: #742a2a; font-size: 13px;">
          <strong>Security Tip:</strong> Never share this code with anyone. Our team will never ask for your OTP.
        </p>
      </div>
    `,
    "🔢"
  );

export const verifyEmailTemplate = ({ name, verifyUrl }) =>
  emailWrapper(
    "Verify Your Email Address 📧",
    `
      <p style="font-size: 16px; margin-bottom: 10px;">Hi <strong style="color: #2d3748;">${name}</strong>,</p>
      <p style="margin-bottom: 20px;">Thanks for signing up with <strong>${appName}</strong>! We're excited to have you onboard. 🎊</p>
      
      <p style="margin-bottom: 20px;">To get started and unlock all features, please verify your email address:</p>
      
      ${createButton(verifyUrl, "Verify My Email")}
      
      ${createInfoBox(
        "This verification link will expire in <strong>24 hours</strong>.",
        "info"
      )}
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin-top: 25px;">
        <p style="color: #718096; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">Button not working? Copy and paste this link:</p>
        <p style="color: #a0aec0; font-size: 12px; margin: 0; word-break: break-all; font-family: monospace;">${verifyUrl}</p>
      </div>
    `,
    "📧"
  );

export const resendEmailVerificationTemplate = ({ verifyUrl }) =>
  emailWrapper(
    "New Verification Link 🔗",
    `
      <p style="margin-bottom: 20px;">You requested a new verification link for your account.</p>
      
      <p style="margin-bottom: 20px;">No problem! Click the button below to verify your email:</p>
      
      ${createButton(verifyUrl, "Verify Email Now")}
      
      ${createInfoBox(
        "This new link will expire in <strong>24 hours</strong>.",
        "info"
      )}
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin-top: 25px;">
        <p style="color: #718096; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">Alternative link:</p>
        <p style="color: #a0aec0; font-size: 12px; margin: 0; word-break: break-all; font-family: monospace;">${verifyUrl}</p>
      </div>
      
      <p style="color: #718096; font-size: 14px; margin-top: 25px;">
        Already verified? You can safely ignore this email.
      </p>
    `,
    "🔗"
  );

export const emailVerifiedSuccessTemplate = ({ name }) =>
  emailWrapper(
    "Email Verified Successfully! 🎉",
    `
      <p style="font-size: 16px; margin-bottom: 10px;">Awesome, <strong style="color: #2d3748;">${name}</strong>! 🎊</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); 
                    padding: 30px; 
                    border-radius: 16px; 
                    display: inline-block;">
          <div style="font-size: 64px; margin-bottom: 15px;">✅</div>
          <p style="color: #2d3748; font-size: 18px; margin: 0; font-weight: 600;">
            Email Verified!
          </p>
        </div>
      </div>
      
      <p style="margin-bottom: 20px;">Your email has been verified successfully. You now have full access to all features of <strong>${appName}</strong>!</p>
      
      ${createInfoBox(
        "You can now place orders, track deliveries, and enjoy exclusive member benefits.",
        "success"
      )}
      
      ${createButton(appUrl, "Start Ordering Now")}
      
      <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); 
                  padding: 20px; 
                  border-radius: 12px; 
                  text-align: center; 
                  margin: 25px 0;">
        <p style="color: #2d3748; font-size: 15px; margin: 0; font-weight: 600;">
          🎁 Welcome Gift: Get 20% off on your first order!
        </p>
      </div>
      
      <p style="color: #718096; font-size: 14px; text-align: center; margin-top: 25px;">
        Happy ordering! 🍔🍕🍰
      </p>
    `,
    "🎉"
  );

export const verifyOtpSuccessEmail = ({ name }) =>
  emailWrapper(
    "OTP Verified Successfully! ✅",
    `
      <p style="font-size: 16px; margin-bottom: 10px;">Hi <strong style="color: #2d3748;">${name}</strong>,</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); 
                    padding: 30px; 
                    border-radius: 16px; 
                    display: inline-block;">
          <div style="font-size: 64px; margin-bottom: 15px;">✅</div>
          <p style="color: #2d3748; font-size: 18px; margin: 0; font-weight: 600;">
            Verification Complete!
          </p>
        </div>
      </div>
      
      <p style="margin-bottom: 20px;">Your OTP has been verified successfully and your account is now active!</p>
      
      ${createInfoBox("You have full access to all features now.", "success")}
      
      ${createButton(appUrl, "Go to Dashboard")}
    `,
    "✅"
  );
