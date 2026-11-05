import os
import base64

onnx_path = '/Users/bhuvangm/Dev/agronex/model train/mobilenet_v2_pest.onnx'
target_js = '/Users/bhuvangm/Dev/agronex/src/assets/mobilenetV2Base64.js'

if os.path.exists(onnx_path):
    with open(onnx_path, 'rb') as f:
        data = f.read()
    b64 = base64.b64encode(data).decode('utf-8')
    with open(target_js, 'w', encoding='utf-8') as f:
        f.write('// AgroNex MobileNetV2 Real Field Trained Neural Network (100% Offline)\n')
        f.write(f'export const MOBILENET_V2_BASE64 = "{b64}";\n')
    print(f'Successfully updated {target_js} ({os.path.getsize(target_js)/1024/1024:.2f} MB)')
else:
    print(f'Error: {onnx_path} does not exist yet.')

