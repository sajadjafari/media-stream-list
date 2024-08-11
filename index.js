module.exports = {
    async devices(type) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        switch (type) {
            case 'audioinput':
            case 'audiooutput':
            case 'videoinput':
            case 'videooutput':
                return devices.filter((device) => device.kind === type);
            case "input":
            case "output":
                return devices.filter((device) => device.kind.endsWith(type));
            default:
                return devices;
        }
    },
};