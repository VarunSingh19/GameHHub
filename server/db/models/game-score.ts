import mongoose from 'mongoose';
import { type GameScore } from '@shared/schema';

const gameScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  game: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster leaderboard queries
gameScoreSchema.index({ game: 1, score: -1 });
gameScoreSchema.index({ userId: 1, playedAt: -1 });

export const GameScoreModel = mongoose.model<GameScore>('GameScore', gameScoreSchema);
