#!/usr/bin/env bash

rm -rf node_modules/

rm -rf certificates/

npm cache verify

npm i

npm i --only=dev
