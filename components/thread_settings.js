var debug = require('debug')('botkit:thread_settings');



module.exports = function(controller) {

    debug('Configuring Facebook thread settings...');
    controller.api.messenger_profile.greeting('Hello! I\'m a Dr Diagnosis!');
    controller.api.messenger_profile.get_started('FACEBOOK_WELCOME');
    controller.api.thread_settings.delete_menu();
    // controller.api.thread_settings.menu([
    //     {
    //         "locale": "default",
    //         "composer_input_disabled": false,
    //         "call_to_actions": [
    //             {
    //                 "type":"postback",
    //                 "title":"Hello",
    //                 "payload":"hello"
    //             },
    //             {
    //                 "type":"postback",
    //                 "title":"Help",
    //                 "payload":"help"
    //             },
    //             {
    //               "type":"nested",
    //               "title":"Botkit Docs",
    //               "call_to_actions": [
    //                   {
    //                     type: "web_url",
    //                     "title": "Facebook Docs",
    //                     "url":"https://github.com/howdyai/botkit/blob/master/docs/readme-facebook.md",
    //                     "webview_height_ratio":"full",
    //                   },
    //                   {
    //                     type: "web_url",
    //                     "title": "Main Readme",
    //                     "url":"https://github.com/howdyai/botkit/blob/master/readme.md",
    //                     "webview_height_ratio":"full",
    //                   }
    //
    //               ]
    //             }
    //         ]
    //     }]);
}
