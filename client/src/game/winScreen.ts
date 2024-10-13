export default function winScreen() {
    document.body.style.background = "#00000000"

    const source = document.createElement("source");
    source.src = "videos/winScreen.webm"
    source.type = "video/webm"

    const video = document.createElement("video");
    video.classList.add("fullscreen")
    video.classList.add("video-style")
    video.id = "win"
    video.width = 1000
    video.height = 1000

    video?.appendChild(source)

    video.load()
    video.play()
    
    const overlay = document.getElementsByClassName("overlay")[0];
    overlay.classList.add("fullscreen")
    overlay?.appendChild(video)
}