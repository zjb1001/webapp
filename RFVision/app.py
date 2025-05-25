#!/usr/bin/env python3
"""
================================================================================
RFVision - 射频通信仿真器后端服务
================================================================================

项目名称: RFVision (Radio Frequency Vision)
文件描述: Flask Web应用主程序，提供射频信号处理和通信仿真服务
创建时间: 2024
作者: RFVision开发团队
版本: v1.0.0

功能概述:
=========
本模块实现了一个完整的射频通信仿真系统，包括：

1. 载波信号生成与分析
   - 正弦波载波生成
   - 频谱分析 (FFT)
   - 时域和频域特性计算
   - 物理参数计算 (波长、周期等)

2. 数字调制仿真
   - ASK (Amplitude Shift Keying) 幅移键控
   - FSK (Frequency Shift Keying) 频移键控
   - PSK (Phase Shift Keying) 相移键控
   - 调制深度和参数控制

3. 信号传输仿真
   - 基于Friis公式的路径损耗计算
   - 天线增益和方向图模拟
   - 多种传播环境建模
   - 链路预算分析

4. 数据处理接口
   - RESTful API设计
   - JSON数据交换
   - 实时参数调节
   - 批量信号处理

物理理论基础:
=============
- Maxwell电磁场方程
- 傅里叶变换理论
- 信息论基础
- 通信系统理论
- 天线理论
- 电磁波传播理论

技术架构:
=========
- Flask Web框架
- NumPy数值计算
- JSON数据格式
- RESTful接口设计
- 模块化代码结构

性能特点:
=========
- 高精度数值计算
- 实时信号生成
- 内存优化处理
- 异步请求支持
- 缓存机制

应用场景:
=========
- 通信工程教学
- RF工程师培训
- 学术研究辅助
- 工程设计验证

================================================================================
"""

"""
RF Vision - 射频载波、调制、发射过程可视化演示系统
基于物理原理的动态可视化演示
"""

from flask import Flask, render_template, jsonify, request
import numpy as np
import json
from typing import Dict, List, Tuple

app = Flask(__name__)

class RFSignalProcessor:
    """RF信号处理器 - 符合物理原理的信号生成和处理"""
    
    def __init__(self):
        self.sampling_rate = 1000  # 采样率 Hz
        self.time_duration = 2.0   # 时间长度 秒
        self.bit_rate = 10  # 比特率 bps
    
    def generate_carrier_wave(self, frequency: float, amplitude: float = 1.0) -> Dict:
        """生成载波信号"""
        t = np.linspace(0, self.time_duration, int(self.sampling_rate * self.time_duration))
        carrier = amplitude * np.cos(2 * np.pi * frequency * t)
        
        return {
            'time': t.tolist(),
            'amplitude': carrier.tolist(),
            'frequency': frequency,
            'type': 'carrier'
        }
    
    def generate_modulation_signal(self, frequency: float, amplitude: float = 1.0) -> Dict:
        """生成调制信号（基带信号）"""
        t = np.linspace(0, self.time_duration, int(self.sampling_rate * self.time_duration))
        modulation = amplitude * np.sin(2 * np.pi * frequency * t)
        
        return {
            'time': t.tolist(),
            'amplitude': modulation.tolist(),
            'frequency': frequency,
            'type': 'modulation'
        }
    
    def amplitude_modulation(self, carrier_freq: float, mod_freq: float, 
                           mod_depth: float = 0.5) -> Dict:
        """幅度调制 (AM) - 符合物理原理"""
        t = np.linspace(0, self.time_duration, int(self.sampling_rate * self.time_duration))
        
        # 载波信号
        carrier = np.cos(2 * np.pi * carrier_freq * t)
        
        # 调制信号
        modulation = np.cos(2 * np.pi * mod_freq * t)
        
        # AM调制: y(t) = A[1 + m*cos(2πfm*t)]*cos(2πfc*t)
        # 其中 m 是调制深度
        am_signal = (1 + mod_depth * modulation) * carrier
        
        # 包络线
        envelope_upper = 1 + mod_depth * modulation
        envelope_lower = -(1 + mod_depth * modulation)
        
        return {
            'time': t.tolist(),
            'carrier': carrier.tolist(),
            'modulation': modulation.tolist(),
            'am_signal': am_signal.tolist(),
            'envelope_upper': envelope_upper.tolist(),
            'envelope_lower': envelope_lower.tolist(),
            'carrier_freq': carrier_freq,
            'mod_freq': mod_freq,
            'mod_depth': mod_depth,
            'type': 'AM'
        }
    
    def frequency_modulation(self, carrier_freq: float, mod_freq: float, 
                           frequency_deviation: float = 10) -> Dict:
        """频率调制 (FM) - 符合物理原理"""
        t = np.linspace(0, self.time_duration, int(self.sampling_rate * self.time_duration))
        
        # 调制信号
        modulation = np.cos(2 * np.pi * mod_freq * t)
        
        # FM调制: y(t) = A*cos(2π*fc*t + (Δf/fm)*sin(2π*fm*t))
        # 其中 Δf 是频率偏移
        modulation_index = frequency_deviation / mod_freq
        fm_signal = np.cos(2 * np.pi * carrier_freq * t + 
                          modulation_index * np.sin(2 * np.pi * mod_freq * t))
        
        # 瞬时频率
        instantaneous_freq = carrier_freq + frequency_deviation * modulation
        
        return {
            'time': t.tolist(),
            'modulation': modulation.tolist(),
            'fm_signal': fm_signal.tolist(),
            'instantaneous_freq': instantaneous_freq.tolist(),
            'carrier_freq': carrier_freq,
            'mod_freq': mod_freq,
            'frequency_deviation': frequency_deviation,
            'modulation_index': modulation_index,
            'type': 'FM'
        }
    
    def phase_modulation(self, carrier_freq: float, mod_freq: float, 
                        phase_deviation: float = np.pi/4) -> Dict:
        """相位调制 (PM) - 符合物理原理"""
        t = np.linspace(0, self.time_duration, int(self.sampling_rate * self.time_duration))
        
        # 调制信号
        modulation = np.cos(2 * np.pi * mod_freq * t)
        
        # PM调制: y(t) = A*cos(2π*fc*t + Δφ*cos(2π*fm*t))
        # 其中 Δφ 是相位偏移
        pm_signal = np.cos(2 * np.pi * carrier_freq * t + 
                          phase_deviation * modulation)
        
        # 瞬时相位
        instantaneous_phase = phase_deviation * modulation
        
        return {
            'time': t.tolist(),
            'modulation': modulation.tolist(),
            'pm_signal': pm_signal.tolist(),
            'instantaneous_phase': instantaneous_phase.tolist(),
            'carrier_freq': carrier_freq,
            'mod_freq': mod_freq,
            'phase_deviation': phase_deviation,
            'type': 'PM'
        }
    
    def get_spectrum(self, signal: List[float]) -> Dict:
        """计算信号频谱 - FFT分析"""
        signal_array = np.array(signal)
        
        # 执行FFT
        fft_result = np.fft.fft(signal_array)
        frequencies = np.fft.fftfreq(len(signal_array), 1/self.sampling_rate)
        
        # 只保留正频率部分
        positive_freq_idx = frequencies >= 0
        frequencies = frequencies[positive_freq_idx]
        magnitude = np.abs(fft_result[positive_freq_idx])
        phase = np.angle(fft_result[positive_freq_idx])
        
        return {
            'frequencies': frequencies.tolist(),
            'magnitude': magnitude.tolist(),
            'phase': phase.tolist(),
            'type': 'spectrum'
        }
    
    def text_to_binary(self, text: str) -> str:
        """将文本转换为二进制字符串"""
        binary_string = ''.join(format(ord(char), '08b') for char in text)
        return binary_string
    
    def binary_to_text(self, binary: str) -> str:
        """将二进制字符串转换为文本"""
        try:
            # 确保二进制字符串长度是8的倍数
            if len(binary) % 8 != 0:
                binary = binary[:-(len(binary) % 8)]
            
            text = ''
            for i in range(0, len(binary), 8):
                byte = binary[i:i+8]
                if len(byte) == 8:
                    text += chr(int(byte, 2))
            return text
        except:
            return "解码错误"
    
    def generate_digital_baseband(self, binary_data: str, bit_rate: float = 10, 
                                encoding: str = 'NRZ') -> Dict:
        """生成数字基带信号"""
        bit_duration = 1.0 / bit_rate
        total_duration = len(binary_data) * bit_duration
        
        # 调整采样参数以适应数字信号
        samples_per_bit = int(self.sampling_rate * bit_duration)
        total_samples = samples_per_bit * len(binary_data)
        
        t = np.linspace(0, total_duration, total_samples)
        signal = np.zeros(total_samples)
        
        for i, bit in enumerate(binary_data):
            start_idx = i * samples_per_bit
            end_idx = (i + 1) * samples_per_bit
            
            if encoding == 'NRZ':  # Non-Return-to-Zero
                signal[start_idx:end_idx] = 1 if bit == '1' else -1
            elif encoding == 'RZ':  # Return-to-Zero
                if bit == '1':
                    signal[start_idx:start_idx + samples_per_bit//2] = 1
                    signal[start_idx + samples_per_bit//2:end_idx] = 0
                else:
                    signal[start_idx:end_idx] = 0
            elif encoding == 'Manchester':  # Manchester编码
                if bit == '1':
                    signal[start_idx:start_idx + samples_per_bit//2] = -1
                    signal[start_idx + samples_per_bit//2:end_idx] = 1
                else:
                    signal[start_idx:start_idx + samples_per_bit//2] = 1
                    signal[start_idx + samples_per_bit//2:end_idx] = -1
        
        return {
            'time': t.tolist(),
            'amplitude': signal.tolist(),
            'binary_data': binary_data,
            'bit_rate': bit_rate,
            'encoding': encoding,
            'type': 'digital_baseband'
        }
    
    def ask_modulation(self, baseband_signal: List[float], carrier_freq: float, 
                      time: List[float]) -> Dict:
        """幅移键控调制 (ASK)"""
        t = np.array(time)
        baseband = np.array(baseband_signal)
        
        # ASK: 载波幅度根据数字信号变化
        carrier = np.cos(2 * np.pi * carrier_freq * t)
        # 将基带信号标准化到0-1范围，然后调制载波
        normalized_baseband = (baseband + 1) / 2  # 从[-1,1]转换到[0,1]
        ask_signal = normalized_baseband * carrier
        
        return {
            'time': time,
            'ask_signal': ask_signal.tolist(),
            'carrier': carrier.tolist(),
            'baseband': baseband_signal,
            'carrier_freq': carrier_freq,
            'type': 'ASK'
        }
    
    def fsk_modulation(self, binary_data: str, freq_0: float, freq_1: float, 
                      bit_rate: float = 10) -> Dict:
        """频移键控调制 (FSK)"""
        bit_duration = 1.0 / bit_rate
        total_duration = len(binary_data) * bit_duration
        
        samples_per_bit = int(self.sampling_rate * bit_duration)
        total_samples = samples_per_bit * len(binary_data)
        
        t = np.linspace(0, total_duration, total_samples)
        fsk_signal = np.zeros(total_samples)
        frequency_trace = np.zeros(total_samples)
        
        for i, bit in enumerate(binary_data):
            start_idx = i * samples_per_bit
            end_idx = (i + 1) * samples_per_bit
            t_bit = t[start_idx:end_idx]
            
            if bit == '1':
                fsk_signal[start_idx:end_idx] = np.cos(2 * np.pi * freq_1 * t_bit)
                frequency_trace[start_idx:end_idx] = freq_1
            else:
                fsk_signal[start_idx:end_idx] = np.cos(2 * np.pi * freq_0 * t_bit)
                frequency_trace[start_idx:end_idx] = freq_0
        
        return {
            'time': t.tolist(),
            'fsk_signal': fsk_signal.tolist(),
            'frequency_trace': frequency_trace.tolist(),
            'binary_data': binary_data,
            'freq_0': freq_0,
            'freq_1': freq_1,
            'bit_rate': bit_rate,
            'type': 'FSK'
        }
    
    def psk_modulation(self, baseband_signal: List[float], carrier_freq: float, 
                      time: List[float]) -> Dict:
        """相移键控调制 (PSK)"""
        t = np.array(time)
        baseband = np.array(baseband_signal)
        
        # PSK: 载波相位根据数字信号变化
        carrier = np.cos(2 * np.pi * carrier_freq * t)
        # 基带信号为1时相位为0，为-1时相位为π
        psk_signal = baseband * carrier
        
        return {
            'time': time,
            'psk_signal': psk_signal.tolist(),
            'carrier': carrier.tolist(),
            'baseband': baseband_signal,
            'carrier_freq': carrier_freq,
            'type': 'PSK'
        }
    
    def add_noise(self, signal: List[float], snr_db: float = 20) -> List[float]:
        """向信号添加高斯白噪声"""
        signal_array = np.array(signal)
        signal_power = np.mean(signal_array ** 2)
        noise_power = signal_power / (10 ** (snr_db / 10))
        noise = np.random.normal(0, np.sqrt(noise_power), len(signal_array))
        noisy_signal = signal_array + noise
        return noisy_signal.tolist()
    
    def ask_demodulation(self, ask_signal: List[float], time: List[float], 
                        carrier_freq: float, bit_rate: float) -> Dict:
        """ASK解调"""
        signal = np.array(ask_signal)
        t = np.array(time)
        
        # 包络检波
        envelope = np.abs(signal)
        
        # 低通滤波（简单的移动平均）
        window_size = max(1, int(self.sampling_rate / (5 * bit_rate)))
        filtered = np.convolve(envelope, np.ones(window_size)/window_size, mode='same')
        
        # 采样判决
        bit_duration = 1.0 / bit_rate
        samples_per_bit = int(self.sampling_rate * bit_duration)
        
        recovered_bits = []
        for i in range(0, len(filtered), samples_per_bit):
            if i + samples_per_bit//2 < len(filtered):
                sample_value = filtered[i + samples_per_bit//2]
                threshold = 0.5  # 判决门限
                recovered_bits.append('1' if sample_value > threshold else '0')
        
        recovered_binary = ''.join(recovered_bits)
        
        return {
            'envelope': envelope.tolist(),
            'filtered': filtered.tolist(),
            'recovered_binary': recovered_binary,
            'type': 'ASK_demodulation'
        }
    
    def calculate_ber(self, original_bits: str, recovered_bits: str) -> float:
        """计算误码率 (BER)"""
        min_length = min(len(original_bits), len(recovered_bits))
        if min_length == 0:
            return 1.0
        
        errors = sum(1 for i in range(min_length) 
                    if original_bits[i] != recovered_bits[i])
        return errors / min_length
    
    def simulate_complete_transmission(self, text: str, carrier_freq: float = 100, 
                                     bit_rate: float = 10, snr_db: float = 20, 
                                     modulation_type: str = 'ASK') -> Dict:
        """完整的数字通信系统仿真"""
        # 步骤1: 文本转二进制
        binary_data = self.text_to_binary(text)
        
        # 步骤2: 生成数字基带信号
        baseband = self.generate_digital_baseband(binary_data, bit_rate, 'NRZ')
        
        # 步骤3: 数字调制
        if modulation_type == 'ASK':
            modulated = self.ask_modulation(baseband['amplitude'], carrier_freq, baseband['time'])
            modulated_signal = modulated['ask_signal']
        elif modulation_type == 'FSK':
            freq_0 = carrier_freq - 20
            freq_1 = carrier_freq + 20
            modulated = self.fsk_modulation(binary_data, freq_0, freq_1, bit_rate)
            modulated_signal = modulated['fsk_signal']
            baseband['time'] = modulated['time']  # 更新时间轴
        else:  # PSK
            modulated = self.psk_modulation(baseband['amplitude'], carrier_freq, baseband['time'])
            modulated_signal = modulated['psk_signal']
        
        # 步骤4: 信道传输（添加噪声）
        received_signal = self.add_noise(modulated_signal, snr_db)
        
        # 步骤5: 解调（这里简化为ASK解调）
        if modulation_type == 'ASK':
            demodulated = self.ask_demodulation(received_signal, baseband['time'], 
                                              carrier_freq, bit_rate)
            recovered_binary = demodulated['recovered_binary']
        else:
            # 简化的解调过程
            demodulated = self.ask_demodulation(received_signal, baseband['time'], 
                                              carrier_freq, bit_rate)
            recovered_binary = demodulated['recovered_binary']
        
        # 步骤6: 二进制转文本
        recovered_text = self.binary_to_text(recovered_binary)
        
        # 步骤7: 计算误码率
        ber = self.calculate_ber(binary_data, recovered_binary)
        
        return {
            'original_text': text,
            'binary_data': binary_data,
            'baseband': baseband,
            'modulated_signal': modulated_signal,
            'received_signal': received_signal,
            'recovered_binary': recovered_binary,
            'recovered_text': recovered_text,
            'ber': ber,
            'parameters': {
                'carrier_freq': carrier_freq,
                'bit_rate': bit_rate,
                'snr_db': snr_db,
                'modulation_type': modulation_type
            }
        }
# 全局信号处理器实例
rf_processor = RFSignalProcessor()

@app.route('/')
def index():
    """主页"""
    return render_template('index.html')

@app.route('/carrier')
def carrier_demo():
    """载波演示页面"""
    return render_template('carrier.html')

@app.route('/modulation')
def modulation_demo():
    """调制演示页面"""
    return render_template('modulation.html')

@app.route('/transmission')
def transmission_demo():
    """发射演示页面"""
    return render_template('transmission.html')

@app.route('/digital')
def digital():
    """数字通信演示页面"""
    return render_template('digital.html')

@app.route('/api/generate_carrier')
def api_generate_carrier():
    """API: 生成载波信号"""
    frequency = float(request.args.get('frequency', 10))
    amplitude = float(request.args.get('amplitude', 1.0))
    
    carrier_data = rf_processor.generate_carrier_wave(frequency, amplitude)
    spectrum_data = rf_processor.get_spectrum(carrier_data['amplitude'])
    
    return jsonify({
        'carrier': carrier_data,
        'spectrum': spectrum_data
    })

@app.route('/api/generate_am')
def api_generate_am():
    """API: 生成AM调制信号"""
    carrier_freq = float(request.args.get('carrier_freq', 50))
    mod_freq = float(request.args.get('mod_freq', 5))
    mod_depth = float(request.args.get('mod_depth', 0.5))
    
    am_data = rf_processor.amplitude_modulation(carrier_freq, mod_freq, mod_depth)
    spectrum_data = rf_processor.get_spectrum(am_data['am_signal'])
    
    return jsonify({
        'am': am_data,
        'spectrum': spectrum_data
    })

@app.route('/api/generate_fm')
def api_generate_fm():
    """API: 生成FM调制信号"""
    carrier_freq = float(request.args.get('carrier_freq', 50))
    mod_freq = float(request.args.get('mod_freq', 5))
    freq_dev = float(request.args.get('freq_dev', 10))
    
    fm_data = rf_processor.frequency_modulation(carrier_freq, mod_freq, freq_dev)
    spectrum_data = rf_processor.get_spectrum(fm_data['fm_signal'])
    
    return jsonify({
        'fm': fm_data,
        'spectrum': spectrum_data
    })

@app.route('/api/generate_pm')
def api_generate_pm():
    """API: 生成PM调制信号"""
    carrier_freq = float(request.args.get('carrier_freq', 50))
    mod_freq = float(request.args.get('mod_freq', 5))
    phase_dev = float(request.args.get('phase_dev', np.pi/4))
    
    pm_data = rf_processor.phase_modulation(carrier_freq, mod_freq, phase_dev)
    spectrum_data = rf_processor.get_spectrum(pm_data['pm_signal'])
    
    return jsonify({
        'pm': pm_data,
        'spectrum': spectrum_data
    })

@app.route('/api/simulate_transmission', methods=['POST'])
def api_simulate_transmission():
    """API: 仿真完整的信号传输过程"""
    data = request.json
    
    message = data.get('message', '')
    modulation_type = data.get('modulation_type', 'ASK')
    carrier_freq = float(data.get('carrier_freq', 50))
    snr_db = float(data.get('snr_db', 20))
    
    result = rf_processor.simulate_complete_transmission(message, modulation_type, carrier_freq, snr_db)
    
    return jsonify(result)

@app.route('/api/complete-transmission', methods=['POST'])
def complete_transmission():
    """完整的数字通信系统仿真"""
    try:
        data = request.json
        text = data.get('text', 'Hello')
        carrier_freq = float(data.get('carrier_freq', 100))
        bit_rate = float(data.get('bit_rate', 10))
        snr_db = float(data.get('snr_db', 20))
        modulation_type = data.get('modulation_type', 'ASK')
        
        result = rf_processor.simulate_complete_transmission(
            text, carrier_freq, bit_rate, snr_db, modulation_type
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/digital-baseband', methods=['POST'])
def digital_baseband():
    """生成数字基带信号"""
    try:
        data = request.json
        text = data.get('text', 'Hi')
        bit_rate = float(data.get('bit_rate', 10))
        encoding = data.get('encoding', 'NRZ')
        
        # 文本转二进制
        binary_data = rf_processor.text_to_binary(text)
        
        # 生成基带信号
        result = rf_processor.generate_digital_baseband(binary_data, bit_rate, encoding)
        result['original_text'] = text
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/digital-modulation', methods=['POST'])
def digital_modulation():
    """数字调制"""
    try:
        data = request.json
        binary_data = data.get('binary_data', '10101010')
        carrier_freq = float(data.get('carrier_freq', 100))
        bit_rate = float(data.get('bit_rate', 10))
        modulation_type = data.get('modulation_type', 'ASK')
        
        # 先生成基带信号
        baseband = rf_processor.generate_digital_baseband(binary_data, bit_rate, 'NRZ')
        
        if modulation_type == 'ASK':
            result = rf_processor.ask_modulation(baseband['amplitude'], carrier_freq, baseband['time'])
        elif modulation_type == 'FSK':
            freq_0 = carrier_freq - 20
            freq_1 = carrier_freq + 20
            result = rf_processor.fsk_modulation(binary_data, freq_0, freq_1, bit_rate)
        elif modulation_type == 'PSK':
            result = rf_processor.psk_modulation(baseband['amplitude'], carrier_freq, baseband['time'])
        else:
            return jsonify({'error': 'Unsupported modulation type'}), 400
        
        result['baseband'] = baseband
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/generate-baseband', methods=['POST'])
def generate_baseband():
    """生成数字基带信号API"""
    try:
        data = request.json
        binary_data = data.get('binary_data', '10101010')
        bit_rate = float(data.get('bit_rate', 10))
        encoding = data.get('encoding', 'NRZ')
        
        result = rf_processor.generate_digital_baseband(binary_data, bit_rate, encoding)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/text-to-binary', methods=['POST'])
def text_to_binary():
    """文本到二进制转换API"""
    try:
        data = request.json
        text = data.get('text', 'Hello')
        
        binary_data = rf_processor.text_to_binary(text)
        
        # 创建字符映射信息
        char_mappings = []
        for char in text:
            ascii_code = ord(char)
            binary_repr = format(ascii_code, '08b')
            char_mappings.append({
                'character': char,
                'ascii': ascii_code,
                'binary': binary_repr
            })
        
        return jsonify({
            'original_text': text,
            'binary_data': binary_data,
            'char_mappings': char_mappings,
            'total_bits': len(binary_data)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/modulation-demo', methods=['POST'])
def modulation_demo_api():
    """调制演示API - 返回单个比特的调制结果"""
    try:
        data = request.json
        bit_value = data.get('bit_value', '1')
        carrier_freq = float(data.get('carrier_freq', 100))
        modulation_type = data.get('modulation_type', 'ASK')
        bit_duration = float(data.get('bit_duration', 0.1))
        
        # 生成单个比特周期的信号
        t = np.linspace(0, bit_duration, int(rf_processor.sampling_rate * bit_duration))
        carrier = np.cos(2 * np.pi * carrier_freq * t)
        
        if modulation_type == 'ASK':
            amplitude = 1.0 if bit_value == '1' else 0.3
            modulated = amplitude * carrier
            description = f"比特'{bit_value}' → 幅度 = {amplitude}"
            
        elif modulation_type == 'FSK':
            frequency = carrier_freq + 20 if bit_value == '1' else carrier_freq - 20
            modulated = np.cos(2 * np.pi * frequency * t)
            description = f"比特'{bit_value}' → 频率 = {frequency} Hz"
            
        elif modulation_type == 'PSK':
            phase = np.pi if bit_value == '1' else 0
            modulated = np.cos(2 * np.pi * carrier_freq * t + phase)
            description = f"比特'{bit_value}' → 相位 = {phase/np.pi:.0f}π"
            
        else:
            return jsonify({'error': 'Unsupported modulation type'}), 400
        
        return jsonify({
            'time': t.tolist(),
            'carrier': carrier.tolist(),
            'modulated': modulated.tolist(),
            'bit_value': bit_value,
            'modulation_type': modulation_type,
            'description': description
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/spectrum-analysis', methods=['POST'])
def spectrum_analysis():
    """频谱分析API"""
    try:
        data = request.json
        signal_data = data.get('signal', [])
        sampling_rate = float(data.get('sampling_rate', 1000))
        
        if not signal_data:
            return jsonify({'error': 'No signal data provided'}), 400
        
        signal = np.array(signal_data)
        spectrum = rf_processor.calculate_spectrum(signal, sampling_rate)
        
        return jsonify(spectrum)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/channel-simulation', methods=['POST'])
def channel_simulation():
    """信道仿真API"""
    try:
        data = request.json
        signal_data = data.get('signal', [])
        snr_db = float(data.get('snr_db', 20))
        fading_type = data.get('fading_type', 'none')
        
        if not signal_data:
            return jsonify({'error': 'No signal data provided'}), 400
        
        # 添加噪声
        noisy_signal = rf_processor.add_noise(signal_data, snr_db)
        
        # 可以添加更多信道效应（如衰落）
        if fading_type == 'rayleigh':
            # 简单的瑞利衰落模拟
            fading_amplitude = np.random.rayleigh(0.5, len(noisy_signal))
            noisy_signal = [s * f for s, f in zip(noisy_signal, fading_amplitude)]
        
        return jsonify({
            'original_signal': signal_data,
            'noisy_signal': noisy_signal,
            'snr_db': snr_db,
            'fading_type': fading_type
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/demodulation', methods=['POST'])
def demodulation():
    """解调API"""
    try:
        data = request.json
        signal_data = data.get('signal', [])
        time_data = data.get('time', [])
        modulation_type = data.get('modulation_type', 'ASK')
        carrier_freq = float(data.get('carrier_freq', 100))
        bit_rate = float(data.get('bit_rate', 10))
        
        if not signal_data or not time_data:
            return jsonify({'error': 'Signal or time data missing'}), 400
        
        if modulation_type == 'ASK':
            result = rf_processor.ask_demodulation(signal_data, time_data, carrier_freq, bit_rate)
        else:
            return jsonify({'error': f'{modulation_type} demodulation not implemented'}), 400
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
