#!/bin/bash
cd /home/kavia/workspace/code-generation/multi-source-retrieval-and-synthesis-system-5745-5756/frontend_react_js
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

