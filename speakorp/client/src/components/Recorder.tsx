import { useEffect, useRef, useState } from 'react';
import { Button } from '@databricks/appkit-ui/react';
import { Mic, Square } from 'lucide-react';
import type { SegmentFeatures } from '@shared/types';
import { computeFeatures } from '@/lib/features';
import { cn } from '@/lib/utils';

export interface RecorderResult {
  transcript: string;
  features: SegmentFeatures;
  hasVideo: boolean;
  mediaUrl: string;
}

export interface RecorderProps {
  requireVideo?: boolean;
  onComplete: (result: RecorderResult) => void;
}

/**
 * In-browser Recorder component with optional video, live speech recognition,
 * editable transcript, and graceful permission fallback.
 *
 * Features:
 * - Records audio and optional video via MediaRecorder
 * - Integrates with Web Speech Recognition API (if available)
 * - Falls back to editable textarea for manual transcript entry
 * - Shows elapsed recording time
 * - Handles permission errors gracefully
 * - Cleans up streams and object URLs on unmount
 */
export function Recorder({ requireVideo = false, onComplete }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const mediaUrlRef = useRef<string>('');

  // Initialize speech recognition if available
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => (prev ? prev + ' ' + transcript : transcript));
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognition.onerror = (event: any) => {
        // Log but don't fail; user can type manually
        console.warn('Speech Recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    setPermissionDenied(false);
    setTranscript('');
    setElapsedSec(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: requireVideo ? { width: 640, height: 480 } : false,
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Start speech recognition if available
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Update elapsed time
      timerRef.current = setInterval(() => {
        setElapsedSec((Date.now() - startTimeRef.current) / 1000);
      }, 100);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (error.name === 'NotAllowedError' || error.message.includes('denied')) {
        setPermissionDenied(true);
        setError('Microphone access denied. You can still type a transcript manually.');
      } else if (error.name === 'NotFoundError') {
        setError('No microphone found. Please check your device.');
      } else {
        setError(`Error accessing media: ${error.message}`);
      }
      console.error('Media access error:', error);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        mediaUrlRef.current = url;
      };
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  };

  const handleComplete = () => {
    const durationSec = (Date.now() - startTimeRef.current) / 1000;

    // If permission was denied, use manual duration (default 30s)
    const finalDuration = permissionDenied ? 30 : durationSec;

    const result: RecorderResult = {
      transcript: transcript.trim(),
      features: computeFeatures(transcript.trim(), finalDuration),
      hasVideo: requireVideo,
      mediaUrl: mediaUrlRef.current,
    };

    onComplete(result);

    // Clean up
    if (mediaUrlRef.current) {
      URL.revokeObjectURL(mediaUrlRef.current);
      mediaUrlRef.current = '';
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaUrlRef.current) {
        URL.revokeObjectURL(mediaUrlRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Recording Controls */}
      <div className="flex gap-2 items-center">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="flex items-center gap-2"
            disabled={permissionDenied && !transcript}
          >
            <Mic className="h-4 w-4" />
            Start Recording
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
            <Square className="h-4 w-4" />
            Stop Recording
          </Button>
        )}

        {isRecording && (
          <div className="text-sm font-mono text-muted-foreground">
            {formatTime(elapsedSec)}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Permission Denied Fallback */}
      {permissionDenied && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
          Microphone access is blocked. Type your transcript below to continue.
        </div>
      )}

      {/* Transcript Textarea */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Transcript {isRecording && <span className="text-muted-foreground">(Recording...)</span>}
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your speech will appear here, or type manually to correct/fill in."
          className={cn(
            'w-full h-32 p-3 border rounded-md text-sm',
            'bg-background text-foreground placeholder:text-muted-foreground',
            'border-input focus:outline-none focus:ring-2 focus:ring-primary',
            isRecording && 'opacity-75'
          )}
          disabled={isRecording && !permissionDenied}
        />
      </div>

      {/* Complete Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleComplete}
          disabled={!transcript.trim()}
          className="flex-1"
        >
          Get Feedback
        </Button>
      </div>
    </div>
  );
}
