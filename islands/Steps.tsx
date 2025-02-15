import { useSignal } from "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";

export default function Steps() {
  const steps = useSignal(0);
  const x = useSignal(0);
  const y = useSignal(0);
  const z = useSignal(0);
  const delta = useSignal(0);
  const isCounting = useSignal(false);
  const lastStepTime = useRef(0);
  const [showAcceleration, setShowAcceleration] = useState(false);

  const alpha = 0.8; // ローパスフィルタの係数
  const prevFilteredX = useRef(0);
  const prevFilteredY = useRef(0);
  const prevFilteredZ = useRef(0);

  const threshold = 1.0;
  const minStepInterval = 300;

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
      const ax = acceleration.x;
      const ay = acceleration.y;
      const az = acceleration.z;

      // ローパスフィルタ適用
      const filteredX = alpha * prevFilteredX.current + (1 - alpha) * ax;
      const filteredY = alpha * prevFilteredY.current + (1 - alpha) * ay;
      const filteredZ = alpha * prevFilteredZ.current + (1 - alpha) * az;

      // 変化量の計算
      const currentDelta = Math.sqrt(
        (filteredX - prevFilteredX.current) ** 2 +
          (filteredY - prevFilteredY.current) ** 2 +
          (filteredZ - prevFilteredZ.current) ** 2,
      );
      delta.value = currentDelta;

      // ステップ検出判定
      const currentTime = Date.now();
      if (currentDelta > threshold && currentTime - lastStepTime.current > minStepInterval && !isCounting.value) {
        steps.value = steps.value + 1;
        lastStepTime.current = currentTime;
        isCounting.value = true;
        setTimeout(() => {
          isCounting.value = false;
        }, minStepInterval);
      }

      prevFilteredX.current = filteredX;
      prevFilteredY.current = filteredY;
      prevFilteredZ.current = filteredZ;

      x.value = ax;
      y.value = ay;
      z.value = az - 9.8;
    }
  };

  return (
    <div>
      <h1>歩数: {steps.value}</h1>
      <button onClick={() => setShowAcceleration(!showAcceleration)}>
        {showAcceleration ? "歩数を表示" : "加速度を表示"}
      </button>
      {showAcceleration && (
        <>
          <p>X: {x.value.toFixed(2)}</p>
          <p>Y: {y.value.toFixed(2)}</p>
          <p>Z: {z.value.toFixed(2)}</p>
          <p>Delta: {delta.value.toFixed(2)}</p>
        </>
      )}
    </div>
  );
}