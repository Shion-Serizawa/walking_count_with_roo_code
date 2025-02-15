import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

export default function Steps() {
  const steps = useSignal(0);
  const x = useSignal(0);
  const y = useSignal(0);
  const z = useSignal(0);

  const alpha = 0.8; // ローパスフィルタの係数
  const prevX = useRef(0);
  const prevY = useRef(0);
  const prevZ = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("devicemotion", handleDeviceMotion);
      return () => {
        window.removeEventListener("devicemotion", handleDeviceMotion);
      };
    }
  }, []);

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;
    if (acceleration && acceleration.x !== null && acceleration.y !== null && acceleration.z !== null) {
      // ローパスフィルタを適用
      const filteredX = alpha * prevX.current + (1 - alpha) * acceleration.x;
      const filteredY = alpha * prevY.current + (1 - alpha) * acceleration.y;
      const filteredZ = alpha * prevZ.current + (1 - alpha) * acceleration.z;

      x.value = filteredX;
      y.value = filteredY;
      z.value = filteredZ;

      prevX.current = filteredX;
      prevY.current = filteredY;
      prevZ.current = filteredZ;

      const threshold = 0.5;
      const changeX = Math.abs(filteredX - prevX.current);
      const changeY = Math.abs(filteredY - prevY.current);
      const changeZ = Math.abs(filteredZ - prevZ.current);

      if (changeX > threshold || changeY > threshold || changeZ > threshold) {
        steps.value = steps.value + 1;
      }
    }
  };

  return (
    <div>
      <h1>歩数: {steps.value}</h1>
      <p>X: {x.value}</p>
      <p>Y: {y.value}</p>
      <p>Z: {z.value}</p>
    </div>
  );
}