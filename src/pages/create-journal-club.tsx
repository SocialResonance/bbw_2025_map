import { trpc } from '~/utils/trpc';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

type JournalClubForm = {
  name: string;
  description: string;
  lat: number;
  lng: number;
  frequency: string;
  time: string;
};

const CreateJournalClubPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const createJournalClub = trpc.journalClub.create.useMutation();
  const { register, handleSubmit } = useForm<JournalClubForm>();

  const onSubmit = async (data: JournalClubForm) => {
    await createJournalClub.mutateAsync(data);
    router.push('/');
  };

  if (!session) {
    return <div>You must be logged in to create a journal club.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Create Journal Club</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            {...register('name', { required: true })}
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            {...register('description', { required: true })}
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label htmlFor="lat">Latitude</label>
          <input
            id="lat"
            type="number"
            step="any"
            {...register('lat', { required: true, valueAsNumber: true })}
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label htmlFor="lng">Longitude</label>
          <input
            id="lng"
            type="number"
            step="any"
            {...register('lng', { required: true, valueAsNumber: true })}
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label htmlFor="frequency">Frequency</label>
          <input
            id="frequency"
            {...register('frequency', { required: true })}
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label htmlFor="time">Time</label>
          <input
            id="time"
            {...register('time', { required: true })}
            className="w-full rounded border p-2"
          />
        </div>
        <button type="submit" className="rounded bg-blue-500 px-4 py-2 text-white">
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateJournalClubPage;
