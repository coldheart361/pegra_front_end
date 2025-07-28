import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, UserCircle, Wallet } from "lucide-react";
import { useSyncProviders } from "@/hooks/useSyncProviders";
import { formatAddress } from "@/utils";
import axios from "axios";

const baseUrlAPI = `http://localhost:18080`;

interface User {
  name: string;
  username: string;
  email: string;
}

interface ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
}

interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
  };
  provider: any;
}

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWallet, setSelectedWallet] =
    useState<ProviderInfo | null>(null);
  const [userAccount, setUserAccount] = useState<string>("");
  const navigate = useNavigate();
  const providers = useSyncProviders();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      console.log("No login information found. Please login first");
      navigate("/");
      return;
    }
    const user_json = JSON.parse(user);
    setUser(user_json);
    if (user_json.metamask_account != "") {
      setUserAccount(user_json.metamask_account);
      setSelectedWallet(user_json.wallet_provider);
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      const accounts: string[] | undefined =
        await providerWithInfo.provider.request({
          method: "eth_requestAccounts",
        });
      if (accounts?.[0]) {
        setSelectedWallet(providerWithInfo.info);
        setUserAccount(accounts[0]);
        console.log(providerWithInfo.info);
        const token_string = localStorage.getItem("token") as string;
        const token = JSON.parse(token_string);
        await axios.post(
          `${baseUrlAPI}/user/update_metamask_account`,
          {
            metamask_account: accounts[0],
            wallet_provider: providerWithInfo.info,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const user = await axios.get(`${baseUrlAPI}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        localStorage.setItem("user", JSON.stringify(user.data));
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  if (loading)
    return <div className="p-8 text-center text-gray-600">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onLoginClick={() => {}} />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Account Information
        </h1>

        <Card className="shadow-lg border border-gray-200">
          <CardContent className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <User className="text-blue-600" />
              <span className="text-gray-700 font-medium">Full Name:</span>
              <span className="text-gray-900">{user.name}</span>
            </div>

            <div className="flex items-center space-x-3">
              <UserCircle className="text-blue-600" />
              <span className="text-gray-700 font-medium">Username:</span>
              <span className="text-gray-900">{user.username}</span>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="text-blue-600" />
              <span className="text-gray-700 font-medium">Email:</span>
              <span className="text-gray-900">{user.email}</span>
            </div>

            <hr className="my-4" />

            {/* Wallet Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="text-blue-600 w-5 h-5" />
                <span className="text-lg font-semibold text-gray-800">
                  Connect to MetaMask
                </span>
              </div>

              {/* Show wallet connection status or buttons */}
              {userAccount && selectedWallet ? (
                <div className="flex items-center gap-4 border rounded-md bg-gray-50 p-4 shadow-sm">
                  <img
                    src={selectedWallet.icon}
                    alt={selectedWallet.name}
                    className="w-6 h-6"
                  />
                  <span className="text-gray-800 font-medium">
                    {selectedWallet.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatAddress(userAccount)}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {providers.length > 0 ? (
                    providers.map((provider: EIP6963ProviderDetail) => (
                      <Button
                        key={provider.info.uuid}
                        variant="outline"
                        onClick={() => handleConnect(provider)}
                        className="flex items-center gap-3 p-4 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                      >
                        <img
                          src={provider.info.icon}
                          alt={provider.info.name}
                          className="w-6 h-6"
                        />
                        <span className="text-gray-800 font-medium">
                          Connect {provider.info.name}
                        </span>
                      </Button>
                    ))
                  ) : (
                    <p className="text-gray-600 col-span-full">
                      No wallet providers detected.
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-10 flex justify-center">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </main>
    </div>
  );
}
