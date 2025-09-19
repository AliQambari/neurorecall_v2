// src/components/Test.jsx
import React, { useCallback, useEffect, useState, useRef } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";
import "../../styles/Test.css";
import { useDropzone } from "react-dropzone";
import { useLocation, useNavigate } from "react-router-dom";
import PuffLoader from "react-spinners/PuffLoader";
import { ConvertWebmToWav } from "../../components/ConvertWebmToWav";
import { useLanguage } from '../../components/LanguageContext';

// file size limitation (5MB)
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// validation for audio file
const validateAudioFile = (file) => {
  if (!file) return { valid: false, key: "noFile" };
  if (file.size > MAX_FILE_SIZE_BYTES) return { valid: false, key: "fileTooLarge" };

  const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/wav', 'audio/webm', 'audio/ogg'];
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|m4a|wav|webm|ogg)$/i)) {
    return { valid: false, key: "invalidFile" };
  }

  return { valid: true, key: null };
};

// validation for recorded blob
const validateRecordedBlob = (blob) => {
  if (!blob) return { valid: false, key: "noRecording" };
  if (blob.size > MAX_FILE_SIZE_BYTES) return { valid: false, key: "recordingTooLarge" };
  return { valid: true, key: null };
};

// translation dictionary for all error messages
const errorMessages = {
  noFile: {
    en: "Please select an audio file",
    fa: "لطفاً یک فایل صوتی انتخاب کنید"
  },
  fileTooLarge: {
    en: `File size exceeds ${MAX_FILE_SIZE_MB} MB`,
    fa: `حجم فایل از ${MAX_FILE_SIZE_MB} مگابایت بیشتر است`
  },
  invalidFile: {
    en: "Please select a valid audio file (MP3, M4A, WAV, WebM, OGG)",
    fa: "لطفاً یک فایل صوتی معتبر انتخاب کنید (MP3, M4A, WAV, WebM, OGG)"
  },
  noRecording: {
    en: "Please record something first",
    fa: "لطفاً ابتدا صدای خود را ضبط کنید"
  },
  recordingTooLarge: {
    en: `Recording size exceeds ${MAX_FILE_SIZE_MB} MB`,
    fa: `حجم ضبط از ${MAX_FILE_SIZE_MB} مگابایت بیشتر است`
  },
  uploadFailed: {
    en: "Upload failed!",
    fa: "آپلود موفقیت آمیز نبود!"
  },
  connectionError: {
    en: "Connection error. Please try again.",
    fa: "خطا در اتصال. لطفاً دوباره امتحان کنید."
  },
  conversionFailed: {
    en: "Audio conversion failed. Please try again.",
    fa: "تبدیل صدا ناموفق بود. لطفاً دوباره امتحان کنید."
  }
};

// server error translations
const translateServerError = (serverError, language) => {
  const serverErrorTranslations = {
    "متن قابل تشخیصی در فایل صوتی یافت نشد. لطفاً مجدداً تلاش کنید.": {
      en: "No recognizable text found in the audio file. Please try again.",
      fa: "متن قابل تشخیصی در فایل صوتی یافت نشد. لطفاً مجدداً تلاش کنید."
    },
    "خطا در پردازش فایل صوتی": {
      en: "Error processing audio file",
      fa: "خطا در پردازش فایل صوتی"
    },
    "فایل صوتی نامعتبر است": {
      en: "Invalid audio file",
      fa: "فایل صوتی نامعتبر است"
    },
    "مشکل در ارتباط با سرویس تشخیص صدا": {
      en: "Problem connecting to speech recognition service",
      fa: "مشکل در ارتباط با سرویس تشخیص صدا"
    }
  };

  // If there is a translation for the error, return it
  if (serverErrorTranslations[serverError]) {
    return serverErrorTranslations[serverError][language] || serverError;
  }

  // If there is not a translation for the error, return the error itself
  return serverError;
};

export default function Test() {
  const [uploadState, setUploadState] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [currentTest, setCurrentTest] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);

  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  // store error key instead of raw string
  const [errorKey, setErrorKey] = useState(null);

  // server error state
  const [serverError, setServerError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const inputRef = useRef(null);

  const { language } = useLanguage();

  const {
    startRecording,
    stopRecording,
    recordingBlob,
    isRecording,
  } = useAudioRecorder();

  // Display error
  const showError = (key) => {
    setErrorKey(key);
    setServerError(null);
    setTimeout(() => setErrorKey(null), 5000);
  };

  const showServerError = (message) => {
    setServerError(message);
    setErrorKey(null); 
    setTimeout(() => setServerError(null), 5000);
  };

  // Update test, round, and result path on route change
  useEffect(() => {
    const currentPath = location.pathname;
    const match = currentPath.match(/tests\/(\d+)\/(\d+)/);
    if (match) {
      setCurrentTest(parseInt(match[1], 10));
      setCurrentRound(parseInt(match[2], 10));
    } else {
      setCurrentTest(1);
      setCurrentRound(1);
    }
    // clear upload/record state whenever the route changes
    setUploadState(false);
    setUploadedFile(null);
    setRecordedBlob(null);
    setErrorKey(null); // clear error
    setServerError(null); // clear server error
  }, [location]);

  useEffect(() => {
    if (recordingBlob) {
      setRecordedBlob(recordingBlob);
    }
  }, [recordingBlob]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validation = validateAudioFile(file);

      if (!validation.valid) {
        showError(validation.key);
        return;
      }

      setUploadState(true);
      setUploadedFile(file);
      setErrorKey(null);
      setServerError(null);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "audio/*": [] },
    multiple: false,
    noClick: true,
    noKeyboard: true,
    maxSize: MAX_FILE_SIZE_BYTES,
    onDropRejected: (fileRejections) => {
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors.some(e => e.code === 'file-too-large')) {
          showError("fileTooLarge");
        } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
          showError("invalidFile");
        }
      }
    }
  });

  async function sendAudioToBackend(file) {
    const formData = new FormData();
    formData.append("audio", file);
    formData.append("test_number", currentTest);
    formData.append("round_number", currentRound);

    try {
      const response = await fetch("/api/tests/submit-audio", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (response.ok) {
        const resultData = await response.json();
        navigate(`/profile/tests/${currentTest}/${currentRound}/result`, {
          state: {
            ...resultData,
            test_number: currentTest,
            round_number: currentRound,
          },
        });
      } else {
        const errorData = await response.json();
        
        if (errorData.error) {
          // show & translate server errors
          const translatedError = translateServerError(errorData.error, language);
          showServerError(translatedError);
        } else {
          showError("uploadFailed");
        }
      }

    } catch (error) {
      console.error(language === "en" ? "Error uploading audio:" : "خطا در آپلود صدا", error);
      showError("connectionError");
    }

    setLoading1(false);
    setLoading2(false);
  }

  async function handleUploadSubmit(e) {
    e.preventDefault();

    const validation = validateAudioFile(uploadedFile);
    if (!validation.valid) {
      showError(validation.key);
      return;
    }

    setLoading1(true);
    await sendAudioToBackend(uploadedFile);
  }

  async function handleRecordSubmit(e) {
    e.preventDefault();

    const validation = validateRecordedBlob(recordedBlob);
    if (!validation.valid) {
      showError(validation.key);
      return;
    }

    setLoading2(true);

    try {
      const wavBlob = await ConvertWebmToWav(recordedBlob);

      const wavValidation = validateRecordedBlob(wavBlob);
      if (!wavValidation.valid) {
        showError(wavValidation.key);
        setLoading2(false);
        return;
      }

      await sendAudioToBackend(wavBlob);
    } catch (err) {
      console.error(language === "en" ? "Conversion failed:" : "تبدیل صدا ناموفق بود!", err);
      showError("conversionFailed");
      setLoading2(false);
    }
  }

  // Choose file handler
  const handleFileSelect = () => {
    inputRef.current?.click();
  };

  return (
    <div className="testRound" dir={language === 'en' ? 'ltr' : 'rtl'}>
      {(errorKey || serverError) && (
        <div className="row">
          <div className="col-12">
            <div className="audio-errors alert alert-danger alert-dismissible fade show" role="alert" aria-live="polite">
              {serverError || errorMessages[errorKey]?.[language] || errorKey}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {
                  setErrorKey(null);
                  setServerError(null);
                }}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Help Button */}
      <div className="row pt-4">
        <div className="col-12 col-md-2 offset-md-1 d-flex justify-content-center justify-content-md-start">
          <a href="/help" className="help" target="_blank" rel="noreferrer">
            {language === "en" ? "Help" : "راهنما"}
          </a>
        </div>
      </div>

      {/* Test Audio */}
      <div className="row pt-1 pb-5 justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-3">
          <audio controls key={`${currentTest}-${currentRound}`}>
            <source
              src={`/static/audio/test${currentTest}.m4a`} type="audio/x-m4a"
              preload="auto"
            />
          </audio>
          <div className="text-center pt-2">{language === "en" ? "Round " : "دور "} {currentRound}
            {language === "en" ? " of 5" : " از 5"}</div>
        </div>
      </div>

      {/* Upload & Record Sections */}
      <div className="ur-container row px-3 px-md-5 py-4 gy-4 justify-content-center">
        {/* Record Section */}
        <div className="col-12 col-lg-5 text-center">
          <div className="upload">
            <h5 className="pb-3 pt-1">
              {language === "en" ? "Record your sound" : "صدای خود را ضبط کنید"}
            </h5>
            <div>
              <img
                src={"../../../images/mic.png"}
                className={`mx-auto d-block my-4 ${isRecording ? "startRecordingmod" : "startRecord"}`}
                alt="record"
                onClick={() => (isRecording ? stopRecording() : startRecording())}
              />
            </div>
            {recordedBlob && (
              <p className="text-muted" style={{ fontSize: '12px' }}>
                {language === "en" ? `Recorded: ${(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB` :
                  `ضبط شده: ${(recordedBlob.size / (1024 * 1024)).toFixed(2)} مگابایت`}
              </p>
            )}
            <hr className="line mx-auto d-block" />
            <button
              className="btn cardBtn mt-3 test-action"
              onClick={handleRecordSubmit}
              disabled={loading1 || loading2}
            >
              {loading2 ? <PuffLoader size={40} color="#fff" /> : (recordedBlob ? (language === "en" ? "Submit Recording" : "ثبت فایل") : (language === "en" ? "Record" : "ضبط کنید"))}
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="col-12 col-lg-5 text-center">
          <div className="upload" {...getRootProps()}>
            <input {...getInputProps({ ref: inputRef })} />
            <img
              src={"../../../images/feather_upload-cloud.png"}
              className="mx-auto d-block my-4"
              alt="upload"
            />
            <h6 className="uploadtitle">
              {uploadState ? (language === "en" ? "Choose another file or drag and drop here" : "فایل دیگری انتخاب کنید") :
                (language === "en" ? "Select a file or drag and drop here" : "یک فایل انتخاب کرده یا اینجا بکشید و رها کنید.")}
            </h6>
            <p className="types text-muted">
              {uploadState ?
                <span style={{ fontSize: '12px' }}>
                  {language === "en" ? `Selected: ${uploadedFile?.name} (${(uploadedFile?.size / (1024 * 1024)).toFixed(2)} MB)` :
                    `انتخاب شده: ${uploadedFile?.name} (${(uploadedFile?.size / (1024 * 1024)).toFixed(2)} مگابایت)`}
                  <br />
                  {language === "en" ? `Max size: ${MAX_FILE_SIZE_MB} MB` : `حداکثر حجم: ${MAX_FILE_SIZE_MB} مگابایت`}
                </span>
                :
                <span>
                  {language === "en" ? "MP3, M4A, OGG, WEBM and other audio files" : "MP3, M4A, OGG, WEBM و انواع فایل های دیگر"}
                  <br />
                  {language === "en" ? `Max size: ${MAX_FILE_SIZE_MB} MB` : `حداکثر حجم: ${MAX_FILE_SIZE_MB} مگابایت`}
                </span>
              }
            </p>
            <button
              type="button"
              className={`btn ${uploadState ? "UploadedBtn px-4" : "BrowseBtn"} test-action`}
              onClick={handleFileSelect}
            >
              {uploadState ? (language === "en" ? "Uploaded" : "آپلود شده") : (language === "en" ? "Browse" : "انتخاب فایل")}
            </button>
            <hr className="line mx-auto d-block" />
            <button
              className="btn cardBtn mt-3 test-action"
              onClick={handleUploadSubmit}
              disabled={loading1 || loading2}
            >
              {loading1 ? <PuffLoader size={40} color="#fff" /> : (uploadedFile ? (language === "en" ? "Submit Upload" : "ثبت فایل") : (language === "en" ? "Upload a File" : "یک فایل آپلود کنید"))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}