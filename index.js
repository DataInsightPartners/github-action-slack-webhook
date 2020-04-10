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
      fields = []
      fallback = '',
      color = '#95a5a6';
 
  // Get Pull Request Info (if event is Pull Request)
  if(context.eventName === 'pull_request') {
    var pullRequest = await octokit.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number
    });
  }          

  // Set Title
  if(jobName === 'test') {
    icon_emoji = ':pencil:';
    title = context.repo.repo + " Test: " + jobStatus.toUpperCase();
    titleLink = "https://github.com/" + repo_path + "/actions/runs/" + runId;
  }

  if(jobName === 'deploy') {
    icon_emoji = ':rocket:';
    title = context.repo.repo + " Deploy: " + jobStatus.toUpperCase();
    titleLink = "https://us-west-2.console.aws.amazon.com/codesuite/codedeploy/deployments/" + deploymentId;
  }

  // Determine Fallback
  fallback = title;
  if(context.eventName === 'pull_request') {
    fallback += ' (#' + context.payload.pull_request.number + ' - ' + pullRequest.data.title + ')';
  } else {
    fallback += ' (' + context.ref.split('/')[2] + ')';
  }

  // Determine Color
  if(jobStatus.toLowerCase() === 'success') {
    color = '#27ae60';
  } 
  if(jobStatus.toLowerCase() === 'failure') {
    color = '#c0392b';
  }

  // Set Fields
  fields.push({
    "title": "Event",
    "value": context.eventName
  });



  if(context.eventName === 'pull_request') {
    fields.push({
      "title": "PR",
      "value": "<" + context.payload.pull_request.html_url + "|#" + context.payload.pull_request.number + " - " + pullRequest.data.title + ">"
    });
  } else {
    fields.push({
      "title": "Branch",
      "value": context.ref.split('/')[2]
    });
  }

  fields.push({
    "title": "Actor",
    "value": context.actor
  });

  if(context.eventName === 'pull_request') {
    fields.push({
      "title": "Commit",
      "value": "<https://github.com/" + repo_path + "/pull/" + context.payload.pull_request.number + "/commits/" + context.sha + "|" + context.sha.substring(0,7) + ">"
    });
  } else {
    fields.push({
      "title": "Commit",
      "value": "<https://github.com/" + repo_path + "/commit/" + context.sha + "|" + context.sha.substring(0,7) + ">"
    });    
  }
  

  fallback = context.repo.repo + " Test: " + jobStatus.toUpperCase();


  // Compose Message
  var message = {
    "attachments": [
        {
        "title": title,
        "title_link": titleLink,
        "fallback": fallback,
        "fields": fields,
        "color": color
        }
    ]
  };

  // Create webhook instance
  var arguments = {
    username: context.repo.repo + ': ' + jobName,
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
