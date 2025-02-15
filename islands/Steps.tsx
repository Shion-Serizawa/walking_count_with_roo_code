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
      x.value = acceleration.x;
      y.value = acceleration.y;
      z.value = acceleration.z;
      const change = Math.sqrt(
        acceleration.x ** 2 + acceleration.y ** 2 + (acceleration.z - 9.8) ** 2,
      );
      const threshold = 3; // 感度調整
      if (change > threshold) {
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