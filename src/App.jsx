import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const mixedStreamRef = useRef(null);
  const [shareScreenAgain, setShareScreenAgain] = useState(false);

  useEffect(() => {}, [shareScreenAgain]);

  // const startRecording = async () => {
  //   try {
  //     const screenStream = await navigator.mediaDevices.getDisplayMedia({
  //       video: true,
  //       audio: true, // You're capturing screen audio here
  //     });

  //     const audioStream = await navigator.mediaDevices.getUserMedia({
  //       audio: true,
  //     });
  //     if (!screenStream.getAudioTracks().length) {
  //       const userResponse = window.confirm(
  //         "Please share system audio to record audio with screen. Do you want to stop screen sharing?"
  //       );
  //       if (userResponse) {
  //         setShareScreenAgain(true);
  //         // Stop screen sharing if the user confirms
  //         screenStream.getTracks().forEach((track) => track.stop());
  //       } else {
  //         setShareScreenAgain(false);
  //       }
  //       return;
  //     }
  //     const audioContext = new AudioContext();
  //     const screenAudioSource =
  //       audioContext.createMediaStreamSource(screenStream);
  //     const microphoneAudioSource =
  //       audioContext.createMediaStreamSource(audioStream);

  //     // Create a mixed audio stream
  //     const destination = audioContext.createMediaStreamDestination();
  //     screenAudioSource.connect(destination);
  //     microphoneAudioSource.connect(destination);

  //     // Combine the screen video stream with the mixed audio stream
  //     // This involves replacing the screen stream's audio track with the mixed audio track
  //     if (screenStream.getVideoTracks().length > 0) {
  //       const mixedStream = new MediaStream([
  //         ...screenStream.getVideoTracks(), // Get video track from the screen
  //         ...destination.stream.getAudioTracks(), // Get mixed audio track
  //       ]);

  //       mixedStreamRef.current = mixedStream;

  //       const mediaRecorder = new MediaRecorder(mixedStreamRef.current);
  //       mediaRecorder.ondataavailable = (e) => {
  //         if (e.data.size > 0) {
  //           chunksRef.current.push(e.data);
  //         }
  //       };
  //       mediaRecorder.onstop = () => {
  //         const blob = new Blob(chunksRef.current, { type: "video/webm" });
  //         const url = URL.createObjectURL(blob);
  //         const a = document.createElement("a");
  //         document.body.appendChild(a);
  //         a.style = "display: none";
  //         a.href = url;
  //         a.download = "recording.webm";
  //         a.click();
  //         window.URL.revokeObjectURL(url);
  //         chunksRef.current = [];
  //       };

  //       mediaRecorderRef.current = mediaRecorder;
  //       mediaRecorder.start();
  //       setRecording(true);
  //       setShareScreenAgain(false);
  //     } else {
  //       console.error("No video track found in screen stream.");
  //     }
  //   } catch (error) {
  //     console.error("Error starting recording:", error);
  //   }
  // };

  // const stopRecording = () => {
  //   if (mediaRecorderRef.current && recording) {
  //     mediaRecorderRef.current.stop();
  //     setRecording(false);
  //   }
  // };

  // <div>
  //   <button onClick={recording ? stopRecording : startRecording}>
  //     {recording ? "Stop Recording" : "Start Recording"}
  //   </button>
  // </div>;

  // -----> this code allows user to record even if he/she doesn't selects systems audio <--------
  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // capturing screen audio here
      });

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const audioContext = new AudioContext();

      let mixedStream;

      screenStream.oninactive = () => {
        stopRecording();
        alert("you have stoped recording");
      };

      // Check if screen stream has audio tracks
      if (screenStream.getAudioTracks().length > 0) {
        const screenAudioSource =
          audioContext.createMediaStreamSource(screenStream);
        const microphoneAudioSource =
          audioContext.createMediaStreamSource(audioStream);

        // Create a mixed audio stream
        const destination = audioContext.createMediaStreamDestination();
        screenAudioSource.connect(destination);
        microphoneAudioSource.connect(destination);

        // Combine the screen video stream with the mixed audio stream
        mixedStream = new MediaStream([
          ...screenStream.getVideoTracks(), // Get video track from the screen
          ...destination.stream.getAudioTracks(), // Get mixed audio track
        ]);
      } else {
        // Record only screen and microphone audio
        mixedStream = new MediaStream([
          ...screenStream.getVideoTracks(), // Get video track from the screen
          ...audioStream.getAudioTracks(), // Get microphone audio track
        ]);
      }

      mixedStreamRef.current = mixedStream;

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
        chunksRef.current = [];
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // -------> recording stop func <-----------
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <>
      <div>
        <button onClick={recording ? stopRecording : startRecording}>
          {recording ? "Stop Recording" : "Start Recording"}
        </button>

        {shareScreenAgain ? (
          <button onClick={startRecording}>Share screen</button>
        ) : null}
      </div>
    </>
  );
}

export default App;

// -------> recording start func <-----------
// -----> this code doesn't allow user to record if he/she doesn't selects systems audio <--------
// const startRecording = async () => {
//   try {
//     const screenStream = await navigator.mediaDevices.getDisplayMedia({
//       video: true,
//       audio: true, // capturing screen audio here
//     });

//     const audioStream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//     });

//     // confirming if user has shared his/her system's audio
//     if (!screenStream.getAudioTracks().length) {
//       const userResponse = window.confirm(
//         "Please share system audio to record audio with screen. Do you want to restart interview again?"
//       );
//       if (userResponse) {
//         // if presses ok then startRecording will run again
//         shareScreenAgainFunc();
//         // Stop screen sharing if the user confirms
//         screenStream.getTracks().forEach((track) => track.stop());
//       } else {
//         // if user press cancel then intevriew will end
//         navigate(`/intervue-report/${candidateId}`, { state: candidateId });
//         window.location.reload();
//       }
//       return;
//     }

//     const audioContext = new AudioContext();
//     const screenAudioSource =
//       audioContext.createMediaStreamSource(screenStream);
//     const microphoneAudioSource =
//       audioContext.createMediaStreamSource(audioStream);

//     // Create a mixed audio stream
//     const destination = audioContext.createMediaStreamDestination();
//     screenAudioSource.connect(destination);
//     microphoneAudioSource.connect(destination);

//     // Combine the screen video stream with the mixed audio stream
//     // This involves replacing the screen stream's audio track with the mixed audio track
//     if (screenStream.getVideoTracks().length > 0) {
//       const mixedStream = new MediaStream([
//         ...screenStream.getVideoTracks(), // Get video track from the screen
//         ...destination.stream.getAudioTracks(), // Get mixed audio track
//       ]);

//       mixedStreamRef.current = mixedStream;

//       const mediaRecorder = new MediaRecorder(mixedStreamRef.current);
//       mediaRecorder.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//           chunksRef.current.push(e.data);
//         }
//       };
//       mediaRecorder.onstop = () => {
//         const blob = new Blob(chunksRef.current, { type: "video/webm" });
//         console.log("blob:", blob);
//         // uploadCandidateRecording(blob);
//         // blobToFile(blob);
//         uploadBlob(blob);
//         // const url = URL.createObjectURL(blob);
//         // const a = document.createElement("a");
//         // document.body.appendChild(a);
//         // a.style = "display: none";
//         // a.href = url;
//         // a.download = "recording.webm";
//         // a.click();
//         // window.URL.revokeObjectURL(url);
//         chunksRef.current = [];
//       };

//       mediaRecorderRef.current = mediaRecorder;
//       mediaRecorder.start();
//       setRecording(true);
//     } else {
//       console.error("No video track found in screen stream.");
//     }
//   } catch (error) {
//     console.error("Error starting recording:", error);
//   }
// };
