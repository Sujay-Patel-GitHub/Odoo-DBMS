
"use client";

import { useState, useEffect, useTransition } from "react";
import { useFirebase } from "@/firebase";
import {
  collection,
  onSnapshot,
  writeBatch,
  doc,
} from "firebase/firestore";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { updateApprovalStatus } from "@/app/actions";

type Approval = {
  id: string;
  subject: string;
  owner: string;
  category: string;
  status: "Approved" | "Pending" | "Rejected";
  amount: {
    value: number;
    currency: string;
    convertedValue: number;
  };
};

const sampleApprovals: Omit<Approval, "id">[] = [
  {
    subject: "Client Dinner",
    owner: "Sarah",
    category: "Food",
    status: "Pending",
    amount: {
      value: 67.3,
      currency: "USD",
      convertedValue: 5619,
    },
  },
  {
    subject: "Team Offsite Transport",
    owner: "John Doe",
    category: "Travel",
    status: "Pending",
    amount: {
      value: 250,
      currency: "USD",
      convertedValue: 20875,
    },
  },
  {
    subject: "Software Subscription",
    owner: "Jane Smith",
    category: "Software",
    status: "Approved",
    amount: {
      value: 99,
      currency: "USD",
      convertedValue: 8266.5,
    },
  },
];


export default function ManagerPage() {
  const { firestore } = useFirebase();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;
    setLoading(true);

    const approvalsCollectionRef = collection(firestore, "approvals");
    const unsubscribe = onSnapshot(
      approvalsCollectionRef,
      async (querySnapshot) => {
        if (querySnapshot.empty) {
          // If no data, populate with sample data
          console.log("No approvals found. Populating with sample data.");
          const batch = writeBatch(firestore);
          sampleApprovals.forEach((approval) => {
            const docRef = doc(approvalsCollectionRef);
            batch.set(docRef, approval);
          });
          await batch.commit();
          // The snapshot listener will be re-triggered with the new data
        } else {
          const fetchedApprovals: Approval[] = [];
          querySnapshot.forEach((doc) => {
            fetchedApprovals.push({ id: doc.id, ...doc.data() } as Approval);
          });
          setApprovals(fetchedApprovals);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching approvals:", error);
        toast({
          title: "Error",
          description: "Could not fetch approval data.",
          variant: "destructive",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, toast]);
  
  const handleStatusUpdate = (id: string, status: "Approved" | "Rejected") => {
    startTransition(async () => {
      const result = await updateApprovalStatus(id, status);
      if (result.success) {
        toast({
          title: "Success",
          description: result.success,
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const getStatusBadgeVariant = (status: Approval["status"]) => {
    switch (status) {
      case "Approved":
        return "default";
      case "Pending":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold text-primary">Manager's View</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Approvals to review</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Approval Subject</TableHead>
                <TableHead>Request Owner</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Request Status</TableHead>
                <TableHead>Total amount (in company's currency)</TableHead>
                <TableHead className="text-center" colSpan={2}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell>{approval.subject || 'none'}</TableCell>
                  <TableCell>{approval.owner}</TableCell>
                  <TableCell>{approval.category}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(approval.status)}>
                      {approval.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>{`${approval.amount.value} ${approval.amount.currency}`}</div>
                    <div className="text-muted-foreground text-sm">
                      = {approval.amount.convertedValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                    </div>
                  </TableCell>
                  <TableCell className="w-[120px]">
                     <Button 
                       variant="outline" 
                       size="sm"
                       className="w-full border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                       onClick={() => handleStatusUpdate(approval.id, 'Approved')}
                       disabled={isPending || approval.status !== 'Pending'}
                      >
                      Approve
                    </Button>
                  </TableCell>
                  <TableCell className="w-[120px]">
                     <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleStatusUpdate(approval.id, 'Rejected')}
                        disabled={isPending || approval.status !== 'Pending'}
                      >
                        Reject
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
               {Array.from({ length: 5 - approvals.length > 0 ? 5 - approvals.length : 0 }).map((_, index) => (
                  <TableRow key={`empty-${index}`} className="h-[73px]">
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    