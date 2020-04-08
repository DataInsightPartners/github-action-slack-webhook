const core = require('@actions/core');
const { IncomingWebhook } = require('@slack/webhook');

const repository = process.env.GITHUB_REPOSITORY;
const workflow = process.env.GITHUB_WORKFLOW;
const event = process.env.GITHUB_EVENT_NAME;
const runId = process.env.GITHUB_RUN_ID; // actions/runs/
const commit = process.env.GITHUB_SHA;
const ref = process.env.GITHUB_REF;
const actor = process.env.GITHUB_ACTOR;




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
          "text": "Job Run Succeeded: *<https://github.com/" + repository + "/actions/runs/" + runId + "|" + workflow + ">*"
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
            "text": "*Event:*\n" + event
          },
          {
            "type": "mrkdwn",
            "text": "*Ref:*\n" + ref
          },
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
            "text": "*Actor:*\n" + actor
          },
          {
            "type": "mrkdwn",
            "text": "*Commit:*\n<https://github.com/" + repository + "/commit/" + commit + "|" + commit.slice(7) + ">"
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
