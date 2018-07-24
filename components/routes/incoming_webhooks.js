var debug = require('debug')('botkit:incoming_webhooks');
var request = require('request');

const DIAGNOSIS_API = 'http://ai-stage.finddoc.com:8080';

module.exports = function(webserver, controller) {

    const pausedUsers = {};

    debug('Configured POST /facebook/receive url for receiving events');
    webserver.post('/facebook/receive', function(req, res) {
        // NOTE: we should enforce the token check here

        // respond to Slack that the webhook has been received.
        res.status(200);
        res.send('ok');

        var bot = controller.spawn({});

        if (req.body.entry) {
          req.body.entry.forEach(entry => {
            if (entry.messaging) {
              entry.messaging.forEach(event => {
                const recipientId = event.sender.id;

                if (!pausedUsers[recipientId]) {
                  // Handle webhook if session is not paused for this userId
                  controller.handleWebhookPayload(req, res, bot);
                }
              });
            }
          });
        }
    });

    debug('Configured GET /facebook/receive url for verification');
    webserver.get('/facebook/receive', function(req, res) {
        if (req.query['hub.mode'] == 'subscribe') {
            if (req.query['hub.verify_token'] == controller.config.verify_token) {
                res.send(req.query['hub.challenge']);
            } else {
                res.send('OK');
            }
        }
    });

    // Create webhook to store userId when conversation is paused via Dashbot interface
    webserver.post('/pause', (req, res) => {
      const { paused, userId } = req.body;

      pausedUsers[userId] = paused;
      res.send('ok');
    });

    let symptoms = [];

    // Create webhook for Dialogflow to append symptoms to parameter list
    webserver.post('/dialogflow/appendsymptom', (req, res) => {
      // console.log('DIALOGFLOW REQ:', req.body.result);
      let context  = req.body.result.contexts[0].name;
      let { parameters } = req.body.result.contexts[0];
      let { action } = req.body.result;

      // console.log('CONTEXT:', context);
      // console.log('PARAMETERS:', parameters);
      console.log('ACTION:', action);

      // Once symptoms are confirmed, push into symptoms array and send back context containing current symptoms with followup event to trigger a new intent
      switch (action){
        case 'symptom.start':
          symptoms = [];
          return res.status(200);
        case 'symptom1.confirmed':
          parameters.symptom1 ? symptoms.push(parameters.symptom1) : '';
          return res.send(replyData("current_symptoms", "symptom2_ask"));
        case 'symptom2.confirmed':
          parameters.symptom2 ? symptoms.push(parameters.symptom2) : '';
          return res.send(replyData("current_symptoms", "symptom3_ask"));
        case 'symptom3.confirmed':
          parameters.symptom3 ? symptoms.push(parameters.symptom3) : '';
          return res.send(replyData("symptom-input-end", "symptom_end"));
        case 'symptom.end':

          // Iterate through array of symptoms and append to url string
          urlString = `${DIAGNOSIS_API}/diagnosis?`

          symptomParams = symptoms.map(symptom => `symptom_list=${symptom}`).join('&')

          urlString += symptomParams

          request({
            url: urlString,
            method: "GET",
          }, (error, response, body) => {
            console.log(JSON.parse(JSON.parse(body).diagnosis));

            diagnosisList = JSON.parse(JSON.parse(body).diagnosis);

            let diagnosisText = `We've reached the end. Judging from your symptoms, your most probably diagnosis is:\n\n`;

            diagnosisList.forEach(result => {
              diagnosisText += `${result.diagnosis}, common level: ${result.common}, prob: ${result.prob}\n\n`
            })

            return res.send(replyData(null, null, diagnosisText))
          });
        }

    });

    // Helper function to respond with correct context and followup events
    function replyData(contextOut, followupEvent, speechText) {
      return {
        speech: speechText ? speechText : undefined,
        contextOut: contextOut ? [
          {
            name: contextOut,
            lifespan: 1,
            parameters: {
              symptoms: symptoms
            }
          }
        ] : undefined,
        followupEvent: followupEvent ? {
          name: followupEvent,
          parameters: {
            symptoms: symptoms
          }
        } : undefined,
      }
    }
}
