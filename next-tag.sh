cd $1
tags=$(git describe --tags --abbrev=0 2>&1)
cd ../commit-and-release
test=$(node test.js 2>&1)
echo $test