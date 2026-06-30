import { CreateUserForm } from "@/components/admin/CreateUserForm";

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create user</h1>
      <CreateUserForm />
    </div>
  );
}
