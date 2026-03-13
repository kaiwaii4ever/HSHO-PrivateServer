const Player = require('@models/player.model');
const staticJson = require('@utils/static-json.util');

const DEFAULT_SKINS = {
  Hunter_Pray: 'Skin_Nymph_D_Default',
  Hunter_Prisoner: 'Skin_Prisoner_D_Default',
  Hunter_Belle: 'Skin_Belle_D_Default',
  Hunter_Rigger: 'Skin_Rigger_D_Default',
  Hunter_Garnet: 'Skin_Garnet_D_Default',
  Hunter_Werewolf: 'Skin_Nylcan_D_Default',
  Hunter_Chan: 'Skin_Chan_D_Default',
  Hunter_GrannyKham: 'Skin_GrannyKham_D_Default',
  Hunter_Saming: 'Skin_Saming_D_Default',
  Hunter_GrimFamily: 'Skin_GrimFamily_D_Default',
  Hunter_Verona: 'Skin_Verona_D_Default',
  Hunter_Kamiko: 'Skin_Kamiko_D_Default',
  Hunter_Charlotte: 'Skin_Charlotte_D_Default',
  Hunter_SilenceMan: 'Skin_SilenceMan_D_Default',
  Hunter_Ratri: 'Skin_Ratri_D_Default',
  Survivor_Security: 'Skin_SeGuard_D_Default',
  Survivor_Pang3P: 'Skin_Pang3P_D_Default',
  Survivor_StudentF: 'Skin_Student_D_Default',
  Survivor_Manop: 'Skin_Manop_D_Default',
  Survivor_Jane: 'Skin_Jane_D_Default',
  Survivor_Jean: 'Skin_Jean_D_Default',
  Survivor_Tim: 'Skin_Tim_D_Default',
  Survivor_Aof: 'Skin_Aof_D_Default',
  Survivor_Don: 'Skin_Don_D_Default',
  Survivor_Vanz: 'Skin_Vanz_D_Default',
  Survivor_JapanTouristF: 'Skin_TouristJap_D_Default',
  Survivor_Tida: 'Skin_Tida_D_Default',
  Survivor_Zico: 'Skin_Zico_D_Default',
  Survivor_Jessi: 'Skin_Jessi_D_Default',
  Survivor_ZBing: 'Skin_zBing_D_Default',
  Survivor_TimAwake: 'Skin_TimAwake_D_Default',
  Survivor_Aisha: 'Skin_Aisha_D_Default',
  Survivor_Stephen: 'Skin_Stephen_D_Default',
  Survivor_Gwyneth: 'Skin_Gwyneth_D_Default',
};

const DEFAULT_PLAYER_CURRENCIES = {
  coin: 250000,
  amethyst: 0,
  amulet: 0,
};

class PlayerDataService {
  constructor() {
    this.nameCooldown = 12 * 60 * 60 * 1000;
    this.basePlayerData = null;
  }

  async loadBasePlayerData() {
    if (!this.basePlayerData) {
      this.basePlayerData = await staticJson.load('static/player/auth.json');
    }

    return this.basePlayerData;
  }

  async loadPlayerTemplate() {
    const template = await staticJson.load('static/player/PlayerTemplate.json');
    return this.parseDates(template);
  }

  parseDates(value) {
    if (value === null || value === undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((entry) => this.parseDates(entry));
    }

    if (typeof value !== 'object') {
      return value;
    }

    if (value.$date) {
      return new Date(value.$date);
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, this.parseDates(entry)])
    );
  }

  assignDefaultSkinsToSlots(characterSlot = {}, inventory = {}) {
    const requiredSkins = new Set();

    for (const slotType of ['hunterSlot', 'survivorSlot']) {
      for (const slot of characterSlot[slotType] || []) {
        const defaultSkin = DEFAULT_SKINS[slot.character];

        if (!defaultSkin) {
          continue;
        }

        if (!slot.cosmetic_cloth || slot.cosmetic_cloth === 'None') {
          slot.cosmetic_cloth = defaultSkin;
        }

        requiredSkins.add(defaultSkin);
      }
    }

    inventory.skins = Array.isArray(inventory.skins) ? inventory.skins : [];

    for (const skin of requiredSkins) {
      if (!inventory.skins.includes(skin)) {
        inventory.skins.push(skin);
      }
    }

    return { characterSlot, inventory };
  }

  ensureDefaultSkinsInInventory(inventory = {}) {
    inventory.skins = Array.isArray(inventory.skins) ? inventory.skins : [];

    for (const character of inventory.characters || []) {
      const defaultSkin = DEFAULT_SKINS[character];

      if (defaultSkin && !inventory.skins.includes(defaultSkin)) {
        inventory.skins.push(defaultSkin);
      }
    }

    return inventory;
  }

  canUpdateName(lastNameUpdate) {
    if (!lastNameUpdate) {
      return true;
    }

    return Date.now() - new Date(lastNameUpdate).getTime() >= this.nameCooldown;
  }

  getTimeUntilNextUpdate(lastNameUpdate) {
    if (!lastNameUpdate) {
      return 0;
    }

    const remainingMs = this.nameCooldown - (Date.now() - new Date(lastNameUpdate).getTime());
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }

  async getOrCreatePlayerData(steamId, steamName) {
    const existingPlayer = await Player.findOne({ steamId });

    if (existingPlayer) {
      return this.syncPlayerDisplayName(existingPlayer, steamName);
    }

    const template = await this.loadPlayerTemplate();
    const { characterSlot, inventory } = this.assignDefaultSkinsToSlots(
      template.characterSlot,
      template.inventory
    );

    this.ensureDefaultSkinsInInventory(inventory);

    const newPlayer = new Player({
      steamId,
      ...template,
      characterSlot,
      inventory,
      profile: {
        ...template.profile,
        displayName: steamName,
        lastNameUpdate: new Date(),
        updatedAt: new Date(),
      },
      isOnline: true,
      lastOnline: new Date(),
    });

    await newPlayer.save();
    return newPlayer;
  }

  async syncPlayerDisplayName(player, steamName) {
    if (
      player.profile.displayName !== steamName &&
      this.canUpdateName(player.profile.lastNameUpdate)
    ) {
      player.profile.displayName = steamName;
      player.profile.lastNameUpdate = new Date();
      player.profile.updatedAt = new Date();
      await player.save();
    }

    return player;
  }

  async updatePlayerOnline(steamId, isOnline) {
    await Player.findOneAndUpdate(
      { steamId },
      {
        isOnline,
        lastOnline: new Date(),
      }
    );
  }

  convertInventoryToLegacyFormat(inventory) {
    const legacyInventory = { inventory: {} };

    if (!inventory) {
      return legacyInventory;
    }

    const copyEntries = (items, defaultQuantity = 1) => {
      if (!Array.isArray(items)) {
        return;
      }

      for (const item of items) {
        if (item && item !== 'None') {
          legacyInventory.inventory[item] = defaultQuantity;
        }
      }
    };

    [
      inventory.characters,
      inventory.skins,
      inventory.perks,
      inventory.profiles,
      inventory.stickers,
      inventory.heads,
      inventory.backs,
      inventory.costumes,
      inventory.rituals,
      inventory.cosmeticconsume,
      inventory.bundles,
      inventory.poses,
      inventory.effects,
    ].forEach((items) => copyEntries(items));

    if (Array.isArray(inventory.items) && Array.isArray(inventory.itemCounts)) {
      inventory.items.forEach((item, index) => {
        legacyInventory.inventory[item] = inventory.itemCounts[index] || 1;
      });
    }

    return legacyInventory;
  }

  buildCharacterSlotResponse(player) {
    const ownedCharacters = player.inventory?.characters || [];
    const hunterSlots = (player.characterSlot?.hunterSlot || []).filter(
      (slot) => slot.character === 'None' || ownedCharacters.includes(slot.character)
    );
    const survivorSlots = (player.characterSlot?.survivorSlot || []).filter(
      (slot) => slot.character === 'None' || ownedCharacters.includes(slot.character)
    );

    return {
      hunterSlot: hunterSlots,
      survivorSlot: survivorSlots,
      characterhunteritem: ownedCharacters.includes(player.characterSlot?.characterhunteritem)
        ? player.characterSlot.characterhunteritem
        : hunterSlots[0]?.character || 'Hunter_Belle',
      characteritem: ownedCharacters.includes(player.characterSlot?.characteritem)
        ? player.characterSlot.characteritem
        : survivorSlots[0]?.character || 'Survivor_Tim',
      updatedAt: (player.characterSlot?.updatedAt || new Date()).toISOString(),
    };
  }

  async prepareAuthResponse(steamId, displayName, sessionToken) {
    const player = await Player.findOne({ steamId });

    if (!player) {
      throw new Error('Player not found');
    }

    const response = structuredClone(await this.loadBasePlayerData());

    response.data.player.characterSlot = this.buildCharacterSlotResponse(player);
    response.data.player.role = player.role || 'survivor';
    response.data.player.session_token = sessionToken;
    response.data.session_token = sessionToken;
    response.data.player.profile = {
      display: player.profile?.display || 'Profile_Default',
      displayName,
      lastNameUpdate: (player.profile?.lastNameUpdate || new Date()).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    response.data.player.inventory = this.convertInventoryToLegacyFormat(player.inventory);
    response.data.player.stickerSlot = player.stickerSlot || response.data.player.stickerSlot;
    response.data.player.coin = player.coin ?? DEFAULT_PLAYER_CURRENCIES.coin;
    response.data.player.amethyst = player.amethyst ?? DEFAULT_PLAYER_CURRENCIES.amethyst;
    response.data.player.amulet = player.amulet ?? DEFAULT_PLAYER_CURRENCIES.amulet;
    response.data.player.banStatus = player.banStatus || response.data.player.banStatus;
    response.data.player.playerRecord = player.playerRecord || response.data.player.playerRecord;
    response.data.player.playerRecordHunter =
      player.playerRecordHunter || response.data.player.playerRecordHunter;
    response.data.player.playerRecordSurvivor =
      player.playerRecordSurvivor || response.data.player.playerRecordSurvivor;
    response.data.player.curseRelic = player.curseRelic || response.data.player.curseRelic;
    response.data.player.auth[0].authAt = new Date().toISOString();
    response.data.player.auth[0].extId = steamId;
    response.data.player.isOnline = true;
    response.data.player.lastOnline = new Date().toISOString();
    response.data.player._id = steamId;

    return response;
  }

  checkBanStatus(player) {
    const bannedUntil = player?.banStatus?.bannedUntil
      ? new Date(player.banStatus.bannedUntil)
      : null;

    if (player?.banStatus?.permanentBanned) {
      return {
        banned: true,
        reason: 'Account permanently banned',
      };
    }

    if (bannedUntil && bannedUntil > new Date()) {
      return {
        banned: true,
        reason: `Account banned until ${bannedUntil.toISOString()}`,
      };
    }

    return { banned: false };
  }

  async updatePlayerSession(player, steamId, sessionToken) {
    player.session_token = sessionToken;
    player.auth = [
      {
        authType: 'STEAM',
        extId: steamId,
        extraInfo: {
          microTxn: {
            state: '',
            country: '',
            currency: '',
            status: 'Active',
          },
        },
        authAt: new Date(),
      },
    ];
    player.isOnline = true;
    player.lastOnline = new Date();

    await player.save();
    return player;
  }
}

module.exports = new PlayerDataService();
