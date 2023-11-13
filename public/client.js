const socket = io();
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const joinRequestsContainer = document.getElementById('join-requests');
const tableElement = document.getElementById("incoming-calls");

let peer;
let roomId;
let isRoomCreator = false;
let remoteSocketId = null;
let incomingCalls = [];

function populateIncomingCalls() {
    const defaultTableHeader = `<table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
    <caption class="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
        Incoming Calls
    </caption>
    <!-- <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
            <th scope="row" class="px-6 py-4"></th></th>
            <th scope="row" class="px-6 py-4"></th></th>
            <th scope="row" class="px-6 py-4"></th></th>
        </tr>
    </thead> -->
    <tbody>`

    let tableContent = ``
    for (var idx = 0; idx <= incomingCalls.length - 1; idx++) {
        let callerId = incomingCalls[idx];
        tableContent += `<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
        <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            ${callerId}
        </th>
        <td class="px-4 py-4">
            <button type="button" onclick="approveJoinRequest('${callerId}')" class="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Accept</button>
        </td>
        <td class="px-4 py-4">
            <button type="button" onclick="rejectJoinRequest('${callerId}')" class="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Reject</button>
        </td>
    </tr>`
    }
    
    const defaultTableFooter = `</tbody>
    </table>`


    tableElement.innerHTML = defaultTableHeader + tableContent + defaultTableFooter;
}

populateIncomingCalls();

peer = new RTCPeerConnection({
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
});

peer.onicecandidate = (event) => {
    console.log("Found ice candidate" + event.candidate);
    if (event.candidate && remoteSocketId) {
    socket.emit('peer-updated', {
        candidate: event.candidate,
        to: remoteSocketId
    });
    }
};

peer.ontrack = (event) => {
    // Don't set srcObject again if it is already set.
    if (remoteVideo.srcObject) return;
    remoteVideo.srcObject = event.streams[0];
};

const startVideoStream = async() => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = stream;

        // Add the local stream to the connection
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    } catch (error) {
        console.error('Error Streaming video:', error);
    }
}

function createRoom() {
    roomId = document.getElementById('create-room-id').value;
    isRoomCreator = true;

    // Emit an event to the server to create a room
    socket.emit('create-room', roomId);
}

function joinRoom() {
    roomId = document.getElementById('join-room-id').value;

    // Emit an event to the server to join a room
    socket.emit('join-room', roomId);
}

function displayJoinRequest(requesterUserId) {
    incomingCalls.push(requesterUserId);
    populateIncomingCalls();
}

function approveJoinRequest(requesterUserId) {
    console.log(requesterUserId);
    // Emit an event to the server to approve the join request
    socket.emit('approve-join-request', roomId, requesterUserId);
    // joinRequestsContainer.innerHTML = '';
    incomingCalls = incomingCalls.filter(function(item) {
        return item !== requesterUserId
    });
    populateIncomingCalls();
}

function rejectJoinRequest(requesterUserId) {
    // Implement rejection logic if needed
    // joinRequestsContainer.innerHTML = '';
    incomingCalls = incomingCalls.filter(function(item) {
        return item !== requesterUserId
    });
    populateIncomingCalls();
}

// Event listeners for server events
socket.on('peer-updated', async data => {
    const {from, candidate} = data;
    peer.addIceCandidate(new RTCIceCandidate(candidate))
    .catch((error) => {
        console.error('Error adding ICE candidate:', error);
    });
    console.log("Added new ice candidate");
});

socket.on('join-request', (requesterUserId) => {
    console.log("Join Request came", requesterUserId);
    displayJoinRequest(requesterUserId);
});

socket.on('join-approved', () => {
    console.log("Received approval to join room");
});

socket.on('room-created', (roomId) => {
    roomId = roomId;
});

socket.on('room-exists', () => {
    alert("Room already exists");
});

socket.on('room-unavailable', () => {
    alert("Room not available");
});

socket.on('start-peer-connection', (to) => {
    initializePeerConnection(to);
});

socket.on('offer-request', async data => {
    const { from, offer } = data;
    console.log("Incoming offer for webRTC from:" + from);
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    console.log("Set Remote Description:" + offer);

    const answereOffer = await peer.createAnswer();
    console.log("Created answer offer:" + answereOffer);
    await peer.setLocalDescription(new RTCSessionDescription(answereOffer));
    console.log("Set Local Description:" + answereOffer);

    socket.emit('offer-answer', { answere: answereOffer, to: from });
    remoteSocketId = from;

    const mySteam = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });

    mySteam.getTracks().forEach((track) =>
        peer.addTrack(track, mySteam));
});

socket.on('offer-answer', async data => {
    console.log("Receibed answer from peer");
    const { offer } = data;
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    console.log("Set Remote description after answer received from peer: ", offer);
});

async function initializePeerConnection(remoteSocketId) {
    console.log("Remote Socket ID: "+ remoteSocketId);
    remoteSocketId = remoteSocketId;
    const localOffer = await peer.createOffer();
    console.log("Set local description for creating call: " + localOffer);
    await peer.setLocalDescription(new RTCSessionDescription(localOffer));
    socket.emit('offer-request', { fromOffer: localOffer, to: remoteSocketId });
}

window.addEventListener('load', startVideoStream);