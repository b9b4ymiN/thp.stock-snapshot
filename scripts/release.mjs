#!/usr/bin/env zx

import 'zx/globals';

const type = process.argv[2]; // <<== ตรงนี้

if (!["patch", "minor", "major"].includes(type)) {
  console.error(`Invalid version type: ${type}`);
  process.exit(1);
}

await $`git add .`;
await $`git commit -m "release: ${type} update"`.catch(() => {
  console.log("No changes to commit, continue...");
});
await $`npm version ${type}`;
await $`git push --follow-tags`;
await $`npm publish --access public`;
