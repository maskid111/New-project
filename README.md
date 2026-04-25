# ParrotPass - Full-Stack NFT-Gated Dashboard

This project includes:

- `backend/` - Express API using `ethers.js` to verify NFT ownership and return activity rank data.
- `frontend/` - Next.js (App Router) dashboard UI with address input, real X OAuth flow, and downloadable share card.

## Project Structure

```text
root/
  backend/
    src/
      server.js
      config.js
      routes/
        verify.js
        activity.js
  frontend/
    app/
      layout.js
      page.js
    components/
      WalletInput.js
      VerificationState.js
      XProfileSection.js
      DashboardCard.js
      DownloadActions.js
    lib/
      api.js
      web3.js
```

## 1) Backend Setup

1. Go to backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` from example:

```bash
cp .env.example .env
```

4. Paste your values into `backend/.env`:

- `RPC_URL`: your Monad RPC endpoint
- `NFT_CONTRACT_ADDRESS`: deployed ParrotPass ERC-721 contract address
- `FRONTEND_URL`: frontend URL for OAuth callback redirect
- `X_CLIENT_ID`: X app OAuth 2.0 client ID
- `X_CLIENT_SECRET`: X app OAuth 2.0 client secret
- `X_REDIRECT_URI`: should match your X app callback URL (default: `http://localhost:5000/auth/x/callback`)

Example:

```env
PORT=5000
RPC_URL=https://testnet-rpc.monad.xyz
NFT_CONTRACT_ADDRESS=0xYourParrotPassNftContractAddress
FRONTEND_URL=http://localhost:3000
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret
X_REDIRECT_URI=http://localhost:5000/auth/x/callback
```

5. Run backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

## 2) Frontend Setup

1. Open a new terminal and go to frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` from example:

```bash
cp .env.local.example .env.local
```

4. Ensure API URL is set:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

5. Run frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`.

## API Endpoints

### `POST /verify`

Input:

```json
{
  "address": "0x..."
}
```

Output:

```json
{
  "ownsNFT": true,
  "nftCount": 1
}
```

### `GET /activity/:address`

Output:

```json
{
  "totalTransactions": 1234,
  "tierName": "Parrot Pro",
  "tierRemark": "Deep in the ecosystem"
}
```

## Notes

- No contracts are deployed by this project.
- NFT ownership check is read-only using ERC-721 `balanceOf(address)`.
- Activity endpoint uses `getTransactionCount` where supported and deterministic mock fallback otherwise.
- Frontend flow is: verify address -> connect X (real OAuth) -> generate/download/share ParrotPass card.
