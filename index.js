const lib = require('./lib');
const chalk = require('chalk');
const simpleGit = require('simple-git');
const options = {
  // baseDir: '../pandago'
}
const commitMessage = 'Commit 6';
const tagMessage = 'tag message 6'
const git = simpleGit(options);

async function run() {
  try {
    await git.add('.');
    console.log(chalk.green('Added untracked files'));
    await git.commit(commitMessage);
    console.log(chalk.green('Committed changes'));
    const newTag = await lib.bumpTag(git);
    const tagArgs = tagMessage ? ['-a', newTag, '-m', tagMessage] : [newTag];
    await git.tag(tagArgs);
    const showTag = await git.show(newTag);
    const newtagCommit = showTag.split('\n').filter(line => line.startsWith('commit'));
    console.log(chalk.green(`Added new ${showTag.split('\n')[0]} to ${newtagCommit}`));
    await git.push();
    console.log(chalk.green('Pushed code'));
    await git.push(['--tags']);
    console.log(chalk.green('Pushed tags'));
  }
  catch (err) {
    console.log(err);
  }
}

run();