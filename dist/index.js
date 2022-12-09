/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 185:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 797:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 386:
/***/ ((module) => {

module.exports = eval("require")("@slack/webhook");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(185);
const github = __nccwpck_require__(797);
const { IncomingWebhook } = __nccwpck_require__(386);

const context = github.context;
const repo_path = context.repo.owner + "/" + context.repo.repo;
const runId = process.env.GITHUB_RUN_ID; // actions/runs/


async function run() {
  const octokit = new github.GitHub(core.getInput('github-token'));
  const url = core.getInput('slack-webhook-url', { required: true });
  const jobName = core.getInput('job-name', { required: true });
  const jobStatus = core.getInput('job-status', { required: true });
  const deploymentId = core.getInput('deployment-id', { required: false });

  var commitSha = null,
      icon_emoji = '',
      title = '',
      titleLink = '',
      fields = []
      fallback = '',
      color = '#95a5a6';
 
  // Get Commit Info
  if(context.eventName === 'pull_request') {
    commitSha = core.getInput('pull-request-sha');
  } else {
    commitSha = context.sha;
  }

  var commit = await octokit.git.getCommit({
    owner: context.repo.owner,
    repo: context.repo.repo,
    commit_sha: commitSha
  });

  // Get Pull Request Info (if event is Pull Request)
  if(context.eventName === 'pull_request') {
    var pullRequest = await octokit.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number
    });
  }          

  // Set Title
  if(jobName.startsWith('test')) {
    icon_emoji = ':pencil:';
    title = context.repo.repo + " " + jobName.charAt(0).toUpperCase() + jobName.slice(1) + ": " + jobStatus.toUpperCase();
    titleLink = "https://github.com/" + repo_path + "/actions/runs/" + runId;
  }

  if(jobName.startsWith('deploy')) {
    icon_emoji = ':rocket:';
    title = context.repo.repo + " " + jobName.charAt(0).toUpperCase() + jobName.slice(1) + ": " + jobStatus.toUpperCase();
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
      "value": "<https://github.com/" + repo_path + "/pull/" + context.payload.pull_request.number + "/commits/" + commitSha + "|" + commitSha.substring(0,7) + "> - " + commit.data.message.substring(0,150)
    });
  } else {
    fields.push({
      "title": "Commit",
      "value": "<https://github.com/" + repo_path + "/commit/" + commitSha + "|" + commitSha.substring(0,7) + "> - " + commit.data.message.substring(0,150)
    });    
  }


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

})();

module.exports = __webpack_exports__;
/******/ })()
;