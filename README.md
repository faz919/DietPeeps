# Official DietPeeps Repository

This is the official GitHub repository for [DietPeeps](https://dietpeeps.com/).
DietPeeps can be found on the [App Store](https://apps.apple.com/app/dietpeeps/id1611172999) and the [Google Play Store](https://play.google.com/store/apps/details?id=com.dietpeeps).

# Setup Guide

## Installation

Clone this project and name it accordingly:

``git clone https://github.com/blackshepherd-lab/DietPeeps.git``

### Prerequisites

[iOS only] If you plan to deploy the app to an iOS device, you must first install [CocoaPods](https://cocoapods.org/)

### Extra Files

1. Ask an admin for a copy of the ``constants.js`` and ``CourseData.json`` files (necessary to run the app)
2. Make a folder named ``constants`` at the project root and place ``constants.js`` inside of it.
3. Make a folder named ``courses`` at the project root and place ``CourseData.json`` inside of it.

### Package Management

1. After installing, open the project in an IDE of your choice and open a terminal at the project's root.
2. Run ``npm i`` and wait for all of the necessary packages to finish installing.
3. [iOS only] Then run ``cd ios && pod install``.

## Android Deployment (MacOS and Windows)

1. [Enable USB debugging on your Android device.](https://www.microfocus.com/documentation/silk-test/210/en/silktestworkbench-help-en/GUID-BE1EA2BA-EFF2-4B2D-8F09-4BEE0947DFB2.html)
2. Connect the device to your computer. 
3. In the project root terminal, run ``npx react-native run-android``. The build and deploy should complete within 5-10 minutes.

## iOS Deployment (MacOS)

1. Install Node and Watchman using [Homebrew](https://brew.sh/) via ``brew install node && brew install watchman``
2. Install Xcode via the Mac App Store.
3. Install the Xcode Command Line Tools. Open Xcode, then choose "Preferences..." from the Xcode menu. Go to the Locations panel and install the tools by selecting the most recent version in the Command Line Tools dropdown.

### Simulator

1. Install a simulator by opening Xcode > Preferences... and selecting the Components tab. Then select a simulator with the corresponding version of iOS you wish to use.
2. In your project root terminal, run ``npx react-native run-ios``. The build and deploy should complete within 5-10 minutes.

### Physical Device

Follow [this guide](https://reactnative.dev/docs/running-on-device) for iOS deployment on a physical device.

# Updates & App Info

As of May 16th, 2022, version 1.031 has been put up for closed beta testing.

# Credits & Special Thanks

Made by Faizi Tofighi with lots of help and feedback from NN, WM, IW, NEA, and NAS.