const mongoose = require('mongoose');

const ServerInfoSchema = new mongoose.Schema(
  {
    correctversion: { type: Boolean, default: true },
    serverVersion: { type: String, default: '1.0.6.0' },
    ServerDevVersion: { type: String, default: '1.0.6.0' },
    IsOnline: { type: Boolean, default: true },
    IsDevOnline: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'serverinfo',
  }
);

module.exports = mongoose.model('ServerInfo', ServerInfoSchema);
