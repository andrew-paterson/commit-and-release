const lib = require('./lib');
const simpleGit = require('simple-git');
const options = {
  // baseDir: '../pandago'
}
const commitMessage = 'Commit 1';
const git = simpleGit(options);

async function run() {
  console.log(await git.status());

  await git.add('.');
  const newTag = await lib.bumpTag(git, {releaseType:'major'});
  console.log(newTag);
  await git.commit(commitMessage);
  console.log(await git.status());
}

run();