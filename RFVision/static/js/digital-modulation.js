/**
 * =============================================================================
 * 数字调制演示系统 - RFVision核心JavaScript模块
 * =============================================================================
 * 
 * 文件描述: 实现数字调制技术的完整可视化演示
 * 创建时间: 2024
 * 作者: RFVision开发团队
 * 版本: v1.0
 * 
 * 功能概述:
 * - ASK (Amplitude Shift Keying) 幅移键控调制
 * - FSK (Frequency Shift Keying) 频移键控调制  
 * - PSK (Phase Shift Keying) 相移键控调制
 * - 数字信号到模拟信号的转换过程演示
 * - 文本数据的编码、调制和传输仿真
 * - 不同调制方式的性能对比分析
 * - 理论基础和数学公式的可视化展示
 * 
 * 技术特点:
 * - 基于Canvas的高性能实时渲染
 * - 物理准确的信号生成算法
 * - 交互式参数调节和即时反馈
 * - 分步动画演示调制过程
 * - 支持误码率和频谱分析
 * 
 * 物理原理:
 * ASK: s(t) = A(d) * cos(2πfct + φ), A(d) = {A1, A0}
 * FSK: s(t) = A * cos(2πf(d)t + φ), f(d) = {f1, f0}  
 * PSK: s(t) = A * cos(2πfct + φ(d)), φ(d) = {φ1, φ0}
 * 
 * =============================================================================
 */

/**
 * 数字调制演示主类
 * 提供完整的数字调制可视化和动画功能
 */

class DigitalModulationDemo {
    constructor() {
        this.animationId = null;
        this.isPlaying = false;
        this.currentStep = 0;
        this.maxSteps = 4;
        this.animationSpeed = 1;
        this.currentTime = 0;
        
        // 信号参数
        this.params = {
            bit: '0',
            modulationType: 'ASK',
            carrierFreq: 5,
            bitDuration: 1.0,
            amplitude: 1.0,
            phase: 0
        };
        
        // 画布引用
        this.canvases = {};
        this.contexts = {};
        
        this.initCanvases();
        this.bindEvents();
    }
    
    /**
     * 初始化所有画布
     */
    initCanvases() {
        const canvasIds = [
            'digital-signal-canvas',
            'carrier-signal-canvas', 
            'modulation-process-canvas',
            'output-signal-canvas',
            'text-modulation-canvas',
            'ask-comparison-canvas',
            'fsk-comparison-canvas',
            'psk-comparison-canvas',
            'performance-chart'
        ];
        
        canvasIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                this.canvases[id] = canvas;
                this.contexts[id] = canvas.getContext('2d');
                
                // 设置高DPI支持
                const rect = canvas.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                canvas.style.width = rect.width + 'px';
                canvas.style.height = rect.height + 'px';
                this.contexts[id].scale(dpr, dpr);
            }
        });
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 参数控制
        const bitSelect = document.getElementById('bit-select');
        const modulationType = document.getElementById('modulation-type');
        const carrierFreq = document.getElementById('carrier-freq');
        const bitDuration = document.getElementById('bit-duration');
        
        if (bitSelect) {
            bitSelect.addEventListener('change', (e) => {
                this.params.bit = e.target.value;
                this.updateDisplay();
                this.updateVisualization();
            });
        }
        
        if (modulationType) {
            modulationType.addEventListener('change', (e) => {
                this.params.modulationType = e.target.value;
                this.updateDisplay();
                this.updateVisualization();
            });
        }
        
        if (carrierFreq) {
            carrierFreq.addEventListener('input', (e) => {
                this.params.carrierFreq = parseFloat(e.target.value);
                this.updateDisplay();
                this.updateVisualization();
            });
        }
        
        if (bitDuration) {
            bitDuration.addEventListener('input', (e) => {
                this.params.bitDuration = parseFloat(e.target.value);
                this.updateDisplay();
                this.updateVisualization();
            });
        }
        
        // 播放控制
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        const stepBtn = document.getElementById('step-btn');
        
        if (playBtn) playBtn.addEventListener('click', () => this.startAnimation());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseAnimation());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetAnimation());
        if (stepBtn) stepBtn.addEventListener('click', () => this.stepForward());
        
        // 文本传输
        const transmitBtn = document.getElementById('transmit-text-btn');
        if (transmitBtn) {
            transmitBtn.addEventListener('click', () => this.startTextTransmission());
        }
        
        // 调制对比
        const bitBtns = document.querySelectorAll('.bit-btn');
        bitBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                bitBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateComparisonCharts(e.target.dataset.bit);
            });
        });
    }
    
    /**
     * 更新显示值
     */
    updateDisplay() {
        // 更新数值显示
        const elements = {
            'carrier-freq-value': this.params.carrierFreq,
            'bit-duration-value': this.params.bitDuration.toFixed(1),
            'carrier-freq-text': this.params.carrierFreq,
            'current-bit': this.params.bit,
            'param-bit-value': this.params.bit,
            'param-carrier-freq': this.params.carrierFreq + ' Hz',
            'param-modulation': this.params.modulationType,
            'param-bit-period': this.params.bitDuration.toFixed(1) + ' s',
            'param-amplitude': this.params.amplitude.toFixed(1) + ' V',
            'param-mod-index': '100%'
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
        
        // 更新比特描述
        const bitDesc = document.getElementById('bit-description');
        if (bitDesc) {
            bitDesc.textContent = this.params.bit === '0' ? '逻辑低电平' : '逻辑高电平';
        }
        
        // 更新数字信号解释
        const digitalExp = document.getElementById('digital-explanation');
        if (digitalExp) {
            digitalExp.textContent = this.params.bit === '0' ? 
                '数字比特0表示为低电平信号（通常为0V）' : 
                '数字比特1表示为高电平信号（通常为3.3V或5V）';
        }
        
        // 更新调制器类型
        const modulatorType = document.getElementById('modulator-type');
        if (modulatorType) {
            modulatorType.textContent = this.params.modulationType + '调制器';
        }
        
        // 更新调制解释和公式
        this.updateModulationExplanation();
    }
    
    /**
     * 更新调制解释
     */
    updateModulationExplanation() {
        const explanations = {
            'ASK': 'ASK调制：数字信号控制载波的幅度',
            'FSK': 'FSK调制：数字信号控制载波的频率',
            'PSK': 'PSK调制：数字信号控制载波的相位'
        };
        
        const formulas = {
            'ASK': '$$s(t) = A(t) \\cos(2\\pi f_c t)$$',
            'FSK': '$$s(t) = A \\cos(2\\pi f(t) t)$$',
            'PSK': '$$s(t) = A \\cos(2\\pi f_c t + \\phi(t))$$'
        };
        
        const expElement = document.getElementById('modulation-explanation');
        const formulaElement = document.getElementById('modulation-formula');
        
        if (expElement) {
            expElement.textContent = explanations[this.params.modulationType];
        }
        
        if (formulaElement) {
            formulaElement.innerHTML = formulas[this.params.modulationType];
            // 重新渲染MathJax
            if (window.MathJax) {
                MathJax.typesetPromise([formulaElement]);
            }
        }
    }
    
    /**
     * 更新所有可视化
     */
    updateVisualization() {
        this.drawDigitalSignal();
        this.drawCarrierSignal();
        this.drawModulationProcess();
        this.drawOutputSignal();
    }
    
    /**
     * 绘制数字信号
     */
    drawDigitalSignal() {
        const canvas = this.canvases['digital-signal-canvas'];
        const ctx = this.contexts['digital-signal-canvas'];
        
        if (!canvas || !ctx) return;
        
        const width = canvas.style.width ? parseInt(canvas.style.width) : canvas.width;
        const height = canvas.style.height ? parseInt(canvas.style.height) : canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // 绘制坐标轴
        this.drawAxes(ctx, width, height);
        
        // 绘制数字信号
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const margin = 40;
        const plotWidth = width - 2 * margin;
        const plotHeight = height - 2 * margin;
        
        const bitLevel = this.params.bit === '1' ? margin + plotHeight * 0.2 : margin + plotHeight * 0.8;
        
        ctx.moveTo(margin, bitLevel);
        ctx.lineTo(margin + plotWidth, bitLevel);
        ctx.stroke();
        
        // 添加标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('V', 15, margin + plotHeight * 0.2);
        ctx.fillText('0', 15, margin + plotHeight * 0.8);
        ctx.fillText('时间 (s)', margin + plotWidth/2 - 20, height - 5);
        
        // 添加电平指示
        const levelText = this.params.bit === '1' ? '高电平 (1)' : '低电平 (0)';
        ctx.fillStyle = '#2196F3';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(levelText, margin + 10, bitLevel - 10);
    }
    
    /**
     * 绘制载波信号
     */
    drawCarrierSignal() {
        const canvas = this.canvases['carrier-signal-canvas'];
        const ctx = this.contexts['carrier-signal-canvas'];
        
        if (!canvas || !ctx) return;
        
        const width = canvas.style.width ? parseInt(canvas.style.width) : canvas.width;
        const height = canvas.style.height ? parseInt(canvas.style.height) : canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // 绘制坐标轴
        this.drawAxes(ctx, width, height);
        
        // 绘制载波
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const margin = 40;
        const plotWidth = width - 2 * margin;
        const plotHeight = height - 2 * margin;
        const centerY = margin + plotHeight / 2;
        const amplitude = plotHeight * 0.3;
        
        const cycles = this.params.carrierFreq * this.params.bitDuration;
        
        for (let x = 0; x <= plotWidth; x++) {
            const t = (x / plotWidth) * this.params.bitDuration;
            const y = centerY + amplitude * Math.sin(2 * Math.PI * this.params.carrierFreq * t);
            
            if (x === 0) {
                ctx.moveTo(margin + x, y);
            } else {
                ctx.lineTo(margin + x, y);
            }
        }
        
        ctx.stroke();
        
        // 添加标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Ac', 15, centerY - amplitude - 10);
        ctx.fillText('-Ac', 15, centerY + amplitude + 15);
        ctx.fillText('时间 (s)', margin + plotWidth/2 - 20, height - 5);
        
        // 添加频率标签
        ctx.fillStyle = '#FF9800';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`载波: ${this.params.carrierFreq} Hz`, margin + 10, margin + 20);
    }
    
    /**
     * 绘制调制过程
     */
    drawModulationProcess() {
        const canvas = this.canvases['modulation-process-canvas'];
        const ctx = this.contexts['modulation-process-canvas'];
        
        if (!canvas || !ctx) return;
        
        const width = canvas.style.width ? parseInt(canvas.style.width) : canvas.width;
        const height = canvas.style.height ? parseInt(canvas.style.height) : canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // 分成三个区域：数字信号、载波、调制结果
        const sectionHeight = height / 3;
        const margin = 40;
        const plotWidth = width - 2 * margin;
        
        // 绘制数字信号（上方）
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2;
        this.drawDigitalBitInSection(ctx, margin, 0, plotWidth, sectionHeight);
        
        // 绘制载波（中间）
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 2;
        this.drawCarrierInSection(ctx, margin, sectionHeight, plotWidth, sectionHeight);
        
        // 绘制调制结果（下方）
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        this.drawModulatedSignalInSection(ctx, margin, 2 * sectionHeight, plotWidth, sectionHeight);
        
        // 添加标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('数字信号', margin + 10, 15);
        ctx.fillText('载波信号', margin + 10, sectionHeight + 15);
        ctx.fillText('调制信号', margin + 10, 2 * sectionHeight + 15);
    }
    
    /**
     * 绘制输出信号
     */
    drawOutputSignal() {
        const canvas = this.canvases['output-signal-canvas'];
        const ctx = this.contexts['output-signal-canvas'];
        
        if (!canvas || !ctx) return;
        
        const width = canvas.style.width ? parseInt(canvas.style.width) : canvas.width;
        const height = canvas.style.height ? parseInt(canvas.style.height) : canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // 绘制坐标轴
        this.drawAxes(ctx, width, height);
        
        // 绘制调制后的信号
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const margin = 40;
        const plotWidth = width - 2 * margin;
        const plotHeight = height - 2 * margin;
        const centerY = margin + plotHeight / 2;
        const amplitude = plotHeight * 0.3;
        
        for (let x = 0; x <= plotWidth; x++) {
            const t = (x / plotWidth) * this.params.bitDuration;
            let y = centerY;
            
            switch (this.params.modulationType) {
                case 'ASK':
                    const askAmplitude = this.params.bit === '1' ? amplitude : amplitude * 0.1;
                    y = centerY + askAmplitude * Math.sin(2 * Math.PI * this.params.carrierFreq * t);
                    break;
                case 'FSK':
                    const freq = this.params.bit === '1' ? this.params.carrierFreq * 1.5 : this.params.carrierFreq * 0.7;
                    y = centerY + amplitude * Math.sin(2 * Math.PI * freq * t);
                    break;
                case 'PSK':
                    const phase = this.params.bit === '1' ? Math.PI : 0;
                    y = centerY + amplitude * Math.sin(2 * Math.PI * this.params.carrierFreq * t + phase);
                    break;
            }
            
            if (x === 0) {
                ctx.moveTo(margin + x, y);
            } else {
                ctx.lineTo(margin + x, y);
            }
        }
        
        ctx.stroke();
        
        // 添加标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('幅度', 15, centerY);
        ctx.fillText('时间 (s)', margin + plotWidth/2 - 20, height - 5);
        
        // 添加调制类型标签
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${this.params.modulationType} 调制输出`, margin + 10, margin + 20);
    }
    
    /**
     * 绘制坐标轴
     */
    drawAxes(ctx, width, height) {
        const margin = 40;
        
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // X轴
        ctx.moveTo(margin, height - margin);
        ctx.lineTo(width - margin, height - margin);
        
        // Y轴
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, height - margin);
        
        ctx.stroke();
    }
    
    /**
     * 在指定区域绘制数字比特
     */
    drawDigitalBitInSection(ctx, x, y, width, height) {
        const centerY = y + height / 2;
        const bitLevel = this.params.bit === '1' ? y + height * 0.3 : y + height * 0.7;
        
        ctx.beginPath();
        ctx.moveTo(x, bitLevel);
        ctx.lineTo(x + width, bitLevel);
        ctx.stroke();
    }
    
    /**
     * 在指定区域绘制载波
     */
    drawCarrierInSection(ctx, x, y, width, height) {
        const centerY = y + height / 2;
        const amplitude = height * 0.25;
        
        ctx.beginPath();
        for (let i = 0; i <= width; i++) {
            const t = (i / width) * this.params.bitDuration;
            const signalY = centerY + amplitude * Math.sin(2 * Math.PI * this.params.carrierFreq * t);
            
            if (i === 0) {
                ctx.moveTo(x + i, signalY);
            } else {
                ctx.lineTo(x + i, signalY);
            }
        }
        ctx.stroke();
    }
    
    /**
     * 在指定区域绘制调制信号
     */
    drawModulatedSignalInSection(ctx, x, y, width, height) {
        const centerY = y + height / 2;
        const amplitude = height * 0.25;
        
        ctx.beginPath();
        for (let i = 0; i <= width; i++) {
            const t = (i / width) * this.params.bitDuration;
            let signalY = centerY;
            
            switch (this.params.modulationType) {
                case 'ASK':
                    const askAmplitude = this.params.bit === '1' ? amplitude : amplitude * 0.1;
                    signalY = centerY + askAmplitude * Math.sin(2 * Math.PI * this.params.carrierFreq * t);
                    break;
                case 'FSK':
                    const freq = this.params.bit === '1' ? this.params.carrierFreq * 1.5 : this.params.carrierFreq * 0.7;
                    signalY = centerY + amplitude * Math.sin(2 * Math.PI * freq * t);
                    break;
                case 'PSK':
                    const phase = this.params.bit === '1' ? Math.PI : 0;
                    signalY = centerY + amplitude * Math.sin(2 * Math.PI * this.params.carrierFreq * t + phase);
                    break;
            }
            
            if (i === 0) {
                ctx.moveTo(x + i, signalY);
            } else {
                ctx.lineTo(x + i, signalY);
            }
        }
        ctx.stroke();
    }
    
    /**
     * 开始动画
     */
    startAnimation() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentStep = 0;
        this.currentTime = 0;
        
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');
        
        if (playBtn) playBtn.disabled = true;
        if (pauseBtn) pauseBtn.disabled = false;
        
        this.animate();
    }
    
    /**
     * 暂停动画
     */
    pauseAnimation() {
        this.isPlaying = false;
        
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');
        
        if (playBtn) playBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    /**
     * 重置动画
     */
    resetAnimation() {
        this.pauseAnimation();
        this.currentStep = 0;
        this.currentTime = 0;
        this.updateProgressBar();
        this.updateVisualization();
    }
    
    /**
     * 单步执行
     */
    stepForward() {
        if (this.currentStep < this.maxSteps - 1) {
            this.currentStep++;
            this.updateProgressBar();
            this.highlightCurrentStep();
        }
    }
    
    /**
     * 动画循环
     */
    animate() {
        if (!this.isPlaying) return;
        
        this.currentTime += 0.016; // 约60fps
        
        // 更新进度
        const progress = (this.currentTime % 4) / 4; // 4秒一个周期
        this.currentStep = Math.floor(progress * this.maxSteps);
        
        this.updateProgressBar();
        this.highlightCurrentStep();
        this.updateVisualizationWithAnimation();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    /**
     * 更新进度条
     */
    updateProgressBar() {
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progress = (this.currentStep / (this.maxSteps - 1)) * 100;
            progressFill.style.width = progress + '%';
        }
    }
    
    /**
     * 高亮当前步骤
     */
    highlightCurrentStep() {
        const sections = document.querySelectorAll('.signal-section');
        sections.forEach((section, index) => {
            if (index === this.currentStep) {
                section.classList.add('active-step');
            } else {
                section.classList.remove('active-step');
            }
        });
    }
    
    /**
     * 带动画的可视化更新
     */
    updateVisualizationWithAnimation() {
        // 根据当前步骤更新相应的图表
        switch (this.currentStep) {
            case 0:
                this.drawDigitalSignal();
                break;
            case 1:
                this.drawCarrierSignal();
                break;
            case 2:
                this.drawModulationProcess();
                break;
            case 3:
                this.drawOutputSignal();
                break;
        }
    }
    
    /**
     * 开始文本传输演示
     */
    startTextTransmission() {
        const inputText = document.getElementById('input-text');
        if (!inputText) return;
        
        const text = inputText.value.trim();
        if (!text) return;
        
        this.showTextToASCII(text);
        setTimeout(() => this.showASCIIToBinary(text), 1000);
        setTimeout(() => this.showBinaryModulation(text), 2000);
    }
    
    /**
     * 显示文本转ASCII
     */
    showTextToASCII(text) {
        const container = document.getElementById('ascii-display');
        if (!container) return;
        
        let asciiHtml = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const ascii = char.charCodeAt(0);
            asciiHtml += `<span class="ascii-item">'${char}' → ${ascii}</span>`;
        }
        
        container.innerHTML = asciiHtml;
    }
    
    /**
     * 显示ASCII转二进制
     */
    showASCIIToBinary(text) {
        const container = document.getElementById('binary-display');
        if (!container) return;
        
        let binaryHtml = '';
        let fullBinary = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const ascii = char.charCodeAt(0);
            const binary = ascii.toString(2).padStart(8, '0');
            fullBinary += binary;
            
            binaryHtml += `<div class="binary-group">
                <span class="char-label">'${char}':</span>
                <span class="binary-value">${binary}</span>
            </div>`;
        }
        
        container.innerHTML = binaryHtml;
        this.fullBinary = fullBinary; // 保存用于调制
    }
    
    /**
     * 显示二进制调制
     */
    showBinaryModulation(text) {
        const canvas = this.canvases['text-modulation-canvas'];
        const ctx = this.contexts['text-modulation-canvas'];
        
        if (!canvas || !ctx || !this.fullBinary) return;
        
        const width = canvas.style.width ? parseInt(canvas.style.width) : canvas.width;
        const height = canvas.style.height ? parseInt(canvas.style.height) : canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const modType = document.getElementById('text-modulation')?.value || 'ASK';
        const baudRate = parseFloat(document.getElementById('baud-rate')?.value || '1');
        
        this.drawTextModulationSignal(ctx, width, height, this.fullBinary, modType, baudRate);
    }
    
    /**
     * 绘制文本调制信号
     */
    drawTextModulationSignal(ctx, width, height, binary, modType, baudRate) {
        const margin = 40;
        const plotWidth = width - 2 * margin;
        const plotHeight = height - 2 * margin;
        const centerY = margin + plotHeight / 2;
        const amplitude = plotHeight * 0.3;
        
        // 绘制坐标轴
        this.drawAxes(ctx, width, height);
        
        const bitDuration = 1 / baudRate; // 每比特时间
        const totalTime = binary.length * bitDuration;
        const carrierFreq = 10; // 载波频率
        
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = 0; x <= plotWidth; x++) {
            const t = (x / plotWidth) * totalTime;
            const bitIndex = Math.floor(t / bitDuration);
            const bit = binary[bitIndex] || '0';
            
            let y = centerY;
            
            switch (modType) {
                case 'ASK':
                    const askAmplitude = bit === '1' ? amplitude : amplitude * 0.1;
                    y = centerY + askAmplitude * Math.sin(2 * Math.PI * carrierFreq * t);
                    break;
                case 'FSK':
                    const freq = bit === '1' ? carrierFreq * 1.5 : carrierFreq * 0.7;
                    y = centerY + amplitude * Math.sin(2 * Math.PI * freq * t);
                    break;
                case 'PSK':
                    const phase = bit === '1' ? Math.PI : 0;
                    y = centerY + amplitude * Math.sin(2 * Math.PI * carrierFreq * t + phase);
                    break;
            }
            
            if (x === 0) {
                ctx.moveTo(margin + x, y);
            } else {
                ctx.lineTo(margin + x, y);
            }
        }
        
        ctx.stroke();
        
        // 添加比特标记
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        for (let i = 0; i < Math.min(binary.length, 16); i++) {
            const x = margin + (i + 0.5) * (plotWidth / Math.min(binary.length, 16));
            ctx.fillText(binary[i], x, margin - 5);
        }
    }
    
    /**
     * 更新调制对比图表
     */
    updateComparisonCharts(bit) {
        const modTypes = ['ask', 'fsk', 'psk'];
        const carrierFreq = 5;
        
        modTypes.forEach(type => {
            const canvas = this.canvases[`${type}-comparison-canvas`];
            const ctx = this.contexts[`${type}-comparison-canvas`];
            
            if (canvas && ctx) {
                this.drawComparisonSignal(ctx, canvas, bit, type.toUpperCase(), carrierFreq);
            }
        });
    }
    
    /**
     * 绘制对比信号
     */
    drawComparisonSignal(ctx, canvas, bit, modType, carrierFreq) {
        const width = canvas.style.width ? parseInt(canvas.style.width) : canvas.width;
        const height = canvas.style.height ? parseInt(canvas.style.height) : canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const margin = 20;
        const plotWidth = width - 2 * margin;
        const plotHeight = height - 2 * margin;
        const centerY = margin + plotHeight / 2;
        const amplitude = plotHeight * 0.3;
        
        // 绘制信号
        ctx.strokeStyle = bit === '1' ? '#28a745' : '#dc3545';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = 0; x <= plotWidth; x++) {
            const t = x / plotWidth;
            let y = centerY;
            
            switch (modType) {
                case 'ASK':
                    const askAmplitude = bit === '1' ? amplitude : amplitude * 0.1;
                    y = centerY + askAmplitude * Math.sin(2 * Math.PI * carrierFreq * t);
                    break;
                case 'FSK':
                    const freq = bit === '1' ? carrierFreq * 1.5 : carrierFreq * 0.7;
                    y = centerY + amplitude * Math.sin(2 * Math.PI * freq * t);
                    break;
                case 'PSK':
                    const phase = bit === '1' ? Math.PI : 0;
                    y = centerY + amplitude * Math.sin(2 * Math.PI * carrierFreq * t + phase);
                    break;
            }
            
            if (x === 0) {
                ctx.moveTo(margin + x, y);
            } else {
                ctx.lineTo(margin + x, y);
            }
        }
        
        ctx.stroke();
        
        // 添加比特标签
        ctx.fillStyle = bit === '1' ? '#28a745' : '#dc3545';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Bit ${bit}`, margin + 5, margin + 15);
    }
    
    /**
     * 初始化性能图表
     */
    initPerformanceChart() {
        const canvas = this.canvases['performance-chart'];
        const ctx = this.contexts['performance-chart'];
        
        if (!canvas || !ctx) return;
        
        const width = canvas.style.width ? parseInt(canvas.style.width) : canvas.width;
        const height = canvas.style.height ? parseInt(canvas.style.height) : canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        this.drawPerformanceChart(ctx, width, height);
    }
    
    /**
     * 绘制性能图表
     */
    drawPerformanceChart(ctx, width, height) {
        const margin = 60;
        const plotWidth = width - 2 * margin;
        const plotHeight = height - 2 * margin;
        
        // 绘制坐标轴
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, height - margin);
        ctx.lineTo(width - margin, height - margin);
        ctx.stroke();
        
        // 模拟误码率数据
        const snrRange = Array.from({length: 21}, (_, i) => i); // 0-20 dB
        const askBER = snrRange.map(snr => Math.pow(10, -snr/5 - 1));
        const fskBER = snrRange.map(snr => Math.pow(10, -snr/4 - 1.5));
        const pskBER = snrRange.map(snr => Math.pow(10, -snr/3 - 2));
        
        // 绘制曲线
        const colors = ['#dc3545', '#ffc107', '#28a745'];
        const labels = ['ASK', 'FSK', 'PSK'];
        const data = [askBER, fskBER, pskBER];
        
        data.forEach((ber, index) => {
            ctx.strokeStyle = colors[index];
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            ber.forEach((rate, i) => {
                const x = margin + (i / (snrRange.length - 1)) * plotWidth;
                const y = height - margin - (Math.log10(rate) + 6) / 6 * plotHeight;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // 添加图例
            ctx.fillStyle = colors[index];
            ctx.fillRect(width - margin + 10, margin + index * 25, 15, 10);
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.fillText(labels[index], width - margin + 30, margin + index * 25 + 8);
        });
        
        // 添加轴标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('信噪比 (dB)', width/2 - 30, height - 20);
        
        ctx.save();
        ctx.translate(20, height/2);
        ctx.rotate(-Math.PI/2);
        ctx.fillText('误码率', 0, 0);
        ctx.restore();
    }
    
    /**
     * 初始化函数
     */
    init() {
        this.updateDisplay();
        this.updateVisualization();
        this.updateComparisonCharts('0');
        this.initPerformanceChart();
        
        console.log('数字调制演示初始化完成');
    }
}

// 全局函数，供HTML调用
window.initComparisonCharts = function() {
    if (window.digitalDemo) {
        window.digitalDemo.updateComparisonCharts('0');
    }
};

window.initPerformanceChart = function() {
    if (window.digitalDemo) {
        window.digitalDemo.initPerformanceChart();
    }
};

// 导出到全局作用域
window.DigitalModulationDemo = DigitalModulationDemo;
