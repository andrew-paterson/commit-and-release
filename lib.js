const chalk = require('chalk');
const simpleGit = require('simple-git');
const path = require('path');

module.exports =  {
  async tagAndRelease(opts = {}) {
    if (!opts.commitMessage) {
      return {
        status: 'error',
        error: 'You must pass commitMessage in the options arg.'
      }
    }
    const options = {
      baseDir: opts.repo ? path.resolve(opts.repo) : path.resolve(process.cwd()),
    }
    const commitMessage = opts.commitMessage;
    const git = simpleGit(options);
    try {
      await git.add('.');
      console.log(chalk.green('Added untracked files'));
      const commit = await git.commit(commitMessage);
      console.log(chalk.green(`Committed changes to ${commit.commit} in branch ${commit.branch}: ${JSON.stringify(commit.summary)}`));
      const newTag = await this.bumpTag(git);
      const tagArgs = opts.tagMessage ? ['-a', newTag, '-m', opts.tagMessage] : [newTag];
      await git.tag(tagArgs);
      const showTag = await git.show(newTag);
      const newtagCommit = showTag.split('\n').filter(line => line.startsWith('commit'));
      console.log(chalk.green(`Added tag ${newTag} to ${newtagCommit}`));
      await git.push();
      console.log(chalk.green('Pushed code'));
      await git.push(['--tags']);
      console.log(chalk.green('Pushed tags'));
      console.log(chalk.blue('Done'));
      return {
        status: 'success',
      }
    }
    catch (err) {
      console.log(chalk.red(err))
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