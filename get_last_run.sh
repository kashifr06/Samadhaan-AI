#!/bin/bash
npx vitest run --reporter=verbose > vitest_last.txt
cat vitest_last.txt | grep -E "(failed|passed)" | tail -n 20
