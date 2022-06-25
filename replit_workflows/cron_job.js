const cron = require('easycron');

var settings = {
    interval: '0-5-0-0-0-0',
    script: `${process.cwd()}/replit_workflows/sync_changes.sh`
};
  
cron.newJob(settings);