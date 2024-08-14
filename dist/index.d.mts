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
interface ISourceImage extends ISourceBase, ISourceVisualBase {
    source: HTMLImageElement;
}
interface ISourceVideo extends ISourceBase, ISourceVisualBase {
    source: HTMLVideoElement;
}
interface ISourceAudio extends ISourceBase, ISourceSoundBase {
    source: HTMLAudioElement;
}
interface ISourceVideoStream extends ISourceBase, ISourceVisualBase {
    source: MediaStream;
    soundTrack: boolean;
}
interface ISourceAudioStream extends ISourceBase, ISourceSoundBase {
    source: MediaStream;
}
type SourceItem = ISourceImage | ISourceVideo | ISourceAudio | ISourceVideoStream | ISourceAudioStream;
type MediaItem = {
    id: number;
    label: string;
    sourceKind: string;
    getSource: () => Promise<SourceItem>;
};
interface LocalStream {
    devices(type?: MediaDeviceKind | 'input' | 'output'): Promise<MediaDeviceInfo[]>;
    getMediaTrack(kind: 'video' | 'audio', constraints?: MediaTrackConstraints): Promise<MediaStream>;
    getDisplay(constraints?: DisplayMediaStreamOptions): Promise<MediaStream>;
    loadFile(type: FileSourceKind): Promise<SourceItem>;
    getMediaList(): Promise<Array<MediaItem>>;
}
declare const _default: LocalStream;

export { type ISourceAudio, type ISourceAudioStream, type ISourceImage, type ISourceVideo, type ISourceVideoStream, type MediaItem, type SourceItem, _default as default };
