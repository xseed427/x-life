'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { HeartPulse, Camera, Video, VideoOff, ArrowLeft, Loader2, User, Fingerprint, Heart, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from './ui/progress';

interface VitalsMonitorProps {
  onBack: () => void;
}

type MeasurementState = 'idle' | 'countdown' | 'measuring' | 'analyzing' | 'result' | 'error';
type Method = 'finger' | 'face';

const MEASUREMENT_DURATION = 15000; // 15 seconds
const COUNTDOWN_SECONDS = 3;
const SIGNAL_BUFFER_SIZE_SECONDS = 5;
const FPS = 30; // Assuming 30fps for buffer size calculation
const SIGNAL_BUFFER_SIZE = SIGNAL_BUFFER_SIZE_SECONDS * FPS;
const MIN_PEAK_DISTANCE_MS = 300; // Corresponds to max 200 BPM
const BPM_MOVING_AVERAGE_SIZE = 5;

export default function VitalsMonitor({ onBack }: VitalsMonitorProps) {
  const [measurementState, setMeasurementState] = useState<MeasurementState>('idle');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [measurementMethod, setMeasurementMethod] = useState<Method | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [progress, setProgress] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [liveBpm, setLiveBpm] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const signalData = useRef<{t: number, v: number}[]>([]);
  const lastPeakTime = useRef(0);
  const bpmBuffer = useRef<number[]>([]);

  const { toast } = useToast();

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
  }, []);

  const getCameraPermission = useCallback(async (deviceId?: string) => {
    cleanupStream();

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      if (capabilities.torch) {
          setMeasurementMethod('finger');
      } else {
          setMeasurementMethod('face');
      }

      setHasCameraPermission(true);

      // Enumerate devices after getting permission
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
      
      const currentDeviceId = videoTrack.getSettings().deviceId;
      const matchingDeviceIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
      if(matchingDeviceIndex !== -1) {
        setCurrentDeviceIndex(matchingDeviceIndex);
      }


    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to measure vitals.',
      });
    }
  }, [toast, cleanupStream]);

  useEffect(() => {
    getCameraPermission();

    return () => {
      cleanupStream();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [getCameraPermission, cleanupStream]);

  const processFrame = useCallback(() => {
    if (measurementState !== 'measuring' || !videoRef.current || !canvasRef.current) {
        return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState < 2 || !ctx) {
        animationFrameId.current = requestAnimationFrame(processFrame);
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const roiSize = 50;
    const sx = Math.floor(canvas.width / 2 - roiSize / 2);
    const sy = Math.floor(canvas.height / 2 - roiSize / 2);
    const frameData = ctx.getImageData(sx, sy, roiSize, roiSize).data;

    let redSum = 0;
    for (let i = 0; i < frameData.length; i += 4) {
        redSum += frameData[i];
    }
    const redAvg = redSum / (frameData.length / 4);

    const now = performance.now();
    signalData.current.push({ t: now, v: redAvg });

    if (signalData.current.length > SIGNAL_BUFFER_SIZE) {
        signalData.current.shift();
    }
    
    if (signalData.current.length > FPS) {
        const smoothingWindow = 5;
        const smoothedSignal = [];
        for (let i = 0; i < signalData.current.length; i++) {
            const start = Math.max(0, i - Math.floor(smoothingWindow/2));
            const end = Math.min(signalData.current.length, i + Math.ceil(smoothingWindow/2));
            const windowSlice = signalData.current.slice(start, end);
            const avg = windowSlice.reduce((acc, p) => acc + p.v, 0) / windowSlice.length;
            smoothedSignal.push({t: signalData.current[i].t, v: avg});
        }
        
        const recentSignal = smoothedSignal.slice(-FPS * 2);
        if (recentSignal.length > 10) {
            const signalSlice = recentSignal.slice(-10); // Look for a peak in the last 10 frames
            const midPointIndex = Math.floor(signalSlice.length / 2);
            const midPoint = signalSlice[midPointIndex];
            
            const mean = signalSlice.reduce((sum, p) => sum + p.v, 0) / signalSlice.length;
            const stdDev = Math.sqrt(signalSlice.reduce((sum, p) => sum + Math.pow(p.v - mean, 2), 0) / signalSlice.length);
            
            const isPeak = midPoint.v > mean + stdDev;
            
            if (isPeak && (now - lastPeakTime.current > MIN_PEAK_DISTANCE_MS)) {
                if (lastPeakTime.current > 0) {
                    const bpm = 60000 / (now - lastPeakTime.current);
                    if (bpm > 40 && bpm < 200) {
                      bpmBuffer.current.push(bpm);
                      if (bpmBuffer.current.length > BPM_MOVING_AVERAGE_SIZE) bpmBuffer.current.shift();
                      
                      const avgBpm = bpmBuffer.current.reduce((a, b) => a + b, 0) / bpmBuffer.current.length;
                      setLiveBpm(Math.round(avgBpm));
                    }
                }
                lastPeakTime.current = now;
            }
        }
    }

    animationFrameId.current = requestAnimationFrame(processFrame);
}, [measurementState]);

  const handleSwitchCamera = () => {
    if (devices.length > 1) {
      const nextDeviceIndex = (currentDeviceIndex + 1) % devices.length;
      setCurrentDeviceIndex(nextDeviceIndex);
      getCameraPermission(devices[nextDeviceIndex].deviceId);
    }
  };

  const handleStartMeasurement = () => {
    if (!hasCameraPermission || !measurementMethod) return;

    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (!videoTrack) return;

    const start = () => {
        setLiveBpm(0);
        bpmBuffer.current = [];
        lastPeakTime.current = 0;
        signalData.current = [];
        setMeasurementState('countdown');
        setCountdown(COUNTDOWN_SECONDS);
        intervalRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    startMeasuring();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    
    if (measurementMethod === 'finger' && videoTrack.getCapabilities().torch) {
      videoTrack.applyConstraints({
        advanced: [{ torch: true } as any],
      }).then(() => {
        start();
      }).catch(err => {
        console.error('Failed to turn on flash:', err);
        setMeasurementMethod('face');
        toast({
            variant: 'destructive',
            title: 'Flash Error',
            description: 'Could not activate flash. Switching to face mode.',
        });
        setTimeout(start, 100);
      });
    } else {
        start();
    }
  };

  const startMeasuring = () => {
    setMeasurementState('measuring');
    setProgress(0);
    animationFrameId.current = requestAnimationFrame(processFrame);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const newProgress = (elapsedTime / MEASUREMENT_DURATION) * 100;
        setProgress(newProgress);
        if (elapsedTime >= MEASUREMENT_DURATION) {
            clearInterval(intervalRef.current!);
            finishMeasurement();
        }
    }, 100);
  }

  const finishMeasurement = () => {
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
    }
    setMeasurementState('analyzing');
    
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (measurementMethod === 'finger' && videoTrack?.getCapabilities().torch) {
        videoTrack.applyConstraints({ advanced: [{ torch: false } as any] });
    }
    
    setTimeout(() => {
        const finalBpm = bpmBuffer.current.reduce((a, b) => a + b, 0) / bpmBuffer.current.length;
        setHeartRate(Math.round(finalBpm > 40 && finalBpm < 200 ? finalBpm : 0));
        setMeasurementState('result');
    }, 2000);
  }

  const handleReset = () => {
    setMeasurementState('idle');
    setProgress(0);
    setHeartRate(0);
    setLiveBpm(0);
  }
  
  const renderInstructions = () => {
      if (measurementState !== 'idle' && measurementState !== 'result') return null;
      if (measurementMethod === 'finger') {
          return {
              icon: <Fingerprint className="h-10 w-10 mb-2" />,
              title: "Place your finger on the back camera.",
              description: "Cover the camera and flash completely."
          };
      }
      if (measurementMethod === 'face') {
          return {
              icon: <User className="h-10 w-10 mb-2" />,
              title: "Position your face in the frame.",
              description: "Ensure you are in a well-lit room and hold still."
          };
      }
      return null;
  }

  const renderContent = () => {
    if (hasCameraPermission === null) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Initializing camera...</p>
            </div>
        );
    }
    
    if (hasCameraPermission === false) {
        return (
            <Alert variant="destructive">
                <VideoOff className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    This feature needs camera access to measure your heart rate. 
                    Please enable camera permissions in your browser settings and refresh the page.
                </AlertDescription>
            </Alert>
        );
    }

    if (measurementState === 'result') {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <p className="text-muted-foreground">Your Estimated Heart Rate</p>
                {heartRate > 0 ? (
                    <>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-bold text-primary">{heartRate}</span>
                            <span className="text-xl font-medium text-muted-foreground">BPM</span>
                        </div>
                        <Heart className="h-12 w-12 text-red-500 animate-pulse" style={{animationDuration: `${60/heartRate}s`}} />
                    </>
                ) : (
                    <p className="text-lg text-destructive">Could not get a reliable reading. Please try again.</p>
                )}
                <Button onClick={handleReset} className="mt-4">Measure Again</Button>
            </div>
        );
    }

    const instructions = renderInstructions();

    return (
      <>
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted border">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/40">
                {measurementState === 'countdown' && (
                    <div className="text-6xl font-bold text-white">{countdown}</div>
                )}
                {measurementState === 'measuring' && (
                     <div className="w-full max-w-xs text-center text-white">
                        {liveBpm > 0 && <span className="text-4xl font-bold">{liveBpm} <span className="text-lg">BPM</span></span>}
                        <p>{liveBpm === 0 ? "Detecting signal..." : 'Measuring... Hold still.'}</p>
                        <Progress value={progress} className="mt-2" />
                    </div>
                )}
                {measurementState === 'analyzing' && (
                    <div className="w-full max-w-xs text-center text-white">
                       <Loader2 className="h-12 w-12 animate-spin mb-4 mx-auto" />
                        <p>Analyzing...</p>
                    </div>
                )}
                {instructions && (
                    <div className="text-center text-white flex flex-col items-center">
                        {instructions.icon}
                        <p className="font-semibold">{instructions.title}</p>
                        <p className="text-sm opacity-80">{instructions.description}</p>
                    </div>
                )}
            </div>
        </div>
        <div className="flex items-center gap-4">
            <Button onClick={handleStartMeasurement} size="lg" className="flex-1" disabled={measurementState !== 'idle'}>
                <HeartPulse className="mr-2 h-5 w-5" /> 
                Start Measurement
            </Button>
            {devices.length > 1 && measurementState === 'idle' && (
                <Button onClick={handleSwitchCamera} variant="outline" size="icon" aria-label="Switch camera">
                    <RefreshCw className="h-5 w-5" />
                </Button>
            )}
        </div>
      </>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
        </Button>
        <div>
            <h1 className="text-2xl font-bold font-headline">Measure Heart Rate</h1>
            <p className="text-muted-foreground">Use your device's camera to check your pulse.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6 space-y-4">
          {renderContent()}
        </CardContent>
      </Card>
      
      <Alert>
        <Camera className="h-4 w-4" />
        <AlertTitle>For Informational Use Only</AlertTitle>
        <AlertDescription>
            This feature is not a medical device. Consult a healthcare professional for accurate medical data. Results may vary.
        </AlertDescription>
      </Alert>
    </div>
  );
}
