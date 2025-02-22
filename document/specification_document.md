# スマートウォッチ歩数再現サイト 仕様書

## 1. プロジェクト概要

本プロジェクトは、スマートウォッチやスマホのセンサー（加速度センサー、ジャイロスコープ）を利用して歩数を計測する仕組みをウェブ上で再現するサイトです。  
また、ユーザー自身がセンサーの特性に合わせたパラメータ調整や、リアルタイムのセンサーデータの可視化を体験できるほか、高校レベルの数学・物理に基づいた仕組みの解説ページも用意し、仕組み理解と実験を促します。

## 2. 採用技術・プラットフォーム

- **サーバーサイド / ホスティング：**  
  - **Deno Deploy**  
    - Denoによる実行環境を活用し、最新のJavaScript/TypeScriptエコシステムを利用
- **フロントエンドフレームワーク：**  
  - **Fresh (Deno用フレームワーク)**
    - サーバーサイドレンダリング（SSR）とIslands Architectureにより、動的かつ高速なユーザー体験を提供
- **ブラウザAPI：**
  - **DeviceMotionEvent**  
    - 加速度センサーのデータ取得
  - **SpeechSynthesis API**  
    - 音声フィードバック（歩数通知）
  - **Vibration API**  
    - 振動フィードバック
- **グラフ描画・可視化：**
  - **SVG**  
    - 軽量なリアルタイムデータ可視化のために使用（最低限の点プロット）
  - **CSSアニメーション**  
    - 加速度データのバー表示で直感的な表現

## 3. ページ構成

本サイトは、ユーザーが歩数計の動作や仕組み、センサーのデータを体験・理解できるように、以下の主要ページを提供します。

### 3.1. 歩数計測ページ

- **概要：**  
  スマホの加速度センサーを用いて歩数を計測し、リアルタイムで歩数を表示するページ。

- **主な機能：**
  - **歩数カウントアルゴリズム（改善版）：**
    - サンプリング間隔：200ms
    - ローパスフィルタ適用後の加速度変化量を計算
    - 変化量の計算：  
      $$
      \text{delta} = \sqrt{(\text{filteredX} - \text{prevFilteredX})^2 + (\text{filteredY} - \text{prevFilteredY})^2 + (\text{filteredZ} - \text{prevFilteredZ})^2}
      $$
    - 閾値（threshold）を超え、かつ**一定時間（300ms）以内の連続カウントを防止**するデバウンス処理を追加
    - ユーザー毎のセンサー特性に対応するため、**歩数補正係数**を適用可能

  - **フィードバック機能：**
    - **音声フィードバック：**  
      SpeechSynthesis API を利用して、一定歩数（例：5歩または10歩ごと）で音声通知
    - **振動フィードバック：**  
      Vibration API を利用して、通知タイミングで端末を振動させる

  - **ユーザー設定 UI：**  
    初心者でも直感的に調整できるよう、以下の設定項目を用意
    - **感度調整：**  
      スライダーで「低め」「普通」「高め」と表示（実際は閾値：例 2.0～5.0 の範囲）
    - **通知間隔：**  
      プルダウンで「5歩ごと」「10歩ごと」「20歩ごと」
    - **歩数補正：**  
      スライダーで「少なめ」「普通」「多め」（補正係数：例 0.5～1.5の範囲）

### 3.2. センサーデータ可視化ページ

- **概要：**  
  ユーザーがスマホの加速度センサーの生データを直感的に把握できるよう、グラフやバー表示で可視化するページ。

- **主な機能：**
  - **バー表示：**  
    各軸（X, Y, Z）の加速度をバー（棒）の長さで表示。  
    - 例：X軸は青、Y軸は緑、Z軸は赤  
    - CSSのtransitionを利用し、動きが滑らかに見えるように実装

  - **データ履歴の簡易グラフ：**  
    SVGを利用して、最新20個の加速度データを点プロット形式で表示  
    - 例：Z軸のデータを横に並べ、動きを視覚的に確認可能

### 3.3. 解説ページ

- **概要：**  
  高校レベルの数学・物理の知識を活用して、本サイトで採用している歩数カウントの仕組みや、加速度センサーの動作原理を解説するページ。

- **主な項目：**
  1. **はじめに**
  2. **加速度センサーの基礎**
  3. **歩数検出アルゴリズム**
  4. **腕時計・スマホでの歩数計測の仕組み**
  5. **センサーの誤作動と対策**
  6. **実験のすすめ**

## 4. まとめ

本仕様書では、Deno DeployおよびFreshを基盤とした**スマートウォッチ歩数再現サイト**の機能、技術、UI/UX設計、各ページの役割、そして将来的な拡張性について詳細に記述しました。  
ユーザーは直感的なパラメータ調整とリアルタイムのフィードバック（音声、振動、視覚効果）により、自身のデバイスのセンサー特性に合わせた最適な歩数計測を体験でき、また、高校レベルの数学・物理の知識を応用した解説ページで仕組みを理解することができます。

この仕様に基づいて実装を進めることで、技術的にもユーザー体験の面でも充実したプロジェクトとなることを期待します。
