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
  await git.tag(tagArgs, function(err, result) {
    if (!err) {
      console.log(lib.highestTag(git));
    }
  });
  // console.log(await git.tag());
}

run();