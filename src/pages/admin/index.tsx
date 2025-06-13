import { useSession, signIn } from 'next-auth/react';
import { trpc } from '~/utils/trpc';
import type { NextPageWithLayout } from '../_app';
import { DefaultLayout } from '~/components/DefaultLayout';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import type { inferRouterOutputs } from '@trpc/server'; // Import for inferring types
import type { AppRouter } from '~/server/routers/_app'; // Import your AppRouter

type RouterOutput = inferRouterOutputs<AppRouter>;
type UserListOutput = RouterOutput['user']['list'];
type UserListItem = UserListOutput[number];

const AdminDashboardPage: NextPageWithLayout = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const utils = trpc.useUtils();

  const usersQuery = trpc.user.list.useQuery(undefined, {
    enabled: !!session?.user?.isAdmin, // Only fetch if user is admin
  });

  const setUserAdminStatus = trpc.user.setAdminStatus.useMutation({
    onSuccess: () => {
      utils.user.list.invalidate(); // Refetch users after updating status
    },
    onError: (error) => {
      alert(`Error updating user: ${error.message}`);
    },
  });

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session) {
      signIn('github'); // If not authenticated, redirect to sign in
      return;
    }
    if (!session.user?.isAdmin) {
      router.push('/'); // If not admin, redirect to homepage
    }
  }, [session, status, router]);

  if (status === 'loading' || !session?.user?.isAdmin) {
    // Show loading state or a message if user is not admin (or redirecting)
    return <p>Loading or unauthorized...</p>;
  }

  const handleSetAdmin = (userId: string, isAdmin: boolean) => {
    setUserAdminStatus.mutate({ userId, isAdmin });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard - User Management</h1>
      
      {usersQuery.isLoading && <p>Loading users...</p>}
      {usersQuery.error && <p>Error loading users: {usersQuery.error.message}</p>}
      
      {usersQuery.data && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Avatar</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Admin Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {usersQuery.data.map((user: UserListItem) => ( // Added type for user
                <tr key={user.id} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-4">
                    {user.image && <img src={user.image} alt={user.name || 'User avatar'} className="w-10 h-10 rounded-full" />}
                  </td>
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isAdmin ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleSetAdmin(user.id, !user.isAdmin)}
                      disabled={setUserAdminStatus.isPending} // Changed isLoading to isPending
                      className={`px-4 py-2 rounded-md text-white font-semibold 
                                  ${user.isAdmin ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'}
                                  disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

AdminDashboardPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default AdminDashboardPage;
