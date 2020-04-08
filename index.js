const core = require('@actions/core');
const github = require('@actions/github');
const { IncomingWebhook } = require('@slack/webhook');

const context = github.context;
const repo_path = context.repo.owner + "/" + context.repo.repo;
const runId = process.env.GITHUB_RUN_ID; // actions/runs/




async function run() {
  const url = core.getInput('slack-webhook-url', { required: true });
  const job = core.getInput('job', { required: true });
  const deploymentId = core.getInput('deployment-id', { required: false });
  core.info(url);
  core.info(job);
  core.info(deploymentId);

  var icon_emoji = '',
      header = '';
      fields = [];
  
  // Set message and fields depending on job type
  if(job === 'test') {
    icon_emoji = ':heavy_check_mark:';
    header = "Job Run Succeeded: *<https://github.com/" + repo_path + "/actions/runs/" + runId + "|" + context.workflow + ">*"
  }

  if(job === 'deploy') {
    icon_emoji = ':rocket:';
    header = "Deploy: *<https://us-west-2.console.aws.amazon.com/codesuite/codedeploy/deployments/" + deploymentId + "|" + deploymentId + ">*"

  }

  // Set universal fields
  fields.push({
    "type": "mrkdwn",
    "text": "*Event:*\n" + context.eventName
  });

  fields.push({
    "type": "mrkdwn",
    "text": "*Ref:*\n" + context.ref
  });

  if(context.eventName === 'pull_request') {
    fields.push({
      "type": "mrkdwn",
      "text": "*PR:*\n<" + context.payload.pull_request.html_url + "|#" + context.payload.pull_request.number + "> - " + context.payload.pull_request.body.substring(0,30)
    });
  }

  fields.push({
    "type": "mrkdwn",
    "text": "*Actor:*\n" + context.actor
  });

  fields.push({
    "type": "mrkdwn",
    "text": "*Commit:*\n<https://github.com/" + repo_path + "/commit/" + context.sha + "|" + context.sha.substring(0,7) + ">"
  });

  

  // Compose Message
  var message = {
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": header
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

  // Create webhook instance
  var arguments = {
    username: context.repo.repo + ': ' + context.workflow,
    icon_emoji: icon_emoji,
    channel: '#devops'
  };
  
  const webhook = new IncomingWebhook(url, arguments);  
  
  // Send Webhook Post Request
  try{
    await webhook.send(message);
  } catch (error) {
    core.setFailed(`Action failed with error ${error}`);
  }
}

run()
