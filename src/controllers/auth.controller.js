const authService = require('@services/auth.service');
const playerDataService = require('@services/player-data.service');
const { sendError } = require('@utils/response.util');

class AuthController {
  async authenticate(req, res) {
    try {
      const { authType, ticket, clientversion } = req.body;

      console.log(`Auth request - Type: ${authType}, Version: ${clientversion}`);

      if (authType !== 'steam') {
        return sendError(res, 400, 'Only Steam authentication is supported');
      }

      const verification = await authService.verifySteamTicket(ticket);

      if (!verification.success) {
        return sendError(res, 401, verification.error || 'Authentication failed');
      }

      const steamId = verification.steamId;
      const steamName = await authService.getSteamPlayerName(steamId);
      const player = await playerDataService.getOrCreatePlayerData(steamId, steamName);
      const banCheck = playerDataService.checkBanStatus(player);

      if (banCheck.banned) {
        return sendError(res, 403, banCheck.reason);
      }

      const sessionToken = authService.generateJWT(steamId);
      await playerDataService.updatePlayerSession(player, steamId, sessionToken);

      console.log(`Auth successful for ${steamName} (${steamId})`);
      return res.status(200).json(
        await playerDataService.prepareAuthResponse(steamId, steamName, sessionToken)
      );
    } catch (error) {
      console.error('Auth endpoint error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  async verifySession(req, res, next) {
    try {
      const token = authService.extractToken(req);

      if (!token) {
        return sendError(res, 401, 'No token provided');
      }

      const player = await authService.verifyToken(token);

      if (!player) {
        return sendError(res, 401, 'Invalid token');
      }

      const banCheck = playerDataService.checkBanStatus(player);

      if (banCheck.banned) {
        return sendError(res, 403, banCheck.reason);
      }

      req.player = player;
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token expired');
      }

      console.error('Token verification error:', error);
      return sendError(res, 401, 'Invalid token');
    }
  }
}

module.exports = new AuthController();
