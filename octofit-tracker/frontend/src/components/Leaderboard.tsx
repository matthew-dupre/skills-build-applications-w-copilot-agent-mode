import { useApiResource } from '../api/useApiResource.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

export default function Leaderboard() {
  const state = useApiResource<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard');

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <p>Compare team point totals.</p>
        {state.status === 'loading' && <p role="status">Loading leaderboard...</p>}
        {state.status === 'error' && <p role="alert">Unable to load leaderboard. Please try again.</p>}
        {state.status === 'success' && state.data.leaderboard.length === 0 && <p>No leaderboard rankings yet.</p>}
        {state.status === 'success' && state.data.leaderboard.length > 0 && (
          <ol className="list-group list-group-numbered list-group-flush">
            {state.data.leaderboard.map((entry) => (
              <li className="list-group-item d-flex justify-content-between align-items-center px-0" key={`${entry.rank}-${entry.teamName}`}>
                <span>{entry.teamName}</span>
                <span className="badge text-bg-primary rounded-pill">{entry.totalPoints} points</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
