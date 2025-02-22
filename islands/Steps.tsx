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
  const [sensitivity, setSensitivity] = useState(2.0); // 感度調整
  const [notificationInterval, setNotificationInterval] = useState(10); // 通知間隔
  const [stepCorrection, setStepCorrection] = useState(1.0); // 歩数補正

  // 最新の状態を反映させるための ref を用意
  const sensitivityRef = useRef(sensitivity);
  const notificationIntervalRef = useRef(notificationInterval);
  const stepCorrectionRef = useRef(stepCorrection);

  useEffect(() => {
    sensitivityRef.current = sensitivity;
  }, [sensitivity]);

  useEffect(() => {
    notificationIntervalRef.current = notificationInterval;
  }, [notificationInterval]);

  useEffect(() => {
    stepCorrectionRef.current = stepCorrection;
  }, [stepCorrection]);

  // ユーザーのタップで音声フィードバックを有効にする
  useEffect(() => {
    const activateAudio = () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        speechSynthesis.resume();
        document.removeEventListener("click", activateAudio);
      }
    };
    document.addEventListener("click", activateAudio);
    return () => document.removeEventListener("click", activateAudio);
  }, []);

  const alpha = 0.8; // ローパスフィルタの係数
  const prevFilteredX = useRef(0);
  const prevFilteredY = useRef(0);
  const prevFilteredZ = useRef(0);

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
      if (currentDelta > sensitivityRef.current && currentTime - lastStepTime.current > minStepInterval && !isCounting.value) {
        const correctedSteps = steps.value + stepCorrectionRef.current;
        steps.value = correctedSteps;
        lastStepTime.current = currentTime;
        isCounting.value = true;
        setTimeout(() => {
          isCounting.value = false;
        }, minStepInterval);

        // 通知間隔ごとにフィードバックを実行
        if (Math.floor(correctedSteps) > 0 && Math.floor(correctedSteps) % notificationIntervalRef.current === 0) {
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(
              `${notificationIntervalRef.current} 歩達成`,
            );
            speechSynthesis.speak(utterance);
          }
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            // 振動フィードバック（※HTTPS環境で動作する点に注意）
            navigator.vibrate([200]);
          }
        }
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
      <div>
        <h2>感度調整</h2>
        <input
          type="range"
          min="0"
          max="5.0"
          step="0.5"
          value={sensitivity}
          onChange={(e) => {
            if (e.target instanceof HTMLInputElement) {
              setSensitivity(parseFloat(e.target.value));
            }
          }}
        />
        <p>感度: {sensitivity.toFixed(1)}</p>
      </div>
      <div>
        <h2>通知間隔</h2>
        <select
          value={notificationInterval}
          onChange={(e) => {
            if (e.target instanceof HTMLSelectElement) {
              setNotificationInterval(parseInt(e.target.value));
            }
          }}
        >
          <option value="5">5歩ごと</option>
          <option value="10">10歩ごと</option>
          <option value="20">20歩ごと</option>
        </select>
        <p>通知間隔: {notificationInterval}歩ごと</p>
      </div>
      <div>
        <h2>歩数補正</h2>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={stepCorrection}
          onChange={(e) => {
            if (e.target instanceof HTMLInputElement) {
              setStepCorrection(parseFloat(e.target.value));
            }
          }}
        />
        <p>歩数補正: {stepCorrection.toFixed(1)}</p>
      </div>
    </div>
  );
}
