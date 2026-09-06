#!/bin/bash
npx vitest run > vitest_out.txt
cat vitest_out.txt | tail -n 20
