const express = require('express');
const router = express.Router();
const authController = require('@controllers/auth.controller');
const inventoryController = require('@controllers/inventory.controller');


router.post('/inventory/getAll',
  authController.verifySession,
  inventoryController.getInventoryAll
);

router.post('/characterslot/get',
  authController.verifySession,
  inventoryController.getCharacterSlot
);

router.post('/characterslot/edit',
  authController.verifySession,
  inventoryController.editCharacterSlot
);

router.post('/profile/edit',
  authController.verifySession,
  inventoryController.editProfile
);

router.post('/sticker/edit',
  authController.verifySession,
  inventoryController.editSticker
);

router.post('/inventory/addItem',
  authController.verifySession,
  inventoryController.addItem
);

router.post('/inventory/removeItem',
  authController.verifySession,
  inventoryController.removeItem
);

module.exports = router;
