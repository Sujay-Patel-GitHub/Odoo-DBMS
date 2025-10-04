
"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, CheckCircle2, XCircle } from "lucide-react";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { saveUsers, createEmployee } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ApprovalRuleForm } from "@/components/approval-rule-form";

type User = {
  id: string;
  name: string;
  role: "Manager" | "Employee" | "";
  manager?: string;
  email: string;
  inviteSent?: boolean;
};

type Status = "idle" | "success" | "error";

const initialUsers: User[] = [
  {
    id: '1',
    name: "",
    role: "",
    manager: "",
    email: "",
    inviteSent: false,
  },
  {
    id: '2',
    name: "",
    role: "",
    manager: "",
    email: "",
    inviteSent: false,
  },
  {
    id: '3',
    name: "",
    role: "",
    manager: "",
    email: "",
    inviteSent: false,
  },
];

export default function DashboardPage() {
  const { firestore } = useFirebase();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;
    
    const usersCollectionRef = collection(firestore, "organization_users");
    const unsubscribe = onSnapshot(usersCollectionRef, (querySnapshot) => {
      const fetchedUsers: User[] = [];
      querySnapshot.forEach((doc) => {
        // Use the document ID as the user's ID
        fetchedUsers.push({ id: doc.id, ...(doc.data() as Omit<User, 'id'>) });
      });

      if (fetchedUsers.length > 0) {
        setUsers(fetchedUsers);
      } else {
        setUsers(initialUsers);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users: ", error);
      setUsers(initialUsers);
      toast({
        title: "Error",
        description: "Could not fetch user data.",
        variant: "destructive",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast]);


  const handleUserChange = (
    index: number,
    field: keyof User,
    value: string | boolean
  ) => {
    const newUsers = [...users];
    const userId = newUsers[index].id;
    (newUsers[index] as any)[field] = value;
    setUsers(newUsers);

    // Reset status when email changes
    if (field === 'email') {
      setStatuses(prev => ({...prev, [userId]: 'idle'}));
      newUsers[index].inviteSent = false;
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveUsers(users);
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
  
  const handleCreateEmployee = (user: User) => {
     if (!user.email || !user.role) {
      toast({
        title: "Error",
        description: "Email and Role are required to create an employee.",
        variant: "destructive",
      });
      return;
    }
    startTransition(async () => {
      const result = await createEmployee({email: user.email});
       if (result.success) {
        toast({
          title: "Success",
          description: result.success,
        });
        setStatuses(prev => ({...prev, [user.id]: 'success'}));
        // Local state will be updated by the onSnapshot listener
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        setStatuses(prev => ({...prev, [user.id]: 'error'}));
      }
    });
  }

  const addNewUserRow = () => {
    // Generate a more robust unique ID for the new row to prevent key collisions
    const newId = `new-user-${Date.now()}-${Math.random()}`;
    setUsers([
      ...users,
      {
        id: newId,
        name: "",
        role: "",
        manager: "",
        email: "",
        inviteSent: false,
      },
    ]);
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
       <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={addNewUserRow}>
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                NEW
              </Button>
            </DialogTrigger>
            <ApprovalRuleForm users={users} />
          </Dialog>
        </div>
         <h1 className="text-3xl font-bold text-center text-primary flex-1">
          Admin View: Approval View
        </h1>
        {/* Placeholder to balance flexbox */}
        <div className="flex gap-2" style={{ visibility: 'hidden' }}>
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Row
            </Button>
             <Button>
                <Plus className="mr-2 h-4 w-4" />
                NEW
            </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="border-r">Sr. No.</TableHead>
              <TableHead className="border-r">User Name</TableHead>
              <TableHead className="border-r">Role</TableHead>
              <TableHead className="border-r">Assigned Manager</TableHead>
              <TableHead className="border-r">Email</TableHead>
              <TableHead className="text-center border-r">Actions</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={`${user.id}-${index}`}>
                <TableCell className="border-r">{index + 1}</TableCell>
                <TableCell className="border-r">
                   <Input 
                    placeholder="Enter user name" 
                    value={user.name}
                    onChange={(e) => handleUserChange(index, "name", e.target.value)}
                   />
                </TableCell>
                <TableCell className="border-r">
                  <Select
                     value={user.role}
                     onValueChange={(value) => handleUserChange(index, "role", value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select role"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="border-r">
                  <Select
                      value={user.manager}
                      onValueChange={(value) => handleUserChange(index, "manager", value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          .filter((u) => u.role === "Manager" && u.id !== user.id)
                          .map((manager, managerIndex) => (
                            <SelectItem key={`${manager.id}-${managerIndex}`} value={manager.name}>
                              {manager.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                </TableCell>
                <TableCell className="border-r">
                   <Input 
                    placeholder="Enter email"
                    type="email"
                    value={user.email}
                    onChange={(e) => handleUserChange(index, "email", e.target.value)}
                   />
                </TableCell>
                <TableCell className="text-center border-r">
                    <Button 
                      size="sm" 
                      onClick={() => handleCreateEmployee(user)}
                      disabled={isPending || !user.email}
                     >
                       Send Password
                    </Button>
                </TableCell>
                <TableCell className="text-center">
                    {user.inviteSent ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <>
                        {statuses[user.id] === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />}
                        {statuses[user.id] === 'error' && <XCircle className="h-5 w-5 text-red-500 mx-auto" />}
                      </>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader className="mr-2 h-4 w-4" /> : "Save"}
        </Button>
      </div>
    </div>
  );
}
