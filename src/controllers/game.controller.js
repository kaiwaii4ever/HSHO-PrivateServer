const gameService = require('@services/game.service');
const { sendError, sendSuccess } = require('@utils/response.util');

exports.checkVersion = async (req, res) => {
  try {
    const clientVersion = req.body?.clientversion;
    const playerId = req.body?.playerId;
    const serverInfo = await gameService.getServerInfo();
    const formattedServerInfo = gameService.formatServerInfo(serverInfo);

    if (!gameService.isServerOnline(serverInfo)) {
      return sendError(
        res,
        200,
        'Server cannot be played during maintenance',
        {
          serverInfo: {
            ...formattedServerInfo,
            correctversion: false,
          },
        }
      );
    }

    if (!gameService.validateClientVersion(clientVersion, serverInfo.serverVersion)) {
      return sendError(
        res,
        200,
        'Client version mismatch. Please update your game.',
        {
          serverInfo: {
            ...formattedServerInfo,
            correctversion: false,
          },
        }
      );
    }

    if (playerId) {
      const player = await gameService.getPlayerById(playerId);

      if (!player) {
        return sendError(res, 200, 'Invalid player ID.', {
          serverInfo: formattedServerInfo,
        });
      }

      if (gameService.isPlayerBanned(player)) {
        const banStatus = gameService.getBanStatus(player);
        return sendError(res, 403, banStatus.reason || 'Your account has been banned');
      }
    }

    return sendSuccess(res, { serverInfo: formattedServerInfo });
  } catch (error) {
    console.error('Check version error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

exports.getBan = async (req, res) => {
  try {
    const playerId = req.body?.Player?.[0]?.playerId;

    if (!playerId) {
      return sendError(res, 400, 'No player ID provided');
    }

    const player = await gameService.getPlayerById(playerId);

    if (!player) {
      return sendError(res, 404, 'Player not found');
    }

    return sendSuccess(res, {
      banStatus: gameService.getBanStatus(player),
    });
  } catch (error) {
    console.error('Get ban error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};
