const core = require('@actions/core');
const github = require('@actions/github');
const { IncomingWebhook } = require('@slack/webhook');

const context = github.context;

const runId = process.env.GITHUB_RUN_ID; // actions/runs/




async function run() {
  const url = core.getInput('slack-webhook-url', { required: true });
  const webhook = new IncomingWebhook(url);
  
  var arguments = {
    username: 'FAFSA Tracker: CI/CD',
    icon_emoji: ':+1',
    channel: '#devops'
  };

  var fields = [];

  fields.push({
    "type": "mrkdwn",
    "text": "*Event:*\n" + context.eventName + "\n"
  });

  fields.push({
    "type": "mrkdwn",
    "text": "*Ref:*\n" + context.ref + "\n"
  });

  if(context.eventName === 'pull_request') {
    fields.push({
      "type": "mrkdwn",
      "text": "*PR:*\n<" + context.payload.pull_request.html_url + "|#" + context.payload.pull_request.number + "> - " + context.payload.pull_request.body.substring(0,30) + "\n"
    });
  }

  fields.push({
    "type": "mrkdwn",
    "text": "*Actor:*\n" + context.actor + "\n"
  });

  fields.push({
    "type": "mrkdwn",
    "text": "*Commit:*\n<https://github.com/" + context.repo.repo + "/commit/" + context.sha + "|" + context.sha.substring(0,7) + ">\n"
  });

  
  var message = {
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Job Run Succeeded: *<https://github.com/" + context.repo + "/actions/runs/" + runId + "|" + context.workflow + ">*"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "fields": fields
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
