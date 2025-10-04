"use client";

import { useState, useTransition, useRef } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "./ui/loader";
import { useToast } from "@/hooks/use-toast";
import { extractExpenseDetails } from "@/ai/flows/extract-expense-flow";

export function ExpenseForm() {
  const [isScanning, startScanningTransition] = useTransition();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState<number | string>("");


  const handleAttachReceiptClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      startScanningTransition(async () => {
        try {
          const result = await extractExpenseDetails({ receiptDataUri: dataUri });
          setDescription(result.description);
          setExpenseDate(result.date);
          setCategory(result.category);
          setAmount(result.amount);
          toast({
            title: "Scan Complete",
            description: "Expense details have been extracted from the receipt.",
          });
        } catch (error) {
          console.error("Error scanning receipt:", error);
          toast({
            variant: "destructive",
            title: "Scan Failed",
            description: "Could not extract details from the provided image.",
          });
        }
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <DialogContent className="sm:max-w-[800px]">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <DialogHeader>
        <DialogTitle>New Expense</DialogTitle>
        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={handleAttachReceiptClick} disabled={isScanning}>
             {isScanning ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isScanning ? "Scanning..." : "Attach Receipt"}
          </Button>
          <div className="text-sm text-muted-foreground p-2 border rounded-md">
            Draft &gt; Waiting approval &gt; Approved
          </div>
        </div>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Team Lunch" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-date">Expense Date</Label>
            <div className="relative">
              <Input id="expense-date" type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} placeholder="Select date" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Meals" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paid-by">Paid By</Label>
            <Select>
              <SelectTrigger id="paid-by">
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="company">Company Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="total-amount">Total amount</Label>
            <div className="flex gap-2">
              <Input id="total-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 567" />
              <Select defaultValue="usd">
                <SelectTrigger id="currency" className="w-[120px]">
                  <SelectValue placeholder="USD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="gbp">GBP</SelectItem>
                  <SelectItem value="inr">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Input id="remarks" placeholder="Optional comments" />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Submit</Button>
      </DialogFooter>
    </DialogContent>
  );
}
