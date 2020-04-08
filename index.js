const core = require('@actions/core');
const github = require('@actions/github');
const { IncomingWebhook } = require('@slack/webhook');

const context = github.context;
const repo_path = context.repo.owner + "/" + context.repo.repo;
const runId = process.env.GITHUB_RUN_ID; // actions/runs/


async function run() {
  const octokit = new github.GitHub(core.getInput('github-token'));
  const url = core.getInput('slack-webhook-url', { required: true });
  const jobName = core.getInput('job-name', { required: true });
  const jobStatus = core.getInput('job-status', { required: true });
  const deploymentId = core.getInput('deployment-id', { required: false });


  var icon_emoji = '',
      title = '',
      titleLink = '',
      fields = [],
      color = '#95a5a6';
  
  // Set message and fields depending on job type
  if(jobName === 'test') {
    icon_emoji = ':pencil:';
    title = "Test " + jobStatus + ": " + context.workflow;
    titleLink = "https://github.com/" + repo_path + "/actions/runs/" + runId;
  }

  if(jobName === 'deploy') {
    icon_emoji = ':rocket:';
    title = "Deploy " + jobStatus + ": *<https://us-west-2.console.aws.amazon.com/codesuite/codedeploy/deployments/" + deploymentId + "|" + deploymentId + ">*"
  }

  if(jobStatus.toLowerCase() === 'success') {
    color = '#27ae60';
  } 
  if(jobStatus.toLowerCase() === 'failure') {
    color = '#c0392b';
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
    var pullRequest = await octokit.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number
    });

    fields.push({
      "type": "mrkdwn",
      "text": "*PR:*\n<" + context.payload.pull_request.html_url + "|#" + context.payload.pull_request.number + " - " + pullRequest.data.title + ">"
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
    "title": title,
    "title_link": titleLink,
    "attachments": [
      {
        "fallback": context.repo.repo + ': ' + context.workflow + ' - ' + jobName + ' ' + jobStatus,
        "fields": fields,
        "color": color
      }
    ]
  };

  // Create webhook instance
  var arguments = {
    username: context.repo.repo + ': ' + context.workflow + ' - ' + jobName,
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
