import React from 'react'

const VideoCallRoom = () => {
  return (
    <>
        <h1>VideoCallRoom</h1>

        <div class="grid grid-cols-3 gap-4">
            <div class="mb-6">
                <input type="text" id="create-room-id" placeholder="Enter room id" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                <br></br>
                <button onclick="createRoom()" type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Create new room</button>
            </div>

            <div class="mb-6">
                <input type="text" id="join-room-id" placeholder="Enter room id" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                <br/>
                <button onclick="joinRoom()" type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Join existing room</button>
            </div>

            <div class="relative overflow-x-auto" id="incoming-calls">
            </div>
        </div>

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