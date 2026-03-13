const Player = require('@models/player.model');

exports.getImmortalPlayer = async (req, res) => {
  try {
    const player = req.player;

    if (!player) {
      return res.status(401).json({
        data: [],
        error: 'Unauthorized',
      });
    }

    const activeSkins = player.immortalData || [];

    if (activeSkins.length === 0) {
      return res.status(200).json({
        data: [],
        error: null,
      });
    }

    const formattedData = activeSkins.map((skin) => ({
      skin_shortcode: skin.skin_shortcode,
      isActive: skin.isActive,
      activity: (skin.activity || []).map((act) => ({
        skin_activity: act.skin_activity,
        goal: act.goal,
        skin_quest_status: act.skin_quest_status,
      })),
    }));

    return res.status(200).json({
      data: formattedData,
      error: null,
    });
  } catch (error) {
    console.error('Get immortal player error:', error);
    return res.status(500).json({
      data: [],
      error: 'Internal server error',
    });
  }
};

exports.getImmortalPlayerMatch = async (req, res) => {
  try {
    const playerId = req.body.player_id || req.query.player_id;

    if (!playerId) {
      return res.status(400).json({
        data: [],
        error: 'Player ID is required',
      });
    }

    let player;
    try {
      player = await Player.findById(playerId);
    } catch (err) {
      player = await Player.findOne({ steamId: playerId });
    }

    if (!player) {
      return res.status(404).json({
        data: [],
        error: 'Player not found',
      });
    }

    const immortalSkins = player.immortalData || [];

    const formattedData = [
      {
        player_id: player.steamId || player.auth.extId,
        immortal_data: immortalSkins.map((skin) => ({
          skin_shortcode: skin.skin_shortcode,
          activity: skin.activity.map((act) => ({
            skin_activity: act.skin_activity,
            goal: act.goal,
            skin_quest_status: act.skin_quest_status,
          })),
        })),
      },
    ];

    return res.status(200).json({
      data: formattedData,
      error: null,
    });
  } catch (error) {
    console.error('Get immortal player match error:', error);
    return res.status(500).json({
      data: [],
      error: 'Internal server error',
    });
  }
};

exports.updateImmortalPlayer = async (req, res) => {
  try {
    const { player_id, skin_shortcode, skin_quest_status, skin_activity } = req.body;

    if (!player_id) {
      return res.status(400).json({
        data: [],
        error: 'Player ID is required',
      });
    }

    if (!skin_shortcode || skin_quest_status === undefined || !skin_activity) {
      return res.status(400).json({
        data: [],
        error: 'Missing required fields: skin_shortcode, skin_quest_status, skin_activity',
      });
    }

    let player;
    try {
      player = await Player.findById(player_id);
    } catch (err) {
      player = await Player.findOne({ steamId: player_id });
    }

    if (!player) {
      return res.status(404).json({
        data: [],
        error: 'Player not found',
      });
    }

    if (!player.immortalData) {
      player.immortalData = [];
    }

    if (!Array.isArray(player.immortalData)) {
      player.immortalData = [];
    }

    let skinIndex = player.immortalData.findIndex(
      (skin) => skin.skin_shortcode === skin_shortcode
    );

    if (skinIndex === -1) {
      player.immortalData.push({
        skin_shortcode: skin_shortcode,
        isActive: true,
        activity: [
          {
            skin_activity: skin_activity,
            goal: 0,
            skin_quest_status: skin_quest_status,
          },
        ],
      });
    } else {
      const skin = player.immortalData[skinIndex];

      let activityIndex = skin.activity.findIndex((act) => act.skin_activity === skin_activity);

      if (activityIndex === -1) {
        skin.activity.push({
          skin_activity: skin_activity,
          goal: 0,
          skin_quest_status: skin_quest_status,
        });
      } else {
        skin.activity[activityIndex].skin_quest_status = skin_quest_status;
      }
    }

    await player.save();

    return res.status(200).json({
      data: {
        player_id: player.steamId || player.auth.extId,
        skin_shortcode: skin_shortcode,
        skin_activity: skin_activity,
        skin_quest_status: skin_quest_status,
        message: 'Immortal player data updated successfully',
      },
      error: null,
    });
  } catch (error) {
    console.error('Update immortal player error:', error);
    return res.status(500).json({
      data: [],
      error: 'Internal server error',
    });
  }
};
