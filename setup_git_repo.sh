#!/bin/bash

git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/tgaik/linkedin-name-scraper-extension.git
git push -u origin main
