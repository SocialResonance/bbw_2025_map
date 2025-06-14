import { trpc } from '~/utils/trpc';
import { useSession, signIn, signOut } from 'next-auth/react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

const Map = dynamic(() => import('~/components/Map'), {
  loading: () => <p>A map is loading</p>,
  ssr: false,
});

const IndexPage = () => {
  const { data: session } = useSession();
  const { data: journalClubs } = trpc.journalClub.getAll.useQuery();

  return (
    <div className="h-screen w-screen">
      <div className="absolute top-0 right-0 z-10 p-4">
        {session ? (
          <div className="flex items-center space-x-4">
            <p>Welcome, {session.user?.name}</p>
            <button
              onClick={() => signOut()}
              className="rounded bg-red-500 px-4 py-2 text-white"
            >
              Sign out
            </button>
            <Link href="/admin">
              <a className="rounded bg-blue-500 px-4 py-2 text-white">
                Admin Dashboard
              </a>
            </Link>
          </div>
        ) : (
          <button
            onClick={() => signIn('github')}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Sign in with GitHub
          </button>
        )}
      </div>
      <Map journalClubs={journalClubs} />
      {session && (
        <div className="absolute bottom-0 right-0 z-10 p-4">
          <Link href="/create-journal-club">
            <a className="rounded bg-green-500 px-4 py-2 text-white">
              Create Journal Club
            </a>
          </Link>
        </div>
      )}
    </div>
  );
};

export default IndexPage;
