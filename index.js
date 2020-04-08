const core = require('@actions/core');
const github = require('@actions/github');
const { IncomingWebhook } = require('@slack/webhook');

const context = github.context;
const repo_path = context.repo.owner + "/" + context.repo.repo;
const runId = process.env.GITHUB_RUN_ID; // actions/runs/




async function run() {
  const url = core.getInput('slack-webhook-url', { required: true });
  var arguments = {
    username: 'FAFSA Tracker: CI/CD',
    icon_emoji: ':+1',
    channel: '#devops'
  };
  
  const webhook = new IncomingWebhook(url, arguments);
  

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
    "text": "*Commit:*\n<https://github.com/" + repo_path + "/commit/" + context.sha + "|" + context.sha.substring(0,7) + ">\n"
  });

  
  var message = {
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*" + repo_path + "*\nJob Run Succeeded: *<https://github.com/" + repo_path + "/actions/runs/" + runId + "|" + context.workflow + ">*"
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
    await webhook.send(message);
  } catch (error) {
    core.setFailed(`Action failed with error ${error}`);
  }
}

run()
