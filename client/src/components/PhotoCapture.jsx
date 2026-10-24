import { useEffect, useRef, useState } from 'react';

const OUT_W = 480;
const OUT_H = 600;

function cropToDataUrl(source) {
  const canvas = document.createElement('canvas');
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  const ctx = canvas.getContext('2d');

  const sw = source.videoWidth || source.naturalWidth || source.width;
  const sh = source.videoHeight || source.naturalHeight || source.height;
  if (!sw || !sh) return null;

  const scale = Math.max(OUT_W / sw, OUT_H / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(source, (OUT_W - dw) / 2, (OUT_H - dh) / 2, dw, dh);

  return canvas.toDataURL('image/jpeg', 0.85);
}

function loadAsImage(file, onDone, onError) {
  const reader = new FileReader();
  reader.onerror = () => onError('Could not read that file');
  reader.onload = () => {
    const img = new Image();
    img.onload = () => onDone(cropToDataUrl(img));
    img.onerror = () => onError('Not a valid image');
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

export default function PhotoCapture({ value, onChange }) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!cameraOpen) return;
    let cancelled = false;

    async function start() {
      setError('');
      try {
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' }
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        if (!cancelled) {
          setError('Camera unavailable: ' + (e.message || 'permission denied'));
        }
      }
    }

    start();
    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOpen]);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function closeCamera() {
    stopCamera();
    setCameraOpen(false);
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setError('Camera is not ready yet');
      return;
    }
    const url = cropToDataUrl(video);
    if (url) {
      onChange(url);
      closeCamera();
    }
  }

  function onFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    loadAsImage(
      file,
      (url) => url && onChange(url),
      (msg) => setError(msg)
    );
  }

  return (
    <div className="photo-capture">
      <div className="photo-preview">
        {value ? (
          <img src={value} alt="Archer" />
        ) : (
          <span>No photo</span>
        )}
      </div>

      <div className="photo-actions">
        <label className="btn ghost sm">
          Upload Photo
          <input type="file" accept="image/*" onChange={onFile} hidden />
        </label>
        <button className="btn ghost sm" type="button" onClick={() => setCameraOpen(true)}>
          Take Photo
        </button>
        {value && (
          <button className="btn danger sm" type="button" onClick={() => onChange('')}>
            Remove
          </button>
        )}
        <div className="photo-hint">Shown in the photo box on the A4 form</div>
      </div>

      {error && <div className="alert err" style={{ gridColumn: '1 / -1' }}>{error}</div>}

      {cameraOpen && (
        <div className="camera-overlay">
          <div className="camera-modal">
            <div className="camera-title">Take Photo</div>
            <video ref={videoRef} autoPlay playsInline muted />
            <div className="btn-row" style={{ justifyContent: 'center' }}>
              <button className="btn gold" type="button" onClick={capture}>
                Capture
              </button>
              <button className="btn ghost" type="button" onClick={closeCamera}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
