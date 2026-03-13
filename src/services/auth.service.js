const jwt = require('jsonwebtoken');
const axios = require('axios');
const config = require('@config');
const Player = require('@models/player.model');

class AuthService {
  generateJWT(steamId) {
    return jwt.sign(
      {
        steamId,
        type: 'session',
        iat: Math.floor(Date.now() / 1000)
      },
      config.jwt.secret,
      { expiresIn: '24h' }
    );
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);

      const player = await Player.findOne({ steamId: decoded.steamId });

      if (!player) {
        return null;
      }

      if (player.session_token !== token) {
        console.warn(`Token mismatch for ${decoded.steamId} - user logged in elsewhere`);
        return null;
      }

      return player;
    } catch (error) {
      throw error;
    }
  }

  parseSteamTicket(ticketHex) {
    try {
      const buffer = Buffer.from(ticketHex, 'hex');
      if (buffer.length < 20) return null;

      for (let i = 0; i < buffer.length - 8; i++) {
        try {
          const testId = buffer.readBigUInt64LE(i).toString();
          if (testId.length === 17 && testId.startsWith('765')) {
            return testId;
          }
        } catch {}
      }
      return null;
    } catch (error) {
      console.error('Error parsing ticket:', error);
      return null;
    }
  }

  async verifySteamTicket(ticket) {
    const parsedId = this.parseSteamTicket(ticket);
    if (parsedId) {
      return { success: true, steamId: parsedId };
    }

    if (!config.steam.apiKey || !config.steam.appId) {
      return { success: false, error: 'Could not verify Steam ticket' };
    }

    try {
      const { data } = await axios.get(
        'https://partner.steam-api.com/ISteamUserAuth/AuthenticateUserTicket/v1/',
        {
          params: {
            key: config.steam.apiKey,
            appid: config.steam.appId,
            ticket,
          },
          timeout: 10000,
        }
      );

      const steamId = data?.response?.params?.steamid || data?.response?.params?.ownersteamid;

      if (steamId) {
        return { success: true, steamId };
      }

      const error = data?.response?.error?.errordesc || 'Steam authentication failed';
      return { success: false, error };
    } catch (error) {
      console.error('Steam API verification error:', error.message);

      if (parsedId) {
        return { success: true, steamId: parsedId };
      }

      return { success: false, error: 'Could not verify Steam ticket' };
    }
  }

  async getSteamPlayerName(steamId) {
    if (!config.steam.apiKey) {
      return `Player_${steamId.slice(-6)}`;
    }

    try {
      const { data } = await axios.get(
        'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/',
        {
          params: {
            key: config.steam.apiKey,
            steamids: steamId,
          },
          timeout: 10000,
        }
      );

      return data?.response?.players?.[0]?.personaname || `Player_${steamId.slice(-6)}`;
    } catch (error) {
      console.error('Error fetching Steam player name:', error.message);
      return `Player_${steamId.slice(-6)}`;
    }
  }

  extractToken(req) {
    return (
      req.headers['authorization']?.replace(/^Bearer\s+/i, '') ||
      req.body?.session_token ||
      req.headers['x-access-token']
    );
  }
}

module.exports = new AuthService();
