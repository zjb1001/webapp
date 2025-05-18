from flask import Flask, render_template, request, redirect, url_for
import math

app = Flask(__name__)

# Define the fractions we'll teach (denominators less than 10)
FRACTIONS = [
    {"numerator": 1, "denominator": 2},  # 1/2 = 50%
    {"numerator": 1, "denominator": 3},  # 1/3 = 33.33%
    {"numerator": 2, "denominator": 3},  # 2/3 = 66.67%
    {"numerator": 1, "denominator": 4},  # 1/4 = 25%
    {"numerator": 3, "denominator": 4},  # 3/4 = 75%
    {"numerator": 1, "denominator": 5},  # 1/5 = 20%
    {"numerator": 2, "denominator": 5},  # 2/5 = 40%
    {"numerator": 3, "denominator": 5},  # 3/5 = 60%
    {"numerator": 4, "denominator": 5},  # 4/5 = 80%
    {"numerator": 1, "denominator": 6},  # 1/6 = 16.67%
    {"numerator": 5, "denominator": 6},  # 5/6 = 83.33%
    {"numerator": 1, "denominator": 8},  # 1/8 = 12.5%
    {"numerator": 3, "denominator": 8},  # 3/8 = 37.5%
    {"numerator": 5, "denominator": 8},  # 5/8 = 62.5%
    {"numerator": 7, "denominator": 8},  # 7/8 = 87.5%
]

# Add angle calculations for segments
for fraction in FRACTIONS:
    fraction['angles'] = []
    segment_angle = 360 / fraction['denominator']
    for i in range(fraction['denominator']):
        start_angle = i * segment_angle
        end_angle = (i + 1) * segment_angle
        fraction['angles'].append({
            'start': start_angle,
            'end': end_angle,
            'active': i < fraction['numerator']
        })

@app.route('/')
def index():
    """Home page showing learning modules"""
    return render_template('index.html')

@app.route('/learn/fraction-identification')
def learn_fraction_identification():
    """Module 1: Learn to identify fractions"""
    return render_template('fraction_identification.html', fractions=FRACTIONS)

@app.route('/learn/fraction-value')
def learn_fraction_value():
    """Module 2: Learn the value of fractions"""
    return render_template('fraction_value.html', fractions=FRACTIONS)

@app.route('/learn/fraction-percent')
def learn_fraction_percent():
    """Module 3: Learn the relationship between fractions and percentages"""
    return render_template('fraction_percent.html', fractions=FRACTIONS)

@app.route('/practice')
def practice():
    """Interactive practice page"""
    return render_template('practice.html')

# Register custom template filters
@app.template_filter('cos')
def cos_filter(value):
    """Cosine filter for templates"""
    return math.cos(math.radians(value))

@app.template_filter('sin')
def sin_filter(value):
    """Sine filter for templates"""
    return math.sin(math.radians(value))

if __name__ == '__main__':
    app.run(debug=True)
