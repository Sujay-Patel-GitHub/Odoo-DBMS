
"use server";

import * as z from "zod";
import { auth } from "@/lib/firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { collection, doc, setDoc, writeBatch, getFirestore, addDoc, serverTimestamp, query, where, getDocs, updateDoc, getDoc } from "firebase/firestore";
import { SignInSchema, SignUpSchema, ForgotPasswordSchema, ApprovalRuleSchema } from "@/lib/schemas";
import { getApp } from "firebase/app";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";


export async function signUp(values: z.infer<typeof SignUpSchema>) {
  const validatedFields = SignUpSchema.safeParse(values);
  const db = getFirestore(getApp());

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name, country } = validatedFields.data;

  try {
    const orgUserQuery = query(collection(db, "organization_users"), where("email", "==", email));
    const orgUserSnapshot = await getDocs(orgUserQuery);
    
    if (!orgUserSnapshot.empty) {
      // User exists in organization, don't overwrite role
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
       await setDoc(doc(db, "users", user.uid), {
        name,
        country,
      });

    } else {
       // User does not exist in organization, create them as an employee
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const batch = writeBatch(db);
      
      const userRef = doc(db, "users", user.uid);
      batch.set(userRef, { name, country });

      const orgUserRef = doc(collection(db, "organization_users"));
      batch.set(orgUserRef, {
        id: orgUserRef.id,
        email,
        name,
        role: "Employee",
        manager: "",
        inviteSent: false,
      });

      await batch.commit();
    }


    return { success: "Account created successfully! Redirecting to login..." };
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      return { error: "This email is already registered." };
    }
    return { error: "An unexpected error occurred." };
  }
}

export async function signIn(values: z.infer<typeof SignInSchema>) {
  const validatedFields = SignInSchema.safeParse(values);
  const db = getFirestore(getApp());

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;
  
  // Special case for manager@gmail.com
  if (email === 'manager@gmail.com' && password === 'manager123') {
    // We don't need to actually sign in with Firebase for the hardcoded user
    return { success: "Signed in successfully! Redirecting...", role: "Manager" };
  }


  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const signedInUser = userCredential.user;

    // Special case for sujaypatel07@gmail.com
    if (signedInUser.email === 'sujaypatel07@gmail.com') {
      return { success: "Signed in successfully! Redirecting...", role: "Admin" };
    }
    
    // After successful sign-in, fetch user's role
    const usersCollectionRef = collection(db, "organization_users");
    const q = query(usersCollectionRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Sign out the user if they don't have a role in the organization
      await signOut(auth);
      return { error: "You are not authorized to access this application." };
    }

    const userDoc = querySnapshot.docs[0].data();
    const role = userDoc.role;

    if (!role) {
      await signOut(auth);
      return { error: "Your role is not defined. Please contact an admin." };
    }

    return { success: "Signed in successfully! Redirecting...", role };

  } catch (error: any) {
    switch (error.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return { error: "Invalid email or password." };
      default:
        return { error: "An unexpected error occurred." };
    }
  }
}

export async function sendPasswordReset(
  values: z.infer<typeof ForgotPasswordSchema>
) {
  const validatedFields = ForgotPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid email!" };
  }

  const { email } = validatedFields.data;

  try {
    await sendPasswordResetEmail(auth, email);
    return { success: "Password reset email sent!" };
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
       return { error: "No user found with this email." };
    }
    return { error: "Failed to send password reset email." };
  }
}

export async function logOut() {
  try {
    await signOut(auth);
    return { success: "Logged out successfully." };
  } catch (error) {
    return { error: "Failed to log out." };
  }
}

type User = {
  id: number;
  name: string;
  role: "Manager" | "Employee" | "";
  manager?: string;
  email: string;
  inviteSent?: boolean;
};

export async function saveUsers(users: User[]) {
  const db = getFirestore(getApp());
  try {
    const batch = writeBatch(db);
    const usersCollectionRef = collection(db, "organization_users");

    users.forEach((user) => {
      if (user.email) { // Use email as the document ID
        const userDocRef = doc(usersCollectionRef, user.email);
        const userData: Partial<User> = { ...user };
        // Ensure inviteSent is not overwritten to false if it's already true
        if (user.inviteSent) {
          userData.inviteSent = true;
        } else {
          // If it's not explicitly true, don't include it in the merge
          // so we don't overwrite a true value in the DB with undefined.
          delete userData.inviteSent; 
        }
        batch.set(userDocRef, userData, { merge: true });
      }
    });

    await batch.commit()
     .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: usersCollectionRef.path,
          operation: 'write',
          requestResourceData: users,
        });

        errorEmitter.emit('permission-error', permissionError);
        // We throw the original error so the client-side promise rejects
        throw serverError;
      });

    return { success: "Users saved successfully!" };
  } catch (error) {
    // This will now catch the re-thrown permission error
    // or other errors during the process.
    console.error("Error in saveUsers action:", error);
    return { error: "Failed to save users." };
  }
}

export async function saveApprovalRule(values: z.infer<typeof ApprovalRuleSchema>) {
  const db = getFirestore(getApp());
  const currentUser = auth.currentUser;
  
  const validatedFields = ApprovalRuleSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
    return { error: "Invalid fields provided." };
  }
   if (!currentUser) {
    return { error: "You must be logged in to create a rule." };
  }

  const {
    userId,
    ruleTitle,
    manager,
    approvers,
    isManagerApprover,
    approversSequence,
    minApprovalPercentage,
  } = validatedFields.data;

  
  const ruleData = {
    userId,
    ruleTitle,
    managerId: manager, 
    approvers: approvers.map(approver => ({userId: approver.name, required: approver.required})),
    isManagerApprover,
    sequence: approversSequence,
    minApprovalPercentage: Number(minApprovalPercentage),
    createdBy: currentUser.uid,
    createdAt: serverTimestamp(),
  };

  try {
    const rulesCollectionRef = collection(db, "approval_rules");
    await addDoc(rulesCollectionRef, ruleData)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: rulesCollectionRef.path,
          operation: 'create',
          requestResourceData: ruleData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });

    return { success: "Approval rule created successfully!" };
  } catch (error) {
    console.error("Error in saveApprovalRule action:", error);
    return { error: "Failed to create approval rule." };
  }
}

const CreateEmployeeSchema = z.object({
  email: z.string().email(),
});

// Helper function to generate a random 6-digit password
function generateRandomPassword() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function setInviteSent(db: any, email: string) {
    const usersCollectionRef = collection(db, 'organization_users');
    const q = query(usersCollectionRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const userDocRef = querySnapshot.docs[0].ref;
        await updateDoc(userDocRef, { inviteSent: true });
    }
}

export async function createEmployee(values: z.infer<typeof CreateEmployeeSchema>) {
  const validatedFields = CreateEmployeeSchema.safeParse(values);
  const db = getFirestore(getApp());

  if (!validatedFields.success) {
    return { error: "Invalid email!" };
  }

  const { email } = validatedFields.data;
  const randomPassword = generateRandomPassword();

  try {
    // Attempt to create the user directly
    await createUserWithEmailAndPassword(auth, email, randomPassword);
    // After creating, immediately send a password reset email.
    await sendPasswordResetEmail(auth, email);
    await setInviteSent(db, email);
    return { success: `Employee account for ${email} created. A password reset link has been sent.` };

  } catch (error: any) {
    // If user already exists, just send a password reset email
    if (error.code === 'auth/email-already-in-use') {
      try {
        await sendPasswordResetEmail(auth, email);
        await setInviteSent(db, email);
        return { success: `User with email ${email} already exists. A password reset link has been sent.` };
      } catch (resetError: any) {
        console.error("Password reset error:", resetError);
        return { error: "User already exists, but failed to send password reset email." };
      }
    }
    // Handle other errors
    console.error("Create employee error:", error);
    return { error: "An unexpected error occurred while processing the employee account." };
  }
}

export async function updateApprovalStatus(approvalId: string, status: "Approved" | "Rejected") {
  const db = getFirestore(getApp());
  try {
    const approvalRef = doc(db, "approvals", approvalId);
    await updateDoc(approvalRef, { status: status })
     .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: approvalRef.path,
          operation: 'update',
          requestResourceData: { status },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
    return { success: `Request has been ${status.toLowerCase()}.` };
  } catch (error) {
    console.error(`Error updating approval status:`, error);
    return { error: "Failed to update approval status." };
  }
}
    

    

    