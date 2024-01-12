import React from 'react'

const VideoCallRoom = () => {
  return (
    <>
        <h1>VideoCallRoom</h1>

        <div class="grid grid-cols-2 gap-4">
            <div id="local-video-container">
                <video id="local-video" autoplay muted></video>
            </div>
        
            <div id="remote-video-container">
                <video id="remote-video" autoplay></video>
            </div>
        </div>

    </>
  )
}

export default VideoCallRoom