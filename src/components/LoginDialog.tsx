// components/LoginDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: () => void;
}

export function LoginDialog({ open, onOpenChange, onLogin }: LoginDialogProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        "http://localhost:18080/user/login",
        {
          emailOrUsername: form.usernameOrEmail,
          password: form.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const login_token = res.data.token;
      localStorage.setItem("token", JSON.stringify(login_token));
      const user = await axios.get("http://localhost:18080/user/me", {
        headers: {
          Authorization: `Bearer ${login_token}`,
        },
      });
      localStorage.setItem("user", JSON.stringify(user.data));
      onLogin();
      setForm({ usernameOrEmail: "", password: "" });
      onOpenChange(false);
      navigate("/account");
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login to Your Account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="usernameOrEmail">Email or Username</Label>
            <Input
              id="usernameOrEmail"
              type="text"
              placeholder="Username or Email"
              value={form.usernameOrEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              navigate("/register");
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            Register for an account
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
