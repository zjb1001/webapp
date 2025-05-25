/**
 * =============================================================================
 * RFVision 射频通信仿真器 - 主JavaScript模块
 * =============================================================================
 * 
 * 文件描述: RFVision系统的核心JavaScript功能模块
 * 创建时间: 2024
 * 作者: RFVision开发团队
 * 版本: v1.0
 * 
 * 模块职责:
 * 1. 射频工程计算函数库 (RF Engineering Calculations)
 * 2. 信号处理与数学运算 (Signal Processing & Mathematics)
 * 3. 图表渲染与动画控制 (Chart Rendering & Animation)
 * 4. 载波信号生成与分析 (Carrier Signal Generation & Analysis)
 * 5. 调制解调算法实现 (Modulation/Demodulation Algorithms)
 * 6. 传播路径损耗计算 (Path Loss Calculations)
 * 7. 天线特性仿真 (Antenna Pattern Simulation)
 * 
 * 核心算法基础:
 * - Maxwell电磁场方程组
 * - Friis传输公式: Pr = Pt * Gt * Gr * (λ/4πd)²
 * - 路径损耗公式: L = 20log₁₀(d) + 20log₁₀(f) + 32.45
 * - 调制理论: AM, FM, PM的数学表达
 * - 傅里叶变换: 时频域转换
 * - 复数信号处理: I/Q调制
 * 
 * 物理常数定义:
 * - 光速: c = 3×10⁸ m/s
 * - 真空磁导率: μ₀ = 4π×10⁻⁷ H/m
 * - 真空介电常数: ε₀ = 8.854×10⁻¹² F/m
 * - 玻尔兹曼常数: k = 1.38×10⁻²³ J/K
 * 
 * 技术特点:
 * - 高精度数值计算
 * - 实时图表渲染
 * - 物理准确的仿真模型
 * - 模块化架构设计
 * - 跨浏览器兼容性
 * 
 * =============================================================================
 */

/**
 * RF Vision - 主要JavaScript功能
 * 提供通用的图表处理、动画控制和数学计算功能
 */

// 全局变量
window.RFVision = {
    charts: {},
    animations: {},
    constants: {
        LIGHT_SPEED: 3e8,  // 光速 m/s
        VACUUM_PERMEABILITY: 4 * Math.PI * 1e-7,  // 真空磁导率
        VACUUM_PERMITTIVITY: 8.854e-12,  // 真空介电常数
        BOLTZMANN_CONSTANT: 1.38e-23  // 玻尔兹曼常数
    }
};

/**
 * 数学工具函数
 */
const MathUtils = {
    /**
     * 将dBm转换为瓦特
     */
    dbmToWatts: function(dbm) {
        return Math.pow(10, (dbm - 30) / 10);
    },

    /**
     * 将瓦特转换为dBm
     */
    wattsToDbm: function(watts) {
        return 10 * Math.log10(watts) + 30;
    },

    /**
     * 将dB转换为线性值
     */
    dbToLinear: function(db) {
        return Math.pow(10, db / 10);
    },

    /**
     * 将线性值转换为dB
     */
    linearToDb: function(linear) {
        return 10 * Math.log10(linear);
    },

    /**
     * 计算两点间距离
     */
    distance: function(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    /**
     * 将度数转换为弧度
     */
    degToRad: function(deg) {
        return deg * Math.PI / 180;
    },

    /**
     * 将弧度转换为度数
     */
    radToDeg: function(rad) {
        return rad * 180 / Math.PI;
    },

    /**
     * 复数运算
     */
    complex: {
        add: function(a, b) {
            return {
                real: a.real + b.real,
                imag: a.imag + b.imag
            };
        },
        
        multiply: function(a, b) {
            return {
                real: a.real * b.real - a.imag * b.imag,
                imag: a.real * b.imag + a.imag * b.real
            };
        },
        
        magnitude: function(c) {
            return Math.sqrt(c.real * c.real + c.imag * c.imag);
        },
        
        phase: function(c) {
            return Math.atan2(c.imag, c.real);
        }
    }
};

/**
 * RF计算工具
 */
const RFCalculations = {
    /**
     * 计算自由空间路径损耗
     */
    freeSpacePathLoss: function(distanceKm, frequencyMHz) {
        return 20 * Math.log10(distanceKm) + 20 * Math.log10(frequencyMHz) + 32.45;
    },

    /**
     * 计算波长
     */
    wavelength: function(frequencyHz) {
        return window.RFVision.constants.LIGHT_SPEED / frequencyHz;
    },

    /**
     * 计算天线有效孔径
     */
    effectiveAperture: function(gainLinear, frequencyHz) {
        const lambda = this.wavelength(frequencyHz);
        return (gainLinear * lambda * lambda) / (4 * Math.PI);
    },

    /**
     * Friis传输方程
     */
    friisTransmission: function(txPowerDbm, txGainDbi, rxGainDbi, distanceKm, frequencyMHz) {
        const pathLoss = this.freeSpacePathLoss(distanceKm, frequencyMHz);
        return txPowerDbm + txGainDbi + rxGainDbi - pathLoss;
    },

    /**
     * 计算噪声功率
     */
    noisePower: function(temperatureK, bandwidthHz) {
        return window.RFVision.constants.BOLTZMANN_CONSTANT * temperatureK * bandwidthHz;
    },

    /**
     * 信噪比计算
     */
    snr: function(signalPowerW, noisePowerW) {
        return MathUtils.linearToDb(signalPowerW / noisePowerW);
    }
};

/**
 * 图表工具
 */
const ChartUtils = {
    /**
     * 默认图表配置
     */
    defaultConfig: {
        responsive: true,
        animation: {
            duration: 300
        },
        plugins: {
            legend: {
                position: 'top'
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            },
            y: {
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            }
        }
    },

    /**
     * 创建时域图表
     */
    createTimeChart: function(canvasId, title = '时域信号') {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const config = {
            ...this.defaultConfig,
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                ...this.defaultConfig,
                plugins: {
                    ...this.defaultConfig.plugins,
                    title: {
                        display: true,
                        text: title
                    }
                },
                scales: {
                    ...this.defaultConfig.scales,
                    x: {
                        ...this.defaultConfig.scales.x,
                        title: {
                            display: true,
                            text: '时间 (s)'
                        }
                    },
                    y: {
                        ...this.defaultConfig.scales.y,
                        title: {
                            display: true,
                            text: '振幅'
                        }
                    }
                }
            }
        };
        return new Chart(ctx, config);
    },

    /**
     * 创建频域图表
     */
    createFrequencyChart: function(canvasId, title = '频域分析') {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const config = {
            ...this.defaultConfig,
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                ...this.defaultConfig,
                plugins: {
                    ...this.defaultConfig.plugins,
                    title: {
                        display: true,
                        text: title
                    }
                },
                scales: {
                    ...this.defaultConfig.scales,
                    x: {
                        ...this.defaultConfig.scales.x,
                        title: {
                            display: true,
                            text: '频率 (Hz)'
                        }
                    },
                    y: {
                        ...this.defaultConfig.scales.y,
                        title: {
                            display: true,
                            text: '幅度 (dB)'
                        }
                    }
                }
            }
        };
        return new Chart(ctx, config);
    },

    /**
     * 创建极坐标图表
     */
    createPolarChart: function(canvasId, title = '极坐标图') {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const config = {
            type: 'polarArea',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: title
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        };
        return new Chart(ctx, config);
    },

    /**
     * 更新图表数据
     */
    updateChart: function(chart, labels, datasets) {
        chart.data.labels = labels;
        chart.data.datasets = datasets;
        chart.update('none');
    },

    /**
     * 添加数据集到图表
     */
    addDataset: function(chart, label, data, color) {
        const dataset = {
            label: label,
            data: data,
            borderColor: color,
            backgroundColor: color + '20',
            borderWidth: 2,
            fill: false
        };
        chart.data.datasets.push(dataset);
        chart.update();
    }
};

/**
 * 动画控制
 */
const AnimationController = {
    /**
     * 开始波形动画
     */
    startWaveAnimation: function(chart, data, speed = 1) {
        const animationId = 'wave_' + Date.now();
        let frame = 0;
        const totalFrames = data.time.length;
        
        function animate() {
            if (frame >= totalFrames) {
                frame = 0;
            }
            
            const currentTime = data.time.slice(0, frame);
            const currentData = data.amplitude.slice(0, frame);
            
            ChartUtils.updateChart(chart, currentTime, [{
                label: '信号',
                data: currentData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                borderWidth: 2,
                fill: false
            }]);
            
            frame += speed;
            window.RFVision.animations[animationId] = requestAnimationFrame(animate);
        }
        
        animate();
        return animationId;
    },

    /**
     * 停止动画
     */
    stopAnimation: function(animationId) {
        if (window.RFVision.animations[animationId]) {
            cancelAnimationFrame(window.RFVision.animations[animationId]);
            delete window.RFVision.animations[animationId];
        }
    },

    /**
     * 停止所有动画
     */
    stopAllAnimations: function() {
        Object.keys(window.RFVision.animations).forEach(id => {
            this.stopAnimation(id);
        });
    }
};

/**
 * 用户界面工具
 */
const UIUtils = {
    /**
     * 显示加载指示器
     */
    showLoading: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading"></div> 计算中...';
            element.disabled = true;
        }
    },

    /**
     * 隐藏加载指示器
     */
    hideLoading: function(elementId, originalText) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = originalText;
            element.disabled = false;
        }
    },

    /**
     * 显示状态消息
     */
    showStatus: function(message, type = 'info', duration = 3000) {
        const statusDiv = document.createElement('div');
        statusDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        statusDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        statusDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(statusDiv);
        
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        }, duration);
    },

    /**
     * 格式化数值显示
     */
    formatNumber: function(value, decimals = 2, unit = '') {
        if (typeof value !== 'number' || isNaN(value)) {
            return 'N/A';
        }
        return value.toFixed(decimals) + (unit ? ' ' + unit : '');
    },

    /**
     * 格式化科学计数法
     */
    formatScientific: function(value, decimals = 2) {
        if (typeof value !== 'number' || isNaN(value)) {
            return 'N/A';
        }
        return value.toExponential(decimals);
    },

    /**
     * 创建工具提示
     */
    createTooltip: function(element, text) {
        element.setAttribute('data-bs-toggle', 'tooltip');
        element.setAttribute('data-bs-placement', 'top');
        element.setAttribute('title', text);
        
        // 初始化Bootstrap工具提示
        if (typeof bootstrap !== 'undefined') {
            new bootstrap.Tooltip(element);
        }
    }
};

/**
 * API通信工具
 */
const APIUtils = {
    /**
     * 通用API请求
     */
    async request(endpoint, params = {}) {
        try {
            const url = new URL(endpoint, window.location.origin);
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            });
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            UIUtils.showStatus('API请求失败: ' + error.message, 'danger');
            throw error;
        }
    },

    /**
     * 获取载波数据
     */
    async getCarrierData(frequency, amplitude) {
        return this.request('/api/generate_carrier', { frequency, amplitude });
    },

    /**
     * 获取AM调制数据
     */
    async getAMData(carrierFreq, modFreq, modDepth) {
        return this.request('/api/generate_am', {
            carrier_freq: carrierFreq,
            mod_freq: modFreq,
            mod_depth: modDepth
        });
    },

    /**
     * 获取FM调制数据
     */
    async getFMData(carrierFreq, modFreq, freqDev) {
        return this.request('/api/generate_fm', {
            carrier_freq: carrierFreq,
            mod_freq: modFreq,
            freq_dev: freqDev
        });
    },

    /**
     * 获取PM调制数据
     */
    async getPMData(carrierFreq, modFreq, phaseDev) {
        return this.request('/api/generate_pm', {
            carrier_freq: carrierFreq,
            mod_freq: modFreq,
            phase_dev: phaseDev
        });
    }
};

/**
 * 数字调制可视化工具
 */
const DigitalModulation = {
    /**
     * 文本到二进制转换并显示映射
     */
    showTextToBinaryMapping: function(text) {
        const mappingContainer = document.getElementById('text-binary-mapping');
        const sequenceContainer = document.getElementById('binary-sequence');
        
        if (!mappingContainer || !sequenceContainer) return;
        
        // 清空容器
        mappingContainer.innerHTML = '';
        
        let fullBinary = '';
        
        // 为每个字符创建映射显示
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const ascii = char.charCodeAt(0);
            const binary = ascii.toString(2).padStart(8, '0');
            fullBinary += binary;
            
            const charDiv = document.createElement('div');
            charDiv.className = 'char-mapping';
            charDiv.innerHTML = `
                <div class="character">'${char === ' ' ? '空格' : char}'</div>
                <div class="ascii">ASCII: ${ascii}</div>
                <div class="binary">${binary}</div>
            `;
            
            // 添加动画延迟
            charDiv.style.animationDelay = `${i * 0.1}s`;
            charDiv.style.opacity = '0';
            charDiv.style.transform = 'translateY(-20px)';
            
            mappingContainer.appendChild(charDiv);
            
            // 动画显示
            setTimeout(() => {
                charDiv.style.transition = 'all 0.5s ease';
                charDiv.style.opacity = '1';
                charDiv.style.transform = 'translateY(0)';
            }, i * 100);
        }
        
        // 显示完整二进制序列
        setTimeout(() => {
            sequenceContainer.innerHTML = `
                <div class="label">完整二进制序列 (${fullBinary.length} bits):</div>
                <div class="binary-stream" id="binary-stream"></div>
            `;
            
            const streamDiv = document.getElementById('binary-stream');
            this.animateBinarySequence(streamDiv, fullBinary);
        }, text.length * 100 + 200);
        
        return fullBinary;
    },
    
    /**
     * 动画显示二进制序列
     */
    animateBinarySequence: function(container, binary) {
        container.innerHTML = '';
        
        for (let i = 0; i < binary.length; i++) {
            const bit = binary[i];
            const bitSpan = document.createElement('span');
            bitSpan.className = `binary-bit bit-${bit}`;
            bitSpan.textContent = bit;
            bitSpan.style.opacity = '0';
            bitSpan.style.transform = 'scale(0)';
            
            container.appendChild(bitSpan);
            
            // 逐个显示比特
            setTimeout(() => {
                bitSpan.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                bitSpan.style.opacity = '1';
                bitSpan.style.transform = 'scale(1)';
            }, i * 50);
        }
    },
    
    /**
     * 显示调制原理说明
     */
    showModulationPrinciple: function(modType) {
        const principleContainer = document.getElementById('modulation-principle');
        if (!principleContainer) return;
        
        let content = '';
        
        switch (modType) {
            case 'ASK':
                content = `
                    <h4>ASK (幅移键控) 调制原理</h4>
                    <div class="principle-grid">
                        <div class="principle-item">
                            <div class="symbol">📉</div>
                            <div class="description">数字"0" → 低幅度载波</div>
                        </div>
                        <div class="principle-item">
                            <div class="symbol">📈</div>
                            <div class="description">数字"1" → 高幅度载波</div>
                        </div>
                        <div class="principle-item">
                            <div class="symbol">⚡</div>
                            <div class="description">频率和相位保持不变</div>
                        </div>
                    </div>
                    <p><strong>核心思想：</strong>通过改变载波的幅度来表示数字信息</p>
                `;
                break;
            case 'FSK':
                content = `
                    <h4>FSK (频移键控) 调制原理</h4>
                    <div class="principle-grid">
                        <div class="principle-item">
                            <div class="symbol">🐌</div>
                            <div class="description">数字"0" → 低频率载波</div>
                        </div>
                        <div class="principle-item">
                            <div class="symbol">🚀</div>
                            <div class="description">数字"1" → 高频率载波</div>
                        </div>
                        <div class="principle-item">
                            <div class="symbol">📊</div>
                            <div class="description">幅度和相位保持不变</div>
                        </div>
                    </div>
                    <p><strong>核心思想：</strong>通过改变载波的频率来表示数字信息</p>
                `;
                break;
            case 'PSK':
                content = `
                    <h4>PSK (相移键控) 调制原理</h4>
                    <div class="principle-grid">
                        <div class="principle-item">
                            <div class="symbol">➡️</div>
                            <div class="description">数字"0" → 0° 相位</div>
                        </div>
                        <div class="principle-item">
                            <div class="symbol">⬅️</div>
                            <div class="description">数字"1" → 180° 相位</div>
                        </div>
                        <div class="principle-item">
                            <div class="symbol">📏</div>
                            <div class="description">幅度和频率保持不变</div>
                        </div>
                    </div>
                    <p><strong>核心思想：</strong>通过改变载波的相位来表示数字信息</p>
                `;
                break;
        }
        
        principleContainer.innerHTML = content;
    },
    
    /**
     * 创建逐比特调制演示
     */
    createBitByBitDemo: function(binary, modType) {
        const demoContainer = document.getElementById('bit-demo-container');
        if (!demoContainer) return;
        
        demoContainer.innerHTML = '';
        
        // 限制显示的比特数量（避免过多）
        const maxBits = Math.min(binary.length, 16);
        const bitsToShow = binary.substring(0, maxBits);
        
        for (let i = 0; i < bitsToShow.length; i++) {
            const bit = bitsToShow[i];
            const bitDiv = document.createElement('div');
            bitDiv.className = 'bit-demo-item';
            bitDiv.setAttribute('data-bit-index', i);
            
            let waveDescription = '';
            switch (modType) {
                case 'ASK':
                    waveDescription = bit === '1' ? '高幅度正弦波' : '低幅度正弦波';
                    break;
                case 'FSK':
                    waveDescription = bit === '1' ? '高频正弦波' : '低频正弦波';
                    break;
                case 'PSK':
                    waveDescription = bit === '1' ? '反相正弦波 (180°)' : '同相正弦波 (0°)';
                    break;
            }
            
            bitDiv.innerHTML = `
                <div class="bit-value bit-${bit}">${bit}</div>
                <div class="wave-preview">
                    <canvas width="200" height="60" style="width:100%;height:100%;"></canvas>
                </div>
                <div class="description">${waveDescription}</div>
            `;
            
            demoContainer.appendChild(bitDiv);
            
            // 绘制小波形预览
            setTimeout(() => {
                this.drawBitWavePreview(bitDiv.querySelector('canvas'), bit, modType);
            }, i * 100);
            
            // 添加点击事件
            bitDiv.addEventListener('click', () => {
                this.highlightBitInDemo(i);
            });
        }
        
        if (binary.length > maxBits) {
            const moreDiv = document.createElement('div');
            moreDiv.className = 'bit-demo-item';
            moreDiv.innerHTML = `
                <div class="bit-value">...</div>
                <div class="description">还有 ${binary.length - maxBits} 个比特</div>
            `;
            demoContainer.appendChild(moreDiv);
        }
    },
    
    /**
     * 绘制比特波形预览
     */
    drawBitWavePreview: function(canvas, bit, modType) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = bit === '1' ? '#28a745' : '#dc3545';
        ctx.lineWidth = 2;
        
        const centerY = height / 2;
        const amplitude = height * 0.3;
        
        ctx.beginPath();
        
        for (let x = 0; x < width; x++) {
            let y = centerY;
            const t = x / width * 4 * Math.PI; // 4个周期
            
            switch (modType) {
                case 'ASK':
                    const askAmplitude = bit === '1' ? amplitude : amplitude * 0.3;
                    y = centerY + askAmplitude * Math.sin(t);
                    break;
                case 'FSK':
                    const freq = bit === '1' ? 1.5 : 1; // 不同频率
                    y = centerY + amplitude * Math.sin(t * freq);
                    break;
                case 'PSK':
                    const phase = bit === '1' ? Math.PI : 0; // 不同相位
                    y = centerY + amplitude * Math.sin(t + phase);
                    break;
            }
            
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    },
    
    /**
     * 高亮选中的比特演示
     */
    highlightBitInDemo: function(bitIndex) {
        const demoItems = document.querySelectorAll('.bit-demo-item');
        demoItems.forEach((item, index) => {
            if (index === bitIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },
    
    /**
     * 创建载波信号图表
     */
    createCarrierChart: function(frequency) {
        const canvas = document.getElementById('carrier-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        this.drawCarrierWave(ctx, canvas.width, canvas.height, frequency);
    },
    
    /**
     * 绘制载波波形
     */
    drawCarrierWave: function(ctx, width, height, frequency) {
        ctx.clearRect(0, 0, width, height);
        
        // 绘制坐标轴
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;
        
        // X轴
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Y轴
        ctx.beginPath();
        ctx.moveTo(50, 0);
        ctx.lineTo(50, height);
        ctx.stroke();
        
        // 绘制载波
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const amplitude = height * 0.3;
        const centerY = height / 2;
        const cycles = 5; // 显示5个周期
        
        for (let x = 50; x < width; x++) {
            const t = (x - 50) / (width - 50) * cycles * 2 * Math.PI;
            const y = centerY + amplitude * Math.sin(t);
            
            if (x === 50) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // 添加标签
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.fillText('载波信号', 60, 20);
        ctx.fillText(`频率: ${frequency} Hz`, 60, 40);
        ctx.fillText('幅度: Ac', 10, height / 2 - amplitude - 10);
        ctx.fillText('时间 →', width - 60, height - 10);
    }
};

// 导出到全局作用域
window.RFVision.MathUtils = MathUtils;
window.RFVision.RFCalculations = RFCalculations;
window.RFVision.ChartUtils = ChartUtils;
window.RFVision.AnimationController = AnimationController;
window.RFVision.UIUtils = UIUtils;
window.RFVision.APIUtils = APIUtils;
window.RFVision.DigitalModulation = DigitalModulation;

/**
 * 全局初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有工具提示
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // 初始化数学公式渲染
    if (window.MathJax) {
        MathJax.typesetPromise().catch((err) => {
            console.error('MathJax rendering failed:', err);
        });
    }

    // 添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    console.log('RF Vision initialized successfully');
});
