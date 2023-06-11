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
var LANGKASUKA_WEBCOUNTER = { count: nnn }
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

### Setup Github Actions if you fork this repo

- Go to Google Cloud console <https://console.cloud.google.com>
  - Select "Web Counter Langkasuka"
  - Go to "IAM and admin" > "service accounts"
  - In the service account `web-counter-langkasuka@appspot.gserviceaccount.com` > action, choose "Manage Key"
  - choose Add Key > Create new Key
  - choose Key Type = json and click Create
  - A json file will be downloaded, the name of file is like `web-counter-langkasuka-xxxxxxxxxx.json`
  - base64 encode the file and upload to github as secret name: `GOOGLE_APPLICATION_CREDENTIALS_BASE64`
    - if you have gh cli, you can just run this command: `base64 web-counter-langkasuka-xxxxxxxxxx.json | gh secret set GOOGLE_APPLICATION_CREDENTIALS_BASE64`
  - remove the json file locally, for security purposes.
- commit changes to Github and check that the workflow run successfully.

## Badges

![count](https://hit-tztugwlsja-uc.a.run.app/?outputtype=badge&counter=ghmd-firebase-webcounter)
