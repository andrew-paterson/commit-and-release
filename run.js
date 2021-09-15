const  tagAndRelease = require('./index');
const nodeUtils = require('node-utils');
const commitMessage = nodeUtils.getNamedArgVal('--commit-msg');
const releaseType = nodeUtils.getNamedArgVal('--release-type');

if (!commitMessage) {
  console.log('The --commit_msg argument is required.');
  return;
}

(async function () {
  const res = await tagAndRelease.run({commitMessage: commitMessage, releaseType: releaseType});
  console.log(res);
})()