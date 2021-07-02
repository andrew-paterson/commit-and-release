const lib = require('./lib');
const simpleGit = require('simple-git');
const options = {
  // baseDir: '../pandago'
}
const commitMessage = 'Commit 1';
const tagMessage = 'tag message'
const git = simpleGit(options);

async function run() {
  // console.log(await git.status());

  await git.add('.');
 
  await git.commit(commitMessage);
  // console.log(await git.push());
  const newTag = await lib.bumpTag(git, {releaseType:'major'});
  console.log(newTag);
  const tagArgs = tagMessage ? ['-a', newTag, '-m', tagMessage] : [newTag];
  await git.tag(tagArgs);
  console.log(await git.tag());
}

run();