const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    ping: () => ipcRenderer.invoke('ping'),
    spotifyLogin: () => ipcRenderer.invoke('spotify-login'),
    onSongPlaying: (callback) => ipcRenderer.on("song-playing", callback),
    artistPlaying: (callback) => ipcRenderer.on("artist", callback),
    albumCover: (callback) => ipcRenderer.on("albumCover", callback),
    onLogin: (callback) => ipcRenderer.on("login-successful", callback),
    onPlayStatus: (callback) => ipcRenderer.on("play-status", callback), 
    spotifyPause: () => ipcRenderer.invoke('spotify-pause'),
    spotifyPlay: () => ipcRenderer.invoke('spotify-play'),
    skipTrack: () => ipcRenderer.invoke('skip-track'),
    rewindTrack: () => ipcRenderer.invoke('rewind-track'),
    volumeUp: () => ipcRenderer.invoke('volume-up'),
    volumeDown: () => ipcRenderer.invoke('volume-down')
})
contextBridge.exposeInMainWorld("spotify", {
    getTrack: () => ipcRenderer.invoke("get-track")
});