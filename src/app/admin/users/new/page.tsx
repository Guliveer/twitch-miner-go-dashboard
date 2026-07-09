import { CreateUserForm } from "@/components/admin/CreateUserForm";

export default function NewUserPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create user</h1>
        <p className="text-sm text-muted-foreground mt-1">Add a new dashboard user</p>
      </div>
      <CreateUserForm />
    </div>
  );
}
