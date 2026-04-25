import { Router } from "express";
import { Contract, JsonRpcProvider, isAddress } from "ethers";
import { config, minimalErc721Abi } from "../config.js";

const verifyRouter = Router();

verifyRouter.post("/", async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || !isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    if (!config.rpcUrl || !config.nftContractAddress) {
      return res.status(500).json({
        error: "Missing RPC_URL or NFT_CONTRACT_ADDRESS in backend environment"
      });
    }

    const provider = new JsonRpcProvider(config.rpcUrl);
    const nftContract = new Contract(config.nftContractAddress, minimalErc721Abi, provider);

    // balanceOf > 0 means the wallet holds at least one NFT from this collection.
    const balance = await nftContract.balanceOf(address);
    const nftCount = Number(balance);
    const ownsNFT = nftCount > 0;

    return res.json({ ownsNFT, nftCount });
  } catch (error) {
    return res.status(500).json({
      error: "Verification failed",
      details: error?.message || "Unknown error"
    });
  }
});

export default verifyRouter;
