import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const createMessage = (role, payload) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  ...payload,
});

const SUPPORTED_LANGUAGES = [
  { value: 'auto', label: { en: 'Auto detect', ru: 'Автоопределение' } },
  { value: 'ru', label: { en: 'Russian', ru: 'Русский' } },
  { value: 'en', label: { en: 'English', ru: 'Английский' } },
  { value: 'es', label: { en: 'Spanish', ru: 'Испанский' } },
  { value: 'de', label: { en: 'Deutsch', ru: 'Немецкий' } },
  { value: 'fr', label: { en: 'French', ru: 'Французский' } },
  { value: 'zh', label: { en: 'Chinese', ru: 'Китайский' } },
];

const LANGUAGE_TO_LOCALE = {
  auto: 'en-US',
  ru: 'ru-RU',
  en: 'en-US',
  es: 'es-ES',
  de: 'de-DE',
  fr: 'fr-FR',
  zh: 'zh-CN',
};

const UI_COPY = {
  en: {
    introTitle: 'Voice translator is ready',
    introText:
      'Press the mic button, record a phrase, and send it for translation. Until the backend is connected, the interface works in demo mode.',
    introMeta: 'This is a starter frontend for an OpenAI API route or your own server.',
    waitingForRecording: 'Waiting for recording',
    mediaRecorderError: 'This browser does not support voice recording with MediaRecorder.',
    readyToSend: 'Recording is ready to send',
    recordingNowStatus: 'Recording voice...',
    microphonePermissionError: 'Could not access the microphone. Check your browser permissions.',
    savingRecording: 'Saving recording...',
    demoTranscriptPrefix: 'Demo: audio payload',
    demoTranslatedText:
      'This is a UI placeholder. Once you connect a backend or API route, the real model translation will appear here.',
    apiAudioError: 'The API returned an error while processing audio.',
    sendingRecording: 'Sending recording for translation...',
    userVoiceTitle: 'Voice message',
    userVoiceText: seconds => `Recording ${seconds} sec was sent for translation.`,
    missingTranslatedText: 'The API did not return translated text.',
    assistantVoiceTitle: 'Translation ready: voice',
    assistantTextTitle: 'Translation ready: text',
    demoModeMeta: 'Demo mode response',
    apiResponseMeta: 'API response',
    demoResponseCreated: 'Demo response created',
    translationComplete: 'Translation complete',
    translationRequestError: 'Could not get the translation.',
    processingError: 'Processing error',
    brandTitle: 'Voice translator interface',
    brandDescription:
      'Starter frontend for the flow: record speech, send audio to a model, and receive the translation as text or voice.',
    settingsTitle: 'Translation settings',
    sourceLanguageLabel: 'Source language',
    targetLanguageLabel: 'Target language',
    responseFormatLabel: 'Response format',
    responseModeAria: 'Response mode',
    responseText: 'Text',
    responseVoice: 'Voice',
    flowTitle: 'How the flow works',
    flowStep1: '1. The user starts recording.',
    flowStep2: '2. The frontend stores the audio.',
    flowStep3: '3. The audio is sent to the API.',
    flowStep4: '4. The response comes back as text or audio.',
    helperDemoNote: 'Demo mode is active. Add REACT_APP_TRANSLATE_API_URL for real translation.',
    helperApiNote: endpoint => `Connected API: ${endpoint}`,
    conversationTitle: 'Translator conversation',
    transcriptLabel: 'Transcript',
    audioFallback: 'Your browser does not support audio playback.',
    summaryRecording: 'Recording',
    summaryDuration: 'Duration',
    summaryRecordingNow: 'Recording now',
    summaryReadyToSend: 'Ready to send',
    summaryNoRecording: 'No recording',
    secondsSuffix: 'sec',
    previewTitle: 'Latest recording preview',
    recordButtonStart: 'Start recording',
    recordButtonStop: 'Stop recording',
    sendButtonIdle: 'Send for translation',
    sendButtonBusy: 'Sending...',
    clearButton: 'Clear',
    interfaceLanguageTitle: 'Interface language',
    interfaceLanguageHint: 'Site language',
    interfaceEnglish: 'English',
    interfaceRussian: 'Russian',
  },
  ru: {
    introTitle: 'Голосовой переводчик готов',
    introText:
      'Нажми на кнопку микрофона, запиши фразу и отправь ее на перевод. Пока backend не подключен, интерфейс работает в демо-режиме.',
    introMeta: 'Это стартовый фронтенд под API OpenAI или собственный сервер.',
    waitingForRecording: 'Ожидание записи',
    mediaRecorderError: 'Этот браузер не поддерживает запись голоса через MediaRecorder.',
    readyToSend: 'Запись готова к отправке',
    recordingNowStatus: 'Идет запись голоса...',
    microphonePermissionError: 'Не удалось получить доступ к микрофону. Проверь разрешения браузера.',
    savingRecording: 'Сохраняем запись...',
    demoTranscriptPrefix: 'Демо: размер аудио',
    demoTranslatedText:
      'Это заглушка интерфейса. Когда подключишь backend или API-роут, здесь появится настоящий перевод от модели.',
    apiAudioError: 'API вернул ошибку при обработке аудио.',
    sendingRecording: 'Отправляем запись на перевод...',
    userVoiceTitle: 'Голосовое сообщение',
    userVoiceText: seconds => `Запись ${seconds} сек отправлена на перевод.`,
    missingTranslatedText: 'API не вернул текст перевода.',
    assistantVoiceTitle: 'Перевод готов: голос',
    assistantTextTitle: 'Перевод готов: текст',
    demoModeMeta: 'Ответ в демо-режиме',
    apiResponseMeta: 'Ответ от API',
    demoResponseCreated: 'Демо-ответ создан',
    translationComplete: 'Перевод завершен',
    translationRequestError: 'Не удалось получить перевод.',
    processingError: 'Ошибка обработки',
    brandTitle: 'Интерфейс голосового переводчика',
    brandDescription:
      'Базовый фронтенд для сценария: записать речь, отправить аудио в модель и получить перевод текстом или голосом.',
    settingsTitle: 'Настройки перевода',
    sourceLanguageLabel: 'Язык оригинала',
    targetLanguageLabel: 'Язык перевода',
    responseFormatLabel: 'Формат ответа',
    responseModeAria: 'Режим ответа',
    responseText: 'Текст',
    responseVoice: 'Голос',
    flowTitle: 'Как это работает',
    flowStep1: '1. Пользователь запускает запись.',
    flowStep2: '2. Фронтенд сохраняет аудио.',
    flowStep3: '3. Аудио уходит в API.',
    flowStep4: '4. Ответ возвращается текстом или голосом.',
    helperDemoNote: 'Сейчас включен демо-режим. Добавь REACT_APP_TRANSLATE_API_URL для реального перевода.',
    helperApiNote: endpoint => `Подключенный API: ${endpoint}`,
    conversationTitle: 'Диалог с переводчиком',
    transcriptLabel: 'Транскрипт',
    audioFallback: 'Ваш браузер не поддерживает воспроизведение аудио.',
    summaryRecording: 'Запись',
    summaryDuration: 'Длительность',
    summaryRecordingNow: 'Идет запись',
    summaryReadyToSend: 'Готово к отправке',
    summaryNoRecording: 'Нет записи',
    secondsSuffix: 'сек',
    previewTitle: 'Предпрослушивание последней записи',
    recordButtonStart: 'Начать запись',
    recordButtonStop: 'Остановить запись',
    sendButtonIdle: 'Отправить на перевод',
    sendButtonBusy: 'Отправляем...',
    clearButton: 'Очистить',
    interfaceLanguageTitle: 'Язык интерфейса',
    interfaceLanguageHint: 'Текст на сайте',
    interfaceEnglish: 'English',
    interfaceRussian: 'Русский',
  },
};

const buildIntroMessage = language =>
  createMessage('assistant', {
    id: 'intro-message',
    isIntro: true,
    title: UI_COPY[language].introTitle,
    text: UI_COPY[language].introText,
    meta: UI_COPY[language].introMeta,
  });

function App() {
  const [interfaceLanguage, setInterfaceLanguage] = useState('en');
  const [messages, setMessages] = useState(() => [buildIntroMessage('en')]);
  const [fromLanguage, setFromLanguage] = useState('auto');
  const [toLanguage, setToLanguage] = useState('en');
  const [responseMode, setResponseMode] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [statusKey, setStatusKey] = useState('waitingForRecording');
  const [errorKey, setErrorKey] = useState('');
  const [errorText, setErrorText] = useState('');

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);
  const recordingTimerRef = useRef(null);

  const apiEndpoint = process.env.REACT_APP_TRANSLATE_API_URL || '';
  const isDemoMode = !apiEndpoint;
  const t = UI_COPY[interfaceLanguage];
  const statusText = t[statusKey] || t.waitingForRecording;
  const displayedError = errorKey ? t[errorKey] : errorText;

  const canSendRecording = useMemo(
    () => Boolean(audioBlob) && !isRecording && !isSubmitting,
    [audioBlob, isRecording, isSubmitting]
  );

  useEffect(() => {
    return () => {
      cleanupRecordingResources();
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  useEffect(() => {
    setMessages(currentMessages => {
      if (!currentMessages.length) {
        return [buildIntroMessage(interfaceLanguage)];
      }

      const [firstMessage, ...restMessages] = currentMessages;

      if (!firstMessage.isIntro) {
        return currentMessages;
      }

      return [
        {
          ...firstMessage,
          title: t.introTitle,
          text: t.introText,
          meta: t.introMeta,
        },
        ...restMessages,
      ];
    });
  }, [interfaceLanguage, t.introMeta, t.introText, t.introTitle]);

  const cleanupRecordingResources = () => {
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    recorderRef.current = null;
  };

  const resetCurrentRecording = () => {
    setAudioBlob(null);
    setRecordingDuration(0);
    setStatusKey('waitingForRecording');
    setErrorKey('');
    setErrorText('');

    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl('');
    }
  };

  const startRecordingTimer = () => {
    startedAtRef.current = Date.now();
    setRecordingDuration(0);

    recordingTimerRef.current = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setRecordingDuration(elapsedSeconds);
    }, 250);
  };

  const handleStartRecording = async () => {
    if (isRecording || isSubmitting) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setErrorKey('mediaRecorderError');
      setErrorText('');
      return;
    }

    resetCurrentRecording();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const nextBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        if (audioPreviewUrl) {
          URL.revokeObjectURL(audioPreviewUrl);
        }

        setAudioBlob(nextBlob);
        setAudioPreviewUrl(URL.createObjectURL(nextBlob));
        setStatusKey('readyToSend');
        setIsRecording(false);
        cleanupRecordingResources();
      };

      recorder.start();
      startRecordingTimer();
      setIsRecording(true);
      setStatusKey('recordingNowStatus');
      setErrorKey('');
      setErrorText('');
    } catch (error) {
      cleanupRecordingResources();
      setIsRecording(false);
      setErrorKey('microphonePermissionError');
      setErrorText('');
    }
  };

  const handleStopRecording = () => {
    if (!recorderRef.current || recorderRef.current.state === 'inactive') {
      return;
    }

    recorderRef.current.stop();
    setStatusKey('savingRecording');
  };

  const speakText = text => {
    if (!('speechSynthesis' in window) || !text) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGE_TO_LOCALE[toLanguage] || 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const addMessages = nextMessages => {
    setMessages(currentMessages => [...currentMessages, ...nextMessages]);
  };

  const getLanguageLabel = languageValue =>
    SUPPORTED_LANGUAGES.find(language => language.value === languageValue)?.label[interfaceLanguage] ||
    languageValue;

  const simulateTranslation = async currentBlob => {
    await new Promise(resolve => window.setTimeout(resolve, 1200));

    return {
      transcript: `${t.demoTranscriptPrefix} ${Math.max(1, Math.round(currentBlob.size / 1024))} KB`,
      translatedText: t.demoTranslatedText,
      outputMode: responseMode,
    };
  };

  const sendAudioToApi = async currentBlob => {
    if (isDemoMode) {
      return simulateTranslation(currentBlob);
    }

    const formData = new FormData();
    formData.append('audio', currentBlob, 'speech.webm');
    formData.append('fromLanguage', fromLanguage);
    formData.append('toLanguage', toLanguage);
    formData.append('responseMode', responseMode);

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      body: formData,
    });

    let payload = null;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      payload = await response.json();
    } else {
      const plainText = await response.text();
      payload = { translatedText: plainText };
    }

    if (!response.ok) {
      throw new Error(payload?.message || t.apiAudioError);
    }

    return payload;
  };

  const normalizeAudioUrl = payload => {
    if (payload?.audioUrl) {
      return payload.audioUrl;
    }

    if (payload?.audioBase64) {
      const mimeType = payload.audioMimeType || 'audio/mpeg';
      return `data:${mimeType};base64,${payload.audioBase64}`;
    }

    return '';
  };

  const handleSubmitRecording = async () => {
    if (!audioBlob || isRecording || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorKey('');
    setErrorText('');
    setStatusKey('sendingRecording');

    addMessages([
      createMessage('user', {
        title: t.userVoiceTitle,
        text: t.userVoiceText(recordingDuration || 1),
        audioUrl: audioPreviewUrl,
        meta: `${getLanguageLabel(fromLanguage)} -> ${getLanguageLabel(toLanguage)}`,
      }),
    ]);

    try {
      const payload = await sendAudioToApi(audioBlob);
      const translatedText = payload?.translatedText || payload?.translation || t.missingTranslatedText;
      const transcript = payload?.transcript || payload?.sourceText || '';
      const returnedAudioUrl = normalizeAudioUrl(payload);

      addMessages([
        createMessage('assistant', {
          title: responseMode === 'voice' ? t.assistantVoiceTitle : t.assistantTextTitle,
          text: translatedText,
          transcript,
          audioUrl: returnedAudioUrl,
          meta: isDemoMode ? t.demoModeMeta : t.apiResponseMeta,
        }),
      ]);

      if (responseMode === 'voice') {
        if (returnedAudioUrl) {
          const replyAudio = new Audio(returnedAudioUrl);
          replyAudio.play().catch(() => {});
        } else {
          speakText(translatedText);
        }
      }

      setStatusKey(isDemoMode ? 'demoResponseCreated' : 'translationComplete');
      setAudioBlob(null);
    } catch (error) {
      setErrorKey(error.message ? '' : 'translationRequestError');
      setErrorText(error.message || '');
      setStatusKey('processingError');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-card">
          <span className="brand-badge">AI Voice Translate</span>
          <h1>{t.brandTitle}</h1>
          <p>{t.brandDescription}</p>
        </div>

        <section className="control-card">
          <h2>{t.settingsTitle}</h2>

          <label className="field">
            <span>{t.sourceLanguageLabel}</span>
            <select value={fromLanguage} onChange={event => setFromLanguage(event.target.value)}>
              {SUPPORTED_LANGUAGES.map(language => (
                <option key={language.value} value={language.value}>
                  {language.label[interfaceLanguage]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t.targetLanguageLabel}</span>
            <select value={toLanguage} onChange={event => setToLanguage(event.target.value)}>
              {SUPPORTED_LANGUAGES.filter(language => language.value !== 'auto').map(language => (
                <option key={language.value} value={language.value}>
                  {language.label[interfaceLanguage]}
                </option>
              ))}
            </select>
          </label>

          <div className="field">
            <span>{t.responseFormatLabel}</span>
            <div className="segmented-control" role="tablist" aria-label={t.responseModeAria}>
              <button
                type="button"
                className={responseMode === 'text' ? 'is-active' : ''}
                onClick={() => setResponseMode('text')}
              >
                {t.responseText}
              </button>
              <button
                type="button"
                className={responseMode === 'voice' ? 'is-active' : ''}
                onClick={() => setResponseMode('voice')}
              >
                {t.responseVoice}
              </button>
            </div>
          </div>
        </section>

        <section className="control-card helper-card">
          <h2>{t.flowTitle}</h2>
          <p>
            {t.flowStep1}
            <br />
            {t.flowStep2}
            <br />
            {t.flowStep3}
            <br />
            {t.flowStep4}
          </p>
          <p className="helper-note">
            {isDemoMode ? t.helperDemoNote : t.helperApiNote(apiEndpoint)}
          </p>
        </section>

        <section className="interface-card">
          <span className="interface-label">{t.interfaceLanguageTitle}</span>
          <label className="compact-field">
            <span>{t.interfaceLanguageHint}</span>
            <select
              className="compact-select"
              value={interfaceLanguage}
              onChange={event => setInterfaceLanguage(event.target.value)}
            >
              <option value="en">{t.interfaceEnglish}</option>
              <option value="ru">{t.interfaceRussian}</option>
            </select>
          </label>
        </section>
      </aside>

      <main className="workspace">
        <section className="chat-panel">
          <header className="chat-header">
            <div>
              <p className="eyebrow">Live translate workspace</p>
              <h2>{t.conversationTitle}</h2>
            </div>
            <div className={`status-chip ${isRecording ? 'is-recording' : ''}`}>
              <span className="status-dot" />
              <span>{statusText}</span>
            </div>
          </header>

          <div className="message-list">
            {messages.map(message => (
              <article key={message.id} className={`message-bubble ${message.role}`}>
                <p className="message-title">{message.title}</p>
                <p className="message-text">{message.text}</p>
                {message.transcript ? (
                  <p className="message-transcript">{t.transcriptLabel}: {message.transcript}</p>
                ) : null}
                {message.audioUrl ? (
                  <audio className="message-audio" controls src={message.audioUrl}>
                    {t.audioFallback}
                  </audio>
                ) : null}
                {message.meta ? <span className="message-meta">{message.meta}</span> : null}
              </article>
            ))}
          </div>

          <footer className="composer">
            <div className="composer-summary">
              <div>
                <span className="summary-label">{t.summaryRecording}</span>
                <strong>
                  {isRecording
                    ? t.summaryRecordingNow
                    : audioBlob
                      ? t.summaryReadyToSend
                      : t.summaryNoRecording}
                </strong>
              </div>
              <div>
                <span className="summary-label">{t.summaryDuration}</span>
                <strong>
                  {recordingDuration} {t.secondsSuffix}
                </strong>
              </div>
            </div>

            {audioPreviewUrl ? (
              <div className="preview-card">
                <p>{t.previewTitle}</p>
                <audio controls src={audioPreviewUrl}>
                  {t.audioFallback}
                </audio>
              </div>
            ) : null}

            {displayedError ? <p className="error-banner">{displayedError}</p> : null}

            <div className="composer-actions">
              <button
                type="button"
                className={`record-button ${isRecording ? 'is-live' : ''}`}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isSubmitting}
              >
                {isRecording ? t.recordButtonStop : t.recordButtonStart}
              </button>

              <button
                type="button"
                className="send-button"
                onClick={handleSubmitRecording}
                disabled={!canSendRecording}
              >
                {isSubmitting ? t.sendButtonBusy : t.sendButtonIdle}
              </button>

              <button
                type="button"
                className="ghost-button"
                onClick={resetCurrentRecording}
                disabled={isRecording || isSubmitting || (!audioBlob && !audioPreviewUrl)}
              >
                {t.clearButton}
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
