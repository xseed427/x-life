'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, ArrowLeft, Loader2, VideoOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface CameraCaptureProps {
  onPhotoTaken: (imageSrc: string) => void;
  onBack: () => void;
}

export default function CameraCapture({ onPhotoTaken, onBack }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permissionState, setPermissionState] = useState<'pending' | 'granted' | 'denied'>('pending');

  const getCameraPermission = useCallback(async () => {
    // Stop any existing streams to ensure a clean request
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setPermissionState('pending');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionState('granted');
    } catch (error) {
      console.error('Error accessing camera:', error);
      setPermissionState('denied');
    }
  }, []);

  useEffect(() => {
    getCameraPermission();

    return () => {
      // Cleanup stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [getCameraPermission]);

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

  const renderOverlay = () => {
    if (permissionState === 'pending') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-md">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Requesting camera permission...</p>
        </div>
      );
    }
    
    if (permissionState === 'denied') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-md p-4 text-center">
          <Alert variant="destructive" className="max-w-md">
            <VideoOff className="h-4 w-4" />
            <AlertTitle>Camera Access Denied</AlertTitle>
            <AlertDescription>
              To use this feature, you must enable camera permissions for this site in your browser settings. After enabling, you may need to close and re-open this camera window.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full h-full">
      <div className="relative w-full aspect-video">
        <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
        {renderOverlay()}
      </div>

      <div className="flex w-full justify-between items-center">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleTakePhoto} disabled={permissionState !== 'granted'}>
          <Camera className="mr-2 h-4 w-4" /> Take Photo
        </Button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
