// pages/Register.tsx
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { LoginDialog } from "@/components/LoginDialog";

export default function Register() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
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
      const res = await axios.post("http://localhost:18080/user/register",{
        username: form.username,
        email: form.email,
        name: form.name,
        password: form.password
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log(res.data);
      alert("Account registered successfully!");
      setForm({ name: "", username: "", email: "", password: "" });
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onLoginClick={() => setIsDialogOpen(true)} />
      <LoginDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onLogin={() => setIsDialogOpen(false)}
      />

      <main className="flex flex-col items-center justify-start pt-16 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Create an Account
          </h1>
          <p className="text-gray-600 mt-2">
            Join Pegra Capital and start managing your digital assets today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
            />
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={form.username}
              onChange={handleChange}
              required
              placeholder="Username"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              className="text-blue-600 hover:underline font-medium"
            >
              Login here
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}
