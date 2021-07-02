module.exports =  {
  bumpTag(git, opts = {}) {
    const releaseType = opts.releaseType || 'patch';
    return new Promise((resolve, reject) => {
      const releaseTypes = ['major', 'minor', 'patch'];
      const matchIndex = releaseTypes.indexOf(releaseType);
      git.tag(null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(!result.length);
        if (!result.length) {
          reject('No existing tags');
          return;
        }
        const tags = result.split('\n');
        const mostRecent = tags.sort((a, b) => {
          return this.naturalSort(b, a);
        })[0];
        const numbers = mostRecent.match(/(\d*)\.(\d*)\.(\d*)/);
        const newVersion = releaseTypes.map((_, index) => {
          if (index < matchIndex) {
            return numbers[index + 1];
          } else if (index === matchIndex) {
            return parseInt(numbers[index + 1]) + 1;
          } else {
            return '0';
          }
        }).join('.');
        resolve(mostRecent.replace(/\d*\.\d*\.\d*/, newVersion));
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