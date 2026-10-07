---
title: ACE-Transformer研究笔记
published: 2026-07-01
description: AutoChordEstimation with Transformer
tags: [MIR,DSP,Transformer,Note]
category: DSP,AI,Note
draft: true

---


# ACE-Transformer研究笔记

## ACE任务

自动和声推测 (Auto Chord Estimation, ACE) 也常被称为自动和弦识别 (Automatic Chord Recognition, ACR)，是音乐信息检索 (Music Information Retrieval, MIR) 领域中的一个声学判别与序列分类任务

简单来说，给定一段音频信号（通常是包含多种乐器和人声的复音音乐），ACE 任务的目的是自动分析并标注出音频中每一时刻（或每一个时间帧）正在演奏的音乐和弦及其起止时间（例如：C Major, G7, A minor）


## 任务解构

目前有三条技术路径

### Path 1 Chromagram => HMM

深度学习之前的方法

先使用算法提取特征生成色谱图Chromagram

然后使用预设的模板进行相似度计算或者使用HMM,HMM的观测概率由色谱图提供,转移概率则由基于乐理的“和弦转移矩阵”提供

优点:
    训练数据小,计算复杂度低,可解释性强

缺点:
    人工设计复杂,容易受到复杂配器,节奏型干扰,准确率存在天花板(存疑)

### Path 2 Neural Network

把CQT频谱视为二维图像,交由卷积网络处理

使用 2D-CNN 或 1D-CNN 对多帧音频特征进行卷积操作。利用模式识别能力自动学习如何过滤掉底部的底噪和不和谐的泛音，提取出“和弦指纹”。

优点:
    显著提升了单帧音频的和弦分类准确率，对复杂音色的鲁棒性远超传统 DSP 方法。

缺点:
    纯粹的 CNN 缺乏时间维度上的长程记忆。它可能会在连续的 C 和弦中，因为某个瞬间的吉他滑音，突然在中间一帧输出一个奇怪的 F# 和弦，导致结果在时间轴上产生“不合逻辑的跳跃”。

### Path 3 LLM (NOW)

使用Transformer/Conformer 架构,彻底或部分抛弃 RNN

使用自注意力机制 (Self-Attention) 处理特征序列（如 BTC - Bi-directional Transformer for Chord Recognition）。它解决了 RNN 在处理超长音频（如 5 分钟的交响乐）时存在的长程梯度遗忘问题。

近年来，不再从零开始训练 ACE 模型，而是先使用海量无标签音频训练基础大模型（如 HuBERT, MERT, JukeBox），提取出包含极高语义信息的音频表征 (Representations)，然后再接入一个简单的线性层或浅层 Transformer 专门做 ACE 任务(存疑)

优点:
    准确率极高，对未知音乐风格的泛化能力极强。
缺点:
    模型参数量庞大，计算开销高，极难做到低延迟的实时推断。

### Path 4 Multi-Task

组合多种特征进行联合推断

## 先行研究