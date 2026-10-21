import { useApiResource } from '../api/useApiResource.js';

type WorkoutSuggestion = {
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason?: string;
};

const userEmail = 'mona@example.com';

export default function Workouts() {
  const path = `/api/workouts/suggestions/${encodeURIComponent(userEmail)}`;
  const state = useApiResource<{ suggestions: WorkoutSuggestion[] }>(path);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommended for {userEmail}.</p>
        {state.status === 'loading' && <p role="status">Loading workout suggestions...</p>}
        {state.status === 'error' && <p role="alert">Unable to load workout suggestions. Please try again.</p>}
        {state.status === 'success' && state.data.suggestions.length === 0 && <p>No workout suggestions yet.</p>}
        {state.status === 'success' && state.data.suggestions.length > 0 && (
          <ul className="list-group list-group-flush">
            {state.data.suggestions.map((suggestion, index) => (
              <li className="list-group-item px-0" key={`${suggestion.title}-${index}`}>
                <h3 className="h6 mb-1">{suggestion.title}</h3>
                {suggestion.focus && <p className="mb-1">Focus: {suggestion.focus}</p>}
                {(suggestion.minutes || suggestion.difficulty) && (
                  <p className="mb-1">
                    {suggestion.minutes && `${suggestion.minutes} minutes`}
                    {suggestion.minutes && suggestion.difficulty && ', '}
                    {suggestion.difficulty}
                  </p>
                )}
                {suggestion.reason && <p className="mb-0">{suggestion.reason}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
