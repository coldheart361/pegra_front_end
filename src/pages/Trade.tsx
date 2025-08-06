import { useEffect, useMemo, useState } from "react";
import { ethers, ContractFactory } from "ethers";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginDialog } from "@/components/LoginDialog";
import exchangeABI from "@/contracts/MultiTokenExchange.json";
import fakeTokenArtifact from "@/contracts/FakeToken.json";
import { BuySellDialog } from "@/components/BuySellDialog";

const EXCHANGE_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const RPC_URL = "http://127.0.0.1:8545";

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  tokenAddress?: string;
}

interface TokenInfo {
  name: string;
  token: string;
}

type SupportedTokens = TokenInfo[];

export default function TopAssets() {
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleLogin = () => setIsDialogOpen(false);

  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), []);
  const wallet = useMemo(() => {
    if (!privateKey) return null;
    return new ethers.Wallet(privateKey, provider);
  }, [privateKey, provider]);

  const contract = useMemo(() => {
    if (!wallet) return null;
    return new ethers.Contract(EXCHANGE_ADDRESS, exchangeABI.abi, wallet);
  }, [wallet]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.wallet_address) {
          setPrivateKey(parsed.wallet_address);
        }
      } catch (e) {
        console.error("Failed to parse wallet info:", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchAndCheckAssets = async (): Promise<void> => {
      if (!wallet) return;
      if (!contract) return;

      try {
        // Fetch top 30 coins from CoinGecko
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=false"
        );
        const data: CryptoAsset[] = await res.json();

        // Get supported tokens from exchange
        const supportedTokens: SupportedTokens =
          await contract.getSupportedTokens();

        let updated_assets: CryptoAsset[] = [];
        let nonce = await wallet.getNonce();

        for (const asset of data) {
          const matchedToken = supportedTokens.find(
            (t) => t.name === asset.name
          );
          const isAlreadySupported = matchedToken !== undefined;

          if (isAlreadySupported) {
            updated_assets.push({
              name: asset.name,
              image: asset.image,
              id: asset.id,
              symbol: asset.symbol,
              current_price: asset.current_price,
              price_change_percentage_24h: asset.price_change_percentage_24h,
              tokenAddress: matchedToken.token,
            });
          } else {
            try {
              const fakeTokenFactory = new ContractFactory(
                fakeTokenArtifact.abi,
                fakeTokenArtifact.bytecode,
                wallet
              );

              const newToken = (await fakeTokenFactory.deploy(
                asset.name,
                asset.symbol.toUpperCase(),
                { nonce }
              )) as ethers.Contract & {
                mint: (
                  to: string,
                  amount: bigint,
                  overrides?: { nonce?: number }
                ) => Promise<ethers.ContractTransactionResponse>;
              };

              nonce++;
              await newToken.waitForDeployment();

              const tokenAddress = await newToken.getAddress();

              const mintAmount = ethers.parseUnits("1000000", 18);
              const mintTx = await newToken.mint(wallet.address, mintAmount, {
                nonce,
              });
              nonce++;
              await mintTx.wait();

              const priceInFUSD = ethers.parseUnits(
                asset.current_price.toString(),
                18
              );
              const addTokenTx = await contract.addToken(
                tokenAddress,
                asset.name,
                priceInFUSD,
                { nonce }
              );
              nonce++;
              await addTokenTx.wait();

              console.log(
                `Created and registered token for ${asset.name}: ${tokenAddress}`
              );

              updated_assets.push({
                name: asset.name,
                image: asset.image,
                id: asset.id,
                symbol: asset.symbol,
                current_price: asset.current_price,
                price_change_percentage_24h: asset.price_change_percentage_24h,
                tokenAddress,
              });
            } catch (err) {
              console.error(`Failed to create token for ${asset.name}:`, err);
            }
          }
        }

        setAssets(updated_assets);
      } catch (error) {
        console.error("Error fetching or checking assets:", error);
      }
    };

    if (wallet) {
      fetchAndCheckAssets();
      const interval = setInterval(fetchAndCheckAssets, 900_000);
      return () => clearInterval(interval);
    }
  }, [wallet]);

  // 🧾 Handle no wallet case
  if (!privateKey) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar onLoginClick={() => setIsDialogOpen(true)} />
        <LoginDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onLogin={handleLogin}
        />
        <main className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Please connect to your wallet
          </h1>
          <p className="text-gray-600 mb-4">
            You need to connect your existing wallet to use the exchange
            features.
          </p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md shadow"
          >
            Connect Wallet
          </button>
        </main>
      </div>
    );
  }

  // 🧾 Loading state
  if (assets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar onLoginClick={() => setIsDialogOpen(true)} />
        <LoginDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onLogin={handleLogin}
        />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
            Trade your Crypto Assets
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 flex flex-col gap-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // 🧾 Final render with data
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onLoginClick={() => setIsDialogOpen(true)} />
      <LoginDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onLogin={handleLogin}
      />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          Trade your Crypto Assets
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img src={asset.image} alt={asset.name} className="w-8 h-8" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {asset.name}
                    </h2>
                    <p className="text-sm text-gray-500 uppercase">
                      {asset.symbol}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-800">
                  ${asset.current_price.toLocaleString()}
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${
                    asset.price_change_percentage_24h >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {asset.price_change_percentage_24h.toFixed(2)}% in 24 hours
                </p>
                <div className="mt-4 flex gap-2">
                  {contract && asset.tokenAddress && (
                    <>
                      <BuySellDialog
                        type="buy"
                        assetName={asset.name}
                        assetSymbol={asset.symbol}
                        assetPrice={asset.current_price}
                        tokenAddress={asset.tokenAddress}
                        exchange={contract}
                      />
                      <BuySellDialog
                        type="sell"
                        assetName={asset.name}
                        assetSymbol={asset.symbol}
                        assetPrice={asset.current_price}
                        tokenAddress={asset.tokenAddress}
                        exchange={contract}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
