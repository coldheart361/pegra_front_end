// pages/Account.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, UserCircle } from "lucide-react";

interface User {
  name: string;
  username: string;
  email: string;
}

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = localStorage.getItem("user");
        if (!user) {
          console.log("No login information found. Please login first");
          return;
        }
        const user_info = JSON.parse(user);
        setUser(user_info);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onLoginClick={() => {}} />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Account Information</h1>

        <Card className="shadow-lg border border-gray-200">
          <CardContent className="p-6 space-y-6">
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
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </main>
    </div>
  );
}