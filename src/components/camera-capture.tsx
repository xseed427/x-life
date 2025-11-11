'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, ArrowLeft, Loader2, Video, VideoOff, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface CameraCaptureProps {
  onPhotoTaken: (imageSrc: string) => void;
  onBack: () => void;
}

export default function CameraCapture({ onPhotoTaken, onBack }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permissionState, setPermissionState] = useState<'idle' | 'pending' | 'granted' | 'denied'>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const getDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      if (videoDevices.length > 0) {
        setDevices(videoDevices);
      }
    } catch (error) {
      console.error("Error enumerating devices:", error);
    }
  }, []);

  const getCameraPermission = useCallback(async (deviceId?: string) => {
    stopStream();
    setPermissionState('pending');
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          //facingMode: deviceId ? undefined : { ideal: 'environment' } // Prefer back camera first
        }
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setStream(newStream);
      setPermissionState('granted');
      await getDevices(); // Get devices after permission is granted
    } catch (error) {
      console.error('Error accessing camera:', error);
      setPermissionState('denied');
    }
  }, [stopStream, getDevices]);

  useEffect(() => {
    // Cleanup stream when component unmounts
    return () => {
      stopStream();
    };
  }, [stopStream]);

  const handleSwitchCamera = () => {
    if (devices.length > 1) {
      const nextDeviceIndex = (currentDeviceIndex + 1) % devices.length;
      setCurrentDeviceIndex(nextDeviceIndex);
      const nextDeviceId = devices[nextDeviceIndex].deviceId;
      getCameraPermission(nextDeviceId);
    }
  };

  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current && permissionState === 'granted') {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onPhotoTaken(dataUrl);
      }
    }
  };

  const renderContent = () => {
    switch (permissionState) {
      case 'idle':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-md p-4 text-center">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Ready to start</h3>
            <p className="text-muted-foreground text-sm mb-4">Click the button below to start your camera.</p>
            <Button onClick={() => getCameraPermission()}>
              <Camera className="mr-2 h-4 w-4" /> Start Camera
            </Button>
          </div>
        );
      case 'pending':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Requesting camera permission...</p>
          </div>
        );
      case 'denied':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-md p-4 text-center">
            <Alert variant="destructive" className="max-w-md">
              <VideoOff className="h-4 w-4" />
              <AlertTitle>Camera Access Denied</AlertTitle>
              <AlertDescription>
                To use this feature, you must enable camera permissions for this site in your browser settings.
              </AlertDescription>
            </Alert>
            <Button onClick={() => getCameraPermission()} className="mt-4">Try Again</Button>
          </div>
        );
      case 'granted':
        return null; // Video will be visible
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full h-full">
      <div className="relative w-full aspect-video">
        <video 
          ref={videoRef} 
          className="w-full aspect-video rounded-md bg-muted" 
          autoPlay 
          muted 
          playsInline 
          style={{ display: permissionState === 'granted' ? 'block' : 'none' }}
        />
        {permissionState !== 'granted' && <div className="w-full aspect-video rounded-md bg-muted" />}
        {renderContent()}
      </div>

      <div className="flex w-full justify-between items-center">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleTakePhoto} disabled={permissionState !== 'granted'}>
          <Camera className="mr-2 h-4 w-4" /> Take Photo
        </Button>
        {devices.length > 1 && permissionState === 'granted' ? (
          <Button variant="ghost" onClick={handleSwitchCamera}>
            <RefreshCw className="mr-2 h-4 w-4" /> Switch Camera
          </Button>
        ) : (
          <div style={{ width: '136px' }} /> // Placeholder to keep layout consistent
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
