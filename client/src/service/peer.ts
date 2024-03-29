class PeerService {
  public peer: RTCPeerConnection | undefined;

  constructor() {
    if (typeof window !== "undefined" && !this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    }
  }

  setLocalDescription = async (
    ans: RTCSessionDescriptionInit
  ): Promise<void> => {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  };

  getAnswer = async (
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit | undefined> => {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  };

  getOffer = async (): Promise<RTCSessionDescriptionInit | undefined> => {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  };

  toggleAudio = (): void => {
    if (this.peer) {
      const audioSender = this.peer
        .getSenders()
        .find((sender) => sender.track?.kind === "audio");
      if (audioSender) {
        const audioTracks = audioSender.track;
        if (audioTracks) {
          audioTracks.enabled = !audioTracks.enabled;
        }
      }

      // Mute the local audio track
      const localAudioTrack = this.peer
        .getTransceivers()
        .find((transceiver) => transceiver.sender.track?.kind === "audio")
        ?.sender.track;
      if (localAudioTrack) {
        localAudioTrack.enabled = !localAudioTrack.enabled;
      }
    }
  };

  toggleVideo = (): void => {
    if (this.peer) {
      const videoTracks = this.peer
        .getSenders()
        .find((sender) => sender.track?.kind === "video")?.track;
      if (videoTracks) {
        videoTracks.enabled = !videoTracks.enabled;
      }
    }
  };
}

export default new PeerService();
