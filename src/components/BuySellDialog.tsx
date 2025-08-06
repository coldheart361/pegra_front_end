// components/BuySellDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ethers } from "ethers";

interface BuySellDialogProps {
  type: "buy" | "sell";
  assetName: string;
  assetSymbol: string;
  assetPrice: number;
  tokenAddress: string;
  exchange: ethers.Contract;
}

export function BuySellDialog({
  type,
  assetName,
  assetSymbol,
  assetPrice,
  tokenAddress,
  exchange,
}: BuySellDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const parsedAmount = parseFloat(amount);
  const totalPrice = isNaN(parsedAmount)
    ? 0
    : parsedAmount * assetPrice;

  const handleTransaction = async () => {
    try {
      setLoading(true);
      const parsed = ethers.parseUnits(amount, 18);

      const tx =
        type === "buy"
          ? await exchange.buyToken(tokenAddress, parsed)
          : await exchange.sellToken(tokenAddress, parsed);

      await tx.wait();
      alert(`${type === "buy" ? "Buy" : "Sell"} successful!`);
      setOpen(false);
      setAmount("");
    } catch (error) {
      console.error(`${type} failed:`, error);
      alert(`${type} failed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={type === "buy" ? "default" : "outline"}>
          {type === "buy" ? "Buy" : "Sell"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "buy" ? "Buy" : "Sell"} {assetName} ({assetSymbol})
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <Input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount to ${type}`}
            />
          </div>
          <div className="text-sm text-gray-700">
            Price per token: <strong>${assetPrice.toFixed(2)}</strong>
          </div>
          <div className="text-sm text-gray-700">
            Total {type === "buy" ? "cost" : "revenue"}:{" "}
            <strong>${totalPrice.toFixed(2)}</strong>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleTransaction} disabled={loading}>
              {loading
                ? `${type === "buy" ? "Buying" : "Selling"}...`
                : `Confirm ${type === "buy" ? "Purchase" : "Sell"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
