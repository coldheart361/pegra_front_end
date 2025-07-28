import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Coins } from "lucide-react";

const MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API_KEY;

interface Asset {
  name: string;
  symbol: string;
  balance: string;
  logo?: string;
  decimals?: number;
}

export default function MyAssets() {
  const [userAccount, setUserAccount] = useState<string>("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const user_string = localStorage.getItem("user");
    if (!user_string) {
      console.log("Please log in first!");
      return;
    }
    const user_json = JSON.parse(user_string);
    setUserAccount(user_json.metamask_account);
  }, []);

  // Fetch ERC20 token balances from Moralis API
  useEffect(() => {
    if (!userAccount) {
      setAssets([]);
      return;
    }

    const fetchAssets = async () => {
      setLoadingAssets(true);
      setError("");
      try {
        const response = await fetch(
          `https://deep-index.moralis.io/api/v2/${userAccount}/erc20?chain=eth`,
          {
            headers: {
              "X-API-Key": MORALIS_API_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch assets: ${response.statusText}`);
        }

        const data = await response.json();

        // data is an array of tokens with keys: name, symbol, balance, decimals, logo
        // balance is a string in wei units, need to format decimals

        const formattedAssets: Asset[] = data.map((token: any) => {
          const decimals = token.decimals || 18;
          const rawBalance = token.balance || "0";

          // convert balance from wei (string) to human readable float string
          const formattedBalance = (Number(rawBalance) / 10 ** decimals)
            .toFixed(6)
            .replace(/\.?0+$/, "");

          return {
            name: token.name,
            symbol: token.symbol,
            balance: formattedBalance,
            logo: token.logo || undefined,
            decimals,
          };
        });

        setAssets(formattedAssets);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load assets");
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchAssets();
  }, [userAccount, MORALIS_API_KEY]);


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
                Assets
              </span>
            </div>

            {!userAccount && (
              <p className="text-gray-600">
                Please login or connect to Metamask first before seeing your assets.
              </p>
            )}

            {loadingAssets && (
              <p className="text-gray-600">Loading assets...</p>
            )}
            {error && <p className="text-red-600">Error: {error}</p>}

            {!loadingAssets && assets.length === 0 && userAccount && (
              <p className="text-gray-500">No assets found in your wallet.</p>
            )}

            {assets.length > 0 && (
              <div className="space-y-4">
                {assets.map((asset, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-md bg-white shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {asset.logo && (
                        <img
                          src={asset.logo}
                          alt={asset.name}
                          className="w-6 h-6"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-800">
                          {asset.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {asset.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-semibold text-gray-700">
                      {asset.balance}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
