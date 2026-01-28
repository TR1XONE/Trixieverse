/**
 * TrixieVerse Discord Bot
 * Revolutionary AI Coaching Platform - Community Integration
 * 
 * Features:
 * - Slash commands for coaching tips, stats, achievements
 * - Real-time achievement notifications
 * - Daily coaching tips
 * - Leaderboard updates
 */

import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
  Colors,
} from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const GUILD_ID = process.env.DISCORD_GUILD_ID || '';
const NOTIFICATIONS_CHANNEL = process.env.DISCORD_NOTIFICATIONS_CHANNEL || '';
const LEADERBOARD_CHANNEL = process.env.DISCORD_LEADERBOARD_CHANNEL || '';

// ========== COACHING TIPS DATABASE ==========
const COACHING_TIPS = [
  {
    title: '⚙️ Mechanics Mastery',
    description:
      'Focus on champion mechanics first. Master your combos in practice mode before ranked games. Consistent mechanics = consistent wins.',
    coach: 'Your Coach',
  },
  {
    title: '🗺️ Map Awareness',
    description:
      'Check the minimap every 3-5 seconds. If you can\'t see enemies, assume they\'re coming to kill you. Vision wins games!',
    coach: 'Macro Mentor',
  },
  {
    title: '💪 Farming Fundamentals',
    description:
      'Aim for 6+ CS per minute. That\'s 360 CS in a 60-minute game. Missing 10 CS = missing a kill\'s worth of gold. CS is king!',
    coach: 'Farm Master',
  },
  {
    title: '🔥 Clutch Plays',
    description:
      'Stay calm under pressure. Clutch moments are won by clear thinking, not mechanical outplays. Breathe, focus, execute.',
    coach: 'Pressure Tester',
  },
  {
    title: '🎯 Wave Management',
    description:
      'Control the minion wave. Push when ahead, freeze when behind. Wave management is the foundation of macro play.',
    coach: 'Wave Wizard',
  },
  {
    title: '🤝 Team Play',
    description:
      'Follow your team. A bad teamfight together is better than a good play alone. Consistency > Flashiness.',
    coach: 'Team Coach',
  },
  {
    title: '⏰ Timing & Cooldowns',
    description:
      'Track enemy cooldowns. Ultimate abilities, summoner spells, item actives. Exploit windows when they\'re on cooldown.',
    coach: 'Timing Expert',
  },
  {
    title: '🛡️ Defensive Play',
    description:
      'Learn to play safe. Being alive > getting kills. A safe death-free game shows discipline and game knowledge.',
    coach: 'Defense Specialist',
  },
];

// ========== ACHIEVEMENT DATABASE ==========
const ACHIEVEMENTS_DB: Record<string, any> = {
  bronze_climber: {
    name: 'Bronze Climber',
    icon: '🥉',
    description: 'Reach Bronze rank',
    rarity: 'common',
  },
  silver_climber: {
    name: 'Silver Climber',
    icon: '⚪',
    description: 'Reach Silver rank',
    rarity: 'uncommon',
  },
  gold_climber: {
    name: 'Gold Climber',
    icon: '🟡',
    description: 'Reach Gold rank',
    rarity: 'rare',
  },
  win_streak_5: {
    name: 'Hot Hand',
    icon: '🔥',
    description: 'Win 5 games in a row',
    rarity: 'uncommon',
  },
  win_streak_10: {
    name: 'On Fire!',
    icon: '🌊',
    description: 'Win 10 games in a row',
    rarity: 'rare',
  },
  cs_master: {
    name: 'CS Master',
    icon: '📊',
    description: 'Maintain 6+ CS/min for 10 games',
    rarity: 'uncommon',
  },
  friend_stage: {
    name: 'True Friend',
    icon: '👥',
    description: 'Reach Friend stage with coach',
    rarity: 'uncommon',
  },
  legend_stage: {
    name: 'Unbreakable Bond',
    icon: '💜',
    description: 'Reach Legend stage with coach',
    rarity: 'legendary',
  },
};

// ========== BOT READY ==========
client.on('ready', () => {
  console.log(`✅ TrixieVerse bot logged in as ${client.user?.tag}`);
  client.user?.setActivity('🎮 Wild Rift Coaching', { type: 'PLAYING' });

  registerSlashCommands();
  scheduleDaily();
});

// ========== SLASH COMMANDS ==========
const commands = [
  new SlashCommandBuilder()
    .setName('coaching_tip')
    .setDescription('Get a daily coaching tip from your AI coach')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('skill_check')
    .setDescription('Check your CoachOS skill profile')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('my_achievements')
    .setDescription('View your unlocked achievements')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('achievements_list')
    .setDescription('View all available achievements')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the TrixieVerse leaderboard')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with TrixieVerse commands')
    .toJSON(),
];

async function registerSlashCommands() {
  if (!GUILD_ID || !TOKEN) return;

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    console.log('🔄 Registering slash commands...');
    await rest.put(Routes.applicationGuildCommands(client.user?.id || '', GUILD_ID), {
      body: commands,
    });
    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
}

// ========== INTERACTION HANDLER ==========
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    switch (interaction.commandName) {
      case 'coaching_tip':
        await handleCoachingTip(interaction);
        break;
      case 'skill_check':
        await handleSkillCheck(interaction);
        break;
      case 'my_achievements':
        await handleMyAchievements(interaction);
        break;
      case 'achievements_list':
        await handleAchievementsList(interaction);
        break;
      case 'leaderboard':
        await handleLeaderboard(interaction);
        break;
      case 'help':
        await handleHelp(interaction);
        break;
    }
  } catch (error) {
    console.error('Command error:', error);
    await interaction.reply({
      content: '❌ An error occurred while processing your command.',
      ephemeral: true,
    });
  }
});

// ========== COMMAND HANDLERS ==========

async function handleCoachingTip(interaction: any) {
  const tip = COACHING_TIPS[Math.floor(Math.random() * COACHING_TIPS.length)];

  const embed = new EmbedBuilder()
    .setColor(Colors.Cyan)
    .setTitle(`💡 ${tip.title}`)
    .setDescription(tip.description)
    .setFooter({ text: `— ${tip.coach}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleSkillCheck(interaction: any) {
  const skillProfile = {
    mechanics: 72,
    macroPlay: 65,
    decisionMaking: 78,
    consistency: 70,
    clutchFactor: 85,
    overall: 74,
    trend: 'improving',
  };

  const skillBars = `
**Mechanics** ████████░░ 72/100
**Macro Play** ██████░░░░ 65/100
**Decision Making** ███████░░░ 78/100
**Consistency** ███████░░░ 70/100
**Clutch Factor** ████████░░ 85/100
  `.trim();

  const embed = new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setTitle('📊 Your Skill Radar')
    .setDescription(`\`\`\`${skillBars}\`\`\``)
    .addFields(
      {
        name: 'Overall Rating',
        value: `${skillProfile.overall}/100`,
        inline: true,
      },
      { name: 'Trend', value: `📈 ${skillProfile.trend}`, inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleMyAchievements(interaction: any) {
  const unlockedAchievements = [
    ACHIEVEMENTS_DB.win_streak_5,
    ACHIEVEMENTS_DB.cs_master,
    ACHIEVEMENTS_DB.friend_stage,
  ];

  const achievementList = unlockedAchievements
    .map((ach) => `${ach.icon} **${ach.name}** - ${ach.description}`)
    .join('\n');

  const embed = new EmbedBuilder()
    .setColor(Colors.Gold)
    .setTitle(`🏆 Your Achievements (${unlockedAchievements.length}/8)`)
    .setDescription(achievementList || 'No achievements yet. Keep grinding!')
    .setFooter({ text: 'Keep playing to unlock more!' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleAchievementsList(interaction: any) {
  const achievements = Object.values(ACHIEVEMENTS_DB)
    .map((ach) => `${ach.icon} **${ach.name}** [${ach.rarity}]\n${ach.description}`)
    .join('\n\n');

  const embed = new EmbedBuilder()
    .setColor(Colors.Purple)
    .setTitle('🏅 Achievement Collection')
    .setDescription(achievements)
    .setFooter({ text: 'Unlock achievements by playing and improving!' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleLeaderboard(interaction: any) {
  const leaderboard = [
    { name: 'Trixie', value: '89%', emoji: '🥇' },
    { name: 'Blaze', value: '87%', emoji: '🥈' },
    { name: 'Echo', value: '85%', emoji: '🥉' },
    { name: 'Nova', value: '82%', emoji: '4️⃣' },
    { name: 'Sage', value: '80%', emoji: '5️⃣' },
  ];

  const leaderboardText = leaderboard
    .map((entry) => `${entry.emoji} **${entry.name}** - ${entry.value}`)
    .join('\n');

  const embed = new EmbedBuilder()
    .setColor(Colors.Gold)
    .setTitle('🏆 TrixieVerse Leaderboard')
    .setDescription(leaderboardText)
    .setFooter({ text: 'Updated in real-time' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleHelp(interaction: any) {
  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle('📖 TrixieVerse Bot Commands')
    .addFields(
      {
        name: '/coaching_tip',
        value: 'Get a random coaching tip from your AI coach',
      },
      {
        name: '/skill_check',
        value: 'View your CoachOS skill profile (5D radar)',
      },
      {
        name: '/my_achievements',
        value: 'View your unlocked achievements',
      },
      {
        name: '/achievements_list',
        value: 'View all available achievements',
      },
      {
        name: '/leaderboard',
        value: 'View the TrixieVerse leaderboard',
      },
      {
        name: '/help',
        value: 'Show this help message',
      }
    )
    .setFooter({ text: '💜 Every player becomes a legend in TrixieVerse' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

// ========== SCHEDULED TASKS ==========

function scheduleDaily() {
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 9 && now.getMinutes() === 0) {
      await sendDailyTip();
    }
  }, 60000);
}

async function sendDailyTip() {
  try {
    const channel = await client.channels.fetch(NOTIFICATIONS_CHANNEL);
    if (!channel || !channel.isTextBased()) return;

    const tip = COACHING_TIPS[Math.floor(Math.random() * COACHING_TIPS.length)];

    const embed = new EmbedBuilder()
      .setColor(Colors.Yellow)
      .setTitle('☀️ Good Morning! Today\'s Coaching Tip')
      .setDescription(tip.title)
      .addFields({ name: 'Tip', value: tip.description })
      .setFooter({ text: `— ${tip.coach}` })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to send daily tip:', error);
  }
}

// ========== EXPORT FUNCTIONS FOR BACKEND ==========

export async function notifyAchievementUnlocked(
  username: string,
  achievement: { icon: string; name: string; description: string; rarity: string }
) {
  try {
    const channel = await client.channels.fetch(NOTIFICATIONS_CHANNEL);
    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(Colors.Gold)
      .setTitle(`${achievement.icon} Achievement Unlocked!`)
      .addFields(
        { name: 'Player', value: username, inline: true },
        { name: 'Achievement', value: achievement.name, inline: true },
        { name: 'Rarity', value: achievement.rarity, inline: true }
      )
      .setDescription(achievement.description)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to send achievement notification:', error);
  }
}

export async function notifyRankUp(username: string, newRank: string) {
  try {
    const channel = await client.channels.fetch(NOTIFICATIONS_CHANNEL);
    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle('📈 Rank Up!')
      .addFields(
        { name: 'Player', value: username, inline: true },
        { name: 'New Rank', value: newRank, inline: true }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to send rank up notification:', error);
  }
}

// ========== LOGIN ==========
if (TOKEN) {
  client.login(TOKEN);
} else {
  console.warn('⚠️ DISCORD_BOT_TOKEN not set. Bot will not start.');
}

export default client;
