# firebase-webcounter-langkasuka

Web Counter using Firebase

Langkasuka was an ancient South East Asia kingdom that the name means, Land with Happiness.

## Usage

<https://hit-tztugwlsja-uc.a.run.app?counter=test1&outputtype=text>

## How to Use

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
  - A json file will be downloaded.
  - base64 encode the file and upload to github as secret name: GOOGLE_APPLICATION_CREDENTIALS_BASE64
    - if you have gh cli, you can just run this command: `base64 web-counter-langkasuka-730b5192351f.json | gh secret set GOOGLE_APPLICATION_CREDENTIALS_BASE64`
  - remove the json file locally, for security purposes.
- commit changes to Github and check that the workflow run successfully.

## Badges

![count](https://hit-tztugwlsja-uc.a.run.app/?outputtype=badge&counter=github.com-firebase-webcounter-langkasuka)
