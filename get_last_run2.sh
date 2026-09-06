#!/bin/bash
npx vitest run --reporter=verbose > vitest_last2.txt
cat vitest_last2.txt | grep -E "(failed|passed)" | tail -n 20
