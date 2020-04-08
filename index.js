const core = require('@actions/core');
const { IncomingWebhook } = require('@slack/webhook');

const repository = process.env.GITHUB_REPOSITORY;
const event = process.env.GITHUB_EVENT_NAME;
const runId = process.env.GITHUB_RUN_ID;
const commit = process.env.GITHUB_SHA;




async function run() {
  const url = core.getInput('slack-webhook-url', { required: true });
  const webhook = new IncomingWebhook(url);
  
  
  var arguments = {
    username: 'FAFSA Tracker: CI/CD',
    icon_emoji: ':+1',
    channel: '#devops'
  };
  
  var message = {
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Job Run Succeeded: *<https://github.com/" + repository + "/runs/" + runId + "|test>*"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "fields": [
          {
            "type": "mrkdwn",
            "text": "*PR:*\n<https://github.com/" + repository + "/pull/3028|#3130> - Fflv Aggregation Final"
          },
                          {
            "type": "mrkdwn",
            "text": "*Branch:*\nfflv-aggregation"
          },
                          {
            "type": "mrkdwn",
            "text": "*Author:*\nBen Robinson"
          },
                          {
            "type": "mrkdwn",
            "text": "*Commit:*\n<https://github.com/" + repository + "/commits/" + commit + "|" + commit.slice(7) + ">"
          }
        ]
      }
    ]
  };
  
  
  // Send Webhook Post Request
  try{
    await webhook.send(message, arguments);
  } catch (error) {
    core.setFailed(`Action failed with error ${error}`);
  }
}

run()
