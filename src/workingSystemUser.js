const [recording, setRecording] = useState(false);
const mediaRecorderRef = useRef(null);
const chunksRef = useRef([]);
const mixedStreamRef = useRef(null);

const startRecording = async () => {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const audioContext = new AudioContext();
    const screenAudioSource =
      audioContext.createMediaStreamSource(screenStream);
    const microphoneAudioSource =
      audioContext.createMediaStreamSource(audioStream);

    // Create a mixed audio stream
    const destination = audioContext.createMediaStreamDestination();
    screenAudioSource.connect(destination);
    microphoneAudioSource.connect(destination);

    // Save the mixed audio stream
    mixedStreamRef.current = destination.stream;

    const mediaRecorder = new MediaRecorder(mixedStreamRef.current);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "recording.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      chunksRef.current = [];
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
  } catch (error) {
    console.error("Error starting recording:", error);
  }
};

const stopRecording = () => {
  if (mediaRecorderRef.current && recording) {
    mediaRecorderRef.current.stop();
    setRecording(false);
  }
};

<div>
  <button onClick={recording ? stopRecording : startRecording}>
    {recording ? "Stop Recording" : "Start Recording"}
  </button>
</div>;
