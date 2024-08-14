import {nanoid} from 'nanoid';

type ScreenSourceKind = 'displaycapture' | 'windowcapture' | 'browsercapture';
type MediaSourceKind = 'audioinput' | 'videoinput';
type FileSourceKind = 'imagefile' | 'videofile' | 'audiofile';
type SourceKind = FileSourceKind | MediaSourceKind | ScreenSourceKind;

interface ISourceBase {
    id: string;
    name: string;
    sourceKind: SourceKind;
}

interface ISourceVisualBase {
    id: string;
    width: number;
    height: number;
    ratio: number;
    name: string;
    sourceType: 'visual';
}

interface ISourceSoundBase {
    sourceType: 'sound';
}

export interface ISourceImage extends ISourceBase, ISourceVisualBase {
    source: HTMLImageElement;
}

export interface ISourceVideo extends ISourceBase, ISourceVisualBase {
    source: HTMLVideoElement;
}

export interface ISourceAudio extends ISourceBase, ISourceSoundBase {
    source: HTMLAudioElement;
}

export interface ISourceVideoStream extends ISourceBase, ISourceVisualBase {
    source: MediaStream;
    soundTrack: boolean;
}

export interface ISourceAudioStream extends ISourceBase, ISourceSoundBase {
    source: MediaStream;
}

export type SourceItem = ISourceImage | ISourceVideo | ISourceAudio | ISourceVideoStream | ISourceAudioStream;

export type MediaItem = {
    id: number;
    label: string;
    sourceKind: string;
    getSource: () => Promise<SourceItem>;
}

interface LocalStream {
    devices(type?: MediaDeviceKind | 'input' | 'output'): Promise<MediaDeviceInfo[]>;

    getMediaTrack(kind: 'video' | 'audio', constraints?: MediaTrackConstraints): Promise<MediaStream>;

    getDisplay(constraints?: DisplayMediaStreamOptions): Promise<MediaStream>;

    loadFile(type: FileSourceKind): Promise<SourceItem>

    getMediaList(): Promise<Array<MediaItem>>
}

const defaults = {
    video: {
        width: {ideal: 960},
        height: {ideal: 540},
        frameRate: 30,
        videoAspectRatio: 1.7777777778,
    },
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
    },
    display: {
        audio: true,
        video: {
            height: 1080,
        },
    },
};

const getReadableName = (device: MediaDeviceInfo, counter: number): string => {
    if (device.label) return device.label;
    const uppercase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const words = device.kind.replace(/(audio|video)(\w+)/, "$1 $2").split(" ");
    return `${uppercase(words[0])} ${uppercase(words[1])} ${counter}`;
};

const getSourceName = (track: MediaStreamTrack): string => {
    const [lblName, lblID] = track?.label ? track.label.split(":") : ["Screen", "Capture"];
    const name = lblName.startsWith("web") ? "Tab" : `${lblName[0].toLocaleUpperCase()}${lblName.substr(1)}`;
    const tag = lblName.startsWith("web") ? lblID?.replace(/\//g, "")?.substr(-5) : lblID;
    return `${name}${tag ? ` ${tag}` : ""}`;
};

const getScreenCaptureConstraint = (displaySurface: DisplayCaptureSurfaceType): DisplayMediaStreamOptions => {
    return {
        audio: true,
        video: {
            width: 1920,
            height: 1080,
            frameRate: 40,
            displaySurface,
        },
    };
};

const getStreamDimensions = async (stream: MediaStream): Promise<{ width: number; height: number; ratio: number }> => {
    return await new Promise(resolve => {
        let video = document.createElement("video");
        video.muted = true;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            const ratio = video.videoWidth / video.videoHeight;
            resolve({
                width: video.videoWidth,
                height: video.videoHeight,
                ratio,
            });
            video.remove();
        };
    });
};

const handleFileLoad = async (accept: string, callback: (e: Event) => Promise<SourceItem>): Promise<SourceItem> => {
    return new Promise(resolve => {
        const input = document.createElement("input");
        input.accept = accept;
        input.multiple = false;
        input.hidden = true;
        input.type = "file";
        input.addEventListener("change", async (e: Event) => {
            resolve(await callback(e));
        });
        document.body.appendChild(input);
        input.click();
    });
};

const handleImageFileLoad = async (e: Event): Promise<SourceItem> => {
    return await new Promise<SourceItem>(resolve => {
        const [file] = (e.target as HTMLInputElement)?.files as FileList;
        const reader = new FileReader();
        reader.onloadend = event => {
            const image = new Image();
            image.src = event.target?.result as string;
            image.onload = () => {
                resolve({
                    id: nanoid(),
                    width: image.width,
                    height: image.height,
                    ratio: image.width / image.height,
                    name: file.name,
                    sourceKind: 'imagefile',
                    sourceType: 'visual',
                    source: image,
                });
            };
        };
        reader.readAsDataURL(file);
    });
};

const handleVideoFileLoad = async (e: Event): Promise<SourceItem> => {
    return await new Promise<SourceItem>(resolve => {
        const [file] = (e.target as HTMLInputElement)?.files as FileList;
        const source = document.createElement("video");
        const reader = new FileReader();
        reader.onload = event => {
            source.src = event.target?.result as string;
            source.onloadedmetadata = () => {
                resolve({
                    id: nanoid(),
                    width: source.videoWidth,
                    height: source.videoHeight,
                    ratio: source.videoWidth / source.videoHeight,
                    name: file.name,
                    sourceKind: 'videofile',
                    sourceType: 'visual',
                    source,
                });
            };
            source.load();
        };
        reader.readAsDataURL(file);
    });
};

const handleAudioFileLoad = async (e: Event): Promise<SourceItem> => {
    return await new Promise<SourceItem>(resolve => {
        const [file] = (e.target as HTMLInputElement)?.files as FileList;
        const source = document.createElement("audio");
        const reader = new FileReader();

        reader.onload = event => {
            source.src = event.target?.result as string;
            source.onloadedmetadata = () => {
                resolve({
                    id: nanoid(),
                    name: file.name,
                    sourceKind: 'audiofile',
                    sourceType: 'sound',
                    source,
                });
            };
            source.load();
        };
        reader.readAsDataURL(file);
    });
};

const handleDisplayLoad = async (displaySurface: DisplayCaptureSurfaceType, sourceKind: ScreenSourceKind): Promise<ISourceVideoStream> => {
    const source = await getDisplay(getScreenCaptureConstraint(displaySurface));
    const {width, height, ratio} = await getStreamDimensions(source);
    const [audioTrack] = source.getAudioTracks();
    const [videoTrack] = source.getVideoTracks();
    const name: string = getSourceName(videoTrack);

    return {
        id: source.id,
        name,
        sourceKind,
        sourceType: 'visual',
        width,
        height,
        ratio,
        soundTrack: !!audioTrack,
        source: source as MediaStream,
    };
};

const handleMediaDeviceLoad = async (sourceKind: MediaSourceKind, deviceId: string, name: string): Promise<SourceItem> => {
    const mediaType = sourceKind === 'audioinput' ? "audio" : "video";
    const source = await getMediaTrack(mediaType, {deviceId: {exact: deviceId}});
    const sourceOptions = {
        id: source.id,
        name,
        source,
        sourceKind,
        sourceType: sourceKind === 'audioinput' ? 'sound' : 'visual',
    };

    if (sourceKind === 'videoinput') {
        const {width, height, ratio} = await getStreamDimensions(source);
        return {...sourceOptions, width, height, ratio} as ISourceVideoStream;
    }
    return sourceOptions as ISourceAudioStream;
};

const devices = async (type: MediaDeviceKind | 'input' | 'output'): Promise<MediaDeviceInfo[]> => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    switch (type) {
        case 'audioinput':
        case 'videoinput':
            return devices.filter((device) => device.kind === type);
        case "input":
        case "output":
            return devices.filter((device) => device.kind.endsWith(type));
        default:
            return devices;
    }
};

const getMediaTrack = async (kind: 'video' | 'audio', constraints: MediaTrackConstraints = {}): Promise<MediaStream> => {
    return await navigator.mediaDevices.getUserMedia({
        [kind]: {
            ...defaults[kind],
            ...constraints,
        },
    });
};

const getDisplay = async (constraints: DisplayMediaStreamOptions = {}): Promise<MediaStream> => {
    const cons = {
        ...defaults.display,
        ...constraints,
    };
    return await navigator.mediaDevices.getDisplayMedia(cons);
};

const loadFile = async (type: FileSourceKind): Promise<SourceItem> => {
    switch (type) {
        case 'imagefile':
            return handleFileLoad("image/*", handleImageFileLoad);
        case 'videofile':
            return handleFileLoad("video/*", handleVideoFileLoad);
        case 'audiofile':
            return handleFileLoad("audio/*", handleAudioFileLoad);
    }
};

const getMediaList = async (): Promise<Array<MediaItem>> => {
    let counter = 0;
    const count = () => (counter += 1);

    const list = [
        {
            id: count(),
            label: "Image",
            sourceKind: 'imagefile',
            getSource: () => loadFile('imagefile'),
        },
        {
            id: count(),
            label: "Video",
            sourceKind: 'videofile',
            getSource: () => loadFile('videofile'),
        },
        {
            id: count(),
            label: "Audio",
            sourceKind: 'audiofile',
            getSource: () => loadFile('audiofile'),
        },
        {
            id: count(),
            label: "Display Capture",
            sourceKind: 'displaycapture',
            getSource: () => handleDisplayLoad("monitor", 'displaycapture'),
        },
        {
            id: count(),
            label: "Window Capture",
            sourceKind: 'windowcapture',
            getSource: () => handleDisplayLoad("window", 'windowcapture'),
        },
        {
            id: count(),
            label: "Browser Capture",
            sourceKind: 'browsercapture',
            getSource: () => handleDisplayLoad("browser", 'browsercapture'),
        },
    ];

    const addCaptureDevices = (devices: MediaDeviceInfo[], sourceKind: MediaSourceKind) => {
        for (const device of devices) {
            if (device.deviceId !== "default") {
                const id = count();
                const sourceName = getReadableName(device, id);
                list.push({
                    id,
                    label: sourceName,
                    sourceKind,
                    getSource: async () => await handleMediaDeviceLoad(sourceKind, device.deviceId, sourceName),
                });
            }
        }
    };

    addCaptureDevices(await devices('audioinput'), 'audioinput');
    addCaptureDevices(await devices('videoinput') as MediaDeviceInfo[], 'videoinput');

    return list;
};

export default {
    devices,
    loadFile,
    getMediaTrack,
    getDisplay,
    getMediaList,
} as LocalStream;