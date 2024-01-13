import React from 'react';
import {useState, useEffect, useRef} from 'react';
import {io, Socket} from 'socket.io-client';
import {useParams} from 'react-router-dom';

const VideoCallRoom = () => {

    let peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302"
            }
        ]
    });

    const params = useParams();
    const roomId = params.roomId;

    const [socket, setSocket] = useState<Socket | null>(null);
    const [remoteSocketId, setremoteSocketId] = useState("");
    const [localVideoStream, setlocalVideoStream] = useState<MediaStream | null>(null);
    const [remoteVideoStream, setremoteVideoStream] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    async function initializePeerConnection(remoteSockId: string) {
        console.log("Remote Socket ID: "+ remoteSockId);
        setremoteSocketId(remoteSockId);
        const localOffer = await peer.createOffer();
        console.log("Set local description for creating call: " + localOffer);
        await peer.setLocalDescription(new RTCSessionDescription(localOffer));
        socket?.emit('offer-request', { fromOffer: localOffer, to: remoteSockId });
    }

    peer.onicecandidate = (event) => {
        console.log("Found ice candidate" + event.candidate);
        if (event.candidate && remoteSocketId!="") {
            socket?.emit('peer-updated', {
                candidate: event.candidate,
                to: remoteSocketId
            });
        }
    };
    
    peer.ontrack = (event) => {
        // Don't set remote stream again if it is already set.
        if (remoteVideoStream) return;
        setremoteVideoStream(event.streams[0]);
        remoteVideoRef.current.srcObject = remoteVideoStream;
        remoteVideoRef.current.play();
    };

    useEffect(() => {
        console.log("hi2")
      const sock = io("http://localhost:3000", { transports: ['websocket', 'polling', 'flashsocket'] });
    //   sock.on('connect', () => {
        console.log("socket connected")
        setSocket(sock);
        sock.emit('join-room', roomId);

        window.navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: true,
          })
          .then(async (stream) => {
            console.log("Set Local Stream 1");
            setlocalVideoStream(stream);
            console.log("Set Local Stream 2");
            localVideoRef.current.srcObject = localVideoStream;
            console.log("Set Local Stream 3");
            localVideoRef.current.play();
            console.log("Set Local Stream 4");
          });
      
        sock.on('peer-updated', async data => {
            const {from, candidate} = data;
            peer.addIceCandidate(new RTCIceCandidate(candidate))
            .catch((error) => {
                console.error('Error adding ICE candidate:', error);
            });
            console.log("Added new ice candidate");
        });
    
        sock.on('join-request', (requesterUserId) => {
            console.log("Join Request came", requesterUserId);
            displayJoinRequest(requesterUserId);
        });
        
        sock.on('join-approved', () => {
            console.log("Received approval to join room");
        });
        
        // sock.on('room-created', (roomId) => {
        //     roomId = roomId;
        // });
        
        // sock.on('room-exists', () => {
        //     alert("Room already exists");
        // });
        
        sock.on('room-unavailable', () => {
            alert("Room not available");
        });
        
        sock.on('start-peer-connection', (to) => {
            initializePeerConnection(to);
        });
        
        sock.on('offer-request', async data => {
            const { from, offer } = data;
            console.log("Incoming offer for webRTC from:" + from);
            await peer.setRemoteDescription(new RTCSessionDescription(offer));
            console.log("Set Remote Description:" + offer);
        
            const answereOffer = await peer.createAnswer();
            console.log("Created answer offer:" + answereOffer);
            await peer.setLocalDescription(new RTCSessionDescription(answereOffer));
            console.log("Set Local Description:" + answereOffer);
        
            sock.emit('offer-answer', { answere: answereOffer, to: from });
            setremoteSocketId(from);
        
            localVideoStream?.getTracks().forEach((track) =>
                peer.addTrack(track, localVideoStream));
        });
        
        sock.on('offer-answer', async data => {
            console.log("Receibed answer from peer");
            const { offer } = data;
            await peer.setRemoteDescription(new RTCSessionDescription(offer));
            console.log("Set Remote description after answer received from peer: ", offer);
        });
    // });
    }, []);

    useEffect(() => {
        if (localVideoRef && localVideoRef.current) {
            localVideoRef.current.srcObject = localVideoStream;
            localVideoRef.current.play();
        }
      }, [localVideoRef,localVideoStream])

      useEffect(() => {
        if (remoteVideoRef && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteVideoStream;
            remoteVideoRef.current.play();
        }
      }, [remoteVideoRef,remoteVideoStream])
    
  return (
    <>
        <h1>VideoCallRoom</h1>

        <div class="grid grid-cols-2 gap-4">
            <div id="local-video-container">
                <video id="local-video" muted ref={localVideoRef}></video>
            </div>
        
            <div id="remote-video-container">
                <video id="remote-video" ref= {remoteVideoRef}></video>
            </div>
        </div>

    </>
  )
}

export default VideoCallRoom