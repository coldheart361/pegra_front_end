import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Coins } from "lucide-react";
import exchangeABI from "@/contracts/MultiTokenExchange.json";
import tokenABI from "@/contracts/FakeToken.json";
import { LoginDialog } from "@/components/LoginDialog";

const EXCHANGE_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const FUSD_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const RPC_URL = "http://127.0.0.1:8545";

interface Asset {
  address: string;
  name: string;
  balance: string;
}

export default function MyAssets() {
  const [fusdBalance, setFusdBalance] = useState<string>("0");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userJson, setUserJson] = useState<any | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const handleLogin = () => setIsDialogOpen(false);

  // ✅ Always run all hooks first
  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      setCheckingAuth(false);
      return;
    }

    try {
      const parsed = JSON.parse(userString);
      if (!parsed.wallet_address) throw new Error("Missing wallet address");
      setUserJson(parsed);
    } catch (e) {
      console.error("Invalid user data:", e);
    }

    setCheckingAuth(false);
  }, []);

  const getWallet = () => {
    if (!userJson) return null;
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(userJson.wallet_address, provider);
    const exchange = new ethers.Contract(
      EXCHANGE_ADDRESS,
      exchangeABI.abi,
      wallet
    );
    return { provider, wallet, exchange };
  };

  const fetchFusdBalance = async () => {
    const walletInfo = getWallet();
    if (!walletInfo) return;

    const { wallet, exchange } = walletInfo;
    const balance = await exchange.getUserBalance(wallet.address, FUSD_ADDRESS);
    setFusdBalance(ethers.formatUnits(balance, 18));
  };

  const handleQuickFusdDeposit = async () => {
    const walletInfo = getWallet();
    if (!walletInfo) return;

    try {
      const amount = ethers.parseUnits("100000", 18);
      const { wallet, provider, exchange } = walletInfo;
      const token = new ethers.Contract(FUSD_ADDRESS, tokenABI.abi, wallet);

      let nonce = await provider.getTransactionCount(wallet.address);

      const mintTx = await token.mint(wallet.address, amount, { nonce });
      await mintTx.wait();
      nonce++;

      const allowance = await token.allowance(wallet.address, EXCHANGE_ADDRESS);
      if (allowance < amount) {
        const approveTx = await token.approve(EXCHANGE_ADDRESS, amount, {
          nonce,
        });
        await approveTx.wait();
        nonce++;
      }

      const depositTx = await exchange.deposit(FUSD_ADDRESS, amount, {
        gasLimit: 100_000,
        nonce,
      });
      await depositTx.wait();

      alert("100,000 FUSD deposited successfully!");
      fetchFusdBalance();
    } catch (err) {
      console.error("Deposit failed:", err);
      alert("Deposit failed. See console for details.");
    }
  };

  useEffect(() => {
    if (!userJson) return;
    fetchFusdBalance();
  }, [userJson]);

  useEffect(() => {
    const fetchAssets = async () => {
      const walletInfo = getWallet();
      if (!walletInfo) return;

      setLoading(true);
      setError("");

      try {
        const { wallet, exchange } = walletInfo;
        const tokenInfos: { token: string; name: string }[] =
          await exchange.getSupportedTokens();

        const balances = await Promise.all(
          tokenInfos.map(async ({ token, name }) => {
            const rawBalance = await exchange.getUserBalance(
              wallet.address,
              token
            );
            return {
              address: token,
              name,
              balance: ethers.formatUnits(rawBalance, 18),
            };
          })
        );

        const fusdRaw = await exchange.getUserBalance(
          wallet.address,
          FUSD_ADDRESS
        );
        setFusdBalance(ethers.formatUnits(fusdRaw, 18));
        setAssets(balances);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch assets");
      } finally {
        setLoading(false);
      }
    };

    if (userJson) {
      fetchAssets();
    }
  }, [userJson]);

  // ✅ Now safe to conditionally render JSX (not hooks!)
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Checking login session...
      </div>
    );
  }

  if (!userJson) {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onLoginClick={() => {}} />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          My Wallet Assets
        </h1>
        <Card className="shadow-lg border border-gray-200">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Coins className="text-blue-600 w-5 h-5" />
              <span className="text-lg font-semibold text-gray-800">
                Synthetic Ledger Balances
              </span>
            </div>

            {loading && <p className="text-gray-600">Loading assets...</p>}
            {error && <p className="text-red-600">Error: {error}</p>}

            {!loading && (
              <>
                {fusdBalance === "0.0" && (
                  <div className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Quick FUSD Deposit
                    </h2>
                    <p className="text-gray-600">
                      Instantly deposit <strong>100,000 FUSD</strong> into your
                      synthetic balance.
                    </p>
                    <button
                      onClick={handleQuickFusdDeposit}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-md shadow"
                    >
                      Deposit 100,000 FUSD
                    </button>
                  </div>
                )}

                <p className="text-gray-700 font-medium">
                  💵 FUSD Balance:{" "}
                  <span className="font-bold">{fusdBalance}</span>
                </p>

                {assets.length === 0 ? (
                  <p className="text-gray-500">
                    No assets found in your wallet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {assets.map((asset, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-md bg-white shadow-sm"
                      >
                        <div className="text-sm text-gray-600 font-mono">
                          {asset.name}
                        </div>
                        <div className="text-right font-semibold text-gray-700">
                          {asset.balance}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
