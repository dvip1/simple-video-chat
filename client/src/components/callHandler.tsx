// components/CallButtons.jsx
import MicOffIcon from "@mui/icons-material/MicOff";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { MouseEventHandler } from "react";
interface CallHandleButtonsProps {
  isAudioMute: boolean;
  isVideoOnHold: boolean;
  onToggleAudio: MouseEventHandler<HTMLButtonElement>;
  onToggleVideo: MouseEventHandler<HTMLButtonElement>;
  onEndCall: MouseEventHandler<HTMLButtonElement>;
}
const CallHandleButtons: React.FC<CallHandleButtonsProps> = ({
  isAudioMute,
  isVideoOnHold,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
}) => (
  <div className="absolute bottom-0 flex w-full space-x-4 h-[80px] items-center justify-center pb-8 ">
    <div className=" bg-[#FEFDED] border-2 border-slate-400 rounded-3xl   flex px-4 py-2 justify-center gap-10">
      <button
        className="callButtons text-white bg-blue-700 hover:bg-white hover:text-blue-700
        focus:ring-4 focus:ring-blue-300 p-1 rounded-xl  "
        onClick={onToggleAudio}
      >
        {isAudioMute ? (
          <MicOffIcon fontSize="large" />
        ) : (
          <KeyboardVoiceIcon fontSize="large" />
        )}
      </button>
      <button
        className="callButtons text-white bg-blue-700 hover:bg-white hover:text-blue-700
        focus:ring-4 focus:ring-blue-300 p-1 rounded-xl"
        onClick={onToggleVideo}
      >
        {isVideoOnHold ? (
          <VideocamOffIcon fontSize="large" />
        ) : (
          <VideocamIcon fontSize="large" />
        )}
      </button>
      <button
        className="callButtons text-white  bg-red-600 hover:text-red-700 hover:bg-white
        focus:ring-4 focus:ring-white p-1 rounded-xl"
        onClick={onEndCall}
      >
        <CallEndIcon fontSize="large" />
      </button>
    </div>
  </div>
);
export default CallHandleButtons;
