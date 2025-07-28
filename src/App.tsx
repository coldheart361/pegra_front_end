// App.tsx
import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { LoginDialog } from "./components/LoginDialog";
import { Button } from "@/components/ui/button";

function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLogin = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onLoginClick={() => setIsDialogOpen(true)} />
      <LoginDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onLogin={handleLogin} />

      <main className="flex flex-col items-center justify-center mt-24 px-4 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Welcome to Pegra Capital</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          Pegra Capital is your all-in-one platform to Buy, Sell, and Manage your digital assets securely and efficiently.
        </p>
        <Button className="px-8 py-4 text-lg">Get Started</Button>
      </main>
    </div>
  );
}

export default App;
