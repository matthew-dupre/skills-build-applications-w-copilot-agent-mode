import { getJson } from '../api/client.js';
import { useApiResource } from '../api/useApiResource.js';

type Activity = {
  _id?: string;
  type: string;
  minutes: number;
  points: number;
};

const loadActivities = () => getJson<{ activities: Activity[] }>('/api/activities');

export default function Activities() {
  const state = useApiResource(loadActivities);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {state.status === 'loading' && <p role="status">Loading activities...</p>}
        {state.status === 'error' && <p role="alert">Unable to load activities. Please try again.</p>}
        {state.status === 'success' && state.data.activities.length === 0 && <p>No activities yet.</p>}
        {state.status === 'success' && state.data.activities.length > 0 && (
          <ul className="list-group list-group-flush">
            {state.data.activities.map((activity, index) => (
              <li className="list-group-item px-0" key={activity._id ?? `${activity.type}-${index}`}>
                <span className="text-capitalize">{activity.type}</span>
                <span className="ms-2">{activity.minutes} minutes</span>
                <span className="ms-2">{activity.points} points</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
