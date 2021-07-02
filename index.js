const lib = require('./lib');
const simpleGit = require('simple-git');
const options = {
  baseDir: '../pandago'
}
const git = simpleGit(options);

async function run() {
  const newTag = await lib.bumpTag(git, {releaseType:'major'});
}

run();