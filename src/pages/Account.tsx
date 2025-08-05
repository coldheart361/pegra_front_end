import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, UserCircle, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface User {
  name: string;
  username: string;
  email: string;
  wallet_address: string;
}

const baseUrlAPI = "http://localhost:18080";

export default function Account() {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [userAccount, setUserAccount] = useState<string>("");
  const [showDialog, setShowDialog] = useState(false);
  const [inputAddress, setInputAddress] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      console.log("No login information found. Please login first");
      navigate("/");
      return;
    }

    const userJson = JSON.parse(userStr);
    setUser(userJson);

    if (userJson.wallet_address) {
      setUserAccount(userJson.wallet_address);
    }

    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleSaveWallet = async () => {
    const address = inputAddress.trim();
    try {
      if (!user) {
        alert("No login information found");
        return;
      }

      const login_token = localStorage.getItem("token") as string;
      const token = JSON.parse(login_token);
      console.log(token);

      await axios.post(
        `${baseUrlAPI}/user/update_wallet`,
        {
          wallet_address: address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const res = await axios.get(`${baseUrlAPI}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.setItem("user", JSON.stringify(res.data));

      console.log(res.data);
      setUser(res.data);
      setUserAccount(address);
      setShowDialog(false);
    } catch (err) {
      console.error("Failed to save wallet:", err);
      alert("Error saving wallet address");
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
                  Connect to Your Wallet
                </span>
              </div>

              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                {userAccount ? (
                  <div className="flex flex-col gap-3 border rounded-md bg-gray-50 p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-800 font-medium">
                        Wallet Address
                      </span>
                      <span className="text-sm text-gray-500">
                        {userAccount}
                      </span>
                    </div>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-fit">
                        Update Wallet Address
                      </Button>
                    </DialogTrigger>
                  </div>
                ) : (
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-2">
                      Enter Wallet Address
                    </Button>
                  </DialogTrigger>
                )}

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Enter Wallet Address</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="0x..."
                      value={inputAddress}
                      onChange={(e) => setInputAddress(e.target.value)}
                    />
                    <Button onClick={handleSaveWallet}>Save Address</Button>
                  </div>
                </DialogContent>
              </Dialog>
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
