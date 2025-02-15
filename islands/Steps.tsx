import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export default function Steps() {
  const steps = useSignal(0);
  const x = useSignal(0);
  const y = useSignal(0);
  const z = useSignal(0);

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
      const threshold = 1; // 感度調整
      const changeX = Math.abs(acceleration.x);
      const changeY = Math.abs(acceleration.y - 0.3);
      const changeZ = Math.abs(acceleration.z - 9.8);

      x.value = acceleration.x;
      y.value = acceleration.y;
      z.value = acceleration.z;

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