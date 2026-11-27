import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    return res.status(503).json({ error: "Authentication is not configured." });
  }

  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: "Please sign in to continue." });

  try {
    const payload = jwt.verify(match[1], secret, { issuer: "matrisathi" });
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Your session is invalid or expired. Please sign in again." });
  }
}
