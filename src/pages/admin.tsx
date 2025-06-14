import { trpc } from '~/utils/trpc';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';

const AdminPage = () => {
  const { data: session } = useSession();
  const { data: users, refetch } = trpc.admin.getUsers.useQuery();
  const setUserRole = trpc.admin.setUserRole.useMutation();

  const handleRoleChange = async (userId: string, role: Role) => {
    await setUserRole.mutateAsync({ userId, role });
    refetch();
  };

  if (session?.user?.role !== 'ADMIN') {
    return <div>You are not authorized to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">
                <select
                  value={user.role}
                  onChange={(e) =>
                    handleRoleChange(user.id, e.target.value as Role)
                  }
                >
                  <option value={Role.USER}>User</option>
                  <option value={Role.ADMIN}>Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
