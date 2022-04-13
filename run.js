const tagAndRelease = require('./index');
const lib = require('node-sundries');
const commitMessage = lib.getNamedArgVal('--commit-msg');
const releaseType = lib.getNamedArgVal('--release-type');

if (!commitMessage) {
  console.log('The --commit_msg argument is required.');
  return;
}

(async function () {
  const res = await tagAndRelease.run({commitMessage: commitMessage, releaseType: releaseType});
  console.log(res);
})()