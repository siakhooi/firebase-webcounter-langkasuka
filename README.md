# firebase-webcounter-langkasuka

Web Counter using Firebase Firestore and Cloud Functions.

Langkasuka was an ancient Malay Hindu-Buddhist kingdom located in the Malay Peninsula. Langkasuka means, Land with Happiness.

## Features

- Using Firebase Firestore and Cloud Functions.
- Support 3 output types:
  - text
  - badge (svg format) - can be used in markdown file or html file.
  - javascript - can be used in html script, as hidden counter or for advance html formatting.

## Usage

### badge in markdown

```md
![visitors](https://hit-tztugwlsja-uc.a.run.app?counter=test1&outputtype=badge)
```

### badge in html

```html
<img src="https://hit-tztugwlsja-uc.a.run.app?counter=test1&outputtype=badge" />
```

### hidden in javascript

```html
<SCRIPT SRC=https://hit-tztugwlsja-uc.a.run.app/?counter=test1&outputtype=javascript></script>
```

### advance html formatting in html

```html
<HTML><HEAD>
<SCRIPT SRC=https://hit-tztugwlsja-uc.a.run.app/?counter=test1&outputtype=javascript></script>
<script>
function show_counter(){
  document.getElementById('counter123').innerText=LANGKASUKA_WEBCOUNTER.count;
}
</script>
</HEAD><BODY onload="show_counter()">
<div id=counter123></div>
</BODY></HTML>
```

Javascript output type will return a javascript file contains the following line, which front-end can use it for more advance formatting.

```javascript
var LANGKASUKA_WEBCOUNTER = { count: nnn };
```

## How to Deploy

- create Firebase project with:
  - Name: Web Counter Langkasuka
  - id: `web-counter-langkasuka`
- upgrade plan to Blaze plan (Pay as you go)
  - Cloud Function requires at least this plan to work.
- Enable Firestore
  - Go to Firebase > Build > Firestore Database
    - click Create Database
    - Select Start in production mode, click Next
    - choose a location, click Create
- Enable Cloud Function
  - Go to Firebase > Build > Functions
    - click 'Get started'
    - click Continue (Set up Functions - step 1 install)
    - click Finish (Set up Functions - step 2 deploy)
- download this repo
- run the following commands: (you need to install firebase cli, <https://firebase.google.com/docs/cli/>)
  - `firebase login`
  - `firebase deploy`
    - A new URL resembling `https://hit-xxxxxxx.a.run.app` will be generated and displayed in the console output. That is the url for your webcounter.

### Setup Github Actions if you fork this repo

- Go to Google Cloud console <https://console.cloud.google.com>
  - Select "Web Counter Langkasuka"
  - Go to "IAM and admin" > "service accounts"
  - In the service account `web-counter-langkasuka@appspot.gserviceaccount.com` > action, choose "Manage Key"
  - choose Add Key > Create new Key
  - choose Key Type = json and click Create
  - A json file will be downloaded, the name of file resembling `web-counter-langkasuka-xxxxxxxxxx.json`
  - encodes the file with base64 and upload to github as secret name: `GOOGLE_APPLICATION_CREDENTIALS_BASE64`
    - if you have gh cli, you can just run this command: `base64 web-counter-langkasuka-xxxxxxxxxx.json | gh secret set GOOGLE_APPLICATION_CREDENTIALS_BASE64`
  - remove the json file locally, for security purposes.
- commit changes to Github and check that the workflow run successfully.
- create release so that github action can deploy to firebase.

## Quality

- https://sonarcloud.io/project/overview?id=siakhooi_firebase-webcounter-langkasuka
- https://qlty.sh/gh/siakhooi/projects/firebase-webcounter-langkasuka

## Badges

![GitHub](https://img.shields.io/github/license/siakhooi/firebase-webcounter-langkasuka?logo=github)
![GitHub last commit](https://img.shields.io/github/last-commit/siakhooi/firebase-webcounter-langkasuka?logo=github)
![GitHub top language](https://img.shields.io/github/languages/top/siakhooi/firebase-webcounter-langkasuka?logo=github)
![GitHub language count](https://img.shields.io/github/languages/count/siakhooi/firebase-webcounter-langkasuka?logo=github)
![Lines of code](https://img.shields.io/tokei/lines/github/siakhooi/firebase-webcounter-langkasuka?logo=github)
![GitHub repo size](https://img.shields.io/github/repo-size/siakhooi/firebase-webcounter-langkasuka?logo=github)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/siakhooi/firebase-webcounter-langkasuka?logo=github)
![Workflow](https://img.shields.io/badge/Workflow-github-purple)
![workflow](https://github.com/siakhooi/firebase-webcounter-langkasuka/actions/workflows/deploy-firebase.yaml/badge.svg)

![Quality-Qlty](https://img.shields.io/badge/Quality-Qlty-purple)
[![Maintainability](https://qlty.sh/gh/siakhooi/projects/firebase-webcounter-langkasuka/maintainability.svg)](https://qlty.sh/gh/siakhooi/projects/firebase-webcounter-langkasuka)
[![Code Coverage](https://qlty.sh/gh/siakhooi/projects/firebase-webcounter-langkasuka/coverage.svg)](https://qlty.sh/gh/siakhooi/projects/firebase-webcounter-langkasuka)

![Quality-Sonar](https://img.shields.io/badge/Quality-SonarCloud-purple)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=siakhooi_firebase-webcounter-langkasuka&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=siakhooi_firebase-webcounter-langkasuka)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=siakhooi_firebase-webcounter-langkasuka&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=siakhooi_firebase-webcounter-langkasuka)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=siakhooi_firebase-webcounter-langkasuka&metric=bugs)](https://sonarcloud.io/summary/new_code?id=siakhooi_firebase-webcounter-langkasuka)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=siakhooi_firebase-webcounter-langkasuka&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=siakhooi_firebase-webcounter-langkasuka)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=siakhooi_firebase-webcounter-langkasuka&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=siakhooi_firebase-webcounter-langkasuka)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=siakhooi_firebase-webcounter-langkasuka&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=siakhooi_firebase-webcounter-langkasuka)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=siakhooi_firebase-webcounter-langkasuka&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=siakhooi_firebase-webcounter-langkasuka)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=siakhooi_firebase-webcounter-langkasuka&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=siakhooi_firebase-webcounter-langkasuka)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=siakhooi_firebase-webcounter-langkasuka&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=siakhooi_firebase-webcounter-langkasuka)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=siakhooi_firebase-webcounter-langkasuka&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=siakhooi_firebase-webcounter-langkasuka)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=siakhooi_firebase-webcounter-langkasuka&metric=coverage)](https://sonarcloud.io/summary/new_code?id=siakhooi_firebase-webcounter-langkasuka)
![Sonar Violations (short format)](https://img.shields.io/sonar/violations/siakhooi_firebase-webcounter-langkasuka?server=https%3A%2F%2Fsonarcloud.io)
![Sonar Violations (short format)](https://img.shields.io/sonar/blocker_violations/siakhooi_firebase-webcounter-langkasuka?server=https%3A%2F%2Fsonarcloud.io)
![Sonar Violations (short format)](https://img.shields.io/sonar/critical_violations/siakhooi_firebase-webcounter-langkasuka?server=https%3A%2F%2Fsonarcloud.io)
![Sonar Violations (short format)](https://img.shields.io/sonar/major_violations/siakhooi_firebase-webcounter-langkasuka?server=https%3A%2F%2Fsonarcloud.io)
![Sonar Violations (short format)](https://img.shields.io/sonar/minor_violations/siakhooi_firebase-webcounter-langkasuka?server=https%3A%2F%2Fsonarcloud.io)
![Sonar Violations (short format)](https://img.shields.io/sonar/info_violations/siakhooi_firebase-webcounter-langkasuka?server=https%3A%2F%2Fsonarcloud.io)
![Sonar Violations (long format)](https://img.shields.io/sonar/violations/siakhooi_firebase-webcounter-langkasuka?format=long&server=http%3A%2F%2Fsonarcloud.io)

[![Generic badge](https://img.shields.io/badge/Funding-BuyMeACoffee-33cb56.svg)](https://www.buymeacoffee.com/siakhooi)
[![Generic badge](https://img.shields.io/badge/Funding-Ko%20Fi-33cb56.svg)](https://ko-fi.com/siakhooi)
![count](https://hit-tztugwlsja-uc.a.run.app/?outputtype=badge&counter=ghmd-firebase-webcounter)
