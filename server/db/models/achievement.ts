import mongoose from 'mongoose';

export interface Achievement {
  name: string;
  description: string;
  game: string;
  criteria: {
    type: string;
    value: number;
  };
}

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  game: {
    type: String,
    required: true,
  },
  criteria: {
    type: {
      type: String,
      enum: ['score', 'games_played', 'win_streak'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
});

export const AchievementModel = mongoose.model<Achievement>('Achievement', achievementSchema);
