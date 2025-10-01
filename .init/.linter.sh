#!/bin/bash
cd /home/kavia/workspace/code-generation/intellianswer-qa-platform-3056-3075/qa_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

