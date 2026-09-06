#!/bin/bash
npx vitest run --reporter=verbose > vitest_last4.txt
cat vitest_last4.txt | grep -E "(failed|passed)" | tail -n 20
