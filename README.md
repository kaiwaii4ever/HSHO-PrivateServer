# Home Sweet Home: Online—Private Server

A private server implementation for **Home Sweet Home: Online**. This project enables players to continue playing HSHO after official server shutdown.

> **Important**: You must own Home Sweet Home: Online in your Steam library (available before Jan 31, 2025) to use this server. This repo might be maintained just for some funnies.

## Prerequisites

- Home Sweet Home: Online in your Steam library (acquired before Jan 31, 2025)
- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [MongoDB Account](https://www.mongodb.com/) (Free tier works fine, this is only for saving your 'progress')
- [Steam Web API Key](https://steamcommunity.com/dev/apikey)
- [Fiddler Classic](https://www.telerik.com/fiddler/fiddler-classic) (for traffic redirection)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/kaiwaii4ever/HSHO-PrivateServer.git
cd <repository-folder>
```

### 2. Configure Environment Variables
Create a `.env` file in the project root with your credentials:
```env
MONGO_URI=your_mongodb_connection_string
MONGO_DB_NAME=HSHO-PrivateServer
JWT_SECRET=very-good-key
STEAM_API_KEY=your_steam_web_api_key
PORT=3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Up MongoDB
1. Create a new collection named `serverinfo`
2. Insert the following document:
```json
{
  "correctversion": true,
  "serverVersion": "1.0.6.0",
  "ServerDevVersion": "0.0.0.1",
  "IsOnline": true,
  "IsDevOnline": false,
  "__v": 0
}
```

### 5. Configure Fiddler (Traffic Redirection)

1. Open **Fiddler Classic**
2. Navigate to **Tools → Options → HTTPS**
3. Enable the following options:
   - Capture HTTPS CONNECTs
   - Decrypt HTTPS traffic
   - Ignore server certificate errors
4. Click **OK** and restart Fiddler
5. Go to the **AutoResponder** tab
6. Enable **"Enable rules"** and **"Unmatched requests passthrough"**
7. Add this one rules:
```
REGEX:https://api\.homesweethomegame\.com(/.*)$
→ http://localhost:3000$1
```

### 6. Start the Server
```bash
node server.js
```
or
```bash
npm start
```

### 7. Launch the Game

Open the game via steam or if you have mods,

Open Command Prompt in your HSHO installation directory and run:
```bash
HSHO.exe -fileopenlog
```

## Usage

Once everything is configured and the server is running:
1. Ensure Fiddler is active with AutoResponder enabled
2. Start the private server (`node server.js`)
3. Launch HSHO
4. Done!

## Customization

### Adding Items or Modifying Player Data

All player data is stored in your MongoDB database. You can:
- Edit existing player profiles directly in MongoDB
- Modify the default template in the server code
- Add custom items or glory points.

## Notes

- This is **not a complete server implementation** - only free items and custom matches are made (no matchmaking)
- Other game systems are not planned, but might change slightly in the future
- Not all official game content is available in the private server (Can be added if you can find the Item ID via some apps like FModel)

## Credits

This project was built using API documentation and research from:
- **Pluto**
- Home Sweet Home: Rescurrected (Glory Implementation)
- [kunseru/homesweethomeonline-api](https://github.com/kunseru/homesweethomeonline-api)

## Legal

All intellectual property rights for **Home Sweet Home: Online** belong to **Yggdrazil Group** (YGG). This is an unofficial project for preservation and educational purposes.

---

**Disclaimer**: This project is not affiliated with or endorsed by Yggdrazil Group. Use at your own risk.
