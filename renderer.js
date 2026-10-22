
document.getElementById("login").addEventListener("click", () => {
    window.versions.spotifyLogin();

});
window.versions.onSongPlaying((event, songTitle) => {
    document.getElementById("title").innerText = songTitle;
});

window.versions.artistPlaying((event, artist) => {
    document.getElementById("artist").innerText = artist;
});
window.versions.albumCover((event, albumCover) => {
    document.getElementById("cover").src = albumCover;
});
window.versions.onLogin(() => {
    document.getElementById("login").style.display = "none";
    document.getElementById("info").style.display = "none";
});
/*window.versions.onPlayStatus((event, play_status) => {
    if (play_status){
        document.getElementById("pause").style.display = "block";
        document.getElementById("play").style.display = "none";
    }else{
        document.getElementById("pause").style.display = "none";
        document.getElementById("play").style.display = "block";
}
})*/
document.getElementById("pause").addEventListener("click", async () => {
    await window.versions.spotifyPause();
    document.getElementById("pause").style.display = "none";
    document.getElementById("play").style.display = "block";
});
document.getElementById("play").addEventListener("click", async () => {
    await window.versions.spotifyPlay();
    document.getElementById("play").style.display = "none";
    document.getElementById("pause").style.display = "block";

});
document.getElementById("fastForward").addEventListener("click", () => {
    window.versions.skipTrack();
});
document.getElementById("backward").addEventListener("click", () => {
    window.versions.rewindTrack();
});
document.getElementById("volUp").addEventListener("click", () => {
    window.versions.volumeUp();
});
document.getElementById("volDown").addEventListener("click", () => {
    window.versions.volumeDown();
});
const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`


const func = async () => {
    const response = await window.versions.ping()
    console.log(response)
}
func()