import { useSession, signIn, signOut } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { NextPageWithLayout } from './_app';

// Dynamically import the Map component to avoid SSR issues with Leaflet
const MapWithNoSSR = dynamic(() => import('~/components/Map'), {
  ssr: false,
});

const IndexPage: NextPageWithLayout = () => {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 bg-gray-800 text-white flex justify-between items-center">
        <h1 className="text-2xl font-bold">Journal Club Locator</h1>
        <div>
          {status === 'loading' && <p>Loading...</p>}
          {status === 'unauthenticated' && (
            <button
              onClick={() => signIn('github')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign in with GitHub
            </button>
          )}
          {status === 'authenticated' && session?.user && (
            <div className="flex items-center gap-4">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User avatar'}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <span>Welcome, {session.user.name}!</span>
              {/* @ts-expect-error - isAdmin is a custom property */}
              {session.user.isAdmin && (
                <Link href="/admin" className="text-yellow-400 hover:underline">
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow" style={{ height: 'calc(100vh - 64px)' }}> {/* Adjust height as needed */}
        <MapWithNoSSR />
      </main>
    </div>
  );
};

export default IndexPage;

// If you have a DefaultLayout, you might want to adjust it or remove it for this page
// depending on how you want the map to be displayed (e.g., full screen).
// IndexPage.getLayout = function getLayout(page: React.ReactElement) {
//   return <>{page}</>; // Example: No layout for this page if map is full screen
// };
