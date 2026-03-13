const staticJson = require('@utils/static-json.util');

const RARITY_WEIGHTS = {
  1: 70, // Common
  2: 20, // Uncommon
  3: 7, // Rare
  4: 2, // Epic
  5: 1, // Legendary
};

const selectRandomRarity = () => {
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      return rarity;
    }
  }

  return '1';
};

const selectItemByRarity = (items, targetRarity) => {
  const itemsWithRarity = items.filter((item) => item.rarity === targetRarity);

  if (itemsWithRarity.length === 0) {
    return items[Math.floor(Math.random() * items.length)];
  }

  return itemsWithRarity[Math.floor(Math.random() * itemsWithRarity.length)];
};

const checkIfDuplicate = async (userId, itemShortCode) => {
  return Math.random() > 0.5;
};

module.exports.OpenLootBox = async (req, res) => {
  try {
    const { loot_box_short_code, amount } = req.body;

    if (!loot_box_short_code) {
      return res.status(400).json({
        status: 'error',
        message: 'loot_box_short_code is required',
      });
    }

    if (!amount || amount < 1 || amount > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'amount must be between 1 and 100',
      });
    }

    const fileMap = {
      'Default_Gacha': 'static/pots/greedy.json',
      'Bullet_Gacha': 'static/pots/bullet.json'
    };

    const filePath = fileMap[loot_box_short_code];

    if (!filePath) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid loot box type',
      });
    }

    const bannerData = await staticJson.load(filePath);

    const items = bannerData.data?.items || bannerData.items || [];

    if (!items || items.length === 0) {
      return res.status(500).json({
        status: 'error',
        message: 'Banner has no items configured',
      });
    }

    const lootdrops = [];

    for (let i = 0; i < amount; i++) {
      const selectedRarity = selectRandomRarity();

      const selectedItem = selectItemByRarity(items, selectedRarity);

      const isDuplicate = await checkIfDuplicate(req.user?.id || 'guest', selectedItem.short_code);

      const lootDrop = {
        short_code: selectedItem.short_code,
        name: selectedItem.name,
        type: selectedItem.type,
        rarity: selectedItem.rarity,
        amount: 1,
        duplicate_exchange: selectedItem.duplicate_exchange || {
          enable: true,
          short_code: 'coin',
          amount: parseInt(selectedItem.rarity) * 100,
          type: 'currency',
        },
        is_dup: isDuplicate,
      };

      lootdrops.push(lootDrop);
    }

    // TODO: Save items to user inventory

    return res.status(200).json({
      status: 'success',
      data: {
        loot_box_type_str: loot_box_short_code,
        loot_box_amount: amount,
        lootdrops: lootdrops,
      },
    });
  } catch (error) {
    console.error('Error opening loot box:', error);

    if (error.message.includes('Invalid loot box')) {
      return res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }

    if (error.code === 'ENOENT') {
      return res.status(404).json({
        status: 'error',
        message: 'Loot box configuration not found',
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Failed to open loot box',
      debug: error.message,
    });
  }
};
