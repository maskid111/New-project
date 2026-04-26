import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

// Always load env from backend/.env, regardless of process cwd.
dotenv.config({ path: envPath });

export const config = {
  port: Number(process.env.PORT || 5000),
  rpcUrl: process.env.RPC_URL || "",
  nftContractAddress: process.env.NFT_CONTRACT_ADDRESS || "",
  frontendUrl: process.env.FRONTEND_URL || "https://parrotpassio.vercel.app/",
  xClientId: process.env.X_CLIENT_ID || "",
  xClientSecret: process.env.X_CLIENT_SECRET || "",
  xRedirectUri: process.env.X_REDIRECT_URI || "https://parrotpass.onrender.com/auth/x/callback"
};

export const minimalErc721Abi = ["function balanceOf(address owner) view returns (uint256)"];
