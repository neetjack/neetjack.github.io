---
title: Windowing/窓掛け[EN/JP]
published: 2026-06-08
description: Window function 
image: ./cover.jpg
tags: [MIR,DSP]
category: DSP
draft: false
---

# 窓掛け

## 0.[Colab Codes](https://colab.research.google.com/drive/1jkihJj20s5pTQXZI450owh5qw57-bLng?usp=sharing)

## 1.窓掛けとは

- 窓掛けとは、処理や分析のために、大規模なデータセットからその一部を切り出すプロセスです
- 窓掛けは、窓関数またはテーパ関数を使用して行われます

## 2.窓掛けが必要な理由

信号測定には2つの種類があります

1.周期信号の測定

- レア
- キャプチャされた信号は対称であり、それらを接合することで連続した無限の波形を作成することが可能です
- 周期信号のFFTは**正確**である

2.非周期的信号の測定

- 通常、キャプチャされた信号は、このカテゴリーに分類されます
- 捕捉された信号は対称ではない
- 信号を接合していても、元の連続した無限の波形は再現されない
- 非周期信号のFFTは**不正確**である

スペクトル リーク

- `時間領域`に非周期的な信号が接合される場合、**不連続性**が引き起こされます
- 時間領域では短い事象であるこれらの不連続性は、`周波数領域`では大きな事象となります
- 元のスペクトル線に起因する周波数領域における広範囲な広がりが、スペクトルリークである
- スペクトルリークは、非周期的な測定に伴う結果である
- 窓関数（ウィンドウ関数）は、スペクトル漏れの抑制に用いられます

## 3.窓関数

### 3.1.定義

- 窓関数とは、特定の区間以外では値がゼロとなり、その区間の中心を対称軸として左右対称であり、中心で最大値を取り、中心から離れるにつれて値が小さくなっていく数学的関数である
- 窓関数を使用するの目的は、非周期的に測定された信号を連結する際に現れる鋭い不連続性を緩和することです。
- 特定の信号処理要件に合わせて、さまざまな種類の窓関数があります

```
boxcar: 矩形窓
triang: 三角窓
blackman: ブラックマン窓
hamming: ハミング窓
hann: ハン窓
bartlett: バートレット窓
flattop: フラットトップ窓
parzen: パーゼン窓
bohman: ボーマン窓
blackmanharris: ブラックマン・ハリス窓
nuttall: ナットール窓
barthann: バートレット・ハン窓
kaiser: カイザー窓
gaussian: ガウス窓
general_gaussian: 一般化ガウス窓
dpss: ディスクリート・プロレト・スペクトル・シーケンス窓
chebwin: チェビシェフ窓
```

### 3.2.プロセス

非周期的信号
-> 信号に選択した窓関数を掛けた
-> 窓掛けた信号を連結して連続波形を作成する
-> 窓掛け処理により、鋭いエッジが緩和される

- 窓掛けなし
```mermaid
graph LR;
    A[非周期的信号] --> |FFT| B[スペクトルリークを伴うスペクトル];
```
- 窓掛けあり
```mermaid
graph LR;
    A[非周期的信号] --> |掛け算| B[窓関数] --> |FFT| C[スペクトルリークが少ないスペクトル];
```
:::note
信号と窓関数を畳み込むと、窓の前後にある信号の値がゼロに設定され、それによって信号を延長する際、ジャンプによる不連続性が抑制される
:::

### 3.3.窓の補正

- 窓掛けた信号は、実際の波形と**完全に一致するわけではありません**
- 元の信号の**振幅**と**エネルギー**の両方にトレードオフが伴います
- 窓タイプごとに補正を行うことは可能ですが、振幅補正とエネルギー補正を同時に適用することは**できません**
:::CAUTION
周期的信号を窓掛けると、周波数領域でスペクトルリークが引き起こされます
:::

## 4.窓関数の種類

### 4.1.理想的な窓関数

- 理想的な窓関数であれば、主ローブの幅が狭く、サイドローブの減衰が大きい
- 周波数領域におけるピュアトーンでは、理想的な窓関数を使用すると、同じ振幅を持つ単一のスペクトル線が得られる
- スペクトルリークなし
- サイドローブなし

### 4.2.Uniform/Rectangular/Boxcar Window

[JOS_Rectangular Window](https://ccrma.stanford.edu/~jos/sasp/Spectrum_Windowed_Sinusoid.html#15711)

[JOS_Rectangular Window Side-Lobes](https://ccrma.stanford.edu/~jos/sasp/Rectangular_Window_Side_Lobes.html#10162)

定義:
- すべての時間サンプルに対する振幅を1にします（時間データのどの部分も減衰させない）
- 窓を掛けないのと同様です

### 4.3.Hamming Window Family

[JOS_ Hamming Window Family](https://ccrma.stanford.edu/~jos/sasp/Generalized_Hamming_Window_Family.html#eq:ghwf)

- 基本的に、ハミング窓の族は、矩形窓にコサイン波の周期を掛けることで構成されます

|メリット|デメリット|
|:---:|:---:|
|低いサイドローブ|メインローブの幅が倍になる|

#### 4.3.1.Hann/Hanning Window

[JOS_Hann Window](https://ccrma.stanford.edu/~jos/sasp/Hann_Hanning_Raised_Cosine.html#10248)

定義:
- この名前はJulius von Hannに由来します
- 窓の両端で入力信号を減衰させる
- 端点は**ゼロ**に到達する

|メリット|デメリット|
|:---:|:---:|
|すべての不連続性を排除する|振幅の精度を犠牲にして|
|優れた周波数解像度|形状に由来する微小な振幅誤差が起こる|


#### 4.3.2.Hamming Window

[JOS_Hamming Window](https://ccrma.stanford.edu/~jos/sasp/Hamming_Window.html#10264)

定義:
- この名前はRichard W Hamming由来します
- 端点はゼロには**到達しない**

|メリット|デメリット|
|:---:|:---:|
|ハンウィンドウの第1サイドローブは消される|スペクトルリークはハン窓よりも大きい|
||畳み込み信号にわずかな不連続が見られる|


#### 4.3.3.Blackman-Harris Window

[JOS_Blackman-Harris Window](https://ccrma.stanford.edu/~jos/sasp/Three_Term_Blackman_Harris_Window.html#10289)

定義:
- ハン・窓およびハミング・窓に比べて主ローブが広い
- ハン窓やハミング窓に比べてサイドローブの減衰が優れている

#### 4.3.4.Hamming Window Familyのまとめ

|窓関数|第1サイドローブ|サイドローブの減衰率|
|:-------------:|:-----------:|:------------------------:|
|Rectangular window|-13dB|−6dB/oct|
|Hanning window|-31dB|−18dB/oct|
|Humming window|-42dB|−6dB/oct|
|Blackman-Harris window|-71dB|−6dB/oct|

