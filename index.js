const lib = require('./lib');
const simpleGit = require('simple-git');
const options = {
  // baseDir: '../pandago'
}
const commitMessage = 'Commit 6';
const tagMessage = 'tag message 6'
const git = simpleGit(options);

async function run() {
  // console.log(await git.status());

  await git.add('.');
 
  await git.commit(commitMessage);
  // console.log(await git.push());
  const newTag = await lib.bumpTag(git);
  // console.log(newTag);
  const tagArgs = tagMessage ? ['-a', newTag, '-m', tagMessage] : [newTag];
  await git.tag(tagArgs);
  const showTag = await git.show(newTag);
  const newtagCommit = showTag.split('\n').filter(line => line.startsWith('commit'));
  console.log(`Added new ${showTag.split('\n')[0]} to ${newtagCommit}`);
  // console.log(await lib.highestTag(git));

  // console.log(await git.tag());
}

run();