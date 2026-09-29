import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1,

  keyGenerator: (req) => {
    const ip = req.ip;

    if (
      ip === "::1" ||
      ip === "::/56" ||
      ip === "127.0.0.1" ||
      ip === "::ffff:127.0.0.1"
    ) {
      return "127.0.0.1";
    }

    return ipKeyGenerator(ip);
  },

  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    console.log("rate limiter hit");
    console.log("IP:", req.ip);
    console.log("Rate Limit:", req.rateLimit);

    return res.status(429).json({
      success: false,
      message: "Please wait before requesting another verification email.",
      code: "VERIFICATION_RATE_LIMITED",
    });
  },
});

export default resendVerificationLimiter;
