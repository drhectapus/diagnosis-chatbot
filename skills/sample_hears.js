/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/
// Enable dialogflow middleware
var dialogflowMiddleware = require('botkit-middleware-dialogflow')({
  token: process.env.dialogflow
});

var wordfilter = require('wordfilter');

// * denotes intents that have webhook enabled, followed by their action name
const DIALOGFLOW_INTENTS = [
  'test',
  'default-fallback',
  'symptom.start',          // * Clears symptoms array
  'symptom.input.1',
  'symptom.input.1-yes',    // * symptom1.confirmed --> stores symptoms in current_symptoms context
  'symptom.input.1-no',
  'symptom.ask.2',
  'symptom.ask.2-yes',
  'symptom.ask.2-no',       // * symptom.end
  'symptom.input.2',
  'symptom.input.2-yes',    // * symptom2.confirmed --> stores symptoms in current_symptoms context
  'symptom.input.2-no',
  'symptom.ask.3',
  'symptom.ask.3-yes',
  'symptom.ask.3-no',       // * symptom.end
  'symptom.input.3',
  'symptom.input.3-yes',    // * symptom3.confirmed --> invokes symptom_end event
  'symptom.input.3-no',
  'symptom.end'             // * Clears symptoms array
];

module.exports = function(controller) {

    /* Collect some very simple runtime stats for use in the uptime/debug command */
    var stats = {
        triggers: 0,
        convos: 0,
    }

    controller.on('heard_trigger', function() {
        stats.triggers++;
    });

    controller.on('conversationStarted', function() {
        stats.convos++;
    });

    // Listens for intent names with test, get-started, default-fallback, symptom-input from Dialogflow and replies with the fulfilled message response
    controller.hears(DIALOGFLOW_INTENTS, 'message_received', dialogflowMiddleware.hears, function(
        bot,
        message
    ) {
      // console.log('INCOMING MESSAGE:', message);

      // If message object contains quick replies, then include that in reply
      if (message.fulfillment.messages[1]) {
        const { replies } = message.fulfillment.messages[1];

        const quick_replies = [];

        replies.forEach(reply => {
          let replyObject = {
            title: reply,
            payload: reply
          };

          quick_replies.push(replyObject);
        });
        console.log('QUICK REPLIES:', quick_replies);

        bot.replyWithTyping(message, {
          text: message.fulfillment.messages[0].speech,
          quick_replies: quick_replies
        });
      // Otherwise reply only with text
      } else {
        bot.replyWithTyping(message, message.fulfillment.messages[0].speech);
      }

    });


    // controller.hears(['^uptime','^debug'], 'message_received', function(bot, message) {
    //
    //     bot.createConversation(message, function(err, convo) {
    //         if (!err) {
    //             convo.setVar('uptime', formatUptime(process.uptime()));
    //             convo.setVar('convos', stats.convos);
    //             convo.setVar('triggers', stats.triggers);
    //
    //             convo.say('My main process has been online for {{vars.uptime}}. Since booting, I have heard {{vars.triggers}} triggers, and conducted {{vars.convos}} conversations.asdasd');
    //             convo.activate();
    //         }
    //     });
    //
    // });
    //
    // controller.hears(['^say (.*)','^say'], 'message_received', function(bot, message) {
    //     if (message.match[1]) {
    //
    //         if (!wordfilter.blacklisted(message.match[1])) {
    //             bot.reply(message, message.match[1]);
    //         } else {
    //             bot.reply(message, '_sigh_');
    //         }
    //     } else {
    //         bot.reply(message, 'I will repeat whatever you say.')
    //     }
    // });


    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* Utility function to format uptime */
    function formatUptime(uptime) {
        var unit = 'second';
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'minute';
        }
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'hour';
        }
        if (uptime != 1) {
            unit = unit + 's';
        }

        uptime = parseInt(uptime) + ' ' + unit;
        return uptime;
    }

};
