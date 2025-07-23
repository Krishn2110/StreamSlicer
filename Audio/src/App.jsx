
// import React, { useState } from 'react';
// import axios from 'axios';
// import { ClipLoader } from 'react-spinners';

// function App() {
//   const [url, setUrl] = useState('');
//   const [downloadLink, setDownloadLink] = useState('');
//   const [status, setStatus] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [metadata, setMetadata] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus('Processing...');
//     setLoading(true);
//     setDownloadLink('');
//     setMetadata(null);

//     try {
//       const response = await axios.post('http://localhost:5000/api/download', { url });
//       const { filename, title, thumbnail, uploader, duration } = response.data;

//       const encodedFilename = encodeURIComponent(filename.endsWith('.mp3') ? filename : filename + '.mp3');
// setDownloadLink(`http://localhost:5000/api/file?filename=${encodedFilename}`);
//       setMetadata({ title, thumbnail, uploader, duration });
//       setStatus('✅ Ready! Click to download:');
//     } catch (err) {
//       setStatus('❌ Error: ' + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-tr from-purple-700 via-pink-500 to-indigo-900 flex items-center justify-center px-4">
//       <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-2xl animate-fade-in">
//         <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-8 tracking-wide">🎧 YouTube to MP3 Converter</h2>

//         <form onSubmit={handleSubmit} className="flex flex-col gap-5">
//           <input
//             type="text"
//             placeholder="Paste YouTube link here..."
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-400 transition duration-200 shadow-sm"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-md ${
//               loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-700 hover:to-pink-700'
//             }`}
//           >
//             {loading ? 'Converting...' : 'Convert to MP3'}
//           </button>
//         </form>

//         <div className="mt-6 text-center transition-all duration-300">
//           {loading && (
//             <div className="flex justify-center mb-4">
//               <ClipLoader color="#9333EA" loading={true} size={40} />
//             </div>
//           )}
//           <p className={`text-base font-medium mb-2 ${status.includes('Error') ? 'text-red-500' : 'text-gray-800'}`}>
//             {status}
//           </p>

//           <div className="flex gap-4 justify-center mt-4">
//             {downloadLink && (
//               <a
//                 href={downloadLink}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition duration-300 transform hover:scale-105 shadow"
//               >
//                 🎵 Download MP3
//               </a>
//             )}

//             {metadata && (
//               <button
//                 onClick={async () => {
//                   setStatus('Preparing video download...');
//                   try {
//                     const response = await axios.post('http://localhost:5000/api/download-video', { url });
//                     const videoFile = response.data.filename;
//                     window.open(`http://localhost:5000/api/video?filename=${videoFile}`, '_blank');
//                     setStatus('🎥 Video ready to download!');
//                   } catch (err) {
//                     setStatus('❌ Video download error: ' + (err.response?.data?.error || err.message));
//                   }
//                 }}
//                 className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition duration-300 transform hover:scale-105 shadow"
//               >
//                 📹 Download Video
//               </button>
//             )}
//           </div>
//         </div>

//         {metadata && (
//           <div className="mt-8 border-t pt-5 text-left animate-fade-in">
//             <img src={metadata.thumbnail} alt="Thumbnail" className="rounded-xl mb-4 w-full max-h-56 object-cover shadow" />
//             <h3 className="text-xl font-bold text-gray-900">{metadata.title}</h3>
//             <p className="text-sm text-gray-700 mt-1">Channel: <span className="font-medium">{metadata.uploader}</span></p>
//             <p className="text-sm text-gray-700">Duration: {formatDuration(metadata.duration)}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // Utility to format seconds to mm:ss
// function formatDuration(seconds) {
//   if (!seconds) return '';
//   const mins = Math.floor(seconds / 60);
//   const secs = seconds % 60;
//   return `${mins}:${secs.toString().padStart(2, '0')}`;
// }

// export default App;




import React from 'react';
import axios from 'axios';
import { useRef, useEffect, useState } from "react";
import TargetCursor from './TargetCursor';
import Galaxy from './Galaxy';



function App() {
  const [urls, setUrls] = useState(['']);
  const [downloads, setDownloads] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    setStatus('Starting batch...');
    setLoading(true);
    setDownloads([]);

    for (const url of urls.filter(Boolean)) {
      try {
        setStatus(`Processing: ${url}`);
        const res = await axios.post('http://localhost:5000/api/download', { url });
        const { filename,videoFilename, title, thumbnail, uploader, duration } = res.data;

        setDownloads((prev) => [
          ...prev,
          {
            url,
            downloadUrl: `http://localhost:5000/api/file?filename=${encodeURIComponent(filename)}`,
            title,
            thumbnail,
            uploader,
            duration
          }
        ]);
      } catch (err) {
        setDownloads((prev) => [
          ...prev,
          {
            url,
            error: err.response?.data?.error || err.message
          }
        ]);
      }
    }

    setStatus('✅ All done!');
    setLoading(false);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  

  return (
    
    <div className="min-h-screen p-6 text-white w-full relative overflow-hidden bg-black">


<div className="absolute inset-0 z-0">
  <Galaxy 
    mouseRepulsion={true}
    mouseInteraction={true}
    density={1.5}
    glowIntensity={0.5}
    saturation={0.8}
    hueShift={240}
  />
</div>

  <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
      />

      <div className="relative z-10 max-w-3xl mx-auto poppins-semibold glass-card text-gray-800 mt-30 shadow-xl rounded-xl p-8 animate-fade-in">
        <h1 className='text-3xl text-center text-gray-200 mb-6'>StreamSlicer -<span className='text-2xl'>🎵 Convert Links to Audio and Video</span></h1>

        <form onSubmit={handleBatchSubmit} className="flex flex-col gap-4 ">
          {urls.map((url, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`YouTube link ${idx + 1}`}
              value={url}
              onChange={(e) => {
                const newUrls = [...urls];
                newUrls[idx] = e.target.value;
                setUrls(newUrls);
              }}
              className="p-3 border border-gray-300 text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          ))}

          <button
            type="button"
            onClick={() => setUrls([...urls, ''])}
            className="bg-black cursor-target text-white px-4 py-3 rounded-xl"
          >
            ➕ Add Another Link
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`bg-black text-white cursor-target font-semibold py-3 rounded-xl transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Converting...' : 'Convert All'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">{status}</p>

        <div className="mt-6 space-y-4">
          

{downloads.map((item, idx) => (
  <div key={idx} className="bg-gray-300 border p-4 rounded-xl shadow-xl">
    {item.error ? (
      <p className="text-red-500">❌ {item.url} — {item.error}</p>
    ) : (
      <>
        <div className="flex gap-4">
          <img src={item.thumbnail} alt="Thumbnail" className="w-24 h-24 object-cover rounded" />
          <div>
            <h4 className="font-bold text-lg">{item.title}</h4>
            <p className="text-sm text-gray-600">Uploader: {item.uploader}</p>
            <p className="text-sm text-gray-600">Duration: {formatDuration(item.duration)}</p>

            <div className="flex flex-wrap gap-2 mt-2">
              <a
                href={item.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className=" bg-black  cursor-target text-white px-4 py-2 rounded-lg"
              >
                ⬇️ Download Audio
              </a>

              <button
  onClick={async () => {
    try {
      setStatus(`📽 Downloading video for: ${item.title}`);
      const res = await axios.post('http://localhost:5000/api/download-video', { url: item.url });
      const videoFilename = res.data.filename;

      window.open(
        `http://localhost:5000/api/video?filename=${encodeURIComponent(videoFilename)}`,
        '_blank'
      );
    } catch (err) {
      alert('Failed to download video: ' + (err.response?.data?.error || err.message));
    }
  }}
  className="bg-black cursor-target text-white px-4 py-2 rounded-lg"
>
  🎥 Download Video
</button>

            </div>
          </div>
        </div>
      </>
    )}
  </div>
))}



        </div>
      </div>
      
    </div>
  );
}

export default App;




// import React, { useState } from 'react';
// import axios from 'axios';
// import LightRays from './LightRays';

// function App() {
//   const [urls, setUrls] = useState(['']);
//   const [downloads, setDownloads] = useState([]);
//   const [status, setStatus] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleBatchSubmit = async (e) => {
//     e.preventDefault();
//     setStatus('Starting batch...');
//     setLoading(true);
//     setDownloads([]);

//     for (const url of urls.filter(Boolean)) {
//       try {
//         setStatus(`Processing: ${url}`);
//         const res = await axios.post('http://localhost:5000/api/download', { url });
//         const { filename, title, thumbnail, uploader, duration } = res.data;

//         setDownloads((prev) => [
//           ...prev,
//           {
//             url,
//             downloadUrl: `http://localhost:5000/api/file?filename=${encodeURIComponent(filename)}`,
//             title,
//             thumbnail,
//             uploader,
//             duration
//           }
//         ]);
//       } catch (err) {
//         setDownloads((prev) => [
//           ...prev,
//           {
//             url,
//             error: err.response?.data?.error || err.message
//           }
//         ]);
//       }
//     }

//     setStatus('✅ All done!');
//     setLoading(false);
//   };

//   const formatDuration = (seconds) => {
//     if (!seconds) return '';
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden">
//       {/* Light Rays Background */}
//       <LightRays
//         className="absolute inset-0 w-full h-full z-0"
//         raysOrigin="top-center"
//         raysColor="#ffffff"
//         raysSpeed={1}
//         lightSpread={0.9}
//         rayLength={1.8}
//         pulsating={true}
//         fadeDistance={1.0}
//         saturation={1}
//         followMouse={true}
//         mouseInfluence={0.1}
//         noiseAmount={0.1}
//         distortion={0.05}
//       />

//       {/* Main Content */}
//       <div className="relative z-10 min-h-screen bg-gradient-to-br from-purple-600/80 to-indigo-900/80 p-6 text-white backdrop-blur">
//         <div className="max-w-3xl mx-auto bg-white text-gray-800 shadow-xl rounded-xl p-8 animate-fade-in">
//           <h2 className="text-3xl font-bold text-center mb-6">🎵 Batch YouTube to MP3 Converter</h2>

//           <form onSubmit={handleBatchSubmit} className="flex flex-col gap-4">
//             {urls.map((url, idx) => (
//               <input
//                 key={idx}
//                 type="text"
//                 placeholder={`YouTube link #${idx + 1}`}
//                 value={url}
//                 onChange={(e) => {
//                   const newUrls = [...urls];
//                   newUrls[idx] = e.target.value;
//                   setUrls(newUrls);
//                 }}
//                 className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//               />
//             ))}

//             <button
//               type="button"
//               onClick={() => setUrls([...urls, ''])}
//               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//             >
//               ➕ Add Another Link
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className={`bg-purple-600 text-white font-semibold py-2 rounded-lg transition ${
//                 loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
//               }`}
//             >
//               {loading ? 'Converting...' : 'Convert All'}
//             </button>
//           </form>

//           <p className="mt-4 text-center text-sm text-gray-600">{status}</p>

//           <div className="mt-6 space-y-4">
//             {downloads.map((item, idx) => (
//               <div key={idx} className="bg-gray-50 border p-4 rounded shadow">
//                 {item.error ? (
//                   <p className="text-red-500">❌ {item.url} — {item.error}</p>
//                 ) : (
//                   <div className="flex gap-4">
//                     <img src={item.thumbnail} alt="Thumbnail" className="w-24 h-24 object-cover rounded" />
//                     <div>
//                       <h4 className="font-bold text-lg">{item.title}</h4>
//                       <p className="text-sm text-gray-600">Uploader: {item.uploader}</p>
//                       <p className="text-sm text-gray-600">Duration: {formatDuration(item.duration)}</p>
//                       <a
//                         href={item.downloadUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="inline-block mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//                       >
//                         ⬇️ Download MP3
//                       </a>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;
