#!/usr/bin/env zx

import { argv } from 'process'

let bumpType = argv[2] || "patch"

await $`git add .`
await $`git commit -m "chore(release): bump ${bumpType} version"`
await $`npm version ${bumpType}`
await $`git push --follow-tags`
await $`npm publish --access public`
