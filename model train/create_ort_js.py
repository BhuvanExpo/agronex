import json

with open('assets/models/ort.min.asset', 'r', encoding='utf-8') as f:
    code = f.read()

with open('src/assets/ortMinJs.js', 'w', encoding='utf-8') as f:
    f.write('// ONNX Runtime Web v1.19.2 (WebGL + CPU)\n')
    f.write('export const ORT_MIN_JS = ' + json.dumps(code) + ';\n')

print('Successfully wrote src/assets/ortMinJs.js')
