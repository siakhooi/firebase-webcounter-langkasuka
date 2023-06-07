# firebase-webcounter-langkasuka

Web Counter using Firebase

Langkasuka was an ancient South East Asia kingdom that the name means, Land with Happiness.

## Usage

<https://hit-tztugwlsja-uc.a.run.app?counter=test1&outputtype=text>

## Setup

- create Firebase project with:
  - Name: Web Counter Langkasuka
  - id: `web-counter-langkasuka`
- upgrade plan to Blaze plan (Pay as you go)
  - Cloud Function requires at least this plan to work.
- Go to Firebase > Build > Firestore Database
  - click Create Database
  - Select Start in production mode, click Next
  - choose a location, click Create
- Go to Google Cloud console <https://console.cloud.google.com>
  - Select "Web Counter Langkasuka"
  - Go to "IAM and admin" > "service accounts"
  - In the service account > action, choose "Manage Key"
  - choose Add Key > Create new Key
  - choose Key Type = json and click Create
  - A json file will be downloaded.
  - base64 encode the file and upload to github as secret name: GOOGLE_APPLICATION_CREDENTIALS_BASE64
    - if you have gh cli, you can just run this command: `base64 web-counter-langkasuka-ddcf8d2d8114.json | gh secret set GOOGLE_APPLICATION_CREDENTIALS_BASE64`
  - remove the json file locally, for security purposes.
