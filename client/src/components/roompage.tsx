import { useSocket } from "../context/socketProvider";
import { useCallback, useEffect, useState } from "react";
import peer from "../service/peer";
import CallIcon from "@mui/icons-material/Call";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideoPlayer from "./videoPlayer";
import CallHandleButtons from "./callHandler";
import { useLocation, useNavigate } from "react-router-dom";

interface handleUserJoinedInterface {
  userID: string;
  id: string;
}
interface handleIncomingCallInterface {
  from: string;
  offer: RTCSessionDescriptionInit;
}
interface handleCallAcceptedInterface {
  from: string;
  ans: RTCSessionDescriptionInit;
}
interface handleNegoNeededIncomingInterface {
  from: string;
  offer: RTCSessionDescriptionInit;
}
export default function RoomPage() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMute, setIsAudioMute] = useState(false);
  const [isVideoOnHold, setIsVideoOnHold] = useState(false);
  const [callButton, setCallButton] = useState(true);
  const [isSendButtonVisible, setIsSendButtonVisible] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { userID, roomID } = location.state || {};

  const handleUserJoined = useCallback(
    ({ userID, id }: handleUserJoinedInterface) => {
      console.log(`userID ${userID} joined the room!`);
      setRemoteSocketId(id);
    },
    []
  );
  const handleIncomingCall = useCallback(
    async ({ from, offer }: handleIncomingCallInterface): Promise<void> => {
      setRemoteSocketId(from);
      console.log(`incoming call from ${from} with offer ${offer}`);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      const ans = await peer.getAnswer(offer);
      socket?.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    if (myStream) {
      for (const track of myStream.getTracks()) {
        peer.peer?.addTrack(track, myStream);
      }
      setIsSendButtonVisible(false);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }: handleCallAcceptedInterface) => {
      console.log(`call accepted from ${from}`);
      peer.setLocalDescription(ans);
      console.log("Call Accepted");

      sendStreams();
    },
    [sendStreams]
  );
  const handleNegoNeededIncoming = useCallback(
    async ({ from, offer }: handleNegoNeededIncomingInterface) => {
      const ans = await peer.getAnswer(offer);
      socket?.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket?.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const handleNegoFinal = useCallback(async ({ ans }: any) => {
    await peer.setLocalDescription(ans);
  }, []);
  useEffect(() => {
    peer.peer?.addEventListener("negotiationneeded", handleNegoNeeded);

    return () => {
      peer.peer?.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    if (!roomID && !userID) navigate("/");
    peer.peer?.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);
    socket?.on("incoming:call", handleIncomingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:nego:needed", handleNegoNeededIncoming);
    socket?.on("peer:nego:final", handleNegoFinal);

    return () => {
      socket?.off("user:joined", handleUserJoined);
      socket?.off("incoming:call", handleIncomingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("peer:nego:needed", handleNegoNeededIncoming);
      socket?.off("peer:nego:final", handleNegoFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeededIncoming,
    handleNegoFinal,
  ]);

  useEffect(() => {
    socket?.on("call:end", ({ from }) => {
      if (from === remoteSocketId) {
        peer.peer?.close();

        if (myStream) {
          myStream.getTracks().forEach((track) => track.stop());
          setMyStream(null);
        }

        setRemoteStream(null);
        setRemoteSocketId(null);
      }
    });

    return () => {
      socket?.off("call:end");
    };
  }, [remoteSocketId, myStream, socket]);

  //* for disappearing call button
  useEffect(() => {
    socket?.on("call:initiated", ({ from }) => {
      if (from === remoteSocketId) {
        setCallButton(false);
      }
    });

    return () => {
      socket?.off("call:initiated");
    };
  }, [socket, remoteSocketId]);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    if (isAudioMute) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = false));
    }

    if (isVideoOnHold) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = false));
    }

    //! create offer
    const offer = await peer.getOffer();
    //* send offer to remote user
    socket?.emit("user:call", { to: remoteSocketId, offer });
    // set my stream
    setMyStream(stream);

    //* hide the call button
    setCallButton(false);

    //* Inform the remote user to hide their "CALL" button
    socket?.emit("call:initiated", { to: remoteSocketId });
  }, [remoteSocketId, socket, isAudioMute, isVideoOnHold, callButton]);

  const handleToggleAudio = () => {
    peer.toggleAudio();
    setIsAudioMute(!isAudioMute);
  };

  const handleToggleVideo = () => {
    peer.toggleVideo();
    setIsVideoOnHold(!isVideoOnHold);
  };

  const handleEndCall = useCallback(() => {
    peer.peer?.close();

    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
    }

    setRemoteStream(null);

    if (remoteSocketId) {
      socket?.emit("call:end", { to: remoteSocketId });
    }
    setRemoteSocketId(null);
  }, [myStream, remoteSocketId, socket]);
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden">
      <title>Room No. {roomID}</title>
      <h1
        className="absolute top-0 left-0 text-5xl
        text-center mt-5 ml-5 mmd:text-xl mxs:text-sm font-sans"
      >
        <VideocamIcon sx={{ fontSize: 50, color: "rgb(250, 112, 112)" }} />
      </h1>
      <h4
        className=" text-xl md:text-2xl 
            mmd:text-sm mt-5 mb-4 msm:max-w-[100px] text-center font-roboto"
      >
        {remoteSocketId ? "Connected With Remote User!" : "No One In Room"}
      </h4>
      {remoteStream && remoteSocketId && isSendButtonVisible && (
        <button
          className="bg-[#A1C398] hover:bg-[#C6EBC5] p-3 rounded-3xl"
          onClick={sendStreams}
        >
          Send Stream
        </button>
      )}
      {remoteSocketId && callButton && (
        <button
          className="text-xl bg-[#A1C398] hover:bg-[#C6EBC5] rounded-3xl p-3"
          onClick={handleCallUser}
          style={{ display: !remoteStream ? "block" : "none" }}
        >
          Call{" "}
          <CallIcon fontSize="medium" className=" animate-pulse scale-125" />
        </button>
      )}
      <div className="flex flex-col w-full items-center justify-center overflow-hidden">
        {myStream && (
          <VideoPlayer
            stream={myStream}
            name={"My Stream"}
            isAudioMute={isAudioMute}
          />
        )}
        {remoteStream && (
          <VideoPlayer
            stream={remoteStream}
            name={"Remote Stream"}
            isAudioMute={isAudioMute}
          />
        )}
      </div>
      {myStream && remoteStream && !isSendButtonVisible && (
        <CallHandleButtons
          isAudioMute={isAudioMute}
          isVideoOnHold={isVideoOnHold}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onEndCall={handleEndCall}
        />
      )}
    </div>
  );
}
