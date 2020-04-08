const core = require('@actions/core');
const { IncomingWebhook } = require('@slack/webhook');

// const url = process.env.SLACK_WEBHOOK_URL;


async function run() {
  const url = core.getInput('slack-webhook-url', { required: true });
  const webhook = new IncomingWebhook(url);
  
  try{
    await webhook.send({
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Job Run Succeeded: *<https://github.com/DataInsightPartners/FAFSA-Laravel-App/runs/569589487|test>*"
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
              "text": "*PR:*\n<https://github.com/DataInsightPartners/MyEducationData/pull/3028|#3130> - Fflv Aggregation Final"
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
              "text": "*Commit:*\n<https://github.com/DataInsightPartners/MyEducationData/pull/3028/commits/8a132d4843e537de9b5367d92535fb22ab3f2f30|8a132d4>"
            }
          ]
        }
      ]
    }
    ,
    {
      username: 'FAFSA Tracker: CI/CD',
      icon_emoji: ':+1',
      channel: '#devops'
    });
  } catch (error) {
    core.setFailed(`Action failed with error ${error}`);
  }
}

run()
