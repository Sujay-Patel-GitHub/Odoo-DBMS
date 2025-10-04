
"use client";

import { useEffect, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ApprovalRuleSchema } from "@/lib/schemas";
import {
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveApprovalRule } from "@/app/actions";
import { Loader } from "@/components/ui/loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

type User = {
  id: string;
  name: string;
  role: "Manager" | "Employee" | "";
  manager?: string;
  email: string;
};

export function ApprovalRuleForm({ users }: { users: User[] }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ApprovalRuleSchema>>({
    resolver: zodResolver(ApprovalRuleSchema),
    defaultValues: {
      userId: "",
      ruleTitle: "",
      manager: "",
      approvers: [{ name: "", required: false }],
      isManagerApprover: true,
      approversSequence: false,
      minApprovalPercentage: 60,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "approvers",
  });

  const selectedUserId = form.watch("userId");

  useEffect(() => {
    if (selectedUserId) {
      const selectedUserDetails = users.find(
        (u) => u.id.toString() === selectedUserId
      );
      if (selectedUserDetails && selectedUserDetails.manager) {
        // Find the manager's ID
        const managerUser = users.find(m => m.name === selectedUserDetails.manager);
        form.setValue("manager", managerUser?.id || "", {
          shouldValidate: true,
        });
      } else {
        form.setValue("manager", "", { shouldValidate: true });
      }
    }
  }, [selectedUserId, users, form]);

  const onSubmit = (values: z.infer<typeof ApprovalRuleSchema>) => {
    startTransition(async () => {
      const result = await saveApprovalRule(values);
      if (result.success) {
        toast({
          title: "Success",
          description: result.success,
        });
        document.getElementById("close-dialog")?.click();
        form.reset();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const getManagerName = (managerId: string) => {
    return users.find(u => u.id === managerId)?.name || managerId;
  }

  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle className="text-primary text-2xl">Admin View: Approval View</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users
                          .filter((u) => u.name && u.email)
                          .map((user) => (
                            <SelectItem
                              key={user.id}
                              value={user.id.toString()}
                            >
                              {user.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ruleTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description about rules</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Approval rule for miscellaneous expenses"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a manager">
                             {field.value ? getManagerName(field.value) : "Select a manager"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users
                          .filter((user) => user.role === "Manager")
                          .map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground pt-1">
                        Initially the manager set on user record should be set, admin can change manager for approval if required.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <FormLabel>Approvers</FormLabel>
                    <FormField
                        control={form.control}
                        name="isManagerApprover"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isPending}
                                />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                Is manager an approver?
                                </FormLabel>
                            </FormItem>
                        )}
                    />
                </div>
                 <p className="text-xs text-muted-foreground -mt-2">
                    If this field is checked then by default the approve request would go to his/her manager first, before going to other approvers.
                </p>


                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Sr.</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="w-[100px] text-center">
                          Required
                        </TableHead>
                        <TableHead className="w-[50px] text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`approvers.${index}.name`}
                              render={({ field: fieldProps }) => (
                                <FormItem>
                                  <FormControl>
                                     <Select
                                      onValueChange={fieldProps.onChange}
                                      value={fieldProps.value}
                                      disabled={isPending}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="border-none">
                                          <SelectValue placeholder="Select approver" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {users
                                          .filter(u => u.name && u.email)
                                          .map((user) => (
                                          <SelectItem key={user.id} value={user.id}>
                                            {user.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <FormField
                              control={form.control}
                              name={`approvers.${index}.required`}
                              render={({ field: fieldProps }) => (
                                <FormItem className="flex justify-center">
                                  <FormControl>
                                    <Checkbox
                                      checked={fieldProps.value}
                                      onCheckedChange={fieldProps.onChange}
                                      disabled={isPending}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                           <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={isPending || fields.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: "", required: false })}
                    disabled={isPending}
                    >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Approver
                </Button>
              </div>

                <FormField
                    control={form.control}
                    name="approversSequence"
                    render={({ field }) => (
                        <FormItem className="flex flex-col gap-2 space-y-0">
                             <div className="flex items-center gap-2">
                                <FormControl>
                                    <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isPending}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                    Approvers Sequence
                                </FormLabel>
                            </div>
                            <p className="text-xs text-muted-foreground pl-6">
                                If this field is ticked true then the above mentioned sequence of approvers matters, that is first the request goes to John, if he approves/rejects then only request goes to mitchell and so on. If the required approver rejects the request, then expense request is auto-rejected. If not ticked then send approver request to all approvers at the same time.
                            </p>
                        </FormItem>
                    )}
                />

              <FormField
                control={form.control}
                name="minApprovalPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Approval percentage:</FormLabel>
                    <FormControl>
                       <div className="relative">
                         <Input
                          {...field}
                          type="number"
                          placeholder="e.g. 60"
                          className="pl-4 pr-6"
                          disabled={isPending}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 0)
                          }
                        />
                         <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
                       </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" id="close-dialog">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader className="mr-2 h-4 w-4" />
              ) : (
                "Create Rule"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
