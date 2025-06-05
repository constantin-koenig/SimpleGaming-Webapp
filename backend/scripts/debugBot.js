// backend/scripts/debugBot.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

async function debugBot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers
    ]
  });

  try {
    console.log('🔍 Debugging Discord Bot connection...');
    console.log('Bot Token:', process.env.DISCORD_BOT_TOKEN ? 'Present' : 'Missing');
    console.log('Guild ID from .env:', process.env.DISCORD_GUILD_ID);
    
    await client.login(process.env.DISCORD_BOT_TOKEN);
    console.log('✅ Bot logged in successfully');
    
    // Warten bis ready
    await new Promise(resolve => {
      if (client.isReady()) {
        resolve();
      } else {
        client.once('ready', resolve);
      }
    });
    
    console.log(`🤖 Bot is ready as ${client.user.tag}`);
    console.log(`🏰 Found ${client.guilds.cache.size} guilds:`);
    
    client.guilds.cache.forEach(guild => {
      console.log(`   - ${guild.name} (ID: ${guild.id}) - ${guild.memberCount} members`);
    });
    
    // Guild ID validieren
    const targetGuildId = process.env.DISCORD_GUILD_ID;
    if (targetGuildId) {
      const guild = client.guilds.cache.get(targetGuildId);
      if (guild) {
        console.log(`✅ Target guild found: ${guild.name}`);
        
        // Permissions checken
        const botMember = guild.members.cache.get(client.user.id);
        if (botMember) {
          console.log('🔐 Bot permissions in guild:');
          console.log(`   - View Channels: ${botMember.permissions.has('ViewChannel')}`);
          console.log(`   - Send Messages: ${botMember.permissions.has('SendMessages')}`);
          console.log(`   - Read Message History: ${botMember.permissions.has('ReadMessageHistory')}`);
          console.log(`   - View Server Members: ${botMember.permissions.has('ViewGuildInsights')}`);
        }
      } else {
        console.log(`❌ Target guild ${targetGuildId} not found`);
        console.log('💡 Make sure the bot is invited to this server');
      }
    } else {
      console.log('⚠️  No DISCORD_GUILD_ID set in .env');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    client.destroy();
    process.exit(0);
  }
}

debugBot();