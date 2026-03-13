const Player = require('@models/player.model');
const ServerInfo = require('@models/server.model');

const SERVER_INFO_DEFAULTS = {
  correctversion: true,
  serverVersion: '1.0.6.0',
  ServerDevVersion: '1.0.6.0',
  IsOnline: true,
  IsDevOnline: true,
};

class GameService {
  async getServerInfo() {
    return (await ServerInfo.findOne()) || SERVER_INFO_DEFAULTS;
  }

  isServerOnline(serverInfo) {
    return Boolean(serverInfo?.IsOnline);
  }

  validateClientVersion(clientVersion, serverVersion) {
    return clientVersion === serverVersion;
  }

  async getPlayerById(playerId) {
    return Player.findOne({ steamId: playerId });
  }

  getBanStatus(player) {
    return {
      permanentBanned: player?.banStatus?.permanentBanned || false,
      bannedUntil: player?.banStatus?.bannedUntil || null,
      banMessageCode: player?.banStatus?.banMessageCode || 1,
      reason: player?.banStatus?.reason || '',
      updatedAt: player?.banStatus?.updatedAt || null,
    };
  }

  isPlayerBanned(player) {
    const { permanentBanned, bannedUntil } = this.getBanStatus(player);
    return permanentBanned || (bannedUntil ? new Date(bannedUntil) > new Date() : false);
  }

  formatServerInfo(serverInfo) {
    return {
      correctversion: true,
      serverVersion: serverInfo.serverVersion,
      ServerDevVersion: serverInfo.ServerDevVersion,
      IsOnline: serverInfo.IsOnline,
      IsDevOnline: serverInfo.IsDevOnline,
    };
  }

  getPlayerStats(player) {
    return {
      playerStat: {
        level: player.playerStat?.level || 0,
        exp: player.playerStat?.exp || 0,
        mmrSurvivor: player.playerStat?.mmrSurvivor || 100,
        mmrHunter: player.playerStat?.mmrHunter || 100,
        mmrVisitor: player.playerStat?.mmrVisitor || 100,
        mmrWarden: player.playerStat?.mmrWarden || 100,
        mmrRankVisitor: player.playerStat?.mmrRankVisitor || 100,
        mmrRankWarden: player.playerStat?.mmrRankWarden || 100,
        mmr4v4: player.playerStat?.mmr4v4 || 100,
        MatchHistory: {
          survivor: player.playerStat?.MatchHistory?.survivor || [],
          hunter: player.playerStat?.MatchHistory?.hunter || [],
          '4v4': player.playerStat?.MatchHistory?.['4v4'] || [],
        },
      },
      playerRecord: {
        scorehunter: player.playerRecord?.hunter?.score || 0,
        scoresurvivor: player.playerRecord?.survivor?.score || 0,
        '4v4matchplayed': player.playerRecord?.['4v4matchplayed'] || 0,
        '4v4transformcount': player.playerRecord?.['4v4transformcount'] || 0,
        '4v4eliminatevisitor': player.playerRecord?.['4v4eliminatevisitor'] || 0,
        '4v4eliminatewarden': player.playerRecord?.['4v4eliminatewarden'] || 0,
        '4v4wardenpunish': player.playerRecord?.['4v4wardenpunish'] || 0,
        '4v4wardenchase': player.playerRecord?.['4v4wardenchase'] || 0,
        '4v4wardencompleteobjective': player.playerRecord?.['4v4wardencompleteobjective'] || 0,
        '4v4wardenrampage': player.playerRecord?.['4v4wardenrampage'] || 0,
        '4v4visitordecoy': player.playerRecord?.['4v4visitordecoy'] || 0,
        '4v4visitoritem': player.playerRecord?.['4v4visitoritem'] || 0,
        '4v4visitorassist': player.playerRecord?.['4v4visitorassist'] || 0,
        '4v4visitorcompleteobjective': player.playerRecord?.['4v4visitorcompleteobjective'] || 0,
        '4v4wincount': player.playerRecord?.['4v4wincount'] || 0,
        '4v4totalscore': player.playerRecord?.['4v4totalscore'] || 0,
      },
      playerRecordHunter: {
        eliminate: 0,
        matchplayed: 0,
        score: 0,
        souls: 0,
        leave: 0,
        eliminateOBT2: player.playerRecord?.hunter?.eliminate || 0,
        matchplayedOBT2: player.playerRecord?.hunter?.matchplayed || 0,
        scoreOBT2: player.playerRecord?.hunter?.score || 0,
        soulsOBT2: player.playerRecord?.hunter?.souls || 0,
        leaveOBT2: player.playerRecord?.hunter?.leave || 0,
        scoreWardenPunishment: player.playerRecord?.hunter?.scoreWardenPunishment || 0,
        scoreWardenChase: player.playerRecord?.hunter?.scoreWardenChase || 0,
        scoreWardenCompleteObjective: player.playerRecord?.hunter?.scoreWardenCompleteObjective || 0,
        scoreWardenRampage: player.playerRecord?.hunter?.scoreWardenRampage || 0,
      },
      playerRecordSurvivor: {
        eliminate: 0,
        escape: 0,
        matchplayed: 0,
        score: 0,
        leave: 0,
        eliminateOBT2: player.playerRecord?.survivor?.eliminate || 0,
        escapeOBT2: player.playerRecord?.survivor?.escape || 0,
        matchplayedOBT2: player.playerRecord?.survivor?.matchplayed || 0,
        scoreOBT2: player.playerRecord?.survivor?.score || 0,
        leaveOBT2: player.playerRecord?.survivor?.leave || 0,
        scoreVisitorCompleteObjective: player.playerRecord?.survivor?.scoreVisitorCompleteObjective || 0,
        scoreVisitorDecoy: player.playerRecord?.survivor?.scoreVisitorDecoy || 0,
        scoreVisitorUseItem: player.playerRecord?.survivor?.scoreVisitorUseItem || 0,
        scoreVisitorAssist: player.playerRecord?.survivor?.scoreVisitorAssist || 0,
      },
      rankData: {
        warden: {
          current_rank_point: player.rankData?.warden?.current_rank_point || 0,
          current_rank_name: player.rankData?.warden?.current_rank_name || 'Bronze V',
          current_rank_tier: player.rankData?.warden?.current_rank_tier || 5,
          leaderboard_number: player.rankData?.warden?.leaderboard_number || '-',
        },
        visitor: {
          current_rank_point: player.rankData?.visitor?.current_rank_point || 0,
          current_rank_name: player.rankData?.visitor?.current_rank_name || 'Bronze V',
          current_rank_tier: player.rankData?.visitor?.current_rank_tier || 5,
          leaderboard_number: player.rankData?.visitor?.leaderboard_number || '-',
        },
        '4v4': {
          current_rank_point: player.rankData?.['4v4']?.current_rank_point || 0,
          current_rank_name: player.rankData?.['4v4']?.current_rank_name || 'Bronze V',
          current_rank_tier: player.rankData?.['4v4']?.current_rank_tier || 5,
          leaderboard_number: player.rankData?.['4v4']?.leaderboard_number || '-',
        },
      },
      returnPlayerStatus: {
        active: player.returnPlayerStatus?.active || false,
        expiresAt: player.returnPlayerStatus?.expiresAt || null,
        history: player.returnPlayerStatus?.history || [],
        updatedAt: player.returnPlayerStatus?.updatedAt || null,
      },
    };
  }
}

module.exports = new GameService();
