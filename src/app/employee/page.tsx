
"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/expense-form";
import { useToast } from "@/hooks/use-toast";
import { extractExpenseDetails } from "@/ai/flows/extract-expense-flow";
import { Loader } from "@/components/ui/loader";

type Expense = {
    employee: string;
    description: string;
    date: string;
    category: string;
    created: string;
    paidBy: string;
    remarks: string;
    amount: number;
    status: "Draft" | "Submitted" | "Approved";
}

const initialExpenses: Expense[] = [];

export default function EmployeePage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isScanning, startScanningTransition] = useTransition();

  const amountToSubmit = expenses
    .filter((e) => e.status === "Draft")
    .reduce((acc, e) => acc + e.amount, 0);
  const waitingApproval = expenses
    .filter((e) => e.status === "Submitted")
    .reduce((acc, e) => acc + e.amount, 0);
  const approvedAmount = expenses
    .filter((e) => e.status === "Approved")
    .reduce((acc, e) => acc + e.amount, 0);
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      startScanningTransition(async () => {
        try {
          const result = await extractExpenseDetails({ receiptDataUri: dataUri });
          
          if (!result.expenses || result.expenses.length === 0) {
            toast({
              variant: "destructive",
              title: "Scan Failed",
              description: "No expenses were found in the image.",
            });
            return;
          }

          const newExpenses: Expense[] = result.expenses.map(extracted => ({
            employee: extracted.employee || "New User",
            description: extracted.description,
            date: extracted.date,
            category: extracted.category,
            created: new Date().toISOString().split('T')[0],
            paidBy: "Employee",
            remarks: extracted.remarks || "",
            amount: extracted.amount,
            status: "Draft",
          }));

          setExpenses(prev => [...newExpenses, ...prev]);
          toast({
            title: "Scan Complete",
            description: `${newExpenses.length} new expense(s) have been added to your drafts.`,
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

    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };


  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 bg-background text-foreground">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
      />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Employee's View</h1>
        <div className="flex items-center gap-4">
           <Button onClick={handleUploadClick} disabled={isScanning}>
            {isScanning ? <Loader className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
            {isScanning ? "Scanning..." : "Upload"}
           </Button>
           <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Plus className="mr-2 h-4 w-4" />
                New
              </Button>
            </DialogTrigger>
            <ExpenseForm />
          </Dialog>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount to Submit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${amountToSubmit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total value of draft expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${waitingApproval.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">Expenses awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${approvedAmount.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">Sum of fully approved expenses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="border-r">Employee</TableHead>
              <TableHead className="border-r">Description</TableHead>
              <TableHead className="border-r">Date</TableHead>
              <TableHead className="border-r">Category</TableHead>
              <TableHead className="border-r">Created</TableHead>
              <TableHead className="border-r">Paid By</TableHead>
              <TableHead className="border-r">Remarks</TableHead>
              <TableHead className="text-right border-r">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense, index) => (
              <TableRow key={index} className="border-b">
                <TableCell className="border-r">{expense.employee}</TableCell>
                <TableCell className="border-r">{expense.description}</TableCell>
                <TableCell className="border-r">{expense.date}</TableCell>
                <TableCell className="border-r">{expense.category}</TableCell>
                <TableCell className="border-r">{expense.created}</TableCell>
                <TableCell className="border-r">{expense.paidBy}</TableCell>
                <TableCell className="border-r">{expense.remarks}</TableCell>
                <TableCell className="text-right border-r">${expense.amount.toFixed(2)}</TableCell>
                <TableCell>
                   <Badge variant={expense.status === 'Draft' ? 'destructive' : expense.status === 'Submitted' ? 'secondary' : 'default'}>
                    {expense.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
             {Array.from({ length: 4 - expenses.length > 0 ? 4 - expenses.length : 0 }).map((_, index) => (
              <TableRow key={`empty-${index}`} className="border-b">
                <TableCell className="border-r h-14"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
