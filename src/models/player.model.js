const mongoose = require('mongoose');

const authSchema = new mongoose.Schema(
  {
    authType: { type: String, default: 'STEAM' },
    extId: { type: String, required: true },
    extraInfo: {
      microTxn: {
        state: { type: String, default: '' },
        country: { type: String, default: '' },
        currency: { type: String, default: '' },
        status: { type: String, default: 'Active' },
      },
    },
    authAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const immortalActivitySchema = new mongoose.Schema(
  {
    skin_activity: { type: String, required: true },
    goal: { type: Number, default: 1 },
    skin_quest_status: { type: Number, default: 0 },
  },
  { _id: false }
);

const immortalDataSchema = new mongoose.Schema(
  {
    skin_shortcode: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    activity: [immortalActivitySchema],
  },
  { _id: false }
);

const playerSchema = new mongoose.Schema(
  {
    steamId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    auth: [authSchema],
    session_token: { type: String, default: null },
    profile: {
      display: { type: String, default: 'Profile_Default' },
      displayName: { type: String, default: '' },
      lastNameUpdate: { type: Date, default: null },
      updatedAt: { type: Date, default: Date.now },
    },
    coin: { type: Number, default: 0 },
    amethyst: { type: Number, default: 0 },
    amulet: { type: Number, default: 0 },
    characterSlot: { type: mongoose.Schema.Types.Mixed },
    role: { type: String, default: 'survivor' },
    banStatus: { type: mongoose.Schema.Types.Mixed },
    playerRecord: { type: mongoose.Schema.Types.Mixed },
    stickerSlot: { type: mongoose.Schema.Types.Mixed },
    inventory: { type: mongoose.Schema.Types.Mixed },
    immortalData: {
      type: [immortalDataSchema],
      default: [],
    },
    isOnline: { type: Boolean, default: false },
    lastOnline: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

playerSchema.index({ 'auth.extId': 1 });

playerSchema.methods.updateImmortalProgress = function updateImmortalProgress(
  skinShortcode,
  activityType
) {
  const immortal = this.immortalData.find(
    (entry) => entry.skin_shortcode === skinShortcode
  );

  if (!immortal) {
    return this.save();
  }

  const activity = immortal.activity.find(
    (entry) => entry.skin_activity === activityType
  );

  if (activity && activity.skin_quest_status < activity.goal) {
    activity.skin_quest_status += 1;
  }

  return this.save();
};

playerSchema.methods.getImmortalProgress = function getImmortalProgress(
  skinShortcode
) {
  return this.immortalData.find(
    (entry) => entry.skin_shortcode === skinShortcode
  );
};

playerSchema.methods.isImmortalComplete = function isImmortalComplete(
  skinShortcode
) {
  const immortal = this.immortalData.find(
    (entry) => entry.skin_shortcode === skinShortcode
  );

  if (!immortal) {
    return false;
  }

  return immortal.activity.every(
    (activity) => activity.skin_quest_status >= activity.goal
  );
};

module.exports = mongoose.model('Player', playerSchema);
