# 🤖 Discord Bot Setup Guide

## Quick Start

The TrixieVerse Discord Bot brings your coaching experience to the Discord community with slash commands for tips, achievements, and leaderboards.

---

## 1️⃣ CREATE A DISCORD APPLICATION

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name it: `TrixieVerse Bot`
4. Go to **"Bot"** section
5. Click **"Add Bot"**
6. Copy your **Token** and save it (you'll need this)

---

## 2️⃣ SET BOT PERMISSIONS

In the **OAuth2 → URL Generator** section:

**Scopes:**
- ✅ `bot`
- ✅ `applications.commands`

**Permissions:**
- ✅ Send Messages
- ✅ Embed Links
- ✅ Read Message History
- ✅ Use Slash Commands

Copy the generated URL and open it to add the bot to your Discord server.

---

## 3️⃣ ENVIRONMENT VARIABLES

Create a `.env.discord` file or update your `.env`:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_server_id_here
DISCORD_NOTIFICATIONS_CHANNEL=channel_id_here
DISCORD_LEADERBOARD_CHANNEL=channel_id_here
```

**How to get IDs:**
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click server/channel and click "Copy Server/Channel ID"

---

## 4️⃣ START THE BOT

### Option A: Run Standalone
```bash
npm run discord-bot
```

### Option B: Integrated with Backend
The bot will start automatically when your backend server starts.

---

## 📝 AVAILABLE COMMANDS

### `/coaching_tip`
Get a random coaching tip from your AI coach.

**Example:**
```
User: /coaching_tip
Bot: 💡 Map Awareness
Check the minimap every 3-5 seconds...
```

### `/skill_check`
View your CoachOS 5D skill profile (Mechanics, Macro, Decision Making, etc.)

**Example:**
```
User: /skill_check
Bot: 📊 Your Skill Radar
Mechanics ████████░░ 72/100
Macro Play ██████░░░░ 65/100
...
```

### `/my_achievements`
View your unlocked achievements and progress.

**Example:**
```
User: /my_achievements
Bot: 🏆 Your Achievements (3/8)
🔥 Hot Hand - Win 5 games in a row
📊 CS Master - Maintain 6+ CS/min
👥 True Friend - Reach Friend stage
```

### `/achievements_list`
View all available achievements you can unlock.

**Example:**
```
User: /achievements_list
Bot: 🏅 Achievement Collection
🥉 Bronze Climber [common]
Reach Bronze rank
...
```

### `/leaderboard`
View the TrixieVerse leaderboard with top players.

**Example:**
```
User: /leaderboard
Bot: 🏆 TrixieVerse Leaderboard
🥇 Trixie - 89%
🥈 Blaze - 87%
🥉 Echo - 85%
```

### `/help`
Show all available commands.

---

## 🔔 AUTOMATIC NOTIFICATIONS

The bot automatically sends:

### Daily Coaching Tip
- **Time:** 9:00 AM (configurable)
- **Channel:** Notifications Channel
- **Content:** Random tip from the coaching database

### Achievement Unlocked
- **Trigger:** Player unlocks an achievement
- **Format:** Embed with achievement icon, name, rarity
- **Channel:** Notifications Channel

### Rank Up
- **Trigger:** Player reaches new rank
- **Format:** Embed with player name and new rank
- **Channel:** Notifications Channel

---

## 🎮 INTEGRATION WITH TRIXIEVERSE

The Discord Bot integrates with:

1. **Achievement System** - Notifies when achievements unlock
2. **CoachOS** - Shares skill profiles and stats
3. **Leaderboards** - Updates rankings automatically
4. **Daily Tips** - Posts coaching tips to the community

---

## ⚙️ CUSTOMIZATION

### Add More Coaching Tips
Edit `COACHING_TIPS` array in `bot.ts`:

```typescript
const COACHING_TIPS = [
  {
    title: '⚙️ Your Title',
    description: 'Your tip here',
    coach: 'Tip Author',
  },
  // Add more...
];
```

### Add More Achievements
Edit `ACHIEVEMENTS_DB` in `bot.ts`:

```typescript
const ACHIEVEMENTS_DB = {
  your_achievement: {
    name: 'Achievement Name',
    icon: '🏆',
    description: 'Achievement description',
    rarity: 'rare', // common, uncommon, rare, epic, legendary
  },
  // Add more...
};
```

### Change Daily Tip Time
Edit `scheduleDaily()` function:

```typescript
if (now.getHours() === 9 && now.getMinutes() === 0) { // 9:00 AM
  await sendDailyTip();
}
```

---

## 🐛 TROUBLESHOOTING

### Bot doesn't appear in Discord
- Check that you invited it with correct permissions
- Make sure bot token is correct in `.env`

### Commands don't show up
- Restart the bot
- Make sure `DISCORD_GUILD_ID` is correct
- Check that bot has `applications.commands` permission

### Notifications not sending
- Verify `DISCORD_NOTIFICATIONS_CHANNEL` ID is correct
- Check that bot has "Send Messages" permission in that channel
- Make sure channel exists

### Bot offline
- Check console for errors
- Verify `DISCORD_BOT_TOKEN` is valid
- Make sure bot is not running in another location

---

## 📚 RESOURCES

- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Slash Commands Guide](https://discord.js.org/#/docs/discord.js/stable/general/welcome)

---

## 🎯 NEXT STEPS

1. ✅ Create Discord application
2. ✅ Set up environment variables
3. ✅ Add bot to your server
4. ✅ Start the bot
5. 🔄 Test commands in Discord
6. 📝 Customize tips and achievements
7. 🚀 Deploy to production

---

**💜 Your Discord community is now powered by TrixieVerse!**
