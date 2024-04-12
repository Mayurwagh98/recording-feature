const [systemRecording, setSystemRecording] = useState(false);
const [userRecording, setUserRecording] = useState(false);
const [systemStream, setSystemStream] = useState(null);
const [userStream, setUserStream] = useState(null);
const systemMediaRecorderRef = useRef(null);
const userMediaRecorderRef = useRef(null);
const systemChunksRef = useRef([]);
const userChunksRef = useRef([]);

const startSystemRecording = async () => {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    const systemMediaRecorder = new MediaRecorder(screenStream);
    systemMediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        systemChunksRef.current.push(e.data);
      }
    };
    systemMediaRecorder.onstop = () => {
      const blob = new Blob(systemChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "system_recording.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      systemChunksRef.current = [];
    };
    systemMediaRecorderRef.current = systemMediaRecorder;
    setSystemStream(screenStream);
    systemMediaRecorder.start();
    setSystemRecording(true);
  } catch (error) {
    console.error("Error starting system recording:", error);
  }
};

const startUserRecording = async () => {
  try {
    const userStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const userMediaRecorder = new MediaRecorder(userStream);
    userMediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        userChunksRef.current.push(e.data);
      }
    };
    userMediaRecorder.onstop = () => {
      const blob = new Blob(userChunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "user_recording.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      userChunksRef.current = [];
    };
    userMediaRecorderRef.current = userMediaRecorder;
    setUserStream(userStream);
    userMediaRecorder.start();
    setUserRecording(true);
  } catch (error) {
    console.error("Error starting user recording:", error);
  }
};

const stopSystemRecording = () => {
  if (systemMediaRecorderRef.current && systemRecording) {
    systemMediaRecorderRef.current.stop();
    setSystemRecording(false);
  }
};

const stopUserRecording = () => {
  if (userMediaRecorderRef.current && userRecording) {
    userMediaRecorderRef.current.stop();
    setUserRecording(false);
  }
};

<div>
  <button
    onClick={systemRecording ? stopSystemRecording : startSystemRecording}
  >
    {systemRecording ? "Stop System Recording" : "Start System Recording"}
  </button>
  <button onClick={userRecording ? stopUserRecording : startUserRecording}>
    {userRecording ? "Stop User Recording" : "Start User Recording"}
  </button>
</div>;
