#!/bin/bash
npx vitest run --reporter=verbose > vitest_last3.txt
cat vitest_last3.txt | grep -E "(failed|passed)" | tail -n 20
