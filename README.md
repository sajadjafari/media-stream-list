# Media Stream Utilities

This package provides a set of utilities for working with various media sources, including capturing video, audio, and screen content, as well as loading media files. It provides a simple interface to access and manage these media sources.

## Installation

You can install the package via npm:

```bash
npm install media-stream-list
```

###Usage
Importing the Package
To use the utilities, import the package into your project:

```bash
import MediaStreamUtils from 'media-stream-list';
```

###Available Media Sources
The package supports the following media sources:

*Image Files:* Load image files from the user's local system.
*Video Files:* Load video files from the user's local system.
*Audio Files:* Load audio files from the user's local system.
*Display Capture:* Capture the user's screen.
*Window Capture:* Capture specific application windows.
*Browser Capture:* Capture browser tabs.
*Audio Input:* Capture audio from microphones.
*Video Input:* Capture video from webcams.

###Example Usage

####List Available Media Sources

You can get a list of available media sources by calling getMediaList():

```bash
const mediaList = await MediaStreamList.getMediaList();
console.log(mediaList);
```

Each item in the list includes a getSource method that you can call to obtain the corresponding media source.

####Capture Video from Webcam
```bash
const webcamSource = await MediaStreamList.getMediaTrack('video');
console.log(webcamSource);
```

####Capture Audio from Microphone
```bash
const audioSource = await MediaStreamList.getMediaTrack('audio');
console.log(audioSource);
```

####Capture Screen
```bash
const screenCapture = await MediaStreamList.getDisplay();
console.log(screenCapture);
```

####Load Image File
```bash
const imageSource = await MediaStreamList.loadFile('imagefile');
console.log(imageSource);
```

Utility Methods
```
devices(type: MediaDeviceKind | 'input' | 'output'): Promise<MediaDeviceInfo[]>
```
Get a list of media devices (e.g., microphones, cameras).

`type: Specify the type of device to list (e.g., 'audioinput', 'videoinput', 'input', 'output').`

```
getMediaTrack(kind: 'video' | 'audio', constraints?: MediaTrackConstraints): Promise<MediaStream>
```
Get a media stream for a specified type of media track.

`kind: Specify 'video' or 'audio'.`

`constraints: (Optional) Media track constraints.`

```
getDisplay(constraints?: DisplayMediaStreamOptions): Promise<MediaStream>
```
Capture the user's screen or a specific window.

`constraints: (Optional) Display media stream options.`
```
loadFile(type: FileSourceKind): Promise<SourceItem>
```
Load a file (image, video, or audio) from the user's system.

`type: Specify 'imagefile', 'videofile', or 'audiofile'.`

```
getMediaList(): Promise<Array<MediaItem>>
```
Get a list of available media items, including files and capture devices.


###Default Settings
The package provides default settings for video and audio capture:

* Video:
  * Width: 960 (ideal)
  * Height: 540 (ideal)
  * Frame Rate: 30 FPS
  * Aspect Ratio: 16:9
* Audio:
  * Echo Cancellation: Enabled
  * Noise Suppression: Enabled
  * Display Capture:
  * Audio: Enabled
  * Video Height: 1080

###License
This project is licensed under the `MIT` License.