const chalk = require('chalk');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');

module.exports = {
  async run(opts = {}) {
    if (!opts.commitMessage) {
      return {
        status: 'error',
        error: 'You must pass commitMessage in the options arg.'
      }
    }
    const baseDir = opts.repo ? path.resolve(opts.repo) : path.resolve(process.cwd());
    const repoName = path.basename(baseDir);
    const options = {
      baseDir: baseDir,
    }
    const commitMessage = opts.commitMessage;
    const git = simpleGit(options);
    let packageFile;
    try {
      packageFile = require(`${baseDir}/package.json`)
    }
    catch (err) {
      packageFile = {};
    }
    try {
      const diff = await git.diff();
      const hasChangesToCommit = diff.length > 0;
      const gitLog = await git.log();
      const headTag = gitLog.latest.refs.match(/.*tag: (.*?),.*/);
      let newTag;
      let newSha;
      if (!hasChangesToCommit && headTag) {
        console.log(chalk.cyan(`[${repoName}] Nothing to commit - HEAD is still at ${gitLog.latest.hash}`));
        console.log(chalk.cyan(`[${repoName}] Tagging skipped, HEAD already tagged with ${headTag[1]}`));
      } else {
        // let newTag;
        // if (!headTag) {
        newTag = await this.bumpTag(git, {releaseType: opts.releaseType});
        if (packageFile.version && packageFile.version !== newTag) {
          packageFile.version = newTag;
          fs.writeFileSync(`${baseDir}/package.json`, JSON.stringify(packageFile,null, 2));
          console.log(chalk.green(`[${repoName}] Updated version in package.json to ${newTag}`));
        }
        // }
        await git.add('.');
        console.log(chalk.green(`[${repoName}] Added untracked files`));
        const commitResult = await git.commit(commitMessage);
        newSha = commitResult.commit.length ? commitResult.commit : null;
        if (newSha) {
          console.log(chalk.green(`[${repoName}] Add commit ${newSha} in branch ${commitResult.branch}: ${JSON.stringify(commitResult.summary)}`));
        } else {
          console.log(chalk.cyan(`[${repoName}] Nothing to commit - head is still at ${gitLog.latest.hash}`));
        }
        // } else {
          // console.log(chalk.cyan(`[${repoName}] Nothing to commit - head is still at ${gitLog.latest.hash}`));
        // }
        // if (headTag) {
          // console.log(chalk.cyan(`[${repoName}] Tagging skipped, head already tagged with ${headTag[1]}`));
        // } else {
        const tagArgs = opts.tagMessage ? ['-a', newTag, '-m', opts.tagMessage] : [newTag];
        await git.tag(tagArgs);
        const showTag = await git.show(newTag);
        const newTagCommit = showTag.split('\n').filter(line => line.startsWith('commit'));
        console.log(chalk.green(`[${repoName}] Added tag ${newTag} to ${newTagCommit}`));
        // }
      }
      await git.push();
      console.log(chalk.green(`[${repoName}] Pushed code`));
      await git.push(['--tags']);
      console.log(chalk.green(`[${repoName}] Pushed tags`));
      console.log(chalk.blue(`[${repoName}] Done`));
      return {
        status: 'success',
        results: {
          tag: newTag || headTag[1],
          commit: newSha || gitLog.latest.hash
        }
      }
    }
    catch (err) {
      console.log(chalk.red(err));
      return {
        status: 'error',
        error: err
      }
    }
  }, 

  async bumpTag(git, opts = {}) {
    const releaseTypes = ['major', 'minor', 'patch'];
    const releaseType = opts.releaseType || 'patch';
    const matchIndex = releaseTypes.indexOf(releaseType);
    const highestTag = await this.highestTag(git) 
    const numbers = highestTag.match(/(\d*)\.(\d*)\.(\d*)/);
    const newVersion = releaseTypes.map((_, index) => {
      if (index < matchIndex) {
        return numbers[index + 1];
      } else if (index === matchIndex) {
        return parseInt(numbers[index + 1]) + 1;
      } else {
        return '0';
      }
    }).join('.');
    return highestTag.replace(/\d*\.\d*\.\d*/, newVersion);
  },

  highestTag(git) {
    return new Promise((resolve, reject) => {
      git.tag(null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        if (!result.length) {
          reject('No existing tags');
          return;
        }
        const tags = result.split('\n');
        resolve(tags.sort((a, b) => {
          return this.naturalSort(b, a);
        })[0]);
      });
    });
  },

  naturalSort(a, b) {
    var ax = [],
      bx = [];
    a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) {
      ax.push([$1 || Infinity, $2 || ""]);
    });
    b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) {
      bx.push([$1 || Infinity, $2 || ""]);
    });
    while (ax.length && bx.length) {
      var an = ax.shift();
      var bn = bx.shift();
      var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
      if (nn) {
        return nn;
      }
    }
    return ax.length - bx.length;
  }
}