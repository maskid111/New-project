import crypto from "crypto";
import { Router } from "express";
import { isAddress } from "ethers";
import { config } from "../config.js";

const xAuthRouter = Router();
const oauthStateStore = new Map();
const STATE_TTL_MS = 10 * 60 * 1000;

function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createPkcePair() {
  const codeVerifier = base64UrlEncode(crypto.randomBytes(48));
  const codeChallenge = base64UrlEncode(crypto.createHash("sha256").update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
}

function cleanupExpiredState() {
  const now = Date.now();
  for (const [state, data] of oauthStateStore.entries()) {
    if (now - data.createdAt > STATE_TTL_MS) {
      oauthStateStore.delete(state);
    }
  }
}

xAuthRouter.get("/start", async (req, res) => {
  try {
    const { address } = req.query;

    if (!address || !isAddress(String(address))) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    if (!config.xClientId || !config.xClientSecret || !config.xRedirectUri) {
      return res.status(500).json({
        error: "Missing X OAuth config. Set X_CLIENT_ID, X_CLIENT_SECRET and X_REDIRECT_URI."
      });
    }

    cleanupExpiredState();

    const state = base64UrlEncode(crypto.randomBytes(24));
    const { codeVerifier, codeChallenge } = createPkcePair();

    oauthStateStore.set(state, {
      codeVerifier,
      address: String(address),
      createdAt: Date.now()
    });

    const authUrl = new URL("https://x.com/i/oauth2/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", config.xClientId);
    authUrl.searchParams.set("redirect_uri", config.xRedirectUri);
    authUrl.searchParams.set("scope", "users.read tweet.read offline.access");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    return res.json({ authUrl: authUrl.toString() });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to start X OAuth flow",
      details: error?.message || "Unknown error"
    });
  }
});

xAuthRouter.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    const redirect = new URL(config.frontendUrl);
    redirect.searchParams.set("x_error", String(error));
    return res.redirect(redirect.toString());
  }

  if (!code || !state) {
    const redirect = new URL(config.frontendUrl);
    redirect.searchParams.set("x_error", "missing_code_or_state");
    return res.redirect(redirect.toString());
  }

  cleanupExpiredState();

  const stateData = oauthStateStore.get(String(state));
  oauthStateStore.delete(String(state));

  if (!stateData) {
    const redirect = new URL(config.frontendUrl);
    redirect.searchParams.set("x_error", "invalid_or_expired_state");
    return res.redirect(redirect.toString());
  }

  try {
    const basicAuth = Buffer.from(`${config.xClientId}:${config.xClientSecret}`).toString("base64");
    const tokenResponse = await fetch("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: String(code),
        redirect_uri: config.xRedirectUri,
        client_id: config.xClientId,
        code_verifier: stateData.codeVerifier
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData?.access_token) {
      const redirect = new URL(config.frontendUrl);
      const errorCode = tokenData?.error || "token_exchange_failed";
      redirect.searchParams.set("x_error", errorCode);
      return res.redirect(redirect.toString());
    }

    const userResponse = await fetch(
      "https://api.x.com/2/users/me?user.fields=profile_image_url,name,username",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      }
    );

    const userData = await userResponse.json();
    const profile = userData?.data;

    if (!userResponse.ok || !profile?.username) {
      const redirect = new URL(config.frontendUrl);
      redirect.searchParams.set("x_error", "profile_fetch_failed");
      return res.redirect(redirect.toString());
    }

    const redirect = new URL(config.frontendUrl);
    redirect.searchParams.set("x_connected", "1");
    redirect.searchParams.set("x_username", `@${profile.username}`);
    redirect.searchParams.set("x_profile_image", profile.profile_image_url || "");
    redirect.searchParams.set("x_address", stateData.address);
    return res.redirect(redirect.toString());
  } catch {
    const redirect = new URL(config.frontendUrl);
    redirect.searchParams.set("x_error", "oauth_callback_failed");
    return res.redirect(redirect.toString());
  }
});

xAuthRouter.get("/avatar", async (req, res) => {
  try {
    const source = String(req.query.url || "");
    if (!source) {
      return res.status(400).json({ error: "Missing url" });
    }

    const parsed = new URL(source);
    const isHttps = parsed.protocol === "https:";
    const allowedHost =
      parsed.hostname === "pbs.twimg.com" || parsed.hostname === "abs.twimg.com";

    if (!isHttps || !allowedHost) {
      return res.status(400).json({ error: "Unsupported avatar host" });
    }

    const upstream = await fetch(parsed.toString());
    if (!upstream.ok) {
      return res.status(404).json({ error: "Avatar not found" });
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(Buffer.from(arrayBuffer));
  } catch {
    return res.status(404).json({ error: "Avatar fetch failed" });
  }
});

export default xAuthRouter;
