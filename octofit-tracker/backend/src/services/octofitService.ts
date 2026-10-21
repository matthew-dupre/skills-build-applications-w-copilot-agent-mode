import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Activity details are required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  const objectIdPattern = /^[a-f\d]{24}$/i;
  if (
    typeof userId !== 'string' || !objectIdPattern.test(userId) ||
    typeof teamId !== 'string' || !objectIdPattern.test(teamId) ||
    typeof type !== 'string' || type.trim().length === 0 ||
    typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0
  ) {
    throw Object.assign(new Error('Activity details are invalid'), { status: 400 });
  }

  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: new mongoose.Types.ObjectId(userId) }),
    Team.exists({ _id: new mongoose.Types.ObjectId(teamId) }),
  ]);
  if (!userExists || !teamExists) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Team details are required'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' || name.trim().length === 0 ||
    typeof mascot !== 'string' || mascot.trim().length === 0 ||
    !Array.isArray(members)
  ) {
    throw Object.assign(new Error('Team details are invalid'), { status: 400 });
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members });
}

export async function getLeaderboard() {
  const totals = await Team.aggregate<{ teamName: string; totalPoints: number }>([
    {
      $lookup: {
        from: Activity.collection.name,
        localField: '_id',
        foreignField: 'team',
        as: 'activities',
      },
    },
    {
      $project: {
        _id: 0,
        teamName: '$name',
        totalPoints: { $sum: '$activities.points' },
      },
    },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);

  return totals.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const [recentActivities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean(),
    Workout.find().lean(),
  ]);
  const goalFocus = user.fitnessGoal.toLowerCase();
  const focusForActivity = (type: string) => {
    const normalized = type.toLowerCase();
    return ['run', 'running', 'cycle', 'cycling', 'walk', 'walking'].includes(normalized)
      ? 'endurance'
      : normalized;
  };

  return workouts
    .map((workout) => {
      const workoutFocus = workout.focus.toLowerCase();
      const matchingActivity = recentActivities.find(
        (activity) => focusForActivity(activity.type) === workoutFocus,
      );
      const matchesGoal = workoutFocus === goalFocus;
      const reason = matchesGoal && matchingActivity
        ? `Matches your ${user.fitnessGoal} goal and recent ${matchingActivity.type} activity.`
        : matchesGoal
          ? `Matches your ${user.fitnessGoal} fitness goal.`
          : matchingActivity
            ? `Builds on your recent ${matchingActivity.type} activity.`
            : `Recommended while working toward your ${user.fitnessGoal} goal.`;

      return {
        recommendation: { ...workout, reason },
        score: (matchesGoal ? 100 : 0) + (matchingActivity ? 10 : 0),
      };
    })
    .sort((left, right) => right.score - left.score || left.recommendation.title.localeCompare(right.recommendation.title))
    .map(({ recommendation }) => recommendation);
}

export { User };
