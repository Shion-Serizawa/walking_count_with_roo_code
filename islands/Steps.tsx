import { useSignal } from "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";

// 定数定義
const LOW_PASS_FILTER_ALPHA = 0.8; // ローパスフィルタの係数
const SENSITIVITY_MIN = 2.0; // 感度調整の最小値
const SENSITIVITY_MAX = 5.0; // 感度調整の最大値
const SENSITIVITY_STEP = 0.1; // 感度調整のステップ
const DEFAULT_NOTIFICATION_INTERVAL = 10; // 通知間隔のデフォルト値
const MIN_STEP_INTERVAL = 300; // ステップ検出の最小間隔 (ms)
const GRAVITY = 9.8; // 重力加速度
const INITIAL_SENSITIVITY = 2.0; // 初期感度
const INITIAL_STEP_CORRECTION = 1.0; // 初期歩数補正

export default function Steps() {
  // 状態の定義
  const steps = useSignal(0); // 歩数
  const x = useSignal(0); // X軸加速度
  const y = useSignal(0); // Y軸加速度
  const z = useSignal(0); // Z軸加速度
  const delta = useSignal(0); // 変化量
  const isCounting = useSignal(false); // カウント中フラグ
  const lastStepTime = useRef(0); // 最後のステップ検出時間
  const [showAcceleration, setShowAcceleration] = useState(false); // 加速度表示フラグ
  const [sensitivity, setSensitivity] = useState(INITIAL_SENSITIVITY); // 感度調整
  const [notificationInterval, setNotificationInterval] = useState(DEFAULT_NOTIFICATION_INTERVAL); // 通知間隔
  const [stepCorrection, setStepCorrection] = useState(INITIAL_STEP_CORRECTION); // 歩数補正

  // ローパスフィルタ用の変数を useRef で保持
  const prevFilteredX = useRef(0);
  const prevFilteredY = useRef(0);
  const prevFilteredZ = useRef(0);

  // デバイスモーションイベントハンドラ
  useEffect(() => {
    // window が存在することを確認
    if (typeof window !== "undefined" && "ondevicemotion" in window) {
      window.addEventListener("devicemotion", handleDeviceMotion);
      return () => {
        window.removeEventListener("devicemotion", handleDeviceMotion);
      };
    } else {
      console.warn("デバイスモーションイベントはサポートされていません。");
    }
  }, []);

  // 加速度データのフィルタリング
  const filterAcceleration = (
    acceleration: { x: number; y: number; z: number },
  ) => {
    const filteredX =
      LOW_PASS_FILTER_ALPHA * prevFilteredX.current +
      (1 - LOW_PASS_FILTER_ALPHA) * acceleration.x;
    const filteredY =
      LOW_PASS_FILTER_ALPHA * prevFilteredY.current +
      (1 - LOW_PASS_FILTER_ALPHA) * acceleration.y;
    const filteredZ =
      LOW_PASS_FILTER_ALPHA * prevFilteredZ.current +
      (1 - LOW_PASS_FILTER_ALPHA) * acceleration.z;

    prevFilteredX.current = filteredX;
    prevFilteredY.current = filteredY;
    prevFilteredZ.current = filteredZ;

    return { filteredX, filteredY, filteredZ };
  };

  // 変化量の計算
  const calculateDelta = (
    filteredX: number,
    filteredY: number,
    filteredZ: number,
  ) => {
    return Math.sqrt(
      (filteredX - prevFilteredX.current) ** 2 +
        (filteredY - prevFilteredY.current) ** 2 +
        (filteredZ - prevFilteredZ.current) ** 2,
    );
  };

  // ステップ検出処理
  const detectStep = (currentDelta: number) => {
    const currentTime = Date.now();
    if (
      currentDelta > sensitivity &&
      currentTime - lastStepTime.current > MIN_STEP_INTERVAL &&
      !isCounting.value
    ) {
      steps.value = steps.value + stepCorrection; // 歩数補正を適用
      lastStepTime.current = currentTime;
      isCounting.value = true;
      setTimeout(() => {
        isCounting.value = false;
      }, MIN_STEP_INTERVAL);
    }
  };

  // デバイスモーションイベントハンドラ
  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;

    // 加速度データが存在することを確認
    if (acceleration && acceleration.x !== null && acceleration.y !== null && acceleration.z !== null) {
      // 加速度の値をローカル変数に格納
      const { x: ax, y: ay, z: az } = acceleration;

      // 加速度データのフィルタリング
      const { filteredX, filteredY, filteredZ } = filterAcceleration({
        x: ax,
        y: ay,
        z: az,
      });

      // 変化量の計算
      const currentDelta = calculateDelta(filteredX, filteredY, filteredZ);

      // 変化量を delta に設定
      delta.value = currentDelta;

      // ステップ検出処理
      detectStep(currentDelta);

      // 状態の更新
      x.value = ax;
      y.value = ay;
      z.value = az - GRAVITY;
    }
  };

  return (
    <div>
      <h1>歩数: {steps.value.toFixed(0)}</h1>
      <button onClick={() => setShowAcceleration(!showAcceleration)}>
        {showAcceleration ? "加速度を非表示" : "加速度を表示"}
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
          min={SENSITIVITY_MIN}
          max={SENSITIVITY_MAX}
          step={SENSITIVITY_STEP}
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