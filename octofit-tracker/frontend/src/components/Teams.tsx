import { useApiResource } from '../api/useApiResource.js';

type Team = {
  _id?: string;
  name: string;
  mascot?: string;
  members?: string[];
};

export default function Teams() {
  const state = useApiResource<{ teams: Team[] }>('/api/teams');

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {state.status === 'loading' && <p role="status">Loading teams...</p>}
        {state.status === 'error' && <p role="alert">Unable to load teams. Please try again.</p>}
        {state.status === 'success' && state.data.teams.length === 0 && <p>No teams yet.</p>}
        {state.status === 'success' && state.data.teams.length > 0 && (
          <ul className="list-group list-group-flush">
            {state.data.teams.map((team, index) => {
              const memberCount = team.members?.length ?? 0;
              return (
                <li className="list-group-item px-0" key={team._id ?? `${team.name}-${index}`}>
                  <h3 className="h6 mb-1">{team.name}</h3>
                  {team.mascot && <p className="mb-1">Mascot: {team.mascot}</p>}
                  <p className="mb-0">{memberCount} {memberCount === 1 ? 'member' : 'members'}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
