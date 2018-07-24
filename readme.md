# Diagnosis Chatbot

A work in progress chatbot built using the BotKit framework.

Uses the Dialogflow NLP engine and custom built AI engine to refer user a specialist depending on their symptom inputs.

### Setup

Create a `.env` file that holds the following environment variables:

```
page_token=<facebook_messenger_page_token>
verify_token=<facebook_messenger_verify_token>
studio_token=<botkit_studio_token>
dialogflow=<dialogflow_client_access_token>
DASHBOT_API_KEY=<dashbot_api_key>
app_secret=<facebook_app_secret>
```

To run, simply type:
```
npm run dev
```

In order for facebook messenger to connect to your localhost during development, your webhook needs to be exposed, i.e. a public domain needs to redirect to your localhost server.

The following are recommended:

* [Pagekite](https://pagekite.net/home/)
* [Ngrok](https://ngrok.com/)
* [Localtunnel](https://localtunnel.github.io/www/)
