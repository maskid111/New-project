import { getAddress, isAddress } from "ethers";

export function normalizeAddress(address) {
  if (!address || !isAddress(address)) {
    throw new Error("Invalid wallet address");
  }

  return getAddress(address);
}
