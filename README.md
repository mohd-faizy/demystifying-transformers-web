# 🧠 Demystifying Transformers

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20to-Vercel-black?style=for-the-badge&logo=vercel)](https://demystifying-transformers.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20Vanilla%20CSS%20%7C%20ES6%2B-teal?style=for-the-badge)](https://developer.mozilla.org/en-US/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-emerald.svg?style=for-the-badge)](https://github.com/mohd-faizy/demystifying-transformers-web)

A highly structured, visual, and mathematically rigorous educational walkthrough of the **Transformer Architecture** from the ground up—covering everything from individual self-attention projections to full encoder-decoder sequence pipelines.

---

## 🚀 Live Interactive Notes

The complete study notes, visual diagrams, mathematical breakdowns, and deep-dive question-and-answers are fully compiled and hosted on Vercel:

<div align="center">
  <a href="https://demystifying-transformers.vercel.app/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Explore%20The%20Live%20Interactive%20Site%20Here-0f766e?style=for-the-badge&logo=vercel&logoColor=white" alt="Explore The Live Interactive Site Here" height="46">
  </a>
</div>


---

## 🗺️ Architectural Learning Path

This repository merges multiple highly-detailed study paths into a singular, clean, responsive reading interface. The curriculum is split into two primary phases:

### 📘 Part 1: Foundations & Core Components
Focuses on mathematical intuition, geometrical representations, and the fundamental building blocks of the network.
*   **01 - Introduction to Transformers:** Why recurrent architectures (RNNs, LSTMs) failed to scale and how self-attention unlocked parallel sequence modeling.
*   **02 & 03 - Self-Attention Mechanics:** The query ($Q$), key ($K$), and value ($V$) projections. Understanding why static embeddings fail to capture contextual semantics.
*   **04 & 05 - Scaled Dot-Product & Geometric Intuition:** Why high dimensional vectors cause training instability and how the scaling factor $\frac{1}{\sqrt{d_k}}$ stabilizes softmax gradients.
*   **06 - Multi-Head Attention:** Projecting representations into parallel subspaces to capture varied contextual relationships simultaneously.
*   **07 - Positional Encoding:** Sinusoidal encodings, their mathematical properties, and why addition is preferred over concatenation to retain spatial sequence structure.
*   **08 - Layer Normalization:** Batch Normalization vs. Layer Normalization in sequential settings and how to handle padded sequences safely.

### 📙 Part 2: Stack Architecture & Sequence Flow
Walks through the complete computational graph of the model from inputs to outputs.
*   **The Encoder Stack:** Residual (skip) connections, layer normalization, and the role of the Position-Wise Feed-Forward Network (FFN).
*   **The Decoder Stack:**
    *   **Masked Self-Attention:** Preventing "future-token cheating" during training.
    *   **Cross-Attention:** How the decoder queries the encoder representation space.
    *   **Autoregressive Inference:** Autoregressive prediction step-by-step during decoding.
    *   **Teacher Forcing:** Parallel training vs. sequential autoregressive inference.

---

## 🧪 Core Mathematical Intuitions Featured

The site features detailed equations, interactive breakdowns, and clean visualizations. The foundation is built upon the **Scaled Dot-Product Attention**:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

### 🔬 Technical Specification Cheat Sheet

| Hyperparameter | Symbol | Value (Base Model) | Value (Big Model) | What It Controls |
| :--- | :--- | :--- | :--- | :--- |
| **Model Dimension** | $d_{\text{model}}$ | 512 | 1024 | Size of all token embeddings and hidden states. |
| **Attention Heads** | $h$ | 8 | 16 | Number of parallel attention subspaces. |
| **Head Dimension** | $d_k$ | 64 | 64 | Projection dimension of each head. |
| **Stacked Layers** | $N$ | 6 | 6 | Number of encoder & decoder blocks. |
| **FFN Inner Dimension** | $d_{\text{ff}}$ | 2048 | 4096 | Hidden layer width of the feed-forward network. |


---
*Created with by [Mohd Faizy](https://github.com/mohd-faizy)*
