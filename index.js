const path = require('path');
const colors = require('colors');
const { CommandoClient } = require('discord.js-commando');

const fetchEnv = require('./utils/fetch-env');
const { roleIds, memberHasOneOfTheseRoles } = require('./utils/roles');

// importing colors extends the String prototype so we can call these directly
// on strings: 'something went wrong'.error
colors.setTheme({
  info: 'blue',
  help: 'cyan',
  warn: 'yellow',
  success: 'green',
  error: 'red'
});

let client = new CommandoClient({
  commandPrefix: '!',
  owner: '92330214046072832'
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['compoverse', 'Compoverse']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
  client.user.setActivity('with Commando');
});

client.on('error', console.error);

client.dispatcher.addInhibitor((message) => {
  // Only let ThaSauce & Compo Admins run compoverse commands
  if (message.command.group.id === 'compoverse') {
    let authorized = memberHasOneOfTheseRoles(message.member, [roleIds.thasauceAdmin, roleIds.compoAdmin]);
    if (!authorized) {
      return ['not-allowed', message.reply('you\'re not allowed to run compoverse commands')];
    }
  }
});

client.login(fetchEnv('HUBOT_DISCORD_TOKEN'));