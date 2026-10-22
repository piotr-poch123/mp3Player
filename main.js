const { app, BrowserWindow, ipcMain } = require('electron/main')
const { shell } = require("electron");
const path = require('node:path')
const express = require('express');
const server = express();
const crypto = require("node:crypto");


const clientId = "24185c0cb3dc408cbfc33a827931b4c4";
const REDIRECT_URI = "http://127.0.0.1:8888/callback";

let previousSongId = null;
let win;
let accessToken = null;
const createWindow = () => {
    win = new BrowserWindow({
        width: 450,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.loadFile('index.html')
}
//code verifier
const generateRandomString = (length) => {
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const values = crypto.randomBytes(length);

    return values.reduce(
        (acc, x) => acc + possible[x % possible.length],
        ""
    );
};

const codeVerifier = generateRandomString(64);

console.log(codeVerifier);

//code challenge
const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

console.log(codeChallenge);


server.listen(8888, () => {
    console.log("Server is listening on port 8888");
});
ipcMain.handle("spotify-login", async () => {
    const url = new URL("https://accounts.spotify.com/authorize");
    url.search = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope: "user-read-currently-playing user-read-playback-state user-modify-playback-state",
        code_challenge_method: "S256",
        code_challenge: codeChallenge
    }).toString();

    console.log("redirect URI:", REDIRECT_URI);
    await shell.openExternal(url.toString());
});
ipcMain.handle("spotify-pause", async () => {
    const response =await fetch(
        "https://api.spotify.com/v1/me/player/pause",
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )
    console.log("Pause status:", response.status);
});
ipcMain.handle("skip-track", async () => {
    const response = await fetch(
        "https://api.spotify.com/v1/me/player/next",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )
    console.log("Skip status:", response.status);
});
ipcMain.handle("spotify-play", async () => {
    const response = await fetch(
        "https://api.spotify.com/v1/me/player/play",
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )
    console.log("Play status:", response.status);
});
ipcMain.handle("rewind-track", async () => {
    const response = await fetch(
        "https://api.spotify.com/v1/me/player/previous",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )
    console.log("Rewind status:", response.status);
});
ipcMain.handle("volume-up", async () => {
    const response = await fetch(
        "https://api.spotify.com/v1/me/player",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
    if (response.status === 200) {
        const player = await response.json();
        const currentVolume = player.device.volume_percent;
        const newVolume = Math.min(currentVolume + 10, 100);
        const volumeResponse = await fetch(
            `https://api.spotify.com/v1/me/player/volume?volume_percent=${newVolume}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        console.log("Volume set to:", newVolume);
        console.log("Volume up status: ", volumeResponse.status);
    }
});
ipcMain.handle("volume-down", async () => {
    const response = await fetch(
        "https://api.spotify.com/v1/me/player",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
    if (response.status === 200) {
        const player = await response.json();
        const currentVolume = player.device.volume_percent;
        const newVolume = Math.max(currentVolume - 10, 0);
        const volumeResponse = await fetch(
            `https://api.spotify.com/v1/me/player/volume?volume_percent=${newVolume}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        console.log("Volume set to:", newVolume);
        console.log("Volume down status: ", volumeResponse.status);
    }
});
async function checkCurrentlyPlaying(accessToken){ 
    const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );
    if (response.status === 200){
        const song = await response.json();
        const play_status = song.is_playing;
        const currentSongId = song.item.id;
        const albumCover = song.item.album.images[0].url;
        if(currentSongId !== previousSongId){
            previousSongId = currentSongId;
        }
        console.log("Song changed!");
        console.log(song.item.name);
        console.log(song.item.artists[0].name);
        console.log(albumCover);
        console.log("Play status:", play_status);
        win.webContents.send("play-status", play_status);
        win.webContents.send("song-playing", song.item.name,);
        win.webContents.send("artist", song.item.artists[0].name);
        win.webContents.send("albumCover", albumCover);
    }
}

server.get("/callback", async (req, res) => {
    //
    const code = req.query.code;
    
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier
        })
    });
    const data = await response.json();
    console.log(data);
    win.webContents.send("login-successful");
    res.send("Spotify login successful");
    accessToken = data.access_token;

    setInterval(() => {
        checkCurrentlyPlaying(accessToken);
    }, 2000);
});

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')
    createWindow()
})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})