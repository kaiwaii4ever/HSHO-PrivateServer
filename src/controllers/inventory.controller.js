const inventoryService = require('@services/inventory.service');
const { sendError, sendSuccess } = require('@utils/response.util');

function getAuthenticatedPlayer(req, res) {
  if (!req.player) {
    sendError(res, 401, 'Unauthorized - Invalid session');
    return null;
  }

  return req.player;
}

function getErrorStatusCode(message = '') {
  if (
    message.includes('not owned') ||
    message.includes('not found') ||
    message.includes('Invalid') ||
    message.includes('must contain') ||
    message.includes('required')
  ) {
    return 400;
  }

  return 500;
}

exports.getInventoryAll = async (req, res) => {
  try {
    const player = getAuthenticatedPlayer(req, res);

    if (!player) {
      return null;
    }

    return sendSuccess(res, inventoryService.getInventoryState(player));
  } catch (error) {
    console.error('getInventoryAll error:', error);
    return sendError(res, 500, error.message || 'Server error');
  }
};

exports.getCharacterSlot = async (req, res) => {
  try {
    const player = getAuthenticatedPlayer(req, res);

    if (!player) {
      return null;
    }

    const slots = inventoryService.getCharacterSlotData(player);

    if (!slots) {
      return sendError(res, 404, 'Character slot not found');
    }

    return sendSuccess(res, {
      session_token: player.session_token,
      slots,
      role: player.role,
    });
  } catch (error) {
    console.error('getCharacterSlot error:', error);
    return sendError(res, 500, error.message || 'Server error');
  }
};

exports.editCharacterSlot = async (req, res) => {
  try {
    const player = getAuthenticatedPlayer(req, res);

    if (!player) {
      return null;
    }

    const { role, slots = {} } = req.body;
    const result = await inventoryService.updateCharacterSlot(player, slots, role);

    return sendSuccess(res, {
      session_token: player.session_token,
      ...result,
    });
  } catch (error) {
    console.error('editCharacterSlot error:', error);
    return sendError(res, getErrorStatusCode(error.message), error.message || 'Server error');
  }
};

exports.editProfile = async (req, res) => {
  try {
    const player = getAuthenticatedPlayer(req, res);

    if (!player) {
      return null;
    }

    if (!req.body.profile) {
      return sendError(res, 400, 'Profile is required');
    }

    const updatedProfile = await inventoryService.updatePlayerProfile(player, req.body.profile);

    return sendSuccess(res, {
      profile: updatedProfile,
      session_token: player.session_token,
    });
  } catch (error) {
    console.error('Profile edit error:', error);
    return sendError(res, getErrorStatusCode(error.message), error.message || 'Internal server error');
  }
};

exports.editSticker = async (req, res) => {
  try {
    const player = getAuthenticatedPlayer(req, res);

    if (!player) {
      return null;
    }

    if (!req.body.stickerInfo) {
      return sendError(res, 400, 'Sticker info is required');
    }

    const updatedStickers = await inventoryService.updatePlayerStickers(
      player,
      req.body.stickerInfo
    );

    return sendSuccess(res, {
      stickerSlot: updatedStickers,
      session_token: player.session_token,
    });
  } catch (error) {
    console.error('Sticker edit error:', error);
    return sendError(res, getErrorStatusCode(error.message), error.message || 'Internal server error');
  }
};

exports.addItem = async (req, res) => {
  try {
    const player = getAuthenticatedPlayer(req, res);

    if (!player) {
      return null;
    }

    const { itemId, quantity = 1 } = req.body;

    if (!itemId) {
      return sendError(res, 400, 'itemId is required');
    }

    const result = await inventoryService.addItemToInventory(player, itemId, quantity);

    return sendSuccess(res, {
      ...result,
      session_token: player.session_token,
    });
  } catch (error) {
    console.error('Add item error:', error);
    return sendError(res, 500, error.message || 'Internal server error');
  }
};

exports.removeItem = async (req, res) => {
  try {
    const player = getAuthenticatedPlayer(req, res);

    if (!player) {
      return null;
    }

    if (!req.body.itemId) {
      return sendError(res, 400, 'itemId is required');
    }

    const result = await inventoryService.removeItemFromInventory(player, req.body.itemId);

    return sendSuccess(res, {
      ...result,
      session_token: player.session_token,
    });
  } catch (error) {
    console.error('Remove item error:', error);
    return sendError(res, 500, error.message || 'Internal server error');
  }
};
