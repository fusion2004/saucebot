const { Command } = require('discord.js-commando');

const { store, streamUpdater } = require('../../lib/chorus-store');
const StreamManager = require('../../lib/stream_manager');

module.exports = class StartPartyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'startparty',
      aliases: ['party'],
      group: 'compoverse',
      memberName: 'startparty',
      description: 'Starts a listening party for a Compo round',
      guildOnly: true,
      args: [
        {
          key: 'round',
          prompt: 'What round would you like to start a party for?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { round }) {
    let currentStream = store.state.context.stream.manager;
    if (currentStream && !currentStream.stopped) {
      message.reply('there is currently a listening party streaming. We can only stream one at a time.');
      return;
    }

    let streamManager = new StreamManager(round);
    // TODO: this likely should be updated to message, not channel
    store.send(streamUpdater.update({ manager: streamManager, channel: message.channel }));

    streamManager.on('intro', function() {
      message.say('**Playing stream intro before we get this party started...**');
    });

    streamManager.on('playing', function(song) {
      message.say(`**Playing "${song.title}" by ${song.artist}...**`);
    });

    streamManager.on('compoMetadataFetching', function() {
      message.say(`*Gathering round ${round} metadata...*`);
    });
    streamManager.on('fetchingSongs', function() {
      message.say(`*Downloading ${round} songs...*`);
    });
    streamManager.on('transcodingSongs', function() {
      message.say(`*Transcoding ${round} songs for streaming...*`);
    });
    streamManager.on('generatingAnnouncer', function() {
      message.say('*Clearing throat, performing vocal exercises...*');
    });

    streamManager.on('finish', () => {
      this.client.user.setActivity('nothing...');
      message.say('**Finished playing...**');
    });

    streamManager.on('startingStream', function() {
      message.say(`**Starting stream... ${streamManager.streamUrl()}**`);
    });

    this.client.user.setActivity(`in #${message.channel.name}`);
    streamManager.start();
  }
};
